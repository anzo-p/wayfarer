import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JourneyResolver } from './journey.resolver';
import { JourneyService } from '../application/journey.service';

describe('JourneyResolver', () => {
  let resolver: JourneyResolver;

  const journeyServiceMock = {
    createJourney: jest.fn(),
    updateJourney: jest.fn(),
    findOneById: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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

  it('rejects duplicate waypoint ids before calling the service', async () => {
    await expect(
      resolver.createJourney({
        journeyId: 'c4dbe0b2-7c29-4c71-ae61-9384cce3a26e',
        time: new Date('2026-04-22T08:00:00.000Z'),
        title: 'Test journey',
        readonly: false,
        waypoints: [
          {
            waypointId: '11111111-1111-4111-8111-111111111111',
            coordinate: { latitude: 60.1699, longitude: 24.9384 },
            order: 1
          },
          {
            waypointId: '11111111-1111-4111-8111-111111111111',
            coordinate: { latitude: 60.2055, longitude: 24.6559 },
            order: 2
          }
        ]
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(journeyServiceMock.createJourney).not.toHaveBeenCalled();
  });
});
