import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = exception instanceof HttpException ? exception.getResponse() : null;
    const message = typeof responseBody === 'string'
      ? responseBody
      : (responseBody && typeof responseBody === 'object' && 'message' in responseBody
        ? (responseBody as { message: string | string[] }).message
        : 'An unexpected server error occurred');

    if (status >= 500) this.logger.error(`Request failed: ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : undefined);
    response.status(status).json({ success: false, statusCode: status, message, path: request.url, timestamp: new Date().toISOString() });
  }
}
