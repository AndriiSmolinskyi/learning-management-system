import cookieParser from 'cookie-parser'
import 'dotenv/config'
import {
	Logger,
	ValidationPipe,
} from '@nestjs/common'
import {
	NestFactory,
} from '@nestjs/core'
import {
	DocumentBuilder,
	SwaggerModule,
} from '@nestjs/swagger'
import type { NestExpressApplication, } from '@nestjs/platform-express'
import * as bodyParser from 'body-parser'
import { ConfigService, } from '@nestjs/config'

import {
	AppModule,
} from './app.module'
import checkEnv from './env'
import { AllExceptionsFilter, } from './shared/utils/exception-filter.util'

const logger = new Logger('GlobalErrorHandler',)

process.on('unhandledRejection', (reason,) => {
	logger.error('[Unhandled Rejection]:', reason,)
},)

process.on('uncaughtException', (error,) => {
	logger.error('[Uncaught Exception]:', error,)
},)

async function bootstrap(): Promise<void> {
	checkEnv()
	const app = await NestFactory.create<NestExpressApplication>(AppModule,)

	app.set('trust proxy', 1,)

	app.use(bodyParser.json({limit: '50mb',},),)
	app.use(bodyParser.urlencoded({limit: '50mb', extended: true,},),)

	app.use(cookieParser(),)

	app.useGlobalPipes(new ValidationPipe({
		transform:            true,
		whitelist:            true,
		forbidNonWhitelisted: true,
	},),)

	app.useGlobalFilters(new AllExceptionsFilter(),)
	app.enableShutdownHooks()

	const allowedOrigins = [
		process.env['FRONTEND_URL'],
		process.env['ADMIN_URL'],
	].filter(Boolean,)

	app.enableCors({
		credentials: true,
		origin:      (origin, cb,) => {
			if (!origin) {
				cb(null, true,); return
			}
			if (allowedOrigins.includes(origin,)) {
				cb(null, true,); return
			}
			cb(new Error('Not allowed by CORS',), false,)
		},
		exposedHeaders: ['Content-Disposition',],
	},)

	const config = new DocumentBuilder()
		.setTitle('API',)
		.setDescription('Description',)
		.setVersion('1.0',)
		.build()

	const document = SwaggerModule.createDocument(app, config,)
	SwaggerModule.setup('api', app, document,)

	app.get(ConfigService,)

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	await app.listen(Number(process.env['PORT'] ?? 8080,),)
}

bootstrap()