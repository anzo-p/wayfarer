import { Coordinate } from '@/src/types/journey';

export const euclidianDistance = (a: Coordinate, b: Coordinate) => {
  return Math.sqrt(Math.pow(a.latitude - b.latitude, 2) + Math.pow(a.longitude - b.longitude, 2));
};

export const calculateBearing = (a: Coordinate, b: Coordinate): number => {
  const rad = Math.PI / 180;
  const phi1 = a.latitude * rad;
  const phi2 = b.latitude * rad;
  const deltaLambda = (b.longitude - a.longitude) * rad;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);

  return (theta * (180 / Math.PI) + 360) % 360;
};

export const bearingDeviation = (bearing: number, reference: number): number => {
  const bearingDifference = Math.abs(bearing - reference);
  return bearingDifference > 180 ? 360 - bearingDifference : bearingDifference;
};
