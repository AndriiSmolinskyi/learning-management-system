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
import { RedisIoAdapterService, } from './modules/common/websockets/redis-adapter.service'

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

	app.use(bodyParser.json({limit: '50mb',},),)
	app.use(bodyParser.urlencoded({limit: '50mb', extended: true,},),)
	app.useGlobalPipes(new ValidationPipe(
		{
			whitelist: true,
		},
	),)
	app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false, },),)
	app.useGlobalFilters(new AllExceptionsFilter(),)

	app.enableShutdownHooks()

	const frontendUrl = process.env['FRONTEND_URL']
	const adminUrl = process.env['ADMIN_URL']
	const allowedOrigins = [
		frontendUrl,
		adminUrl,
	]

	app.enableCors({
		origin:         allowedOrigins,
		credentials:    true,
		exposedHeaders: ['Content-Disposition',],
	},)

	app.use(cookieParser(),)
	const config = new DocumentBuilder()
		.setTitle('API',)
		.setDescription('Description',)
		.setVersion('1.0',)
		.build()

	const document = SwaggerModule.createDocument(app, config,)
	SwaggerModule.setup('api', app, document,)

	const configService = app.get(ConfigService,)
	const redisIoAdapter = new RedisIoAdapterService(app,)
	await redisIoAdapter.connectToRedis(configService,)

	app.useWebSocketAdapter(redisIoAdapter,)

	await app.listen((process.env['PORT']) || 8080,)
}

bootstrap()
