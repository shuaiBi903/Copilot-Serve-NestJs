import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkerPoolService } from './app.WorkerPoolService';
import { ConfigModule } from './config.module';
import { AppTokenService } from './app.token.service';
import { myThrottlerModule } from './ThrottlerModule/ThrottlerModule';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [ConfigModule, myThrottlerModule],
  controllers: [AppController],
  providers: [AppService, WorkerPoolService, AppTokenService, {
    provide: "APP_GUARD",
    useClass: ThrottlerGuard,
  }],
})
export class AppModule { }
