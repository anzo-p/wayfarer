import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetItemCommand, QueryCommand, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';

import { DynamoDBService } from '../../dynamodb/dynamodb.service';
import { BadDbDataException } from '../api/filters/errors.custom-errors';
import { Journey, RouteWaypoint } from '../domain/journey.model';
import { validateJourney } from '../domain/validator/journey.validator';
import { journeyFromDb, waypointsFromDb } from './mappers/journey.from-db-item';
import { journeyToDb, waypointsToDb } from './mappers/journey.to-db-item';

const ItemType = {
  Journey: 'JOURNEY',
  Waypoint: 'WAYPOINT'
} as const;

const DYNAMODB_MAX_TRANSACTION_WRITE_ITEMS = 100;

@Injectable()
export class JourneyRepository {
  private readonly journeyTable: string;

  constructor(
    private configService: ConfigService,
    private dynamoDBService: DynamoDBService
  ) {
    this.journeyTable = this.configService.get<string>('JOURNEY_TABLE');
  }

  private journeyPk(journeyId: string): string {
    return `${ItemType.Journey}#${journeyId}`;
  }

  private journeySk(journeyId: string): string {
    return `${ItemType.Journey}#${journeyId}`;
  }

  private waypointSk(waypointId: string): string {
    return `${ItemType.Waypoint}#${waypointId}`;
  }

  private getItemType(sk?: string): string | undefined {
    return sk?.split('#')[0];
  }

  private isCoreJourneyItem(sk?: string): boolean {
    return this.getItemType(sk) === ItemType.Waypoint;
  }

  private isNamedError(error: unknown, name: string): boolean {
    return typeof error === 'object' && error !== null && 'name' in error && error.name === name;
  }

  private ensureTransactionSize(actionCount: number): void {
    if (actionCount > DYNAMODB_MAX_TRANSACTION_WRITE_ITEMS) {
      throw new Error(
        `Journey core write requires ${actionCount} transaction actions, ` +
          `exceeding DynamoDB's limit of ${DYNAMODB_MAX_TRANSACTION_WRITE_ITEMS}.`
      );
    }
  }

  private buildJourneyRootPut(journey: Journey, conditionExpression: string) {
    return {
      Put: {
        TableName: this.journeyTable,
        Item: journeyToDb(journey),
        ConditionExpression: conditionExpression
      }
    };
  }

  private buildWaypointPuts(journey: Journey, conditionExpression?: string) {
    return waypointsToDb(journey.journeyId, journey.waypoints).map((item) => ({
      Put: {
        TableName: this.journeyTable,
        Item: item,
        ...(conditionExpression ? { ConditionExpression: conditionExpression } : {})
      }
    }));
  }

  private buildWaypointDeletes(journeyId: string, waypointSkValues: string[]) {
    return waypointSkValues.map((waypointSk) => ({
      Delete: {
        TableName: this.journeyTable,
        Key: {
          PK: { S: this.journeyPk(journeyId) },
          SK: { S: waypointSk }
        }
      }
    }));
  }

  private buildCreateJourneyTransaction(journey: Journey) {
    const waypointPuts = this.buildWaypointPuts(journey, 'attribute_not_exists(PK)');
    this.ensureTransactionSize(1 + waypointPuts.length);

    return [this.buildJourneyRootPut(journey, 'attribute_not_exists(PK)'), ...waypointPuts];
  }

  private buildUpdateJourneyTransaction(journey: Journey, removedWaypointKeys: string[]) {
    const waypointPuts = this.buildWaypointPuts(journey);
    const waypointDeletes = this.buildWaypointDeletes(journey.journeyId, removedWaypointKeys);
    this.ensureTransactionSize(1 + waypointPuts.length + waypointDeletes.length);

    return [this.buildJourneyRootPut(journey, 'attribute_exists(PK)'), ...waypointPuts, ...waypointDeletes];
  }

  private async fetchExistingCoreWaypointKeys(journeyId: string): Promise<Set<string>> {
    const relatedItems = await this.dynamoDBService.queryItem(
      new QueryCommand({
        TableName: this.journeyTable,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': { S: this.journeyPk(journeyId) }
        },
        ProjectionExpression: 'SK'
      })
    );

    const coreKeys = new Set<string>();

    relatedItems.Items?.forEach((item) => {
      const sk = item.SK.S;
      if (this.isCoreJourneyItem(sk)) {
        coreKeys.add(sk!);
      }
    });

    return coreKeys;
  }

  async createJourney(journey: Journey): Promise<string> {
    const transactItems = this.buildCreateJourneyTransaction(journey);

    try {
      await this.dynamoDBService.transactWriteItems(
        new TransactWriteItemsCommand({
          TransactItems: transactItems
        })
      );
    } catch (err) {
      if (this.isNamedError(err, 'TransactionCanceledException')) {
        throw new ConflictException('journey already exists');
      }
      throw new Error(`Failed to save journey: ${err.toString()}`);
    }

    return journey.journeyId;
  }

  async updateJourney(journey: Journey): Promise<string> {
    const existingWaypointKeys = await this.fetchExistingCoreWaypointKeys(journey.journeyId);
    const nextWaypointKeys = new Set(journey.waypoints.map((waypoint) => this.waypointSk(waypoint.waypointId)));
    const removedWaypointKeys = [...existingWaypointKeys].filter((sk) => !nextWaypointKeys.has(sk));
    const transactItems = this.buildUpdateJourneyTransaction(journey, removedWaypointKeys);

    try {
      await this.dynamoDBService.transactWriteItems(
        new TransactWriteItemsCommand({
          TransactItems: transactItems
        })
      );
    } catch (err) {
      if (this.isNamedError(err, 'TransactionCanceledException')) {
        throw new NotFoundException('journey not found');
      }
      throw new Error(`Failed to update journey: ${err.toString()}`);
    }

    return journey.journeyId;
  }

  private async getJourneyItem(journeyId: string, waypoints: RouteWaypoint[]): Promise<Journey> {
    const { Item } = await this.dynamoDBService.getItem(
      new GetItemCommand({
        TableName: this.journeyTable,
        Key: {
          PK: { S: this.journeyPk(journeyId) },
          SK: { S: this.journeySk(journeyId) }
        }
      })
    );

    if (!Item) {
      throw new NotFoundException('journey not found');
    }

    return journeyFromDb(Item, waypoints);
  }

  async fetchJourney(journeyId: string): Promise<Journey> {
    const relatedItems = await this.dynamoDBService.queryItem(
      new QueryCommand({
        TableName: this.journeyTable,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': { S: this.journeyPk(journeyId) }
        }
      })
    );

    const waypoints: RouteWaypoint[] = [];

    relatedItems.Items?.forEach((item) => {
      const itemType = this.getItemType(item.SK.S);
      switch (itemType) {
        case ItemType.Waypoint:
          waypoints.push(waypointsFromDb(item));
          break;

        default:
          break;
      }
    });

    const journey = await this.getJourneyItem(journeyId, waypoints);

    const { error, value } = validateJourney(journey);
    if (error) {
      throw new BadDbDataException(`Validation failure when loadeing Journey from DB: ${error}`);
    }

    return value;
  }
}
