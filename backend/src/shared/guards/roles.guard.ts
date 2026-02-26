import type { CanActivate, ExecutionContext,} from '@nestjs/common'
import { Injectable, } from '@nestjs/common'
import { Reflector, } from '@nestjs/core'

import type { AuthRequest, } from '../../modules/auth/auth.types'
import { PrismaService, } from 'nestjs-prisma'
import type { RolesMetadata, } from '../types'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly prismaService: PrismaService,
	) { }

	public async canActivate(context: ExecutionContext,): Promise<boolean> {
		const requiredRoles = this.reflector.get<RolesMetadata>('data', context.getHandler(),).roles
		const hasClientAccess = this.reflector.get<RolesMetadata>('data', context.getHandler(),).clientAccess

		const request: AuthRequest = context.switchToHttp().getRequest()

		const userRoles = request.roles

		const hasRolesAccess = userRoles.some((role,) => {
			return requiredRoles.includes(role,)
		},)

		if (hasRolesAccess) {
			return true
		}

		if (!hasClientAccess) {
			return false
		}

		const id = request.clientId

		if (!id) {
			return false
		}

		const client = await this.prismaService.client.findUnique({
			where: {id,},
		},)

		if (client) {
			return true
		}

		return false
	}
}