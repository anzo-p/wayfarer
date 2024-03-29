export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type UserMarker = {
  id: string;
  coordinate: Coordinate;
};

export interface RouteWaypoint {
  id: string;
  coordinate: Coordinate;
  label: string;
  address?: string;
  userWaypointId?: string;
}
