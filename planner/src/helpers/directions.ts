import { RouteWaypoint } from '@/src/types/journey';

export const getMapBounds = (waypoints: RouteWaypoint[]) => {
  const bounds = new window.google.maps.LatLngBounds();
  waypoints.forEach((waypoint) => {
    bounds.extend(new window.google.maps.LatLng(waypoint.coordinate.latitude, waypoint.coordinate.longitude));
  });
  return bounds;
};

export const calculateTotalDistance = (directions: google.maps.DirectionsResult): number =>
  directions.routes.reduce((agg, route: google.maps.DirectionsRoute) => {
    const distance = route.legs[0].distance ? route.legs[0].distance.value : Infinity;
    return agg + distance;
  }, 0);
