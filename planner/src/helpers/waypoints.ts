import { Coordinate, RouteWaypoint } from '@/src/types/journey';

import { euclideanDistance } from './location';

type CoordinateKey = string;

const proximityThreshold = 0.0001;

export const canBeCleared = (waypoints: RouteWaypoint[]): boolean => waypoints.length > 0;

export const canMakeRoute = (waypoints: RouteWaypoint[]): boolean => waypoints.length > 1;

export const canonicalize = (waypoints: RouteWaypoint[]): RouteWaypoint[] =>
  reindex([...waypoints].sort((a, b) => a.order - b.order));

export const mapAddresses = (legs: google.maps.DirectionsLeg[], waypoints: RouteWaypoint[]): RouteWaypoint[] => {
  const addressesByWaypointId = new Map<CoordinateKey, string>();

  legs.forEach((leg) => {
    const waypoint = findNearest(waypoints, {
      latitude: leg.end_location.lat(),
      longitude: leg.end_location.lng()
    });
    if (waypoint) {
      addressesByWaypointId.set(waypoint.waypointId, leg.end_address);
    }
  });

  return waypoints.map((waypoint) => ({
    ...waypoint,
    address: addressesByWaypointId.get(waypoint.waypointId) ?? waypoint.address
  }));
};

export const tooClose = (coordinate: Coordinate, waypoints: RouteWaypoint[], threshold: number = proximityThreshold) =>
  waypoints.some((waypoint) => euclideanDistance(coordinate, waypoint.coordinate) < threshold);

const reindex = (waypoints: RouteWaypoint[]): RouteWaypoint[] =>
  [...waypoints].map((waypoint, index) => ({
    ...waypoint,
    order: index + 1
  }));

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
