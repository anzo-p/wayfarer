import { ConfigService } from '@nestjs/config';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { GetItemCommand, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { Journey, RouteWaypoint, UserMarker } from './models/journey.model';
import { journeyFromDb, markersFromDb, waypointsFromDb } from './models/journey.from-db-item';
import { journeyToDb, markersToDb, waypointsToDb } from './models/journey.to-db-item';
import { validateJourney } from './validator/journey.validator';
import { BadDbDataException } from 'journey/errors/errors.custom-errors';

@Injectable()
export class JourneysRepository {
  private readonly journeyTable: string;

  constructor(
    private configService: ConfigService,
    private dynamoDBService: DynamoDBService
  ) {
    this.journeyTable = this.configService.get<string>('JOURNEY_TABLE');
  }

  private async getJourneyItem(journeyId: string, waypoints: RouteWaypoint[], markers: UserMarker[]): Promise<Journey> {
    const { Item } = await this.dynamoDBService.getItem(
      new GetItemCommand({
        TableName: this.journeyTable,
        Key: {
          PK: { S: `JOURNEY#${journeyId}` },
          SK: { S: `JOURNEY#${journeyId}` }
        }
      })
    );

    if (!Item) {
      throw new NotFoundException('journey not found');
    }

    return journeyFromDb(Item, waypoints, markers);
  }

  async saveJourney(journey: Journey): Promise<string> {
    const journeyItemParams = new PutItemCommand({
      TableName: this.journeyTable,
      Item: journeyToDb(journey),
      ConditionExpression: 'attribute_not_exists(PK)'
    });

    try {
      await this.dynamoDBService.putItemWithRetry(journeyItemParams);
    } catch (err) {
      if (err instanceof Error && err.name === 'ConditionalCheckFailedException') {
        throw new ConflictException('journey already exists');
      }
      throw new Error('Failed to save journey');
    }

    const journeyId = journey.journeyId;
    const waypoints = waypointsToDb(journeyId, journey.waypoints);
    const markers = markersToDb(journeyId, journey.markers);

    await this.dynamoDBService.bulkInsert(this.journeyTable, waypoints.concat(markers));

    return journeyId;
  }

  async saveWaypoints(journeyId: string, waypoints: RouteWaypoint[]): Promise<void> {
    return this.dynamoDBService.bulkInsert(this.journeyTable, waypointsToDb(journeyId, waypoints));
  }

  async saveMarkers(journeyId: string, markers: UserMarker[]): Promise<void> {
    return this.dynamoDBService.bulkInsert(this.journeyTable, markersToDb(journeyId, markers));
  }

  async fetchJourney(journeyId: string): Promise<Journey> {
    const relatedItems = await this.dynamoDBService.queryItem(
      new QueryCommand({
        TableName: this.journeyTable,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': { S: `JOURNEY#${journeyId}` }
        }
      })
    );

    const waypoints: RouteWaypoint[] = [];
    const markers: UserMarker[] = [];

    relatedItems.Items?.forEach((item) => {
      const itemType = item.SK.S?.split('#')[0];
      switch (itemType) {
        case 'WAYPOINT':
          waypoints.push(waypointsFromDb(item));
          break;
        case 'USER_MARKER':
          markers.push(markersFromDb(item));
          break;
        default:
          break;
      }
    });

    const journey = await this.getJourneyItem(journeyId, waypoints, markers);

    const { error, value } = validateJourney(journey);
    if (error) {
      throw new BadDbDataException(`Validation failure when loadeing Journey from DB: ${error}`);
    }

    return value;
  }
}
