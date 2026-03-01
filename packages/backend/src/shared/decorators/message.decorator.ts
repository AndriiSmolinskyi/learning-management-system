import type {
	CustomDecorator,
} from '@nestjs/common'
import {
	SetMetadata,
} from '@nestjs/common'

export const Message = (message: string,): CustomDecorator<string> => {
	return SetMetadata('message', message,)
}