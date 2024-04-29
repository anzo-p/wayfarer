import { Coordinate, RouteWaypoint } from '@/src/types/journey';

import { bearingDeviation, calculateBearing } from './location';

const angleThreshold = Number(process.env.NEXT_PUBLIC_ROUTE_DEVIATION_ANGULAR_LIMIT);
const shortLegLimit = Number(process.env.NEXT_PUBLIC_ROUTE_DEVIATION_IGNORE_LEGS_SHORTER_THAN);
const shortStepLimit = Number(process.env.NEXT_PUBLIC_ROUTE_DEVIATION_IGNORE_STEPS_SHORTER_THAN);

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

export const detectDetour = (directions: google.maps.DirectionsResult): boolean => {
  const lastLeg: google.maps.DirectionsLeg = directions.routes[0].legs[directions.routes[0].legs.length - 1];

  if (lastLeg.steps.length < 2) {
    return false;
  }
  if ((lastLeg.distance?.value ?? 0) < shortLegLimit) {
    return false;
  }
  if (lastLeg.start_address.split(' ')[0] !== lastLeg.end_address.split(' ')[0]) {
    return false;
  }

  const startCoordinate: Coordinate = {
    latitude: lastLeg.start_location.lat(),
    longitude: lastLeg.start_location.lng()
  };
  const legBearing = calculateBearing(startCoordinate, {
    latitude: lastLeg.end_location.lat(),
    longitude: lastLeg.end_location.lng()
  });
  const invertedBearing = (legBearing + 180) % 360;
  const excludeShortSteps = lastLeg.steps.filter(
    (step: google.maps.DirectionsStep) => step?.distance?.value ?? 0 > shortStepLimit
  );

  return excludeShortSteps.some((step: google.maps.DirectionsStep) => {
    const stepBearing = calculateBearing(startCoordinate, {
      latitude: step.start_location.lat(),
      longitude: step.start_location.lng()
    });

    const deviationFromStart = bearingDeviation(stepBearing, legBearing);
    const deviationFromEnd = bearingDeviation(stepBearing, invertedBearing);

    if (deviationFromStart > angleThreshold && deviationFromEnd > angleThreshold) {
      return true;
    }
  });
};
