import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class InputCoordinate {
  @Field()
  latitude: number;

  @Field()
  longitude: number;
}

@InputType()
export class InputRouteWaypoint {
  @Field(() => ID)
  waypointId: string;

  @Field()
  coordinate: InputCoordinate;

  @Field()
  label: string;

  @Field({ nullable: true })
  address?: string;
}

@InputType()
export class NewJourneyInput {
  @Field(() => ID)
  journeyId: string;

  @Field(() => Date)
  time: Date;

  @Field({ nullable: true })
  title?: string;

  @Field(() => [InputRouteWaypoint])
  waypoints: InputRouteWaypoint[];
}
