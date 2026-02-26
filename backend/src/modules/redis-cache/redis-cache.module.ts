import { Module, Global, Logger, } from '@nestjs/common'
import type { CacheModuleOptions,} from '@nestjs/cache-manager'
import { CacheModule, } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService, } from '@nestjs/config'

import { RedisCacheService, } from './redis-cache.service'
import { RedisCacheInterceptor, } from './redis-cache.interceptor'
import { REDIS_CLIENT_TOKEN, THREE_DAYS_CACHE_TIME, } from './redis-cache.constants'
import { RedisConnectionFactory, } from './keyv-redis.factory'
import type { RedisClientConnectionType, } from '@keyv/redis'
import { RedisController, } from './redis-cache.controller'
import { JwtModule, } from '../jwt/jwt.module'

@Global()
@Module({
	controllers: [RedisController,],
	imports:     [
		JwtModule,
		ConfigModule,
		CacheModule.registerAsync({
			imports:    [ConfigModule,],
			inject:     [ConfigService,],
			useFactory: async(configService: ConfigService,): Promise<CacheModuleOptions> => {
				const { keyv, } = RedisConnectionFactory.create(configService,)

				return {
					stores: [
						keyv,
					],
					ttl:       THREE_DAYS_CACHE_TIME,
					isGlobal:  true,
				}
			},
		},),
	],
	providers: [
		{
			provide:    'REDIS_CLIENT',
			inject:     [ConfigService,],
			useFactory: (configService: ConfigService,): RedisClientConnectionType => {
				const { redisClient, } = RedisConnectionFactory.create(configService,)
				return redisClient
			},
		},
		RedisCacheService,
		RedisCacheInterceptor,
		Logger,
	],
	exports: [
		RedisCacheService,
		CacheModule,
		RedisCacheInterceptor,
		REDIS_CLIENT_TOKEN,
	],
},)
export class RedisCacheModule { }