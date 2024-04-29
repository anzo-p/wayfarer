import Joi from 'joi';

export type ValidatedModel<T> = { value?: T; error?: Joi.ValidationError };

const idSchema = Joi.string().uuid().required();

const maybeString = Joi.string().optional();

const positiveNumber = Joi.number().positive();

const coordinateSchema = Joi.object({
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180)
});

export const waypointSchema = Joi.object({
  waypointId: idSchema,
  coordinate: coordinateSchema.required(),
  order: positiveNumber.required(),
  address: maybeString
});

export const journeySchema = Joi.object({
  journeyId: idSchema,
  time: Joi.date().iso(),
  title: maybeString,
  waypoints: Joi.array().items(waypointSchema).required()
});

export function createModel<T>(input: any, schema: Joi.ObjectSchema<T>): ValidatedModel<T> {
  const { error, value } = schema.validate(input, { abortEarly: false });

  if (error) {
    return { error };
  } else {
    return { value };
  }
}
