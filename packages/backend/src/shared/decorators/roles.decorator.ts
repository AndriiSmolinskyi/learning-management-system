import type { CustomDecorator,} from '@nestjs/common'
import { SetMetadata, } from '@nestjs/common'
import type { RolesMetadata, } from '../types'

export const RolesDecorator = ({roles, clientAccess = false,}: RolesMetadata,): CustomDecorator<string> => {
	return SetMetadata('data', { roles, clientAccess, },)
}