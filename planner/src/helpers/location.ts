import { Coordinate } from '@/src/types/journey';

export const euclidianDistance = (a: Coordinate, b: Coordinate) => {
  return Math.sqrt(Math.pow(a.latitude - b.latitude, 2) + Math.pow(a.longitude - b.longitude, 2));
};
