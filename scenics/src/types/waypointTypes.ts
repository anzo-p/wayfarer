export type Coordinate = {
  latitude: number;
  longitude: number;
};

/**
 * Markers that user adds onto the map. Works as dependency objects in reactive hooks.
 * Rendered when there is no route yet.
 */
export type UserMarker = {
  id: string;
  coordinate: Coordinate;
};

/**
 * Parallel state to UserMarkers that may be modified without triggering those reactive hooks.
 * Rendered instead of the UserMarkers when a route exists between any markers.
 */
export type RouteWaypoint = {
  id: string;
  coordinate: Coordinate;
  label: string;
  address?: string;
  userMarkerId?: string;
};
