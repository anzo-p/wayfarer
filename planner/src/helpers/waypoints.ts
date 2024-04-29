import { RouteWaypoint } from '@/src/types/journey';

import { findNearest } from './location';

export const updateAddresses = (legs: google.maps.DirectionsLeg[], waypoints: RouteWaypoint[]): void => {
  legs.forEach((leg) => {
    const waypoint = findNearest(waypoints, {
      latitude: leg.end_location.lat(),
      longitude: leg.end_location.lng()
    });
    if (waypoint) {
      waypoint.address = leg.end_address;
    }
  });
};
