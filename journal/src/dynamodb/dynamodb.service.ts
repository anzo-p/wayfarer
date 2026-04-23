import { ConfigService } from '@nestjs/config';
import { Injectable, Inject } from '@nestjs/common';
import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';

@Injectable()
export class DynamoDBService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('DynamoDBClient') private dynamoDBClient: DynamoDBClient
  ) {}

  async getItem(command: GetItemCommand): Promise<GetItemCommandOutput> {
    return this.dynamoDBClient.send(command);
  }

  async queryItem(command: QueryCommand): Promise<QueryCommandOutput> {
    return this.dynamoDBClient.send(command);
  }

  async transactWriteItems(command: TransactWriteItemsCommand): Promise<void> {
    await this.dynamoDBClient.send(command);
  }
}
