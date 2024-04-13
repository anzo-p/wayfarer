import { Module } from '@nestjs/common';
import { DynamoDBService } from './dynamodb.service';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigModule, ConfigService } from '@nestjs/config';

const DynamoDBClientProvider = {
  provide: 'DynamoDBClient',
  useFactory: (configService: ConfigService) => {
    return new DynamoDBClient({
      region: configService.get('AWS_REGION', 'us-east-1'),
    });
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [DynamoDBService, DynamoDBClientProvider],
  exports: [DynamoDBService],
})
export class DynamoDBModule {}
