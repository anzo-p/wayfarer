import { makeWaypoint, updateLabels } from '@/src/helpers/waypoints';
import { Coordinate, RouteWaypoint, UserMarker } from '@/src/types/journey';

export type MaybeDirections = google.maps.DirectionsResult | undefined;

export const requestDirections = async (markers: UserMarker[]): Promise<MaybeDirections> => {
  if (markers.length < 2) {
    return;
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

export const linkWaypointsToMarkers = (
  response: google.maps.DirectionsResult,
  userMarkers: UserMarker[],
  routeWaypoints: RouteWaypoint[]
): RouteWaypoint[] => {
  if (response.routes.length === 0 || response.routes[0]?.legs.length === 0) {
    return [];
  }

  const legs: google.maps.DirectionsLeg[] = response.routes[0].legs;

  mergeWaypoint(
    routeWaypoints,
    makeWaypoint(
      { latitude: legs[0].start_location.lat(), longitude: legs[0].start_location.lng() },
      legs[0].start_address,
      userMarkers
    )
  );

  legs.forEach((leg) => {
    mergeWaypoint(
      routeWaypoints,
      makeWaypoint(
        { latitude: leg.end_location.lat(), longitude: leg.end_location.lng() },
        leg.end_address,
        userMarkers
      )
    );
  });

  updateLabels(legs, routeWaypoints);

  return routeWaypoints;
};

export const getMapBounds = (markers: UserMarker[]) => {
  const bounds = new window.google.maps.LatLngBounds();
  markers.forEach((marker) => {
    bounds.extend(new window.google.maps.LatLng(marker.coordinate.latitude, marker.coordinate.longitude));
  });
  return bounds;
};

const mergeWaypoint = (waypoints: RouteWaypoint[], newWaypoint: RouteWaypoint) => {
  if (!waypoints.map((waypoint) => waypoint.userMarkerId).includes(newWaypoint.userMarkerId)) {
    waypoints.push(newWaypoint);
  }
};
