import { BadRequestException, UseFilters } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NewJourneyInput } from './dto/new-journey.input';
import {
  GqlBadDbDataException,
  GqlBadRequestException,
  GqlConflictException,
  GqlNotFoundException
} from './errors/errors.filters';
import { JourneysService } from './journey.service';
import { Journey } from './models/journey.model';
import { validateJourney } from './validator/journey.validator';

@Resolver(() => Journey)
@UseFilters(
  new GqlBadDbDataException(),
  new GqlBadRequestException(),
  new GqlConflictException(),
  new GqlNotFoundException()
)
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

  @Mutation(() => String)
  async updateJourney(@Args('journey') journey: NewJourneyInput): Promise<string> {
    const { error, value } = validateJourney(journey);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return this.journeysService.updateJourney(value);
  }

  @Query(() => Journey)
  async journey(@Args('journeyId') journeyId: string): Promise<Journey> {
    return this.journeysService.findOneById(journeyId);
  }
}
