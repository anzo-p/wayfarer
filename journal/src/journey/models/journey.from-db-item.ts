import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { epochToIso8601 } from 'helpers/date';
import { Journey, RouteWaypoint } from './journey.model';

export const journeyFromDb = (rec: Record<string, AttributeValue>, waypoints: RouteWaypoint[]): Journey => {
  const item: Journey = {
    journeyId: rec.id.S!,
    time: epochToIso8601(Number(rec.time.N!)),
    waypoints
  };

  if (rec.title) {
    item.title = rec.title.S!;
  }

  return item;
};

export const waypointsFromDb = (rec: Record<string, AttributeValue>): RouteWaypoint => {
  const item: RouteWaypoint = {
    waypointId: rec.id.S!,
    coordinate: {
      latitude: Number(rec.latitude.N!),
      longitude: Number(rec.longitude.N!)
    },
    label: rec.label.S!,
    address: rec.address?.S ?? undefined
  };

  return item;
};
