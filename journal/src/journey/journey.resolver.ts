import { Args, InputType, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JourneysService } from './journey.service';
import { Journey } from './models/journey.model';
import { NewJourneyInput } from './dto/new-journey.input';
import { validateJourney } from './validator/journey.validator';
import { BadRequestException, UseFilters } from '@nestjs/common';
import { GqlBadRequestException, GqlConflictException, GqlNotFoundException } from './errors/errors.filters';

@InputType()
export class CreateJourneyInput extends Journey {}

@Resolver(() => Journey)
@UseFilters(new GqlConflictException(), new GqlNotFoundException(), new GqlBadRequestException())
export class JourneysResolver {
  constructor(private journeysService: JourneysService) {}

  @Mutation(() => String)
  async createJourney(@Args('newJourney') newJourney: NewJourneyInput): Promise<string> {
    const { error, value } = validateJourney(newJourney);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return this.journeysService.createJourney(value);
  }

  @Query(() => Journey)
  async journey(@Args('journeyId') journeyId: string): Promise<Journey> {
    return this.journeysService.findOneById(journeyId);
  }
}
