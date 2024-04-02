import { v4 as uuidv4 } from 'uuid';

import { Coordinate, RouteWaypoint, UserMarker } from 'types/waypointTypes';
import { findNearest } from 'helpers/location';
import { alphabethAt } from 'helpers/string';

export const calculateRoute = async (waypoints: UserMarker[]): Promise<google.maps.DirectionsResult> => {
  if (waypoints.length < 2) {
    console.log('Need at least two waypoints to calculate a route.');
    Promise.resolve([]);
  }

  const { latitude: originLat, longitude: originLng }: Coordinate = waypoints[0].coordinate;
  const { latitude: destLat, longitude: destLng }: Coordinate = waypoints[waypoints.length - 1].coordinate;

  const markers = waypoints.slice(1, waypoints.length - 1).map((waypoint) => {
    const { latitude, longitude } = waypoint.coordinate;
    return {
      location: new google.maps.LatLng(latitude, longitude),
      stopover: true
    };
  });

  return new google.maps.DirectionsService().route({
    origin: new google.maps.LatLng(originLat, originLng),
    destination: new google.maps.LatLng(destLat, destLng),
    waypoints: markers,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  });
};

export const getRouteWaypoints = (
  response: google.maps.DirectionsResult,
  userWaypoints: UserMarker[]
): RouteWaypoint[] => {
  if (response.routes.length === 0 || response.routes[0]?.legs.length === 0) {
    return [];
  }

  const legs = response.routes[0].legs;
  const routewaypoints: RouteWaypoint[] = [];

  routewaypoints.push(
    waypoint(
      { latitude: legs[0].start_location.lat(), longitude: legs[0].start_location.lng() },
      legs[0].start_address,
      userWaypoints,
      alphabethAt(0)
    )
  );

  legs.forEach((leg, index) => {
    routewaypoints.push(
      waypoint(
        { latitude: leg.end_location.lat(), longitude: leg.end_location.lng() },
        leg.end_address,
        userWaypoints,
        alphabethAt(index + 1)
      )
    );
  });

  return routewaypoints;
};

const waypoint = (
  coordinate: Coordinate,
  address: string,
  userWaypoints: UserMarker[],
  label: string
): RouteWaypoint => {
  const nearestMarker: UserMarker | undefined = findNearest(userWaypoints, coordinate);

  return {
    id: uuidv4(),
    label,
    coordinate,
    address,
    userMarkerId: nearestMarker ? nearestMarker.id : undefined
  };
};

export const getRouteBounds = (waypoints: UserMarker[]) => {
  const bounds = new window.google.maps.LatLngBounds();
  waypoints.forEach((waypoint) => {
    bounds.extend(new window.google.maps.LatLng(waypoint.coordinate.latitude, waypoint.coordinate.longitude));
  });
  return bounds;
};
