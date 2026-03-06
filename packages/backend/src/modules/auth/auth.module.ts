import { Module, } from '@nestjs/common'
import { ConfigModule, } from '@nestjs/config'
import { PrismaModule, } from 'nestjs-prisma'

import { AuthController, } from './controllers/auth.controller'
import { AuthService, } from './services/auth.service'
import { JWTService, } from '../../shared/auth/jwt.service'

@Module({
	imports:     [
		ConfigModule,
		PrismaModule,
	],
	controllers: [
		AuthController,
	],
	providers:   [
		AuthService,
		JWTService,
	],
	exports:     [
		AuthService,
	],
},)
export class AuthModule {}