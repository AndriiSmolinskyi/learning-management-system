import { PrismaModule, loggingMiddleware, } from 'nestjs-prisma'
import { Logger, Module, } from '@nestjs/common'
import { ConfigModule, } from '@nestjs/config'
import { AuthModule, } from './modules/auth/auth.module'
import { MailModule, } from './modules/mail/mail.module'
import { StudentsModule, } from './modules/students/students.module'
import { JwtModule, } from './shared/auth/jwt.module'

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
		AuthModule,
		MailModule,
		StudentsModule,
		JwtModule,
	],
},)

export class AppModule {}