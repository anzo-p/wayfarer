import { Coordinate, RouteWaypoint } from '@/src/types/journey';

import { euclideanDistance } from './location';

const proximityThreshold = 0.0001;

export const canBeCleared = (waypoints: RouteWaypoint[]): boolean => waypoints.length > 0;

export const canMakeRoute = (waypoints: RouteWaypoint[]): boolean => waypoints.length > 1;

export const reindex = (waypoints: RouteWaypoint[]): RouteWaypoint[] =>
  [...waypoints].map((waypoint, index) => ({
    ...waypoint,
    order: index + 1
  }));

export const sort = (waypoints: RouteWaypoint[]): RouteWaypoint[] => [...waypoints].sort((a, b) => a.order - b.order);

export const tooClose = (
  coordinate: Coordinate,
  waypoints: RouteWaypoint[],
  threshold: number = proximityThreshold
) => {
  return waypoints.some((waypoint) => euclideanDistance(coordinate, waypoint.coordinate) < threshold);
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
    const distance = euclideanDistance(coordinate, waypoint.coordinate);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = waypoint;
    }
  });

  return nearest;
};
