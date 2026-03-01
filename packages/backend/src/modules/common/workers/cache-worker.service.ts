import type { OnApplicationBootstrap, OnApplicationShutdown, } from '@nestjs/common'
import { Injectable, Logger, } from '@nestjs/common'
import { join, } from 'path'
import { Worker, isMainThread, } from 'worker_threads'
import { randomUUID, } from 'crypto'
import type { Observable,} from 'rxjs'
import { fromEvent, firstValueFrom, filter, tap, timeout, retry, catchError,} from 'rxjs'
import { WORKER_STREAM_TIMEOUT, workerMethods, } from './cache-worker.constants'

@Injectable()
export class CacheWorkerService implements OnApplicationBootstrap, OnApplicationShutdown {
	private worker: Worker | undefined

	private readonly logger: Logger = new Logger(CacheWorkerService.name,)

	private messages$: Observable<{ id: string; success: boolean; error?: string }>

	public async onApplicationBootstrap(): Promise<void> {
		if (!isMainThread) {
			return
		}
		this.worker = new Worker(join(__dirname, 'cache-update.worker.js',),)
		this.worker.setMaxListeners(30,)
		this.messages$ = fromEvent(this.worker, 'message',) as Observable<{
			id: string;
			success: boolean;
			error?: string;
		}>
	}

	public async onApplicationShutdown(): Promise<void> {
		if (this.worker) {
			await this.worker.terminate()
		}
	}

	private async sendMessageAndWait<T extends object>(
		payload: T & { method: string },
	): Promise<void> {
		const id = randomUUID()
		if (!this.worker) {
			throw new Error('Worker is not initialized',)
		}
		this.worker.postMessage({ ...payload, id, },)
		await firstValueFrom(
			this.messages$.pipe(
				filter((msg,) => {
					return msg.id === id
				},),
				timeout(WORKER_STREAM_TIMEOUT,),
				tap((msg,) => {
					if (!msg.success) {
						throw new Error(msg.error ?? 'Unknown error',)
					}
				},),
				retry(3,),
				catchError((err,) => {
					this.logger.error(`Failed to get response from worker: ${payload.method} - ${err.message}`,)
					throw err
				},),
			),
		)
	}

	public async runWorkerJob<T extends object>(
		method: string,
		payload?: T,
	): Promise<void> {
		return new Promise((resolve, reject,) => {
			const id = randomUUID()

			if (!this.worker) {
				throw new Error('Worker is not initialized',)
			}

			const sub = this.messages$
				.pipe(
					filter((msg,) => {
						return msg.id === id
					},),
					timeout(WORKER_STREAM_TIMEOUT,),
					tap((msg,) => {
						if (!msg.success) {
							throw new Error(msg.error ?? 'Unknown error',)
						}
					},),
				)
				.subscribe({
					next: () => {
						resolve()
						sub.unsubscribe()
					},
					error: (err,) => {
						reject(err,)
						sub.unsubscribe()
					},
				},)

			this.worker.postMessage({
				id,
				method,
				data: payload,
			},)
		},)
	}

	public async runRestoreCache(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_RESTORE,},)
	}

	public async runRoutesWithTotalsCacheUpdate(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_UPDATE_ROUTES_WITH_TOTALS, },)
	}

	public async runRestorePortfolioListCache(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_PORTFOLIO_LIST_RESTORE, },)
	}

	public async runRestoreAssetCache(assetName: string,): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_ASSET_UPDATE, assetName,},)
	}

	public async runRestoreClientAssetCache(assetName: string, clientId: string,): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_CLIENT_ASSET_UPDATE, assetName, clientId,},)
	}

	public async runRestorePortfolioCache(portfolioId: string,): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_PORTFOLIO_DETAILS_UPDATE, portfolioId, },)
	}

	public async runRestoreClientListWithPortfoliosCache(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_CLIENT_LIST_WITH_PORTFOLIOS_UPDATE, },)
	}

	public async runRestoreClientListCache(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_CLIENT_LIST_UPDATE, },)
	}

	public async runRestoreBudgetListCache(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_BUDGET_LIST_UPDATE, },)
	}

	public async runRestoreOverviewCache(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_OVERVIEW_UPDATE, },)
	}

	public async runGenerateClientListCache(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_CLIENT_LIST_GENERATE, },)
	}

	public async runClientsCacheUpdate(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CACHE_CLIENTS_PORTAL_UPDATE,},)
	}

	public async handleClientListUpdateEvent(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.HANDLE_CLIENT_LIST_UPDATE_EVENT,},)
	}

	public async handleTransactionCreationEvent(portfolioId: string, assetName: string,): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.HANDLE_TRANSACTION_CREATION_EVENT, portfolioId, assetName,},)
	}

	public async handleAssetCreationEvent(assetName: string, portfolioId?: string,): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.HANDLE_ASSET_CREATION_EVENT, assetName, portfolioId, },)
	}

	public async updateAllClientsTotals(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.CLIENTS_TOTALS_UPDATE, },)
	}

	public async handleBinanceUpdate(): Promise<void> {
		await this.sendMessageAndWait({ method: workerMethods.HANDLE_BINANCE_UPDATE, },)
	}
}
