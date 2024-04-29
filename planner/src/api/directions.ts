import { Coordinate, RouteWaypoint } from '@/src/types/journey';

export type MaybeDirections = google.maps.DirectionsResult | undefined;

export const requestDirections = async (waypoints: RouteWaypoint[]): Promise<MaybeDirections> => {
  if (waypoints.length < 2) {
    return;
  }

  waypoints.sort((a, b) => a.order - b.order);

  const { latitude: originLat, longitude: originLng }: Coordinate = waypoints[0].coordinate;
  const { latitude: destLat, longitude: destLng }: Coordinate = waypoints[waypoints.length - 1].coordinate;

  const middleMarkers: google.maps.DirectionsWaypoint[] = waypoints.slice(1, waypoints.length - 1).map((waypoint) => {
    const { latitude, longitude } = waypoint.coordinate;
    return {
      location: new google.maps.LatLng(latitude, longitude),
      stopover: true
    };
  });

  console.log('Call Google Maps Directions');
  return new google.maps.DirectionsService().route({
    origin: new google.maps.LatLng(originLat, originLng),
    destination: new google.maps.LatLng(destLat, destLng),
    waypoints: middleMarkers,
    optimizeWaypoints: false,
    travelMode: google.maps.TravelMode.DRIVING
  });
};

export const getMapBounds = (waypoints: RouteWaypoint[]) => {
  const bounds = new window.google.maps.LatLngBounds();
  waypoints.forEach((waypoint) => {
    bounds.extend(new window.google.maps.LatLng(waypoint.coordinate.latitude, waypoint.coordinate.longitude));
  });
  return bounds;
};
