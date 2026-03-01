import { Reflector, } from '@nestjs/core'
import type {
	CallHandler,
	ExecutionContext,
	NestInterceptor,} from '@nestjs/common'
import {
	Injectable, Logger,
} from '@nestjs/common'
import type { Observable,} from 'rxjs'
import { of, } from 'rxjs'
import { tap, } from 'rxjs/operators'
import type {
	Response,
} from 'express'
import { CACHE_TTL_METADATA, } from '@nestjs/cache-manager'

import { RedisCacheService, } from './redis-cache.service'
import type { ICacheKeyInput, } from './redis-cache.types'
import { TTL_CACHE_TIME, } from './redis-cache.constants'
import type { AuthRequest, } from '../auth'

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger(RedisCacheInterceptor.name,)

	constructor(
		private cacheService: RedisCacheService,
		private readonly reflector: Reflector,
	) {}

	public async intercept(context: ExecutionContext, next: CallHandler,): Promise<Observable<unknown>> {
		const request: AuthRequest = context.switchToHttp().getRequest()
		const { method, originalUrl, body, query, params, clientId, headers,} = request

		const methodTTL = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler(),) as number | undefined
		const classTTL = this.reflector.get<number>(CACHE_TTL_METADATA, context.getClass(),) as number | undefined
		const ttl = methodTTL ?? classTTL ?? TTL_CACHE_TIME
		const url = `${headers.origin ?? headers.referer ?? ''}${originalUrl}`
		const urlPath = new URL(url,).pathname.replace(/\/+$/, '',).trim()

		const key = this.generateCacheKey({method, url: urlPath, body, query, params, clientId,},)

		const cached = await this.cacheService.get(key,)
		if (cached) {
			return of(cached,)
		}

		return next.handle().pipe(
			tap((response: Response,) => {
				this.cacheService.set(key, response, ttl,)
			},),
		)
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

		return this.cacheService.generateKey(payload,)
	}
}