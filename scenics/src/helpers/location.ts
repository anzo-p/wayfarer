import { Coordinate, UserMarker } from 'types/waypointTypes';

const proximityThreshold = 0.0001;

export const findNearest = (waypoints: UserMarker[], coordinate: Coordinate): UserMarker | undefined => {
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

export const tooClose = (coordinate: Coordinate, waypoints: UserMarker[], threshold: number = proximityThreshold) => {
  return waypoints.some((waypoint) => euclidianDistance(coordinate, waypoint.coordinate) < threshold);
};

const euclidianDistance = (a: Coordinate, b: Coordinate) => {
  return Math.sqrt(Math.pow(a.latitude - b.latitude, 2) + Math.pow(a.longitude - b.longitude, 2));
};
