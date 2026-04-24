import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetItemCommand, QueryCommand, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';

import { DynamoDBService } from '../../dynamodb/dynamodb.service';
import {
  BadDbDataException,
  JourneyPersistenceException,
  JourneyStorageUnavailableException,
  JourneyTransactionLimitException
} from '../api/filters/errors.custom-errors';
import { Journey, RouteWaypoint } from '../domain/journey.model';
import { validateJourney } from '../domain/validator/journey.validator';
import {
  getJourneyItemType,
  isCoreJourneyItem,
  JourneyItemType,
  journeyPk,
  journeySk,
  waypointSk
} from './journey.keys';
import { journeyFromDb, waypointsFromDb } from './mappers/journey.from-db-item';
import { journeyToDb, waypointsToDb } from './mappers/journey.to-db-item';

const DYNAMODB_MAX_TRANSACTION_WRITE_ITEMS = 100;
const TRANSIENT_DYNAMODB_ERROR_NAMES = new Set([
  'ProvisionedThroughputExceededException',
  'RequestLimitExceeded',
  'ThrottlingException',
  'InternalServerError',
  'ServiceUnavailable'
]);

@Injectable()
export class JourneyRepository {
  private readonly journeyTable: string;

  constructor(
    private configService: ConfigService,
    private dynamoDBService: DynamoDBService
  ) {
    this.journeyTable = this.configService.get<string>('JOURNEY_TABLE');
  }

  private isNamedError(error: unknown, name: string): boolean {
    return typeof error === 'object' && error !== null && 'name' in error && error.name === name;
  }

  private getErrorName(error: unknown): string | undefined {
    return typeof error === 'object' && error !== null && 'name' in error && typeof error.name === 'string'
      ? error.name
      : undefined;
  }

  private isTransientDynamoError(error: unknown): boolean {
    const errorName = this.getErrorName(error);
    return errorName !== undefined && TRANSIENT_DYNAMODB_ERROR_NAMES.has(errorName);
  }

  private ensureTransactionSize(actionCount: number): void {
    if (actionCount > DYNAMODB_MAX_TRANSACTION_WRITE_ITEMS) {
      throw new JourneyTransactionLimitException(actionCount, DYNAMODB_MAX_TRANSACTION_WRITE_ITEMS);
    }
  }

  private handleWriteFailure(operation: 'createJourney' | 'updateJourney', error: unknown): never {
    if (this.isTransientDynamoError(error)) {
      throw new JourneyStorageUnavailableException(operation, error);
    }

    throw new JourneyPersistenceException(operation, error);
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
          PK: { S: journeyPk(journeyId) },
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
          ':pk': { S: journeyPk(journeyId) }
        },
        ProjectionExpression: 'SK'
      })
    );

    const coreKeys = new Set<string>();

    relatedItems.Items?.forEach((item) => {
      const sk = item.SK.S;
      if (isCoreJourneyItem(sk)) {
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
        throw new ConflictException('journey already exists. Use updateJourney instead.');
      }
      this.handleWriteFailure('createJourney', err);
    }

    return journey.journeyId;
  }

  async updateJourney(journey: Journey): Promise<string> {
    const existingWaypointKeys = await this.fetchExistingCoreWaypointKeys(journey.journeyId);
    const nextWaypointKeys = new Set(journey.waypoints.map((waypoint) => waypointSk(waypoint.waypointId)));
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
        throw new NotFoundException('journey not found for updateJourney. Use createJourney instead.');
      }
      this.handleWriteFailure('updateJourney', err);
    }

    return journey.journeyId;
  }

  private async getJourneyItem(journeyId: string, waypoints: RouteWaypoint[]): Promise<Journey> {
    const { Item } = await this.dynamoDBService.getItem(
      new GetItemCommand({
        TableName: this.journeyTable,
        Key: {
          PK: { S: journeyPk(journeyId) },
          SK: { S: journeySk(journeyId) }
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
          ':pk': { S: journeyPk(journeyId) }
        }
      })
    );

    const waypoints: RouteWaypoint[] = [];

    relatedItems.Items?.forEach((item) => {
      const itemType = getJourneyItemType(item.SK.S);
      switch (itemType) {
        case JourneyItemType.Waypoint:
          waypoints.push(waypointsFromDb(item));
          break;

        default:
          break;
      }
    });

    const journey = await this.getJourneyItem(journeyId, waypoints);

    const { error, value } = validateJourney(journey);
    if (error) {
      throw new BadDbDataException(`Validation failure when loading Journey from DB: ${error}`);
    }

    return value;
  }
}
