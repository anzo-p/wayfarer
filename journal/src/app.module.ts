import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { JourneysResolver } from './journey/journey.resolver';
import { JourneysService } from './journey/journey.service';
import { JourneysRepository } from './journey/journey.repository';
import { DynamoDBModule } from './dynamodb/dynamodb.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true
    }),
    DynamoDBModule
  ],
  providers: [JourneysResolver, JourneysService, JourneysRepository]
})
export class AppModule {}
