import { Body, Controller, HttpException, Post, Req, UseFilters } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';
import { SendMessage } from './type';
import { ConfigService } from '@nestjs/config';
@Controller()
@UseFilters(new HttpExceptionFilter())
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) { }

  @Post("/v1/chat/completions")
  async chatCompletions(@Req() req: Request, @Body() body: SendMessage) {
    const WORKER = this.configService.get("WORKER")
    if (!WORKER) {
      return await this.appService.chatCompletions(req, body);
    } else {
      return await this.appService.startWorkerChat(req, body).catch(e => {
        if (e.status) {
          throw new HttpException(e.response, e.status)
        }
        throw new HttpException(e.response, 500)
      })
    }
  }

  @Post("/worker/v1/chat/completions")
  async workerChatCompletions(@Req() req: Request, @Body() body: SendMessage) {
    return await this.appService.startWorkerChat(req, body).catch(e => {
      if (e.status) {
        throw new HttpException(e.response, e.status)
      }
      throw new HttpException(e.response, 500)
    })
  }
}
