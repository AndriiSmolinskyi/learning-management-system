/* eslint-disable no-console */
import Keyv from 'keyv'
import type { ConfigService, } from '@nestjs/config'
import KeyvRedis from '@keyv/redis'
import type { RedisClientConnectionType, RedisClientOptions, } from '@keyv/redis'

import {
	REDIS_CONNECT_TIMEOUT_MS,
	REDIS_KEEP_ALIVE_TIMEOUT_MS,
	MAX_RECONNECT_ATTEMPTS,
} from './redis-cache.constants'

export class RedisConnectionFactory {
	private static keyvInstance: Keyv<unknown> | null = null

	private static redisClientInstance: RedisClientConnectionType | null = null

	public static create(configService: ConfigService,): {
		keyv: Keyv<unknown>,
		redisClient: RedisClientConnectionType
	} {
		if (this.keyvInstance && this.redisClientInstance) {
			return {
				keyv:        this.keyvInstance,
				redisClient: this.redisClientInstance,
			}
		}

		const nodeEnv = configService.getOrThrow<string>('NODE_ENV',)
		const host = configService.getOrThrow<string>('REDIS_HOST',)
		const port = parseInt(configService.getOrThrow<string>('REDIS_PORT',), 10,)
		const prefix = nodeEnv === 'development' ?
			'redis' :
			'rediss'

		const redisOptions: RedisClientOptions = {
			url:    `${prefix}://${host}:${port}`,
			socket: {
				host,
				port,
				tls:               prefix === 'rediss',
				keepAlive:         REDIS_KEEP_ALIVE_TIMEOUT_MS,
				connectTimeout:    REDIS_CONNECT_TIMEOUT_MS,
				reconnectStrategy: (retries, cause,) => {
					console.error(`Redis reconnect attempt ${retries}: ${cause.message}`,)
					if (retries > MAX_RECONNECT_ATTEMPTS) {
						return false
					}
					return Math.min(retries * 100, 2000,)
				},
			},
		}

		const redisStore = new KeyvRedis(redisOptions,)
		this.redisClientInstance = redisStore.client

		this.keyvInstance = new Keyv({
			store:        redisStore,
			useKeyPrefix: false,
			namespace:    undefined,
		},)

		return {
			keyv:        this.keyvInstance,
			redisClient: this.redisClientInstance,
		}
	}
}