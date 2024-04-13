import { v4 as uuidv4 } from 'uuid';

import { Coordinate, RouteWaypoint, UserMarker } from '@/src/types/journey';
import { alphabethAt } from './string';
import { findNearest } from './location';

export const makeWaypoint = (
  coordinate: Coordinate,
  address: string,
  markers: UserMarker[],
  label: string = ''
): RouteWaypoint => {
  const nearestMarker: UserMarker | undefined = findNearest(markers, coordinate);

  return {
    waypointId: uuidv4(),
    label,
    coordinate,
    address,
    userMarkerId: nearestMarker ? nearestMarker.markerId : undefined
  };
};

export const updateLabels = (legs: google.maps.DirectionsLeg[], waypoints: RouteWaypoint[]): void => {
  const makeKey = (lat: number, lng: number) => `${lat},${lng}`;

  const waypointLookup = new Map(
    waypoints.map((waypoint) => [makeKey(waypoint.coordinate.latitude, waypoint.coordinate.longitude), waypoint])
  );

  const firstWaypoint = waypointLookup.get(makeKey(legs[0].start_location.lat(), legs[0].start_location.lng()));
  if (firstWaypoint) {
    firstWaypoint.label = 'A';
  }

  legs.forEach((leg, index) => {
    const waypoint = waypointLookup.get(makeKey(leg.end_location.lat(), leg.end_location.lng()));
    if (waypoint) {
      waypoint.label = alphabethAt(index + 1);
    }
  });
};
