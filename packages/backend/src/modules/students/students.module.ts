import { Module, } from '@nestjs/common'
import { PrismaModule, } from 'nestjs-prisma'

import { StudentsController, } from './controllers/students.controller'
import { StudentsService, } from './services/students.service'
import { JwtModule, } from 'src/shared/auth/jwt.module'

@Module({
	imports:     [
		PrismaModule,
		JwtModule,
	],
	controllers: [
		StudentsController,
	],
	providers:   [
		StudentsService,
	],
	exports:     [
		StudentsService,
	],
},)
export class StudentsModule {}