import { Test, TestingModule } from '@nestjs/testing';
import { JourneysResolver } from './journey.resolver';

describe('JourneysResolver', () => {
  let resolver: JourneysResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneysResolver]
    }).compile();

    resolver = module.get<JourneysResolver>(JourneysResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
