import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { ConfigService } from "@nestjs/config"
@Module({
    imports: [
        ThrottlerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                // 获取配置文件中的限流配置,或无限制
                const LIMIT = configService.get('THROTTLE_LIMIT') || 0;
                return {
                    errorMessage: "请求频繁，请稍后再试!",
                    throttlers: [
                        {
                            limit: LIMIT,
                            ttl: 60000
                        }
                    ]
                }
            },

        }
        ),
    ],
})
export class myThrottlerModule { }