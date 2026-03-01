/* eslint-disable no-console */
import { IoAdapter, } from '@nestjs/platform-socket.io'
import { createAdapter, } from '@socket.io/redis-adapter'
import { createClient, } from 'redis'
import type { Server, ServerOptions, } from 'socket.io'
import type { ConfigService, } from '@nestjs/config'
import {
	MAX_RECONNECT_ATTEMPTS,
	REDIS_CONNECT_TIMEOUT_MS,
} from '../../../modules/redis-cache'
import { Logger, } from '@nestjs/common'

export class RedisIoAdapterService extends IoAdapter {
	public readonly logger = new Logger(RedisIoAdapterService.name,)

	private adapterConstructor: ReturnType<typeof createAdapter> | null = null

	public async connectToRedis(configService: ConfigService,): Promise<void> {
		const nodeEnv = configService.get<string>('NODE_ENV',)
		const host = configService.get<string>('REDIS_HOST',)
		const port = parseInt(configService.getOrThrow<string>('REDIS_PORT',), 10,)

		const prefix = nodeEnv === 'development' ?
			'redis' :
			'rediss'
		const redisUrl = `${prefix}://${host}:${port}`

		const clientOpts = {
			url:    redisUrl,
			socket: {
				host,
				port,
				connectTimeout:    REDIS_CONNECT_TIMEOUT_MS,
				reconnectStrategy: (retries: number, cause: Error,): number | false => {
					this.logger.error(`Redis reconnect attempt ${retries}: ${cause.message}`,)
					if (retries > MAX_RECONNECT_ATTEMPTS) {
						return false
					}
					return Math.min(retries * 100, 2000,)
				},
			},
		}

		const pubClient = createClient(clientOpts,)
		const subClient = createClient(clientOpts,)

		pubClient.on('error', (err,) => {
			this.logger.error('❌ Redis pubClient error:', err.message,)
		},
		)
		subClient.on('error', (err,) => {
			this.logger.error('❌ Redis subClient error:', err.message,)
		},
		)
		try {
			await Promise.all([pubClient.connect(), subClient.connect(),],)
			this.logger.debug('✅ Redis connected for Socket.IO adapter',)
			this.adapterConstructor = createAdapter(pubClient, subClient,)
		} catch (err) {
			this.logger.error('⚠️ Redis not available, running without Socket.IO adapter.',)
			this.adapterConstructor = null
		}
	}

	public createIOServer(port: number, options?: ServerOptions,): Server {
		const server = super.createIOServer(port, options,)
		if (this.adapterConstructor) {
			server.adapter(this.adapterConstructor,)
		} else {
			console.warn('⚠️ Socket.IO running WITHOUT Redis adapter',)
		}
		return server
	}
}

// todo: Remove after new logic tested
// import { IoAdapter, } from '@nestjs/platform-socket.io'
// import type { Server, ServerOptions, } from 'socket.io'
// import { createAdapter, } from '@socket.io/redis-adapter'
// import { createClient, } from 'redis'

// export class RedisIoAdapterService extends IoAdapter {
// 	private adapterConstructor: ReturnType<typeof createAdapter>

// 	public async connectToRedis(): Promise<void> {
// 		const prefix = process.env.NODE_ENV === 'development' ?
// 			'redis' :
// 			'rediss'
// 		const host = process.env.REDIS_HOST
// 		const port = process.env.REDIS_PORT
// 		const pubClient = createClient({ url: `${prefix}://${host}:${port}`, },)
// 		const subClient = pubClient.duplicate()

// 		await Promise.all([pubClient.connect(), subClient.connect(),],)
// 		this.adapterConstructor = createAdapter(pubClient, subClient,)
// 	}

// 	public createIOServer(port: number, options?: ServerOptions,): Server {
// 		const server = super.createIOServer(port, options,)
// 		server.adapter(this.adapterConstructor,)
// 		return server
// 	}
// }