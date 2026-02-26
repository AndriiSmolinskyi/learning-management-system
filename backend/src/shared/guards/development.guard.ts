import {
	Injectable,
} from '@nestjs/common'
import {
	ConfigService,
} from '@nestjs/config'

import type {
	CanActivate,
} from '@nestjs/common'

@Injectable()
export class DevelopmentModeGuard implements CanActivate {
	constructor(private readonly configService: ConfigService,) {}

	public canActivate(): boolean {
		return this.configService.getOrThrow<string>('NODE_ENV',) === 'development'
	}
}
