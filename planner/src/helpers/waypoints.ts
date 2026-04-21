import { Coordinate, Waypoint } from '@/src/types/journey';

import { euclideanDistance } from './location';

const proximityThreshold = 0.0001;

export const hasWaypoints = (waypoints: Waypoint[]): boolean => waypoints.length > 0;

export const canRequestRoute = (waypoints: Waypoint[]): boolean => waypoints.length > 1;

export const canonicalize = (waypoints: Waypoint[]): Waypoint[] =>
  reindex([...waypoints].sort((a, b) => a.order - b.order));

export const isTooClose = (
  coordinate: Coordinate,
  waypoints: Waypoint[],
  threshold: number = proximityThreshold
): Boolean => waypoints.some((waypoint) => euclideanDistance(coordinate, waypoint.coordinate) < threshold);

export const buildRouteSignature = (waypoints: Waypoint[]): string =>
  waypoints
    .map(
      (waypoint) =>
        `${waypoint.waypointId}:${waypoint.order}:${waypoint.coordinate.latitude}:${waypoint.coordinate.longitude}`
    )
    .join('|');

const reindex = (waypoints: Waypoint[]): Waypoint[] =>
  [...waypoints].map((waypoint, index) => ({
    ...waypoint,
    order: index + 1
  }));
