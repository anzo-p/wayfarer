import { Test, TestingModule } from '@nestjs/testing';
import { JourneysResolver } from './journey.resolver';
import { JourneysService } from './journey.service';

describe('JourneysResolver', () => {
  let resolver: JourneysResolver;

  const journeysServiceMock = {
    createJourney: jest.fn(),
    findOneById: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneysResolver,
        {
          provide: JourneysService,
          useValue: journeysServiceMock
        }
      ]
    }).compile();

    resolver = module.get<JourneysResolver>(JourneysResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
