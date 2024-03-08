import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        try {
            const status = exception.getStatus();
            response
                .status(status)
                .json({
                    statusCode: status,
                    data: exception.getResponse(),
                });
        } catch (error) {
            response
                .status(500)
                .json({
                    statusCode: 500,
                    data: "Internal server error",
                });
        }
    }
}