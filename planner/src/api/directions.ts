import { calculateTotalDistance } from '@/src/helpers/directions';
import { Coordinate, RouteWaypoint } from '@/src/types/journey';

export type MaybeDirections = google.maps.DirectionsResult | undefined;

type RouteCriterion = 'distance' | 'duration';

const lengthSensationThreshold = Number(process.env.NEXT_PUBLIC_ROUTE_LENGTH_SENSATION_THRESHOLD);

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
  const directions = await new google.maps.DirectionsService().route({
    origin: new google.maps.LatLng(originLat, originLng),
    destination: new google.maps.LatLng(destLat, destLng),
    waypoints: middleMarkers,
    optimizeWaypoints: false,
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true
  });

  const optimalRoute =
    calculateTotalDistance(directions) < lengthSensationThreshold
      ? getOptimalRoute(directions, 'distance')
      : getOptimalRoute(directions, 'duration');

  return {
    ...directions,
    routes: [optimalRoute]
  };
};

const getOptimalRoute = (
  directions: google.maps.DirectionsResult,
  criterion: RouteCriterion
): google.maps.DirectionsRoute => {
  return directions.routes.reduce((optimal, current) => {
    const currentVal = current.legs.reduce((sum, leg) => sum + (leg[criterion]?.value ?? Infinity), 0);
    const optimalVal = optimal.legs.reduce((sum, leg) => sum + (leg[criterion]?.value ?? Infinity), 0);

    return currentVal < optimalVal ? current : optimal;
  });
};
