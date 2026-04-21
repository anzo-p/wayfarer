import { Journey, Waypoint } from '@/src/types/journey';

import { JourneyDto, WaypointDto, SaveJourneyInputDto } from './journey.dto';

const toWaypoint = (dto: WaypointDto): Waypoint => ({
  waypointId: dto.waypointId,
  coordinate: {
    latitude: dto.coordinate.latitude,
    longitude: dto.coordinate.longitude
  },
  order: dto.order,
  address: dto.address ?? undefined
});

const toWaypointDto = (waypoint: Waypoint): WaypointDto => ({
  waypointId: waypoint.waypointId,
  coordinate: {
    latitude: waypoint.coordinate.latitude,
    longitude: waypoint.coordinate.longitude
  },
  order: waypoint.order,
  address: waypoint.address
});

export const toJourney = (dto: JourneyDto): Journey => ({
  journeyId: dto.journeyId,
  time: new Date(dto.time),
  title: dto.title ?? undefined,
  waypoints: dto.waypoints.map(toWaypoint),
  readonly: dto.readonly
});

export const toSaveJourneyInputDto = (journey: Journey): SaveJourneyInputDto => ({
  journeyId: journey.journeyId,
  time: journey.time.toISOString(),
  title: journey.title,
  waypoints: journey.waypoints.map(toWaypointDto),
  readonly: journey.readonly
});
