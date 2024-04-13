import { Injectable } from '@nestjs/common';
import { JourneysRepository } from './journey.repository';
import { Journey } from './models/journey.model';

@Injectable()
export class JourneysService {
  constructor(private journeysRepository: JourneysRepository) {}

  async createJourney(journey: Journey): Promise<string> {
    return this.journeysRepository.saveJourney(journey);
  }

  async findOneById(id: string): Promise<any> {
    return this.journeysRepository.fetchJourney(id);
  }
}
