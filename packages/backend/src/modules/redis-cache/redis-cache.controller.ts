import { ApiTags, } from '@nestjs/swagger'
import { Controller, UseGuards, Delete,} from '@nestjs/common'
import { RedisCacheService, } from './redis-cache.service'
import { JWTAuthGuard, RolesGuard, } from '../../shared/guards'
import { RedisRoutes, SwaggerDescriptions, } from './redis-cache.constants'
import { Roles, } from '../../shared/types'
import { RolesDecorator, } from '../../shared/decorators'

@Controller(RedisRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.REDIS_TAG,)
export class RedisController {
	constructor(
		private readonly redisCacheService: RedisCacheService,
	) { }

	/**
		* Clears all cached data from Redis.
		* @returns A Promise that resolves when the cache has been successfully cleared.
		* @remarks
		* This endpoint is protected by role-based access and can be used
		* by authorized family-office manager to force cache invalidation.
	*/
	@Delete(RedisRoutes.CLEAR_CACHE,)
	@RolesDecorator({
		roles:        [Roles.FAMILY_OFFICE_MANAGER,],
	},)
	public async getCacheClered(): Promise<void> {
		return this.redisCacheService.clear()
	}
}