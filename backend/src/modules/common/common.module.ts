/* eslint-disable no-unused-vars */
import { Global, Logger, Module, } from '@nestjs/common'
import { CBondsApiModule, } from '../apis/cbonds-api/cbonds-api.module'
import { CronJobsService, } from './cron-jobs/cron-jobs.service'
import { AssetModule, } from '../asset/asset.module'
import { TransactionModule, } from '../transaction/transaction.module'
import { EventsGateway, } from './websockets/events.gateway'
import { PortfolioModule, } from '../portfolio/portfolio.module'
import { AnalyticsModule, } from '../analytics/analytics.module'
import { ClientModule, } from '../client/client.module'
import { CacheUpdateService, } from './cache-sync/cache-sync.service'
import { BudgetModule, } from '../budget/budget.module'
import { HealthCheckModule, } from './health-check/health-check.module'
import { CacheWorkerService, } from './workers/cache-worker.service'
import { ComputationsService, } from './computations/computations.service'
import { RedisIoAdapterService, } from './websockets/redis-adapter.service'
import { DbMigrationService, } from './db-migration/db-migration.service'
import { EntityModule, } from './../entity/entity.module'
import { BankModule, } from '../bank/bank.module'
import { CryptoModule, } from '../crypto/crypto.module'
import { AccountModule, } from '../account/account.module'
import { ListHubModule, } from '../list-hub/list-hub.module'
import { BinanceService, } from '../apis/cbonds-api/services/binance-api.service'

@Global()
@Module({
	providers: [
		CacheUpdateService,
		Logger,
		CronJobsService,
		EventsGateway,
		CacheWorkerService,
		ComputationsService,
		RedisIoAdapterService,
		DbMigrationService,
		BinanceService,
	],
	exports: [
		ComputationsService,
		RedisIoAdapterService,
		DbMigrationService,
	],
	imports: [
		CBondsApiModule,
		AssetModule,
		TransactionModule,
		PortfolioModule,
		AnalyticsModule,
		ClientModule,
		BudgetModule,
		HealthCheckModule,
		EntityModule,
		BankModule,
		CryptoModule,
		AccountModule,
		ListHubModule,
	],
},)

export class CommonModule {}