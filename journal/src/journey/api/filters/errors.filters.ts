import {
  Catch,
  ArgumentsHost,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import {
  BadDbDataException,
  JourneyPersistenceException,
  JourneyTransactionLimitException
} from './errors.custom-errors';
import { GraphQLError } from 'graphql';

const errorDetails = (exception: Error): string => {
  const cause =
    'cause' in exception && exception.cause instanceof Error
      ? ` Cause: ${exception.cause.name}: ${exception.cause.message}`
      : '';

  return `${exception.name}: ${exception.message}${cause}`;
};

abstract class BaseJourneyGqlExceptionFilter<T extends Error> implements GqlExceptionFilter {
  protected readonly logger = new Logger('JourneyGraphqlExceptions');

  protected abstract readonly code: string;
  protected abstract log(exception: T): void;

  catch(exception: T, unusedHost: ArgumentsHost) {
    this.log(exception);
    return new GraphQLError(exception.message, {
      extensions: { code: this.code }
    });
  }
}

@Catch(BadRequestException)
export class GqlBadRequestException extends BaseJourneyGqlExceptionFilter<BadRequestException> {
  protected readonly code = 'INVALID_INPUT';

  protected log(exception: BadRequestException) {
    this.logger.warn(errorDetails(exception), exception.stack);
  }
}

@Catch(BadDbDataException)
export class GqlBadDbDataException extends BaseJourneyGqlExceptionFilter<BadDbDataException> {
  protected readonly code = 'INTERNAL_SERVER_ERROR';

  protected log(exception: BadDbDataException) {
    this.logger.error(errorDetails(exception), exception.stack);
  }
}

@Catch(ConflictException)
export class GqlConflictException extends BaseJourneyGqlExceptionFilter<ConflictException> {
  protected readonly code = 'DUPLICATE_ITEM';

  protected log(exception: ConflictException) {
    this.logger.warn(errorDetails(exception), exception.stack);
  }
}

@Catch(JourneyPersistenceException)
export class GqlJourneyPersistenceException extends BaseJourneyGqlExceptionFilter<JourneyPersistenceException> {
  protected readonly code = 'INTERNAL_SERVER_ERROR';

  protected log(exception: JourneyPersistenceException) {
    this.logger.error(errorDetails(exception), exception.stack);
  }
}

@Catch(JourneyTransactionLimitException)
export class GqlJourneyTransactionLimitException extends BaseJourneyGqlExceptionFilter<JourneyTransactionLimitException> {
  protected readonly code = 'INVALID_INPUT';

  protected log(exception: JourneyTransactionLimitException) {
    this.logger.warn(errorDetails(exception), exception.stack);
  }
}

@Catch(NotFoundException)
export class GqlNotFoundException extends BaseJourneyGqlExceptionFilter<NotFoundException> {
  protected readonly code = 'NOT_FOUND';

  protected log(exception: NotFoundException) {
    this.logger.warn(errorDetails(exception), exception.stack);
  }
}

@Catch(ServiceUnavailableException)
export class GqlServiceUnavailableException extends BaseJourneyGqlExceptionFilter<ServiceUnavailableException> {
  protected readonly code = 'SERVICE_UNAVAILABLE';

  protected log(exception: ServiceUnavailableException) {
    this.logger.error(errorDetails(exception), exception.stack);
  }
}
