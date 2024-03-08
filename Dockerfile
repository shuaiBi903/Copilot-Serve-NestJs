FROM node:18-alpine 
# nestjs的docker镜像打包
# 设置工作目录
WORKDIR /app
# 复制package.json和package-lock.json到工作目录
COPY package*.json ./
# set registry and install pnpm
RUN npm config set registry "https://registry.npmmirror.com/"
RUN npm install -g pnpm
RUN pnpm config set registry "https://registry.npmmirror.com/"
# 安装依赖
RUN pnpm install
# 复制所有文件到工作目录
COPY . .
# 编译
RUN pnpm run build
# 暴露端口
EXPOSE 3000
# 启动命令
CMD ["pnpm", "run", "start:prod"]
