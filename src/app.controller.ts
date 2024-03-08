import { Body, Controller, Post, Req, UseFilters } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';
import { SendMessage } from './type';
@Controller()
@UseFilters(new HttpExceptionFilter())
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post("/v1/chat/completions")
  chatCompletions(@Req() req: Request, @Body() body: SendMessage) {
    return this.appService.chatCompletions(req, body);
  }
}
