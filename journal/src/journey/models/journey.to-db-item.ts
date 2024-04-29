import { PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { iso8601ToEpoch } from 'helpers/date';
import { Journey, RouteWaypoint } from './journey.model';

export const journeyToDb = (journey: Journey): PutItemCommandInput['Item'] => {
  const item: PutItemCommandInput['Item'] = {
    PK: { S: `JOURNEY#${journey.journeyId}` },
    SK: { S: `JOURNEY#${journey.journeyId}` },
    id: { S: journey.journeyId },
    time: { N: iso8601ToEpoch(journey.time).toString() }
  };

  if (journey.title) {
    item.title = { S: journey.title };
  }

  return item;
};

export const waypointsToDb = (journeyId: string, waypoints: RouteWaypoint[]): PutItemCommandInput['Item'][] => {
  const items = waypoints.map((waypoint) => {
    const item: PutItemCommandInput['Item'] = {
      PK: { S: `JOURNEY#${journeyId}` },
      SK: { S: `WAYPOINT#${waypoint.waypointId}` },
      id: { S: waypoint.waypointId },
      latitude: { N: waypoint.coordinate.latitude.toString() },
      longitude: { N: waypoint.coordinate.longitude.toString() },
      order: { N: waypoint.order.toString() }
    };

    if (waypoint.address) {
      item.address = { S: waypoint.address };
    }

    return item;
  });

  return items.flat();
};
