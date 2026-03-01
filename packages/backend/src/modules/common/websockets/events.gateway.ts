/* eslint-disable complexity */
/* eslint-disable max-lines */
import { Logger, } from '@nestjs/common'
import { OnEvent, } from '@nestjs/event-emitter'
import type { BudgetPlan, } from '@prisma/client'
import type { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,} from '@nestjs/websockets'
import { WebSocketGateway, WebSocketServer, } from '@nestjs/websockets'
import type { Socket, } from 'socket.io'

import { eventNames, } from './events.constants'
import { TAssetTransferEvent, TAssetActionEvent, TTransactionActionEvent, TPortfolioDeletion, } from './events.types'
import { CacheWorkerService, } from '../workers/cache-worker.service'
import { AssetNamesType, } from '../../../modules/asset/asset.types'
import { RedisCacheService, } from '../../../modules/redis-cache/redis-cache.service'
import { Server, } from 'socket.io'

@WebSocketGateway({
	cors:       true,
},)
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private readonly logger: Logger = new Logger(EventsGateway.name,)

	constructor(
		private readonly cacheWorkerService: CacheWorkerService,
		private readonly redisCacheService: RedisCacheService,
	) {}

	@WebSocketServer()
	public server: Server

	/**
	 	* CR - 138
 		* SOCKET - 001
 		* Lifecycle hook triggered once after the WebSocket gateway has been initialized.
 		* @remarks
 		* Useful for logging or performing one-time setup logic. Runs once on application boot.
 	*/
	public afterInit(): void {
		this.logger.log('[Socket initialized]',)
		// this.connectBinance()
	}

	/**
		* CR - 138
 		* SOCKET - 002
 		* Handles a new WebSocket client connection.
 		* @remarks
 		* Stores the client in the internal `clients` map for further event communication.
 		* @param client - The connected WebSocket client instance.
 	*/
	public handleConnection(client: Socket,): void {
		this.logger.log(`[Client connected]: ${client.id}`,)
	}

	/**
	 	* CR - 138
 		* SOCKET - 003
 		* Handles WebSocket client disconnection.
 		* @remarks
 		* Cleans up internal references to the client and removes associated event listeners if any.
 		* @param client - The disconnected WebSocket client instance.
 	*/
	public handleDisconnect(client: Socket,): void {
		this.logger.log(`[Client disconnected]: ${client.id}`,)
	}

	/**
	 	* CR - 138
 		* SOCKET - 004
 		* Emits a `cbonds-update` event to all connected WebSocket clients.
 		* @remarks
 		* This method is triggered when the `CBONDS_DATA_UPDATED` application event is fired.
 		* Used to invalidate queries CBonds data has been updated.
 	*/
	@OnEvent(eventNames.CBONDS_DATA_UPDATED, { async: true, },)
	private async handleCbondsDataUpdate(): Promise<void> {
		try {
			await Promise.all([
				// this.cacheWorkerService.runRoutesWithTotalsCacheUpdate(),
				this.cacheWorkerService.updateAllClientsTotals(),
			],)
			this.server.emit('cbonds-update', {
				success: true,
				message: 'CBonds updated!',
			},)
		} catch (error) {
			this.logger.error('[HandleCbondsDataUpdateEvent] Error:', error,)
		}
	}

	public async delay(ms: number,): Promise<void> {
		return new Promise((resolve,) => {
			setTimeout(resolve, ms,)
		},)
	}

	/**
	 	* CR - 138
 		* SOCKET - 005
 		* Emits a `totals-update` event to all connected WebSocket clients.
 		* @remarks
 		* This method is triggered when the `TOTALS_UPDATED` application event is fired.
 		* Used to update cached data after totals changed.
 	*/
	@OnEvent(eventNames.TOTALS_UPDATED,  { async: true, },)
	private async handleTotalsUpdate(): Promise<void> {
		try {
			await this.cacheWorkerService.runRestoreCache()
			// this.server.emit('totals-update', {
			// 	success: true,
			// 	message: 'Totals updated!',
			// },)
		} catch (error) {
			this.logger.error('[HandleTotalsUpdateEvent] Error:', error,)
		}
	}

	/**
		* CR - 138
		* SOCKET - 006
		* Handles the `PORTFOLIO_ACTION` application event.
		* @remarks
		* This async event handler performs the following steps:
		* 1. Triggers restoration of the portfolio list cache via a background worker.
		* 2. Emits a `portfolio.action` event to all connected WebSocket clients to notify them about the portfolio action.
		* This ensures client-side state stays in sync after a new portfolio is created/edited/deleted.
		* Errors during processing are caught and logged without interrupting the application flow.
	*/
	@OnEvent(eventNames.PORTFOLIO_ACTION, { async: true, },)
	private async handlePortfolioDeletion(data: TPortfolioDeletion,): Promise<void> {
		try {
			await this.redisCacheService.setMutatingId('portfolios', data.portfolioId,)
			await	this.cacheWorkerService.runRestoreCache()
			this.server.emit('totals-update', {
				success: true,
				message: 'Totals updated!',
			},)
		} catch (error) {
			this.logger.error('[HandleTotalsUpdateEvent] Error:', error,)
		}
	}

	/**
		* CR - 138
		* SOCKET - 007
		* Handles the `ASSET_ACTION` application event.
		* @remarks
		* This async event handler performs the following steps sequentially:
		* 1. Triggers restoration of the asset cache for the created asset via a background worker.
		* 2. Emits an `asset-created` event via WebSocket to notify all connected clients, including event data.
		* 3. If a portfolio ID is provided, triggers restoration of the specific portfolio cache.
		* Errors during processing are caught and logged without disrupting application execution.
	*/
	@OnEvent(eventNames.ASSET_ACTION, { async: true, },)
	private async handleAssetCreation(data: TAssetActionEvent,): Promise<void> {
		try {
			this.server.emit('asset-mutating', {
				success: true,
				message: 'Asset is mutating!',
				data,
			},)
			if (data.assetId) {
				await this.redisCacheService.setMutatingId('assets', data.assetId,)
				if (data.asset) {
					await this.redisCacheService.setCreating('assetsCreating', data.assetId, data.asset,)
				}
			}
			await	this.cacheWorkerService.handleAssetCreationEvent(data.assetName, data.portfolioId,)
			this.server.emit('asset-action', {
				success: true,
				message: 'Asset action!',
				data,
			},)
			this.server.emit('totals-update', {
				success: true,
				message: 'Totals updated!',
			},)
			await this.cacheWorkerService.runRestoreClientAssetCache(data.assetName, data.clientId,)
		} catch (error) {
			this.logger.error('[HandleAssetCreationEvent] Error:', error,)
		} finally {
			if (data.assetId) {
				await Promise.allSettled([
					this.redisCacheService.removeMutatingId('assets', data.assetId,),
					this.redisCacheService.delCreating('assetsCreating', data.assetId,),
				],)
			}
		}
	}

	/**
		* CR - 138
		* SOCKET - 008
		* Handles the `TRANSACTION_ACTION` application event.
		* @remarks
		* This async event handler performs the following actions:
		* 1. Triggers portfolio cache restoration via a background worker, using the provided portfolio ID.
		* 2. Broadcasts a `transaction-action` WebSocket event to all connected clients, including the event payload.
		* 3. Any errors encountered during execution are logged without interrupting application flow.
	*/
	@OnEvent(eventNames.TRANSACTION_ACTION,  { async: true, },)
	private async handleTransactionCreation(data: TTransactionActionEvent,): Promise<void> {
		try {
			await this.cacheWorkerService.handleTransactionCreationEvent(data.portfolioId,AssetNamesType.CASH,)
			this.server.emit('transaction-action', {
				success: true,
				message: 'Transaction action!',
				data,
			},)
			this.server.emit('totals-update', {
				success: true,
				message: 'Totals updated!',
			},)
			await this.cacheWorkerService.runRestoreClientAssetCache(AssetNamesType.CASH, data.clientId,)
		} catch (error) {
			this.logger.error('[HandleAssetCreationEvent] Error:', error,)
		}
	}

	/**
		* CR - 138
		* SOCKET - 009
		* Handles the `ASSET_TRANSFER` application event.
		* @remarks
		* This async event handler performs the following actions:
		* 1. Restores cache for both the old and new portfolios using their respective IDs.
		* 2. Restores cache for the transferred asset by asset name.
		* 3. Broadcasts an `asset-transfer` WebSocket event to all connected clients, including the event payload.
		* 4. Any errors encountered during execution are logged without interrupting application flow.
	*/
	@OnEvent(eventNames.ASSET_TRANSFER,  { async: true, },)
	private async handleAssetTransfer(data: TAssetTransferEvent,): Promise<void> {
		try {
			await this.cacheWorkerService.runRestoreAssetCache(data.assetName,)
			this.server.emit('asset-transfer', {
				success: true,
				message: 'Asset transfered!',
				data,
			},)
			await this.cacheWorkerService.runRestoreCache()
			this.server.emit('totals-update', {
				success: true,
				message: 'Totals updated!',
			},)
			await this.cacheWorkerService.runRestorePortfolioCache(data.oldPortfolioId,)
			await this.cacheWorkerService.runRestorePortfolioCache(data.newPortfolioId,)
			await this.cacheWorkerService.runRestoreClientAssetCache(data.assetName, data.clientId,)
		} catch (error) {
			this.logger.error('[HandleAssetCreationEvent] Error:', error,)
		}
	}

	/**
	 * CR - 138
	 * SOCKET - 010
	 * Handles the `CLIENT_DELETED` application event.
	 * @remarks
	 * This async event handler performs the following actions:
	 * 1. Restores the client list cache along with associated portfolios using `runRestoreClientListWithPortfoliosCache`.
	 * 2. Broadcasts a `client-deleted` WebSocket event to all connected clients, confirming the deletion.
	 * 3. Any errors during execution are caught and logged without disrupting application flow.
	 * @private
	 */
	@OnEvent(eventNames.CLIENT_LIST_UPDATED, { async: true, },)
	private async handleClientListUpdate(): Promise<void> {
		try {
			await this.cacheWorkerService.handleClientListUpdateEvent()
			this.server.emit('totals-update', {
				success: true,
				message: 'Totals updated!',
			},)
		} catch (error) {
			this.logger.error('[HandleClientListUpdateEvent] Error:', error,)
		}
	}

	/**
		* CR - 138
		* SOCKET - 011
		* Handles the `BUDGET_LIST_UPDATED` application event.
		* @remarks
		* This async event handler performs the following actions:
		* 1. Emits a `budget-mutating` WebSocket event to notify clients that a budget-related change is in progress.
		* 2. Triggers restoration of the client list cache via `runRestoreClientListCache`, ensuring up-to-date data.
		* 3. Emits a `budget-list-updated` WebSocket event after cache restoration to confirm update completion.
		* 4. Any errors during the process are caught and logged without affecting the app's stability.
		* @private
	*/
	@OnEvent(eventNames.BUDGET_LIST_UPDATED, { async: true, },)
	private async handleBudgetListUpdate(
		data: { budgetId?: string; budget?: BudgetPlan },
	): Promise<void> {
		try {
			this.server.emit('budget-mutating', {
				success: true,
				message: 'Budget is mutating!',
				data,
			},)
			if (data.budgetId) {
				await this.redisCacheService.setMutatingId('budgets', data.budgetId,)
				if (data.budget) {
					await this.redisCacheService.setCreating('budgetsCreating', data.budgetId, data.budget,)
				}
			}
			await this.cacheWorkerService.runRestoreBudgetListCache()
			this.server.emit('budget-list-updated', {
				success: true,
				message: 'Budget list updated!',
				data,
			},)
		} catch (error) {
			this.logger.error('[HandleBudgetListUpdateEvent] Error:', error,)
		} finally {
			if (data.budgetId) {
				await Promise.allSettled([
					this.redisCacheService.removeMutatingId('budgets', data.budgetId,),
					data.budget ?
						this.redisCacheService.delCreating('budgetsCreating', data.budgetId,) :
						Promise.resolve(),
				],)
			}
		}
	}

	/**
		* CR - 142
		* SOCKET - 012
		* Handles the `CLIENTS_TOTALS_UPDATE` application event.
		* @remarks
		* This async event handler performs the following actions:
		* 1. Triggers recalculation and cache update of all client totals and their portfolio totals
		*    by invoking `updateAllClientsTotals` after CBonds API data refresh.
		* 2. Ensures that aggregated financial metrics remain accurate and up to date for analytics and reporting.
		* 3. Catches and logs any errors that occur during the totals update, preventing disruption of the event flow.
		* @private
	*/
	@OnEvent(eventNames.CLIENTS_TOTALS_UPDATE,  { async: true, },)
	private async handleClientsTotalsUpdate(): Promise<void> {
		try {
			await this.cacheWorkerService.updateAllClientsTotals()
		} catch (error) {
			this.logger.error('[HandleClientsTotalsUpdate] Error:' , error, eventNames.CLIENTS_CACHE_UPDATE,)
		}
	}

	// Client portal
	/**
	 * CR - 138
	 * SOCKET - 013
	 * Handles the `CLIENTS_CACHE_UPDATE` application event.
	 * @remarks
	 * This async event handler performs the following actions:
	 * 1. Triggers a full update of all client-related analytics cache by invoking `runClientsCacheUpdate`.
	 * 2. Logs the start and end of the cache update process for debugging and monitoring purposes.
	 * 3. Any errors that occur during the update are caught and logged, ensuring the application remains stable.
	 * @private
	 */
	@OnEvent(eventNames.CLIENTS_CACHE_UPDATE,  { async: true, },)
	private async handleClientsCacheUpdate(): Promise<void> {
		try {
			await this.cacheWorkerService.runClientsCacheUpdate()
		} catch (error) {
			this.logger.error('[HandleAssetCreationEvent] Error:' , error, eventNames.CLIENTS_CACHE_UPDATE,)
		}
	}

	/**
	 	* TASK - 10.4
 		* SOCKET - 014
 		* Emits a `binance-update` event to all connected WebSocket clients.
 		* @remarks
 		* This method is triggered when the `BINANCE_DATA_UPDATED` application event is fired.
 		* Used to invalidate queries Crypto data has been updated.
 	*/
	@OnEvent(eventNames.BINANCE_DATA_UPDATED, { async: true, },)
	private async handleBinanceDataUpdate(): Promise<void> {
		try {
			await this.cacheWorkerService.handleBinanceUpdate()
			this.server.emit('cbonds-update', {
				success: true,
				message: 'CBonds updated!',
			},)
		} catch (error) {
			this.logger.error('[HandleBinanceDataUpdate] Error:', error,)
		}
	}
}