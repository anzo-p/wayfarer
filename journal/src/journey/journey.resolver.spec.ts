import { Test, TestingModule } from '@nestjs/testing';
import { JourneyResolver } from './journey.resolver';
import { JourneyService } from './journey.service';

describe('JourneyResolver', () => {
  let resolver: JourneyResolver;

  const journeyServiceMock = {
    createJourney: jest.fn(),
    updateJourney: jest.fn(),
    findOneById: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyResolver,
        {
          provide: JourneyService,
          useValue: journeyServiceMock
        }
      ]
    }).compile();

    resolver = module.get<JourneyResolver>(JourneyResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
