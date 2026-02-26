/* eslint-disable complexity */
import { parentPort, } from 'worker_threads'
import { NestFactory, } from '@nestjs/core'
import { AppModule, } from '../../../app.module'
import { CacheUpdateService, } from '../cache-sync/cache-sync.service'
import { workerMethods, workerMethodsList, } from './cache-worker.constants'
import { ComputationsService, } from './../computations/computations.service'

async function bootstrap(): Promise<void> {
	const app = await NestFactory.createApplicationContext(AppModule,)
	const service = app.get(CacheUpdateService,)
	const computationsService = app.get(ComputationsService,)

	parentPort?.on('message', async(msg,) => {
		try {
			if (!workerMethodsList.includes(msg.method,)) {
				throw new Error('Unknown method',)
			}

			if (msg.method === workerMethods.CACHE_RESTORE) {
				await	computationsService.updateAllClientsTotals()
				// await service.restoreCache()
			}
			if (msg.method === workerMethods.CACHE_UPDATE_ROUTES_WITH_TOTALS) {
				await service.routesWithTotalsCacheUpdate()
			}
			if (msg.method === workerMethods.CACHE_PORTFOLIO_LIST_RESTORE) {
				await service.restorePortfolioListCache()
			}
			if (msg.method === workerMethods.CACHE_ASSET_UPDATE) {
				await service.updateAssetCache(msg.assetName,)
			}
			if (msg.method === workerMethods.CACHE_CLIENT_ASSET_UPDATE) {
				await service.updateAssetCache(msg.assetName, msg.clientId,)
			}
			if (msg.method === workerMethods.CACHE_PORTFOLIO_DETAILS_UPDATE) {
				await service.portfoliosDetailsCacheUpdate(msg.portfolioId,)
			}
			if (msg.method === workerMethods.CACHE_CLIENT_LIST_WITH_PORTFOLIOS_UPDATE) {
				await service.restoreClientListWithPortfoliosCache()
			}
			if (msg.method === workerMethods.CACHE_CLIENT_LIST_UPDATE) {
				await service.restoreClientListCache()
			}
			if (msg.method === workerMethods.CACHE_BUDGET_LIST_UPDATE) {
				await service.updateBudgetList()
			}
			if (msg.method === workerMethods.CACHE_CLIENT_LIST_GENERATE) {
				await service.generateClientListCache()
			}
			if (msg.method === workerMethods.CACHE_OVERVIEW_UPDATE) {
				await service.updateOverviewCache(msg.data,)
			}
			if (msg.method === workerMethods.CACHE_PORTFOLIO_LIST_RESTORE_WITH_DATA) {
				await service.syncUpdatePortfolioListCache(msg.data,)
			}
			if (msg.method === workerMethods.CACHE_CLIENT_LIST_RESTORE_WITH_DATA) {
				await service.updateClientListCache(msg.data,)
			}
			if (msg.method === workerMethods.CACHE_BUDGET_LIST_RESTORE_WITH_DATA) {
				await service.generateBudgetList(msg.data,)
			}
			if (msg.method === workerMethods.CACHE_CLIENTS_PORTAL_UPDATE) {
				await service.routesForClientsUpdate()
			}
			if (msg.method === workerMethods.HANDLE_CLIENT_LIST_UPDATE_EVENT) {
				await service.handleClientListUpdateEvent()
			}
			if (msg.method === workerMethods.HANDLE_TRANSACTION_CREATION_EVENT) {
				await service.handleTransactionCreationEvent({portfolioId: msg.portfolioId, assetName: msg.assetName,},)
			}
			if (msg.method === workerMethods.HANDLE_ASSET_CREATION_EVENT) {
				await service.handleAssetCreationEvent({portfolioId: msg?.portfolioId, assetName: msg.assetName,},)
			}
			if (msg.method === workerMethods.CLIENTS_TOTALS_UPDATE) {
				await computationsService.updateAllComputations()
			}

			if (msg.method === workerMethods.HANDLE_BINANCE_UPDATE) {
				await computationsService.updateCryptoBinanceComputations()
			}

			parentPort?.postMessage({ id: msg.id, success: true, },)
		} catch (e) {
			const error = e instanceof Error ?
				e.message :
				'Unknown error'
			parentPort?.postMessage({ id: msg.id, success: false, error, },)
		}
	},)
}

bootstrap()