import {
  Catch,
  ArgumentsHost,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { BadDbDataException } from './errors.custom-errors';

@Catch(BadRequestException)
export class GqlBadRequestException implements GqlExceptionFilter {
  private readonly logger = new Logger(GqlConflictException.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    return new ApolloError(exception.message, 'INVALID_INPUT');
  }
}

@Catch(BadDbDataException)
export class GqlBadDbDataException implements GqlExceptionFilter {
  private readonly logger = new Logger(GqlConflictException.name);

  catch(exception: BadDbDataException, host: ArgumentsHost) {
    console.log('exception', exception);
    return new ApolloError(exception.message, 'INTERNAL_SERVER_ERROR');
  }
}

@Catch(ConflictException)
export class GqlConflictException implements GqlExceptionFilter {
  private readonly logger = new Logger(GqlConflictException.name);

  catch(exception: ConflictException, host: ArgumentsHost) {
    return new ApolloError(exception.message, 'DUPLICATE_ITEM');
  }
}

@Catch(NotFoundException)
export class GqlNotFoundException implements GqlExceptionFilter {
  private readonly logger = new Logger(GqlNotFoundException.name);

  catch(exception: NotFoundException, host: ArgumentsHost) {
    return new ApolloError(exception.message, 'NOT_FOUND');
  }
}
