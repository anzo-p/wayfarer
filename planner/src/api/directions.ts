import { Coordinate, UserMarker } from '@/src/types/journey';

export type MaybeDirections = google.maps.DirectionsResult | undefined;

type DirectionsOptions = {
  optimizeWaypoints: boolean;
};

export const requestDirections = async (
  markers: UserMarker[],
  options: DirectionsOptions = { optimizeWaypoints: false }
): Promise<MaybeDirections> => {
  if (markers.length < 2) {
    return;
  }

  const { latitude: originLat, longitude: originLng }: Coordinate = markers[0].coordinate;
  const { latitude: destLat, longitude: destLng }: Coordinate = markers[markers.length - 1].coordinate;

  const middleMarkers: google.maps.DirectionsWaypoint[] = markers.slice(1, markers.length - 1).map((marker) => {
    const { latitude, longitude } = marker.coordinate;
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
    optimizeWaypoints: options.optimizeWaypoints,
    travelMode: google.maps.TravelMode.DRIVING
  });
};

export const getMapBounds = (markers: UserMarker[]) => {
  const bounds = new window.google.maps.LatLngBounds();
  markers.forEach((marker) => {
    bounds.extend(new window.google.maps.LatLng(marker.coordinate.latitude, marker.coordinate.longitude));
  });
  return bounds;
};
