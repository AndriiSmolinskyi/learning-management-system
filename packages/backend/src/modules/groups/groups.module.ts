import { Module, } from '@nestjs/common'
import { PrismaModule, } from 'nestjs-prisma'

import { GroupsController, } from './controllers/groups.controller'
import { GroupsService, } from './services/groups.service'
import { JwtModule, } from 'src/shared/auth/jwt.module'

@Module({
	imports:     [
		PrismaModule,
		JwtModule,
	],
	controllers: [
		GroupsController,
	],
	providers:   [
		GroupsService,
	],
	exports:     [
		GroupsService,
	],
},)
export class GroupsModule {}