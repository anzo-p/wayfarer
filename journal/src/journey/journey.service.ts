import { Injectable } from '@nestjs/common';
import { JourneyRepository } from './journey.repository';
import { Journey } from './models/journey.model';

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
