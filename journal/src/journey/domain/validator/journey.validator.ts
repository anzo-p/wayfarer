import { Journey, RouteWaypoint } from '../journey.model';
import { ValidatedModel, createModel, journeySchema, waypointSchema } from './journey.schemas';

export function validateJourney(input: any): ValidatedModel<Journey> {
  const result = createModel(input, journeySchema);

  if (result.value) {
    result.value.time = new Date(result.value.time);
  }
  return result;
}

export function validateWaypoint(input: any): ValidatedModel<RouteWaypoint> {
  return createModel(input, waypointSchema);
}
