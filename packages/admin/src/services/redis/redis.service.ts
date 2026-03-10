import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'

import {
	RedisRoutes,
} from './redic.constants'

class RedisService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = RedisRoutes.MODULE

	public async getRedisCacheCleared(): Promise<void> {
		return this.httpService.delete(`${this.module}/${RedisRoutes.CLEAR_CACHE}`,)
	}
}

export const redisService = new RedisService(new HttpFactoryService().createHttpService(),)
