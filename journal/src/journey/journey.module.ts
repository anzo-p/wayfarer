import { Module } from '@nestjs/common';
import { DynamoDBModule } from '../dynamodb/dynamodb.module';
import {
  GqlBadDbDataException,
  GqlBadRequestException,
  GqlConflictException,
  GqlNotFoundException
} from './errors/errors.filters';
import { JourneyRepository } from './journey.repository';
import { JourneyResolver } from './journey.resolver';
import { JourneyService } from './journey.service';

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
