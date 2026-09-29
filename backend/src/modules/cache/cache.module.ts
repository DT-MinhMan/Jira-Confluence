import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (config: ConfigService) => {
        const ttl = Number(config.get('KANBAN_CACHE_TTL_MS')) || 60_000;
        const max = Number(config.get('KANBAN_MEMORY_CACHE_MAX')) || 1_000;
        return { ttl, max };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}

