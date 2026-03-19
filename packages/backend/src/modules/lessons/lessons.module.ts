import { Module, } from '@nestjs/common'
import { PrismaModule, } from 'nestjs-prisma'

import { LessonsController, } from './controllers/lessons.controller'
import { LessonsService, } from './services/lessons.service'
import { JwtModule, } from '../../shared/auth/jwt.module'

@Module({
	imports: [
		PrismaModule,
		JwtModule,
	],
	controllers: [
		LessonsController,
	],
	providers: [
		LessonsService,
	],
	exports: [
		LessonsService,
	],
},)
export class LessonsModule {}