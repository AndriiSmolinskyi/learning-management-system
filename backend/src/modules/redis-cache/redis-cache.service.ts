/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable no-await-in-loop */
import { CACHE_MANAGER, } from '@nestjs/cache-manager'
import type { OnModuleInit,} from '@nestjs/common'
import { Inject, Injectable, Logger,} from '@nestjs/common'
import { Cache, } from 'cache-manager'
import { ConfigService, } from '@nestjs/config'
import * as crypto from 'crypto'
import { RedisClientConnectionType,} from '@keyv/redis'
import { MINUTE_CACHE_TIME, REDIS_CLIENT_TOKEN, THREE_DAYS_CACHE_TIME, } from './redis-cache.constants'
import type { CreatingType, ICacheKeyInput, MutatingType, TRedisLockKeyBuild, TRunWithRedisLock, } from './redis-cache.types'
import { cacheKeysToDeleteClient, } from '../client/client.constants'

@Injectable()
export class RedisCacheService implements OnModuleInit {
	private readonly nodeEnv: string

	constructor(
		@Inject(CACHE_MANAGER,) private readonly cacheManager: Cache,
		@Inject(REDIS_CLIENT_TOKEN,) private readonly redisClient: RedisClientConnectionType,
		private readonly configService: ConfigService,
		private readonly logger: Logger = new Logger('RedisCacheService',),

	) {
		this.nodeEnv = this.configService.getOrThrow<string>('NODE_ENV',)
		this.redisClient.on('error', (err,) => {
			this.logger.error('[RedisClient] Error:', err,)
		},)
		this.redisClient.on('end', () => {
			this.logger.warn('[RedisClient] Connection ended',)
		},)
	}

	public async onModuleInit(): Promise<void> {
		if (process.env.NODE_ENV === 'development') {
			return
		}
		this.redisClient.on('ready', () => {
			this.logger.debug('Redis READY → clearing cache...',)

			this.clear().catch((err,) => {
				this.logger.error(err,)
			},)
		},)
		await this.clear()
	}

	// public async runWithLock(
	// 	{ lockKey, ttlMs, callback, }: TRunWithRedisLock,
	// ): Promise<void> {
	// 	const start = Date.now()
	// 	try {
	// 		const lock = await this.cacheManager.get(lockKey,)
	// 		if (lock) {
	// 			this.logger.debug(`Skipped — another instance holds: ${lockKey}`,)
	// 			return
	// 		}
	// 		await this.cacheManager.set(lockKey, 'locked', ttlMs,)
	// 		this.logger.debug(`Lock acquired for: ${lockKey}`,)

	// 		try {
	// 			await callback()
	// 		} finally {
	// 			await this.cacheManager.del(lockKey,)
	// 			const duration = Date.now() - start
	// 			this.logger.debug(`Lock released for: ${lockKey} (duration: ${duration}ms)`,)
	// 		}
	// 	} catch (err) {
	// 		this.logger.error(`Error in locked job ${lockKey}`, err,)
	// 	}
	// }

	// Second type of runWithLock
	public async runWithLock(
		{ lockKey, ttlMs, callback, }: TRunWithRedisLock,
	): Promise<void> {
		const start = Date.now()
		const lockId = `${process.pid}-${Date.now()}-${Math.random()}`
		try {
			if (!this.redisClient.isOpen) {
				this.logger.warn('Redis client is not open — reconnecting…',)
				await this.redisClient.connect()
			}
			const acquired = await this.redisClient.set(lockKey, lockId, {
				NX: true,
				PX: ttlMs,
			},)
			if (acquired !== 'OK') {
				this.logger.debug(`Skipped — another instance already holds ${lockKey}`,)
				return
			}
			this.logger.debug(`Lock acquired for: ${lockKey} by ${lockId}`,)
			try {
				await callback()
			} finally {
				const current = await this.redisClient.get(lockKey,)

				if (current === lockId) {
					await this.redisClient.del(lockKey,)
					const duration = Date.now() - start
					this.logger.debug(
						`Lock released for: ${lockKey} (duration: ${duration}ms)`,
					)
				} else {
					this.logger.warn(
						`Lock for ${lockKey} expired — NOT removing (current holder: ${current})`,
					)
				}
			}
		} catch (err) {
			this.logger.error(`Error in locked job ${lockKey}`, err,)
		}
	}

	public buildLockKey({
		context,
		operation,
		extra,
	}: TRedisLockKeyBuild,): string {
		return extra ?
			`locks:${context}:${operation}:${extra}` :
			`locks:${context}:${operation}`
	}

	public async get<T>(key: string,): Promise<T | undefined> {
		try {
			const cache = await this.cacheManager.get<T>(key,)
			return cache
		} catch (error) {
			this.logger.error(`[RedisCacheService.get] cacheManager.get error:`, error,)
			return undefined
		}
	}

	public async set<T>(key: string, value: T, ttlSeconds = THREE_DAYS_CACHE_TIME,): Promise<void> {
		try {
			await this.cacheManager.set(key, value, ttlSeconds,)
		} catch (err) {
			this.logger.error('[RedisCacheService.set] cacheManager.set error:', err,)
			return
		}
		if (!this.redisClient.isOpen) {
			this.logger.warn('[RedisCacheService] Redis client is not open, skipping set',)
			return
		}
		const [, , urlPath,] = key.split(':',)
		const setKey = this.generateSetKey(urlPath,)
		try {
			await this.redisClient.sAdd(setKey, key,)
			await this.redisClient.expire(setKey, ttlSeconds,)
		} catch (error) {
			this.logger.error('[RedisCacheService.set] Redis error:', error,)
		}
	}

	public async deleteByCacheParams(cacheParams: ICacheKeyInput,): Promise<void> {
		const key = this.generateCacheKey(cacheParams,)
		const [, , urlPath,] = key.split(':',)
		const setKey = this.generateSetKey(urlPath,)
		if (!this.redisClient.isOpen) {
			this.logger.warn('[RedisCacheService] Redis client is not open, skipping deleteByUrl',)
			return
		}
		const keysToDelete = await this.redisClient.sMembers(setKey,)

		if (keysToDelete.length > 0) {
			await this.cacheManager.mdel(keysToDelete,)
			await this.cacheManager.del(setKey,)
		}
	}

	public async deleteAllCacheByUrlPath(urlPath: string,): Promise<void> {
		try {
			const setKey = this.generateSetKey(urlPath,)
			if (!this.redisClient.isOpen) {
				this.logger.warn('[RedisCacheService] Redis client is not open, skipping deleteByUrl',)
				return
			}
			const keys = await this.redisClient.sMembers(setKey,)

			if (keys.length > 0) {
				await this.cacheManager.mdel(keys,)
				await this.cacheManager.del(setKey,)
			}
		} catch (error) {
			this.logger.error('[RedisCacheService.deleteAllCacheByUrlPath] Redis error:', error,)
		}
	}

	public async deleteByUrl(urlPath: string | Array<string>,): Promise<void> {
		const paths = Array.isArray(urlPath,) ?
			urlPath :
			[urlPath,]
		if (!this.redisClient.isOpen) {
			this.logger.warn('[RedisCacheService] Redis client is not open, skipping deleteByUrl',)
			return
		}
		try {
			await Promise.all(paths.map(async(rawPath,) => {
				const setKey = this.generateSetKey(rawPath,)
				const keysToDelete = await this.redisClient.sMembers(setKey,)
				if (keysToDelete.length > 0) {
					await this.cacheManager.mdel(keysToDelete,)
					await this.cacheManager.del(setKey,)
				}
			},),)
		} catch (error) {
			this.logger.error('[RedisCacheService.deleteByUrl] Redis error:', error,)
		}
	}

	public async clear(): Promise<void> {
		await this.deleteByUrl([
			...cacheKeysToDeleteClient,
		],)
		await this.cacheManager.clear()
	}

	public generateKey(payload: ICacheKeyInput,): string {
		const hash = crypto
			.createHash('sha1',)
			.update(JSON.stringify(payload,),)
			.digest('hex',)
		return `cache:${this.nodeEnv}:${payload.url}:${hash}`
	}

	private generateSetKey(urlPath: string, keepTrailingSlash = false,): string {
		const normalizedPath = keepTrailingSlash ?
			urlPath.trim() :
			this.normalizeUrlPath(urlPath,)
		return `cache:keys:${this.nodeEnv}:${normalizedPath}`
	}

	private normalizeUrlPath(urlPath: string,): string {
		return urlPath.replace(/\/+$/, '',).trim()
	}

	private generateCacheKey({
		method, url, body, query, params, clientId,
	}: ICacheKeyInput,): string {
		const payload: ICacheKeyInput = { method, url, }
		if (query && Object.keys(query,).length > 0) {
			payload.query = query
		}
		if (params && Object.keys(params,).length > 0) {
			payload.params = params
		}
		if (body && Object.keys(body,).length > 0) {
			payload.body = body
		}
		if (clientId) {
			payload.clientId = clientId
		}
		return this.generateKey(payload,)
	}

	// WebSocket data storage handling block.
	private mutatingSetKey(type: MutatingType,): string {
		return `mutating:{${this.nodeEnv}}:${type}`
	}

	private creatingSetKey(type: CreatingType,): string {
		return `mutating:{${this.nodeEnv}}:${type.replace('Creating','',)}:creating`
	}

	private mutatingIndexKey(type: MutatingType,): string {
		return `mutating:keys:${this.nodeEnv}:${type}`
	}

	private creatingIndexKey(type: CreatingType,): string {
		return `mutating:keys:${this.nodeEnv}:${type}`
	}

	public async clearAllMutatingKeys(): Promise<void> {
		if (!this.redisClient.isOpen) {
			this.logger.warn('[RedisCacheService.clearAllMutatingKeys] Redis client is not open, skipping',)
			return
		}
		const keys = [
			`mutating:${this.nodeEnv}:portfolios`,
			`mutating:${this.nodeEnv}:assets`,
			`mutating:${this.nodeEnv}:clients`,
			`mutating:${this.nodeEnv}:budgets`,
			`mutating:${this.nodeEnv}:assets:creating`,
			`mutating:${this.nodeEnv}:clients:creating`,
			`mutating:${this.nodeEnv}:budgets:creating`,
		]
		try {
			if (keys.length > 0) {
				await this.redisClient.del(keys,)
				this.logger.log('[RedisCacheService.clearAllMutatingKeys] All mutating keys cleared',)
			}
		} catch (error) {
			this.logger.error('[RedisCacheService.clearAllMutatingKeys] Redis error:', error,)
		}
	}

	public async setMutatingId(type: MutatingType, id: string, ttlSeconds = MINUTE_CACHE_TIME,): Promise<void> {
		const key = `${this.mutatingSetKey(type,)}:${id}`
		const indexKey = this.mutatingIndexKey(type,)
		try {
			await this.cacheManager.set(key, true, ttlSeconds,)
		} catch (err) {
			this.logger.error('[RedisCacheService.setMutatingId] cacheManager.set error:', err,)
			return
		}
		if (!this.redisClient.isOpen) {
			this.logger.warn('[RedisCacheService.setMutatingId] Redis client is not open, skipping set',)
			return
		}
		try {
			await this.redisClient.sAdd(indexKey, key,)
			await this.redisClient.expire(indexKey, ttlSeconds,)
		} catch (error) {
			this.logger.error('[RedisCacheService.setMutatingId] Redis error:', error,)
		}
	}

	public async deleteAllMutatingByType(type: MutatingType,): Promise<void> {
		const indexKey = this.mutatingIndexKey(type,)
		try {
			if (!this.redisClient.isOpen) {
				this.logger.warn('[RedisCacheService.deleteAllMutatingByType] Redis client is not open, skipping delete',)
				return
			}
			const keys = await this.redisClient.sMembers(indexKey,)
			if (keys.length > 0) {
				await this.cacheManager.mdel(keys,)
				await this.cacheManager.del(indexKey,)
			}
		} catch (error) {
			this.logger.error('[RedisCacheService.deleteAllMutatingByType] Redis error:', error,)
		}
	}

	public async removeMutatingId(type: MutatingType,id: string,): Promise<void> {
		const fullKey = `${this.mutatingSetKey(type,)}:${id}`
		const indexKey = this.mutatingIndexKey(type,)
		try {
			await this.cacheManager.del(fullKey,)
		} catch (err) {
			this.logger.error('[RedisCacheService.removeMutatingId] cacheManager.del error:', err,)
		}
		if (!this.redisClient.isOpen) {
			this.logger.warn('[RedisCacheService.removeMutatingId] Redis client is not open, skipping',)
			return
		}
		try {
			await this.redisClient.sRem(indexKey, fullKey,)
			await this.redisClient.del(fullKey,)
		} catch (error) {
			this.logger.error('[RedisCacheService.removeMutatingId] Redis error:', error,)
		}
	}

	public async delCreating(type: CreatingType, id: string,): Promise<void> {
		const key = `${this.creatingSetKey(type,)}:${id}`
		const indexKey = this.creatingIndexKey(type,)
		try {
			await this.cacheManager.del(key,)
		} catch (err) {
			this.logger.error('[RedisCacheService.delCreating] cacheManager.del error:', err,)
		}
		if (!this.redisClient.isOpen) {
			this.logger.warn('[RedisCacheService.delCreating] Redis client is not open, skipping',)
			return
		}
		try {
			await this.redisClient.sRem(indexKey, key,)
			await this.redisClient.del(key,)
		} catch (error) {
			this.logger.error('[RedisCacheService.delCreating] Redis error:', error,)
		}
	}

	public async setCreating<T>(type: CreatingType, id: string,	value: T,ttlSeconds = MINUTE_CACHE_TIME,): Promise<void> {
		const key = `${this.creatingSetKey(type,)}:${id}`
		const indexKey = this.creatingIndexKey(type,)
		try {
			await this.cacheManager.set(key, value, ttlSeconds,)
		} catch (err) {
			this.logger.error('[RedisCacheService.setCreating] cacheManager.set error:', err,)
			return
		}
		if (!this.redisClient.isOpen) {
			this.logger.warn('[RedisCacheService.setCreating] Redis client is not open, skipping set',)
			return
		}
		try {
			await this.redisClient.sAdd(indexKey, key,)
			await this.redisClient.expire(indexKey, ttlSeconds,)
		} catch (error) {
			this.logger.error('[RedisCacheService.setCreating] Redis error:', error,)
		}
	}

	public async getAllMutatingIds(type: MutatingType,): Promise<Array<string>> {
		if (!this.redisClient.isOpen) {
			this.logger.warn('[RedisCacheService.getAllMutatingIds] Redis client is not open, skipping',)
			return []
		}
		const indexKey = this.mutatingIndexKey(type,)
		try {
			const keys = await this.redisClient.sMembers(indexKey,)
			if (keys.length === 0) {
				return []
			}
			return keys
				.map((fullKey,) => {
					const parts = fullKey.split(':',)
					return parts.length > 0 ?
						parts[parts.length - 1] :
						undefined
				},)
				.filter((id,): id is string => {
					return typeof id === 'string' && id.length > 0
				},)
		} catch (error) {
			this.logger.error('[RedisCacheService.getAllMutatingIds] Redis error:', error,)
			return []
		}
	}

	public async getAllCreating<T>(type: CreatingType,): Promise<Record<string, T>> {
		if (!this.redisClient.isOpen) {
			this.logger.warn('[RedisCacheService.getAllCreating] Redis client is not open, skipping',)
			return {}
		}
		const indexKey = this.creatingIndexKey(type,)
		try {
			const keys = await this.redisClient.sMembers(indexKey,)
			if (keys.length === 0) {
				return {}
			}
			const result: Record<string, T> = {}
			for (const fullKey of keys) {
				const parts = fullKey.split(':',)
				const idPart = parts.length > 0 ?
					parts[parts.length - 1] :
					undefined
				if (!idPart) {
					continue
				}
				try {
					const val = await this.cacheManager.get<T>(fullKey,)
					if (val !== undefined && val !== null) {
						result[idPart] = val
					}
				} catch (err) {
					this.logger.error('[RedisCacheService.getAllCreating] cacheManager.get error:', err,)
				}
			}
			return result
		} catch (error) {
			this.logger.error('[RedisCacheService.getAllCreating] Redis error:', error,)
			return {}
		}
	}
}