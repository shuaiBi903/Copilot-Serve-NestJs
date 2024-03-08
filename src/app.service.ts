import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';
import { SendMessage } from './type';
import { v4 as uuidv4 } from 'uuid';
const fs = require('fs')
const path = require('path')
@Injectable()
export class AppService {
  private readonly filePath = path.join(__dirname, './token.json')

  private readonly getAuthorizationUrl = "https://api.github.com/copilot_internal/v2/token"
  // 请求
  async chatCompletions(req: Request, body: SendMessage) {
    const appToken = this.getAuthorization(req)
    if (!appToken) {
      throw new HttpException('token都没有玩什么呀', 400)
    }
    const authorization = await this.getAuthorizationFromToken(appToken)
    if (!authorization.token) {
      // 返回一个错误的响应
      throw new HttpException('token is invalid', 400)
    }
    const data = await this.sendMessagesToCopilot(body, authorization.token)
    return data
  }

  getAuthorization(req: Request): string {
    const copilotToken = (req.headers as any)?.authorization ? (req.headers as any)?.authorization.replace('Bearer ', '') : '';
    return copilotToken
  }

  async getAuthorizationFromToken(token: string): Promise<{ token: string }> {


    // 判断文件是否存在
    if (fs.existsSync(this.filePath)) {
      // 读取文件
      let file = fs.readFileSync(this.filePath, 'utf-8')
      // 转为json对象
      let fileJson = JSON.parse(file)
      const historyToken = fileJson[token]
      console.log("historyToken>>>>>>>>>>>>>>>>>>>>>>>>>>", historyToken.expiration, Math.floor(Date.now() / 1000))
      if (historyToken && historyToken.expiration > Math.floor(Date.now() / 1000)) {
        console.log("读取历史文件>>>>>>>>>>>>>>>>>>>>>>>>>>")
        return {
          token: historyToken.token
        }
      }
    }
    // 不存在则重新获取token
    const data = await this.writeTokenToFile(token)
    if (data.data) {
      return {
        token: data.data
      }
    }
  }
  // 发送消息
  async sendMessagesToCopilot(body: SendMessage, token: string) {
    const url = "https://api.githubcopilot.com/chat/completions"
    const uid = uuidv4()
    const ContentType = body.stream ? "text/event-stream; charset=utf-8" : "application/json; charset=utf-8"
    const client = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": ContentType,
        'X-Github-Api-Version': '2023-07-07',
        'Vscode-Sessionid': uid + (+new Date()),
        "Vscode-Machineid": uuidv4(),
        "User-Agent": "GitHubCopilotChat/0.8.0",
        "Accept": "*/*",
        "Accept-Encoding": "gzip,deflate,br",
        "Connection": "close",
        "Editor-Version": "vscode/1.83.1",
        "Editor-Plugin-Version": "copilot-chat/0.8.0",
        "Openai-Organization": "github-copilot",
        "Openai-Intent": "conversation-panel",
      }
    }).catch((error) => {
      const { response: { status: code, data } } = error
      throw new HttpException(data, code)
    })
    return client.data
  }

  // 获取token
  async getToken(getAuthorizationUrl: string, token: string) {
    const client = await axios.get(getAuthorizationUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Editor-Version': 'vscode/1.85.2',
        'Editor-Plugin-Version': 'copilot-chat/0.11.1',
        'User-Agent': 'GitHubCopilotChat/0.11.1',
        'Accept': '*/*',
        'Content-Type': 'application/json',
      }
    }).catch((error) => {
      const { response: { status: code, data } } = error
      throw new HttpException(data, code)
    })
    return {
      data: client.data
    }
  }

  // 写入token
  async writeTokenToFile(token: string) {
    const client = await this.getToken(this.getAuthorizationUrl, token)
    let data = {}
    if (fs.existsSync(this.filePath)) {
      console.log("文件存在>>>>>>>>>>>>>>>>>>>>>>>>>>")
      data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
    }
    data[token] = {
      token: client.data.token,
      expiration: client.data.expires_at - 1000 * 60 * 5
    }
    fs.writeFileSync(this.filePath, JSON.stringify(data))
    return {
      data: client.data.token
    }
  }
}
