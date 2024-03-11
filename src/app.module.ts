import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkerPoolService } from './app.WorkerPoolService';
import { ConfigModule } from './config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService, WorkerPoolService],
})
export class AppModule { }
