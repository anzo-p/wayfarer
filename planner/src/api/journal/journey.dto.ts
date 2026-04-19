export type CoordinateDto = {
  latitude: number;
  longitude: number;
};

export type RouteWaypointDto = {
  waypointId: string;
  coordinate: CoordinateDto;
  order: number;
  address?: string | null;
};

export type JourneyDto = {
  journeyId: string;
  time: string;
  title?: string | null;
  waypoints: RouteWaypointDto[];
  readonly: boolean;
};

export type SaveJourneyInputDto = {
  journeyId: string;
  time: string;
  title?: string | null;
  waypoints: RouteWaypointDto[];
  readonly: boolean;
};
