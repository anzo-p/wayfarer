import Joi from 'joi';
import { referentialIntegrity } from './journey.custom-rules';

export type ValidatedModel<T> = { value?: T; error?: Joi.ValidationError };

const idSchema = Joi.string().uuid().required();

const maybeString = Joi.string().optional();

const positiveNumber = Joi.number().positive();

const coordinateSchema = Joi.object({
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180)
});

export const markerSchema = Joi.object({
  markerId: idSchema,
  coordinate: coordinateSchema.required()
});

export const waypointSchema = Joi.object({
  waypointId: idSchema,
  userMarkerId: idSchema,
  coordinate: coordinateSchema.required(),
  label: Joi.string().required().length(1),
  address: maybeString
});

export const journeySchema = Joi.object({
  journeyId: idSchema,
  time: Joi.date().iso(),
  title: maybeString,
  markers: Joi.array().items(markerSchema).required(),
  waypoints: Joi.array().items(waypointSchema).required(),
  startWaypointId: idSchema,
  endWaypointId: idSchema
}).custom(referentialIntegrity);

export function createModel<T>(input: any, schema: Joi.ObjectSchema<T>): ValidatedModel<T> {
  const { error, value } = schema.validate(input, { abortEarly: false });

  if (error) {
    return { error };
  } else {
    return { value };
  }
}
