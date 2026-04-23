import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DynamoDBService } from '../../dynamodb/dynamodb.service';
import { Journey } from '../domain/journey.model';
import { JourneyRepository } from './journey.repository';

describe('JourneyRepository', () => {
  const journeyTable = 'journeys';
  const journey: Journey = {
    journeyId: 'c4dbe0b2-7c29-4c71-ae61-9384cce3a26e',
    time: new Date('2026-04-22T08:00:00.000Z'),
    title: 'Test journey',
    readonly: false,
    waypoints: [
      {
        waypointId: '11111111-1111-4111-8111-111111111111',
        coordinate: { latitude: 60.1699, longitude: 24.9384 },
        order: 2
      },
      {
        waypointId: '22222222-2222-4222-8222-222222222222',
        coordinate: { latitude: 60.2055, longitude: 24.6559 },
        order: 1
      }
    ]
  };

  const configServiceMock = {
    get: jest.fn((key: string) => {
      if (key === 'JOURNEY_TABLE') {
        return journeyTable;
      }
      return undefined;
    })
  } as unknown as ConfigService;

  const dynamoDbServiceMock = {
    getItem: jest.fn(),
    queryItem: jest.fn(),
    transactWriteItems: jest.fn()
  } as unknown as jest.Mocked<DynamoDBService>;

  let repository: JourneyRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new JourneyRepository(configServiceMock, dynamoDbServiceMock);
  });

  it('creates a journey atomically with its waypoint items', async () => {
    dynamoDbServiceMock.transactWriteItems.mockResolvedValueOnce();

    await expect(repository.createJourney(journey)).resolves.toBe(journey.journeyId);

    expect(dynamoDbServiceMock.transactWriteItems).toHaveBeenCalledTimes(1);
    const [command] = dynamoDbServiceMock.transactWriteItems.mock.calls[0];
    const transactItems = command.input.TransactItems ?? [];

    expect(transactItems).toHaveLength(1 + journey.waypoints.length);
    expect(transactItems[0]?.Put?.ConditionExpression).toBe('attribute_not_exists(PK)');
    expect(transactItems[0]?.Put?.Item?.PK).toEqual({ S: `JOURNEY#${journey.journeyId}` });
    expect(transactItems.slice(1).every((item) => item.Put?.ConditionExpression === 'attribute_not_exists(PK)')).toBe(
      true
    );
  });

  it('updates only core journey items and leaves future non-core items untouched', async () => {
    dynamoDbServiceMock.queryItem.mockResolvedValueOnce({
      Items: [
        { SK: { S: 'WAYPOINT#11111111-1111-4111-8111-111111111111' } },
        { SK: { S: 'WAYPOINT#33333333-3333-4333-8333-333333333333' } },
        { SK: { S: 'PHOTO#photo-1' } }
      ]
    } as never);
    dynamoDbServiceMock.transactWriteItems.mockResolvedValueOnce();

    await expect(repository.updateJourney(journey)).resolves.toBe(journey.journeyId);

    const [command] = dynamoDbServiceMock.transactWriteItems.mock.calls[0];
    const transactItems = command.input.TransactItems ?? [];

    expect(transactItems[0]?.Put?.ConditionExpression).toBe('attribute_exists(PK)');
    expect(
      transactItems.some((item) => item.Delete?.Key?.SK?.S === 'WAYPOINT#33333333-3333-4333-8333-333333333333')
    ).toBe(true);
    expect(transactItems.some((item) => item.Delete?.Key?.SK?.S === 'PHOTO#photo-1')).toBe(false);
  });

  it('returns waypoints ordered by their explicit order field', async () => {
    dynamoDbServiceMock.queryItem.mockResolvedValueOnce({
      Items: [
        {
          PK: { S: `JOURNEY#${journey.journeyId}` },
          SK: { S: 'WAYPOINT#11111111-1111-4111-8111-111111111111' },
          id: { S: '11111111-1111-4111-8111-111111111111' },
          latitude: { N: '60.1699' },
          longitude: { N: '24.9384' },
          order: { N: '2' }
        },
        {
          PK: { S: `JOURNEY#${journey.journeyId}` },
          SK: { S: 'PHOTO#photo-1' }
        },
        {
          PK: { S: `JOURNEY#${journey.journeyId}` },
          SK: { S: 'WAYPOINT#22222222-2222-4222-8222-222222222222' },
          id: { S: '22222222-2222-4222-8222-222222222222' },
          latitude: { N: '60.2055' },
          longitude: { N: '24.6559' },
          order: { N: '1' }
        }
      ]
    } as never);
    dynamoDbServiceMock.getItem.mockResolvedValueOnce({
      Item: {
        PK: { S: `JOURNEY#${journey.journeyId}` },
        SK: { S: `JOURNEY#${journey.journeyId}` },
        id: { S: journey.journeyId },
        time: { N: String(journey.time.getTime()) },
        readonly: { BOOL: false },
        title: { S: journey.title! }
      }
    } as never);

    await expect(repository.fetchJourney(journey.journeyId)).resolves.toMatchObject({
      journeyId: journey.journeyId,
      waypoints: [
        { waypointId: '22222222-2222-4222-8222-222222222222', order: 1 },
        { waypointId: '11111111-1111-4111-8111-111111111111', order: 2 }
      ]
    });
  });

  it('maps missing journeys on save to not found', async () => {
    dynamoDbServiceMock.queryItem.mockResolvedValueOnce({ Items: [] } as never);
    dynamoDbServiceMock.transactWriteItems.mockRejectedValueOnce({
      name: 'TransactionCanceledException'
    });

    await expect(repository.updateJourney(journey)).rejects.toBeInstanceOf(NotFoundException);
  });
});
