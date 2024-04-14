import { v4 as uuidv4 } from 'uuid';

import { Coordinate, RouteWaypoint, UserMarker } from '@/src/types/journey';

import { findNearest } from './location';
import { alphabethAt } from './string';

type StartEndWaypoints = {
  start: RouteWaypoint | undefined;
  finish: RouteWaypoint | undefined;
};

export const refreshWaypoints = (
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

export const getStartAndFinish = (
  directions: google.maps.DirectionsResult,
  waypoints: RouteWaypoint[]
): StartEndWaypoints => {
  function findByLatLong(lat: number, lng: number): RouteWaypoint | undefined {
    return waypoints.find((w) => w.coordinate.latitude === lat && w.coordinate.longitude === lng);
  }

  const startLoc = directions.routes[0].legs[0].start_location;
  const finishLoc = directions.routes[0].legs[directions.routes[0].legs.length - 1].end_location;

  return {
    start: findByLatLong(startLoc.lat(), startLoc.lng()),
    finish: findByLatLong(finishLoc.lat(), finishLoc.lng())
  };
};

const updateLabels = (legs: google.maps.DirectionsLeg[], waypoints: RouteWaypoint[]): void => {
  const makeKey = (lat: number, lng: number) => `${lat},${lng}`;

  const waypointLookup = new Map(
    waypoints.map((waypoint) => [makeKey(waypoint.coordinate.latitude, waypoint.coordinate.longitude), waypoint])
  );

  const firstWaypoint = waypointLookup.get(makeKey(legs[0].start_location.lat(), legs[0].start_location.lng()));
  if (firstWaypoint) {
    firstWaypoint.label = 'A';
  }

  legs.forEach((leg, index) => {
    const waypoint = waypointLookup.get(makeKey(leg.end_location.lat(), leg.end_location.lng()));
    if (waypoint) {
      waypoint.label = alphabethAt(index + 1);
    }
  });
};

const makeWaypoint = (
  coordinate: Coordinate,
  address: string,
  markers: UserMarker[],
  label: string = ''
): RouteWaypoint => {
  const nearestMarker: UserMarker | undefined = findNearest(markers, coordinate);

  return {
    waypointId: uuidv4(),
    label,
    coordinate,
    address,
    userMarkerId: nearestMarker ? nearestMarker.markerId : undefined
  };
};

const mergeWaypoint = (waypoints: RouteWaypoint[], newWaypoint: RouteWaypoint) => {
  if (!waypoints.map((waypoint) => waypoint.userMarkerId).includes(newWaypoint.userMarkerId)) {
    waypoints.push(newWaypoint);
  }
};
