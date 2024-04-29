import { Coordinate, RouteWaypoint } from '@/src/types/journey';

const proximityThreshold = 0.0001;

export const findNearest = (waypoints: RouteWaypoint[], coordinate: Coordinate): RouteWaypoint | undefined => {
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

export const tooClose = (
  coordinate: Coordinate,
  waypoints: RouteWaypoint[],
  threshold: number = proximityThreshold
) => {
  return waypoints.some((waypoint) => euclidianDistance(coordinate, waypoint.coordinate) < threshold);
};

const euclidianDistance = (a: Coordinate, b: Coordinate) => {
  return Math.sqrt(Math.pow(a.latitude - b.latitude, 2) + Math.pow(a.longitude - b.longitude, 2));
};