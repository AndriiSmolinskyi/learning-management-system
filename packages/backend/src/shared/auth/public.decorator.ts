import { SetMetadata, } from '@nestjs/common'
import { AUTH_META, } from './auth.constants'

export const Public = (): MethodDecorator & ClassDecorator => {
	return SetMetadata(AUTH_META.IS_PUBLIC, true,)
}