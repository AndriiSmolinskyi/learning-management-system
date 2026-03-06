import { SetMetadata, } from '@nestjs/common'
import type { Role, } from '@prisma/client'
import { AUTH_META, } from './auth.constants'

export const Roles = (...roles: Array<Role>): MethodDecorator & ClassDecorator => {
	return SetMetadata(AUTH_META.ROLES, roles,)
}