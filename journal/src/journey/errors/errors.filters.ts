import {
  Catch,
  ArgumentsHost,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { BadDbDataException } from './errors.custom-errors';
import { GraphQLError } from 'graphql';

@Catch(BadRequestException)
export class GqlBadRequestException implements GqlExceptionFilter {
  private readonly logger = new Logger(GqlConflictException.name);

  catch(exception: BadRequestException, unusedHost: ArgumentsHost) {
    return new GraphQLError(exception.message, {
      extensions: { code: 'INVALID_INPUT' }
    });
  }
}

@Catch(BadDbDataException)
export class GqlBadDbDataException implements GqlExceptionFilter {
  private readonly logger = new Logger(GqlConflictException.name);

  catch(exception: BadDbDataException, unusedHost: ArgumentsHost) {
    return new GraphQLError(exception.message, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    });
  }
}

@Catch(ConflictException)
export class GqlConflictException implements GqlExceptionFilter {
  private readonly logger = new Logger(GqlConflictException.name);

  catch(exception: ConflictException, unusedHost: ArgumentsHost) {
    return new GraphQLError(exception.message, {
      extensions: { code: 'DUPLICATE_ITEM' }
    });
  }
}

@Catch(NotFoundException)
export class GqlNotFoundException implements GqlExceptionFilter {
  private readonly logger = new Logger(GqlNotFoundException.name);

  catch(exception: NotFoundException, unusedHost: ArgumentsHost) {
    return new GraphQLError(exception.message, {
      extensions: { code: 'NOT_FOUND' }
    });
  }
}
