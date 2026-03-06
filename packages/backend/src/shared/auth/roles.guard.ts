import type { CanActivate, ExecutionContext, } from '@nestjs/common'
import { Injectable, } from '@nestjs/common'
import { Reflector, } from '@nestjs/core'
import type { Role, } from '@prisma/client'

import { AUTH_META, } from './auth.constants'
import type { AuthRequest, } from './auth.types'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
	) {}

	public canActivate(context: ExecutionContext,): boolean {
		const roles = this.reflector.getAllAndOverride<Array<Role>>(
			AUTH_META.ROLES,
			[
				context.getHandler(),
				context.getClass(),
			],
		)

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!roles || roles.length === 0) {
			return true
		}

		const request: AuthRequest = context.switchToHttp().getRequest()
		const userRole = request.user?.role

		return Boolean(userRole && roles.includes(userRole,),)
	}
}