import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Coordinate {
  @Field()
  latitude: number;

  @Field()
  longitude: number;
}

@ObjectType({ description: 'Journey waypoints' })
export class RouteWaypoint {
  @Field(() => ID)
  waypointId: string;

  @Field()
  coordinate: Coordinate;

  @Field()
  order: number;

  @Field({ nullable: true })
  address?: string;
}

@ObjectType({ description: 'Journey' })
export class Journey {
  @Field(() => ID)
  journeyId: string;

  @Field(() => Date)
  time: Date;

  @Field({ nullable: true })
  title?: string;

  @Field(() => [RouteWaypoint])
  waypoints: RouteWaypoint[];
}
