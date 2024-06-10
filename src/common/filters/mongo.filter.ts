import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { FastifyReply } from 'fastify';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class MongoExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      this.logger.error(exception.message);

      return super.catch(exception, host);
    }

    const entityExeption = new UnprocessableEntityException(exception.message);
    const entityExeptionResponse = entityExeption.getResponse();

    this.logger.error(entityExeption.message);

    return res.status(entityExeption.getStatus()).send(entityExeptionResponse);
  }
}
