export type Coordinate = {
  latitude: number;
  longitude: number;
};

/**
 * Markers that user adds onto the map. Works as dependency objects in reactive hooks.
 * Rendered when there is no route yet.
 */
export type UserMarker = {
  markerId: string;
  coordinate: Coordinate;
};

/**
 * Parallel state to UserMarkers that may be modified without triggering those reactive hooks.
 * Rendered instead of the UserMarkers when a route exists between any markers.
 */
export type RouteWaypoint = {
  waypointId: string;
  userMarkerId?: string;
  coordinate: Coordinate;
  label: string;
  address?: string;
};

export type Journey = {
  journeyId: string;
  time: Date;
  title?: string;
  markers: UserMarker[];
  waypoints: RouteWaypoint[];
  startWaypointId: string;
  endWaypointId: string;
};

export type MaybeJourney = Journey | undefined;
