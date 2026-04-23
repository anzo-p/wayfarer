import { BadRequestException, UseFilters } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NewJourneyInput } from './dto/new-journey.input';
import {
  GqlBadDbDataException,
  GqlBadRequestException,
  GqlConflictException,
  GqlNotFoundException
} from './errors/errors.filters';
import { JourneyService } from './journey.service';
import { Journey } from './models/journey.model';
import { validateJourney } from './validator/journey.validator';

@Resolver(() => Journey)
@UseFilters(GqlBadDbDataException, GqlBadRequestException, GqlConflictException, GqlNotFoundException)
export class JourneyResolver {
  constructor(private journeyService: JourneyService) {}

  @Mutation(() => String)
  async createJourney(@Args('newJourney') newJourney: NewJourneyInput): Promise<string> {
    const { error, value } = validateJourney(newJourney);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return this.journeyService.createJourney(value);
  }

  @Mutation(() => String)
  async updateJourney(@Args('journey') journey: NewJourneyInput): Promise<string> {
    const { error, value } = validateJourney(journey);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return this.journeyService.updateJourney(value);
  }

  @Query(() => Journey)
  async journey(@Args('journeyId') journeyId: string): Promise<Journey> {
    return this.journeyService.findOneById(journeyId);
  }
}
