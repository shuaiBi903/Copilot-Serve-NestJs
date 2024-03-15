
## Description

[Nest]使用NestJs编写方便使用copilot项目的api
- `http://127.0.0.1:3000/get-ghbToken`:获取toekn
- `POST /v1/chat/completions`: 对话 API
## 如何使用

1. 安装并启动 copilot-gpt4-service 服务，如本地启动后，API 默认地址为：`http://127.0.0.1:3000`;
    `
    curl --request POST \
  --url http://localhost:3000/v1/chat/completions \
  --header 'Authorization: Bearer ${token}' \
  --header 'Content-Type: application/json' \
  --data '{
    "stream": false,
    "model": "gpt-4",
    "messages": [
        {
            "role": "user",
            "content": "刘备为什么把诸葛亮杀了"
        }
    ]
}'
    `
2. 获取你的 GitHub 账号 GitHub Copilot Plugin Token:
  - `http://127.0.0.1:3000/get-ghbToken`:获取toekn
3. 安装第三方客户端，如：[ChatGPT-Next-Web](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web)，在设置中填入 copilot-gpt4-service 的 API 地址和 GitHub Copilot Plugin Token，即可使用 GPT-4 模型进行对话

4. 多线程支持
  环境变量WORKER=0
  默认为0
5. 环境变量说明
 ` WORKER=10  :线程
  LIMIT=20 :  每分钟限制请求次数
  PORT=3000 :启动端口`
## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
## 开源协议

[MIT](https://opensource.org/license/mit/)

## Star历史

![Star History Chart](https://api.star-history.com/svg?repos=mouxans/copilot-api&type=Date)