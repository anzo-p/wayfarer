import { v4 as uuidv4 } from 'uuid';

import { Coordinate, RouteWaypoint, UserMarker } from 'types/waypointTypes';
import { findNearest } from 'helpers/location';
import { alphabethAt } from 'helpers/string';

export const calculateDirections = async (markers: UserMarker[]): Promise<google.maps.DirectionsResult> => {
  if (markers.length < 2) {
    console.log('Need at least two markers to calculate a route.');
    Promise.resolve([]);
  }

  const { latitude: originLat, longitude: originLng }: Coordinate = markers[0].coordinate;
  const { latitude: destLat, longitude: destLng }: Coordinate = markers[markers.length - 1].coordinate;

  const waypoints: google.maps.DirectionsWaypoint[] = markers.slice(1, markers.length - 1).map((marker) => {
    const { latitude, longitude } = marker.coordinate;
    return {
      location: new google.maps.LatLng(latitude, longitude),
      stopover: true
    };
  });

  return new google.maps.DirectionsService().route({
    origin: new google.maps.LatLng(originLat, originLng),
    destination: new google.maps.LatLng(destLat, destLng),
    waypoints,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  });
};

export const attachRouteWaypoints = (
  response: google.maps.DirectionsResult,
  userMarkers: UserMarker[],
  routeWaypoints: RouteWaypoint[]
): RouteWaypoint[] => {
  if (response.routes.length === 0 || response.routes[0]?.legs.length === 0) {
    return [];
  }

  const legs = response.routes[0].legs;

  merge(
    routeWaypoints,
    waypoint(
      { latitude: legs[0].start_location.lat(), longitude: legs[0].start_location.lng() },
      legs[0].start_address,
      userMarkers,
      alphabethAt(0)
    )
  );

  legs.forEach((leg, index) => {
    merge(
      routeWaypoints,
      waypoint(
        { latitude: leg.end_location.lat(), longitude: leg.end_location.lng() },
        leg.end_address,
        userMarkers,
        alphabethAt(index + 1)
      )
    );
  });

  return routeWaypoints;
};

const waypoint = (coordinate: Coordinate, address: string, markers: UserMarker[], label: string): RouteWaypoint => {
  const nearestMarker: UserMarker | undefined = findNearest(markers, coordinate);

  return {
    id: uuidv4(),
    label,
    coordinate,
    address,
    userMarkerId: nearestMarker ? nearestMarker.id : undefined
  };
};

const merge = (routeWaypoints: RouteWaypoint[], newWaypoint: RouteWaypoint) => {
  if (!routeWaypoints.map((waypoint) => waypoint.userMarkerId).includes(newWaypoint.userMarkerId)) {
    routeWaypoints.push(newWaypoint);
  }
};

export const getRouteBounds = (markers: UserMarker[]) => {
  const bounds = new window.google.maps.LatLngBounds();
  markers.forEach((marker) => {
    bounds.extend(new window.google.maps.LatLng(marker.coordinate.latitude, marker.coordinate.longitude));
  });
  return bounds;
};
