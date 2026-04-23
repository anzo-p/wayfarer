import { Module } from '@nestjs/common';

import { DynamoDBModule } from '../dynamodb/dynamodb.module';
import {
  GqlBadDbDataException,
  GqlBadRequestException,
  GqlConflictException,
  GqlNotFoundException
} from './api/filters/errors.filters';
import { JourneyResolver } from './api/journey.resolver';
import { JourneyService } from './application/journey.service';
import { JourneyRepository } from './infrastructure/journey.repository';

@Module({
  imports: [DynamoDBModule],
  providers: [
    JourneyResolver,
    JourneyService,
    JourneyRepository,
    GqlBadDbDataException,
    GqlBadRequestException,
    GqlConflictException,
    GqlNotFoundException
  ]
})
export class JourneyModule {}
