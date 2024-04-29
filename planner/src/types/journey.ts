import { v4 as uuidv4 } from 'uuid';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RouteWaypoint = {
  waypointId: string;
  coordinate: Coordinate;
  label: string;
  address?: string;
};

export type Journey = {
  journeyId: string;
  time: Date;
  title?: string;
  waypoints: RouteWaypoint[];
  notes?: string;
};

export type MaybeJourney = Journey | undefined;

export const makeJourney = (): Journey => ({
  journeyId: uuidv4(),
  time: new Date(),
  waypoints: []
});
