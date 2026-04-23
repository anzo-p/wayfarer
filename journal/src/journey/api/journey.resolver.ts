import { BadRequestException, UseFilters } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NewJourneyInput } from './dto/new-journey.input';
import {
  GqlBadDbDataException,
  GqlBadRequestException,
  GqlConflictException,
  GqlNotFoundException
} from './filters/errors.filters';
import { JourneyService } from '../application/journey.service';
import { Journey } from '../domain/journey.model';
import { validateJourney } from '../domain/validator/journey.validator';

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
