import { CustomPrismaModule, PrismaModule, loggingMiddleware, } from 'nestjs-prisma'
import { Logger, Module, } from '@nestjs/common'
import { ConfigModule, } from '@nestjs/config'
import { ScheduleModule, } from '@nestjs/schedule'
import { PrismaClient as ThirdPartyPrismaClient, } from '@third-party-prisma/client'

import { AuthModule, } from './modules/auth/auth.module'
import { UserModule, } from './modules/user/user.module'
import { ClientModule, } from './modules/client/client.module'
import { CryptoModule, } from './modules/crypto/crypto.module'
import { JwtModule, } from './modules/jwt/jwt.module'
import { UserRepModule, } from './repositories/user/user.module'
import { EmailRepModule, } from './repositories/email/email.module'
import { PhoneRepModule, } from './repositories/phone/phone.module'
import { ClientRepModule, } from './repositories/client/client.module'
import { DocumentModule, } from './modules/document/document.module'
import { PortfolioModule, } from './modules/portfolio/portfolio.module'
import { EntityModule, } from './modules/entity/entity.module'
import { BankModule, } from './modules/bank/bank.module'
import { AccountModule, } from './modules/account/account.module'
import { AssetModule, } from './modules/asset/asset.module'
import { ListHubModule, } from './modules/list-hub/list-hub.module'
import { PortfolioRepModule, } from './repositories/portfolio/portfolio.module'
import { CBondsApiModule, } from './modules/apis/cbonds-api/cbonds-api.module'
import { RequestModule, } from './modules/request/request.module'
import { CBondsRepModule, } from './repositories/cbonds/cbonds.module'
import { OrderModule, } from './modules/order/order.module'
import { TransactionModule, } from './modules/transaction/transaction.module'
import { AnalyticsModule, } from './modules/analytics/analytics.module'
import { BudgetModule, } from './modules/budget/budget.module'
import { ReportModule, } from './modules/report/report.module'
import { ExpenseCategoryModule, } from './modules/expense-category/expense-category.module'
import { THIRD_PARTY_PRISMA_SERVICE, } from './shared/constants'
import { BudgetRepModule, } from './repositories/budget/budget.module'
import { AssetRepModule, } from './repositories/asset/asset.module'
import { CommonModule, } from './modules/common/common.module'
import { MetricsModule, } from './modules/metrics/metrics.module'
import { RedisCacheModule, } from './modules/redis-cache/redis-cache.module'
import { EventEmitterModule, } from '@nestjs/event-emitter'
import { SettingsModule, } from './modules/settings/settings.module'
import { TableModule, } from './modules/tables/table.module'

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
		CustomPrismaModule.forRoot({
			name:     THIRD_PARTY_PRISMA_SERVICE,
			client: new ThirdPartyPrismaClient({
				log: ['query', 'info', 'warn', 'error',],
			},),
			isGlobal: true,
		},),
		EventEmitterModule.forRoot(),
		ScheduleModule.forRoot(),
		RedisCacheModule,
		MetricsModule,
		CryptoModule,
		AuthModule,
		UserModule,
		ClientModule,
		JwtModule,
		UserRepModule,
		ClientRepModule,
		DocumentModule,
		EmailRepModule,
		PhoneRepModule,
		PortfolioModule,
		EntityModule,
		BankModule,
		AccountModule,
		AssetModule,
		ListHubModule,
		PortfolioRepModule,
		CBondsApiModule,
		RequestModule,
		TransactionModule,
		CBondsRepModule,
		OrderModule,
		AnalyticsModule,
		BudgetModule,
		ReportModule,
		ExpenseCategoryModule,
		BudgetRepModule,
		AssetRepModule,
		CommonModule,
		SettingsModule,
		TableModule,
	],
},)

export class AppModule {}