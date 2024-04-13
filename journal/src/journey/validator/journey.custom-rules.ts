import Joi from 'joi';
import { Journey, RouteWaypoint, UserMarker } from 'journey/models/journey.model';

export const referentialIntegrity = (journey: Journey, helpers: Joi.CustomHelpers) => {
  const { markers, waypoints } = journey;

  const markerIds = markers.map((marker: UserMarker) => marker.markerId);
  for (const waypoint of waypoints) {
    if (!markerIds.includes(waypoint.userMarkerId)) {
      return helpers.message({
        custom: `userMarkerId ${waypoint.userMarkerId} in RouteWaypoints does not exist in UserMarkers`
      });
    }
  }

  const waypointIds = waypoints.map((waypoint: RouteWaypoint) => waypoint.waypointId);
  if (!waypointIds.includes(journey.startWaypointId)) {
    return helpers.message({
      custom: `startWaypointId ${journey.startWaypointId} does not exist in RouteWaypoints`
    });
  }
  if (!waypointIds.includes(journey.endWaypointId)) {
    return helpers.message({
      custom: `endWaypointId ${journey.endWaypointId} does not exist in RouteWaypoints`
    });
  }

  return journey;
};
