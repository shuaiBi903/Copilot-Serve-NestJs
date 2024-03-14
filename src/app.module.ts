import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkerPoolService } from './app.WorkerPoolService';
import { ConfigModule } from './config.module';
import { AppTokenService } from './app.token.service';

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService, WorkerPoolService, AppTokenService],
})
export class AppModule { }
