import { CustomPrismaModule, PrismaModule, loggingMiddleware, } from 'nestjs-prisma'
import { Logger, Module, } from '@nestjs/common'
import { ConfigModule, } from '@nestjs/config'
import { ScheduleModule, } from '@nestjs/schedule'

@Module({
	imports:     [
		ConfigModule.forRoot({
			isGlobal:    true,
		},),
		PrismaModule.forRoot({
			isGlobal:             true,
			prismaServiceOptions: {
				middlewares: [
					loggingMiddleware({
						logger:   new Logger('PrismaMiddleware',),
						logLevel: 'log',
					},),
				],
			},
		},),
	],
},)

export class AppModule {}