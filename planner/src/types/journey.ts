import { v4 as uuidv4 } from 'uuid';

export type JourneyId = string;

export type WaypointId = string;

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type Waypoint = {
  waypointId: WaypointId;
  coordinate: Coordinate;
  order: number;
  address?: string;
};

export type Journey = {
  journeyId: JourneyId;
  time: Date;
  title?: string;
  waypoints: Waypoint[];
  notes?: string;
  readonly: boolean;
};

export type MaybeJourney = Journey | undefined;

export const makeJourney = (): Journey => ({
  journeyId: uuidv4(),
  time: new Date(),
  waypoints: [],
  readonly: false
});

export const makeReadonlyCopy = (journey: Journey): Journey => {
  const { time, title, waypoints, notes } = journey;
  return {
    journeyId: uuidv4(),
    time: new Date(time),
    title,
    waypoints: waypoints.map((waypoint) => ({
      ...waypoint,
      coordinate: { ...waypoint.coordinate }
    })),
    notes,
    readonly: true
  };
};
