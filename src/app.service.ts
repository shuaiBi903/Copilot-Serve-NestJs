import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';
import { SendMessage } from './type';
import { v4 as uuidv4 } from 'uuid';
import { WorkerPoolService } from './app.WorkerPoolService';
const fs = require('fs')
const path = require('path')
@Injectable()
export class AppService {
  private readonly filePath = path.join(__dirname, './token.json')

  private getAuthorizationUrl = "https://api.github.com/copilot_internal/v2/token"
  constructor(private readonly workerPoolService: WorkerPoolService) { }
  // 请求
  async chatCompletions(req: Request, body: SendMessage, authorizationUrl?: string) {
    if (authorizationUrl) {
      this.getAuthorizationUrl = authorizationUrl
    }
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
      console.log("historyToken>>>>>>>>>>>>>>>>>>>>>>>>>>", historyToken.expiration, +Date.now())
      if (historyToken && historyToken.expiration > Date.now() / 1000) {
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
      expiration: new Date().getTime() + 1000 * 60 * 60 * 20
    }
    fs.writeFileSync(this.filePath, JSON.stringify(data))
    return {
      data: client.data.token
    }
  }

  // 启动worker
  async startWorkerChat(req: Request, body: SendMessage, authorizationUrl?: string) {
    const appToken = this.getAuthorization(req);
    if (authorizationUrl) {
      this.getAuthorizationUrl = authorizationUrl
    }
    const worker = this.workerPoolService.getWorker();
    // 获取一个线程
    console.log('worker>>>>>>>>>>>>>>>>>>>>>>>>>>')
    if (!worker) {
      console.log('All workers are busy. Please try again later.')
      return Promise.resolve({ error: 'All workers are busy. Please try again later.' });
    }
    // 判断worker是否有错误
    if (worker.threadId === 0) {
      console.log('worker has error>>>>>>>>>>>>>>>>>>>>>>>>>>')
      return Promise.resolve({ error: 'worker has error' });
    }


    return new Promise((resolve, reject) => {
      worker.postMessage({ appToken, body, authorizationUrl });

      worker.once('message', (result) => {
        this.workerPoolService.releaseWorker(worker);
        resolve(result);
      });

      worker.once('error', (error: HttpException) => {
        // 删除线程并关闭, 用于线程异常退出, 重新创建线程
        this.workerPoolService.removeWorker(worker);
        console.log('error>>>>>>线程释放')
        // throw error
        reject(error);
      });

      worker.once('exit', (code) => {
        if (code !== 0) {
          this.workerPoolService.releaseWorker(worker);
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    })
  }
}
