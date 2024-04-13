import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Coordinate {
  @Field()
  latitude: number;

  @Field()
  longitude: number;
}

@ObjectType()
export class UserMarker {
  @Field(() => ID)
  markerId: string;

  @Field()
  coordinate: Coordinate;
}

@ObjectType({ description: 'Journey waypoints' })
export class RouteWaypoint {
  @Field(() => ID)
  waypointId: string;

  @Field()
  userMarkerId?: string;

  @Field()
  coordinate: Coordinate;

  @Field()
  label: string;

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

  @Field(() => [UserMarker])
  markers: UserMarker[];

  @Field(() => [RouteWaypoint])
  waypoints: RouteWaypoint[];

  @Field()
  startWaypointId: string;

  @Field()
  endWaypointId: string;
}
