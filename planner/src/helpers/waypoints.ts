import { Coordinate, RouteWaypoint } from '@/src/types/journey';

import { euclidianDistance } from './location';

const proximityThreshold = 0.0001;

export const tooClose = (
  coordinate: Coordinate,
  waypoints: RouteWaypoint[],
  threshold: number = proximityThreshold
) => {
  return waypoints.some((waypoint) => euclidianDistance(coordinate, waypoint.coordinate) < threshold);
};

export const updateAddresses = (legs: google.maps.DirectionsLeg[], waypoints: RouteWaypoint[]): void => {
  legs.forEach((leg) => {
    const waypoint = findNearest(waypoints, {
      latitude: leg.end_location.lat(),
      longitude: leg.end_location.lng()
    });
    if (waypoint) {
      waypoint.address = leg.end_address;
    }
  });
};

const findNearest = (waypoints: RouteWaypoint[], coordinate: Coordinate): RouteWaypoint | undefined => {
  let nearest = undefined;
  let minDistance = Infinity;

  waypoints.forEach((waypoint) => {
    const distance = euclidianDistance(coordinate, waypoint.coordinate);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = waypoint;
    }
  });

  return nearest;
};
