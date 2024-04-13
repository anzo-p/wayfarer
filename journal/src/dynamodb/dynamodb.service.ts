import { ConfigService } from '@nestjs/config';
import { Injectable, Inject } from '@nestjs/common';
import {
  AttributeValue,
  BatchWriteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  GetItemCommandOutput,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandOutput
} from '@aws-sdk/client-dynamodb';

export type DynamoDBPutItem = PutItemCommandInput['Item'];
export type DynamoDBPutItems = PutItemCommandInput['Item'][];
export type DynamoDBRecord = Record<string, AttributeValue>;

@Injectable()
export class DynamoDBService {
  private readonly maxBatchSize: number;
  private readonly maxRetries: number;

  constructor(
    private configService: ConfigService,
    @Inject('DynamoDBClient') private dynamoDBClient: DynamoDBClient
  ) {
    this.maxBatchSize = this.configService.get<number>('DYNAMODB_MAX_BATCH_SIZE');
    this.maxRetries = this.configService.get<number>('DYNAMODB_MAX_RETRIES');
  }

  async getItem(command: GetItemCommand): Promise<GetItemCommandOutput> {
    return this.dynamoDBClient.send(command);
  }

  async queryItem(command: QueryCommand): Promise<QueryCommandOutput> {
    return this.dynamoDBClient.send(command);
  }

  async putItemWithRetry(command: PutItemCommand): Promise<void> {
    let retries = 0;

    while (true) {
      try {
        await this.dynamoDBClient.send(command);
        return;
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === 'ProvisionedThroughputExceededException' &&
          retries < this.maxRetries
        ) {
          console.log(`Retrying putItem... ${retries}/${this.maxRetries}`);
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 100));
          retries++;
        } else {
          throw err;
        }
      }
    }
  }

  async bulkInsert(tableName: string, items: DynamoDBPutItems): Promise<void> {
    const batches = this.splitIntoBatches(items);

    for (const batch of batches) {
      await this.bulkInsertWithRetry(
        new BatchWriteItemCommand({
          RequestItems: {
            [tableName]: batch.map((item) => ({
              PutRequest: { Item: item }
            }))
          }
        })
      );
    }
  }

  /**
   * Splits an array of DynamoDB PutItems into chunks of maximum size that aws supports.
   *
   * @param items - The array of items to be split.
   * @param chunkSize - The maximum size of each chunk.
   * @returns An array of item chunks.
   */
  private splitIntoBatches(items: DynamoDBPutItems): DynamoDBPutItems[] {
    const batches: DynamoDBPutItems[] = [];

    while (items.length) {
      batches.push(items.splice(0, this.maxBatchSize));
    }

    return batches;
  }

  private async bulkInsertWithRetry(command: BatchWriteItemCommand): Promise<void> {
    let retries = 0;
    while (true) {
      try {
        const response = await this.dynamoDBClient.send(command);

        if (!response.UnprocessedItems || Object.keys(response.UnprocessedItems).length === 0) {
          return;
        }
        if (retries >= this.maxRetries) {
          console.log(
            `Max retries reached with ${JSON.stringify(response.UnprocessedItems.length)} unprocessed items.`
          );
          return;
        }

        console.log(
          `Retrying ${JSON.stringify(response.UnprocessedItems.length)} unprocessed items... ${retries + 1}/${this.maxRetries}`
        );

        const unprocessedItems = {};
        Object.entries(response.UnprocessedItems).forEach(([tableName, requests]) => {
          unprocessedItems[tableName] = requests;
        });

        command.input.RequestItems = unprocessedItems;

        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 100));
        retries++;
      } catch (err) {
        throw new Error('An error occurred during bulk insert');
      }
    }
  }
}
