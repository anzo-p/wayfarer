import { Journey, RouteWaypoint } from '@/src/types/journey';

import { JourneyDto, RouteWaypointDto, SaveJourneyInputDto } from './journey.dto';

const toRouteWaypoint = (dto: RouteWaypointDto): RouteWaypoint => ({
  waypointId: dto.waypointId,
  coordinate: {
    latitude: dto.coordinate.latitude,
    longitude: dto.coordinate.longitude
  },
  order: dto.order,
  address: dto.address ?? undefined
});

const toRouteWaypointDto = (waypoint: RouteWaypoint): RouteWaypointDto => ({
  waypointId: waypoint.waypointId,
  coordinate: {
    latitude: waypoint.coordinate.latitude,
    longitude: waypoint.coordinate.longitude
  },
  order: waypoint.order,
  address: waypoint.address ?? 'address undefined'
});

export const toJourney = (dto: JourneyDto): Journey => ({
  journeyId: dto.journeyId,
  time: new Date(dto.time),
  title: dto.title ?? undefined,
  waypoints: dto.waypoints.map(toRouteWaypoint),
  readonly: dto.readonly
});

export const toSaveJourneyInputDto = (journey: Journey): SaveJourneyInputDto => ({
  journeyId: journey.journeyId,
  time: journey.time.toISOString(),
  title: journey.title ?? "I'm feeling lucky!",
  waypoints: journey.waypoints.map(toRouteWaypointDto),
  readonly: journey.readonly
});
