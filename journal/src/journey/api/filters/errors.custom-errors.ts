import { HttpException, HttpStatus, ServiceUnavailableException } from '@nestjs/common';

export class BadDbDataException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class JourneyPersistenceException extends HttpException {
  constructor(operation: string, cause?: unknown) {
    super(`Journey persistence failed during ${operation}.`, HttpStatus.INTERNAL_SERVER_ERROR, { cause });
  }
}

export class JourneyStorageUnavailableException extends ServiceUnavailableException {
  constructor(operation: string, cause?: unknown) {
    super(`Journey storage unavailable during ${operation}.`, { cause });
  }
}

export class JourneyTransactionLimitException extends HttpException {
  constructor(actionCount: number, maxActions: number) {
    super(
      `Journey write requires ${actionCount} transaction actions, exceeding DynamoDB's limit of ${maxActions}.`,
      HttpStatus.BAD_REQUEST
    );
  }
}
