import { Body, Controller, Get, HttpException, Post, Query, Req, Res, UseFilters } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';
import { SendMessage } from './type';
import { ConfigService } from '@nestjs/config';
import { AppTokenService } from './app.token.service';
import { Response } from 'express';
import * as path from 'path';

@Controller()
@UseFilters(new HttpExceptionFilter())
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly appTokenService: AppTokenService,
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

  @Get("/get-ghbToken")
  async getGhbToken(@Res() res: Response) {
    try {
      const response = await this.appTokenService.getGhbToken();
      res.redirect('/copilot?response=' + JSON.stringify(response))
    } catch (error) {
      throw new HttpException(error.response, error.status || 500)
    }
  }
  @Get("/copilot")
  goCopilot(@Res() res: Response) {
    // 代理本地的./html.index
    return res.sendFile('index.html', { root: path.join(__dirname, '../html') })
  }

  @Get("/pollAuth")
  async pollAuth(@Query('device_code') device_code: string) {
    console.log(device_code)
    return await this.appTokenService.pollAuth(device_code)
  }
}
