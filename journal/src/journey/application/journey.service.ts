import { Injectable } from '@nestjs/common';

import { Journey } from '../domain/journey.model';
import { JourneyRepository } from '../infrastructure/journey.repository';

@Injectable()
export class JourneyService {
  constructor(private journeyRepository: JourneyRepository) {}

  async createJourney(journey: Journey): Promise<string> {
    return this.journeyRepository.createJourney(journey);
  }

  async updateJourney(journey: Journey): Promise<string> {
    return this.journeyRepository.updateJourney(journey);
  }

  async findOneById(id: string): Promise<any> {
    return this.journeyRepository.fetchJourney(id);
  }
}
