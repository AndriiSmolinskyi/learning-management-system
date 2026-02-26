/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
import {
	Injectable,
	Logger,
} from '@nestjs/common'
import {
	Cron,
	CronExpression,
} from '@nestjs/schedule'
import { CBondsApiService, } from '../../apis/cbonds-api/services'
import { AssetService, } from '../../asset/asset.service'
import { CBondsEmissionsService, } from '../../apis/cbonds-api/services'
import { CBondsEquityStocksService, } from '../../apis/cbonds-api/services'
import { TransactionService, } from '../../transaction/services/transaction.service'
import { cronjobOperations, cronjobsErrors, cronjobsMessages, } from './cron-jobs.constants'
import { EventEmitter2, } from '@nestjs/event-emitter'
import { isMainThread, } from 'worker_threads'
import { TTL_CACHE_TIME, MINUTE_CACHE_TIME, } from '../../redis-cache'
import { DbMigrationService, } from '../db-migration/db-migration.service'
import { ComputationsService, } from '../computations/computations.service'
import { RedisCacheService, } from '../../../modules/redis-cache/redis-cache.service'
import { eventNames, } from '../websockets/events.constants'
import { cacheKeysToDeleteAsset, } from '../../../modules/asset/asset.constants'
import { BinanceService, } from '../../apis/cbonds-api/services/binance-api.service'

@Injectable()
export class CronJobsService {
	private readonly redlockContext = 'cronjobservice'

	constructor(
		private readonly cBondsApiService: CBondsApiService,
		private readonly assetService: AssetService,
		private readonly transactionService: TransactionService,
		private readonly cBondsEmissionsService: CBondsEmissionsService,
		private readonly cBondsEquityStocksService: CBondsEquityStocksService,
		private readonly logger: Logger = new Logger(CronJobsService.name,),
		private readonly eventEmitter: EventEmitter2,
		private readonly cacheService: RedisCacheService,
		private readonly computationsService: ComputationsService,
		private readonly dbMigrationService: DbMigrationService,
		private readonly binanceService: BinanceService,
	) {}

	/**
	* CR - 114 / 138
	* * Scheduled every two minutes.
	* Cron task that update totals through the app.
	*/
	@Cron('*/5 * * * *',)
	public async updateTotals(): Promise<void> {
		if (!isMainThread) {
			return
		}
		this.eventEmitter.emit(eventNames.TOTALS_UPDATED,)
	}

	/**
 		* Scheduled job that runs every day at 2:00 AM.
 		* @remarks
 		* - Triggers asset maturity processing to convert matured cash deposits into cash and create related transactions.
 	*/
	@Cron(CronExpression.EVERY_DAY_AT_2AM,)
	public async depositMaturityAutomation(): Promise<void> {
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.depositMaturityAutomation,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    MINUTE_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.assetService.depositMaturityAutomation()
		// 			await this.cacheService.deleteByUrl([
		// 				...cacheKeysToDeleteAsset.deposit,
		// 				...cacheKeysToDeleteAsset.portfolio,
		// 				...cacheKeysToDeleteAsset.client,
		// 			],)
		// 			this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
		// 			this.logger.log(cronjobsMessages.depositAutomationSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.depositMaturityAutomationError, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.assetService.depositMaturityAutomation()
			await this.cacheService.deleteByUrl([
				...cacheKeysToDeleteAsset.deposit,
				...cacheKeysToDeleteAsset.portfolio,
				...cacheKeysToDeleteAsset.client,
			],)
			this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
			this.logger.log(cronjobsMessages.depositAutomationSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.depositMaturityAutomationError, error.message,)
		}
	}

	/**
 	* Scheduled job that runs every day at 9 AM.
 	* @remarks
 	* - Fetches and updates metal rates from the CBonds API.
 	*/
	@Cron(CronExpression.EVERY_DAY_AT_9AM, {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleGetMetalDataNineAM(): Promise<void> {
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleGetMetalDataNineAM,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.cBondsApiService.getMetalRates()
		// 			this.logger.log(cronjobsMessages.metalsNineAmSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.metalRateUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.cBondsApiService.getMetalRates()
			this.logger.log(cronjobsMessages.metalsNineAmSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.metalRateUpdate, error.message,)
		}
	}

	/**
 	* Scheduled job that runs every day at 12:00 PM (noon).
 	* @remarks
 	* - Fetches and updates metal rates from the CBonds API.
 	*/
	@Cron(CronExpression.EVERY_DAY_AT_NOON, {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleGetMetalDataNoon(): Promise<void> {
		if (!isMainThread) {
			return
		}
		if (process.env.NODE_ENV !== 'production') {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleGetMetalDataNoon,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.cBondsApiService.getMetalRates()
		// 			this.logger.log(cronjobsMessages.metalsNoonSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.metalRateUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.cBondsApiService.getMetalRates()
			this.logger.log(cronjobsMessages.metalsNoonSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.metalRateUpdate, error.message,)
		}
	}

	/**
 	* Scheduled job that runs every day at 6 PM.
 	* @remarks
 	* - Fetches and updates metal rates from the CBonds API.
 	* - Duplicates the noon job to ensure consistent data.
 	*/
	@Cron(CronExpression.EVERY_DAY_AT_6PM, {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleGetMetalDataSixPM(): Promise<void> {
		if (process.env.NODE_ENV !== 'production') {
			return
		}
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleGetMetalDataSixPM,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.cBondsApiService.getMetalRates()
		// 			this.logger.log(cronjobsMessages.metalsSixPmSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.metalRateUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.cBondsApiService.getMetalRates()
			this.logger.log(cronjobsMessages.metalsSixPmSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.metalRateUpdate, error.message,)
		}
	}

	/**
 	* Scheduled job that runs every day at 9 AM.
 	* @remarks
 	* - Fetches and updates currency rates from the CBonds API.
 	*/
	@Cron(CronExpression.EVERY_DAY_AT_9AM, {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleGetCurrencyDataNineAM(): Promise<void> {
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleGetCurrencyDataNineAM,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.cBondsApiService.getCurrencyRates()
		// 			this.logger.log(cronjobsMessages.currenciesNineAmSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.currencyRateUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.cBondsApiService.getCurrencyRates()
			this.logger.log(cronjobsMessages.currenciesNineAmSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.currencyRateUpdate, error.message,)
		}
	}

	/**
 	* Scheduled job that runs every day at 12:00 PM (noon).
 	* @remarks
 	* - Fetches and updates currency rates from the CBonds API.
 	*/
	@Cron(CronExpression.EVERY_DAY_AT_NOON, {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleGetCurrencyDataNoon(): Promise<void> {
		if (process.env.NODE_ENV !== 'production') {
			return
		}
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleGetCurrencyDataNoon,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.cBondsApiService.getCurrencyRates()
		// 			this.logger.log(cronjobsMessages.currenciesNoonSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.currencyRateUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.cBondsApiService.getCurrencyRates()
			this.logger.log(cronjobsMessages.currenciesNoonSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.currencyRateUpdate, error.message,)
		}
	}

	/**
 	* Scheduled job that runs every day at 6 PM.
 	* @remarks
 	* - Fetches and updates currency rates from the CBonds API.
 	* - Duplicates the noon job to ensure consistent data.
 	*/
	@Cron(CronExpression.EVERY_DAY_AT_6PM, {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleGetCurrencyDataSixPM(): Promise<void> {
		if (process.env.NODE_ENV !== 'production') {
			return
		}
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleGetCurrencyDataSixPM,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.cBondsApiService.getCurrencyRates()
		// 			this.logger.log(cronjobsMessages.currenciesSixPmSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.currencyRateUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.cBondsApiService.getCurrencyRates()
			this.logger.log(cronjobsMessages.currenciesSixPmSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.currencyRateUpdate, error.message,)
		}
	}

	/**
		* Scheduled job that runs every day at 8 AM.
		* @remarks
		* - Checks if running in the main thread before execution.
		* - Triggers the update process for emitents data via the CBonds API service.
		* - Ensures the latest emitents information is processed and stored accordingly.
	*/
	@Cron(CronExpression.EVERY_DAY_AT_8AM, {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleEmitentsUpdate(): Promise<void> {
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleEmitentsUpdate,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.cBondsApiService.handleEmitentsUpdate()
		// 			this.logger.log(cronjobsMessages.emitentsSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.cbondsEmitentsUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.cBondsApiService.handleEmitentsUpdate()
			this.logger.log(cronjobsMessages.emitentsSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.cbondsEmitentsUpdate, error.message,)
		}
	}

	/**
	 * Scheduled job that runs every day at 9 AM.
	 * @remarks
	 * - Triggers the data fetching and aggregation process from the CBonds API.
	 * - Saves the latest combined data into the CBonds table.
	 */
	@Cron(CronExpression.EVERY_DAY_AT_9AM, {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleGetCBondsDataNineAm(): Promise<void> {
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleGetCBondsDataNineAm,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.cBondsApiService.processCBondsExtensionData()
		// 			await this.cacheService.clear()
		// 			this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
		// 			this.logger.log(cronjobsMessages.cbondsNineAmSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.cBondsDataUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.cBondsApiService.processCBondsExtensionData()
			await this.cacheService.clear()
			this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
			this.logger.log(cronjobsMessages.cbondsNineAmSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.cBondsDataUpdate, error.message,)
		}
	}

	/**
	 * Scheduled job that runs every day at 12 PM.
	 * @remarks
	 * - Triggers the data fetching and aggregation process from the CBonds API.
	 * - Saves the latest combined data into the CBonds table.
	 */
	@Cron(CronExpression.EVERY_DAY_AT_NOON, {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleGetCBondsDataNoon(): Promise<void> {
		if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
			return
		}
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleGetCBondsDataNoon,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.cBondsApiService.processCBondsExtensionData()
		// 			await this.cacheService.clear()
		// 			this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
		// 			this.logger.log(cronjobsMessages.cbondsNoonSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.cBondsDataUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.cBondsApiService.processCBondsExtensionData()
			await this.cacheService.clear()
			this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
			this.logger.log(cronjobsMessages.cbondsNoonSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.cBondsDataUpdate, error.message,)
		}
	}

	/**
	 * Scheduled job that runs every day at 6 PM.
	 * @remarks
	 * - Triggers the data fetching and aggregation process from the CBonds API.
	 * - Saves the latest combined data into the CBonds table.
	 */
	@Cron(CronExpression.EVERY_DAY_AT_6PM, {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleGetCBondsDataSixPM(): Promise<void> {
		if (process.env.NODE_ENV !== 'production') {
			return
		}
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleGetCBondsDataSixPM,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.cBondsApiService.processCBondsExtensionData()
		// 			await this.cacheService.clear()
		// 			this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
		// 			this.logger.log(cronjobsMessages.cbondsSixPmSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.cBondsDataUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.cBondsApiService.processCBondsExtensionData()
			await this.cacheService.clear()
			this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
			this.logger.log(cronjobsMessages.cbondsSixPmSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.cBondsDataUpdate, error.message,)
		}
	}

	/**
 		* CR - 121
 		* Scheduled job that runs daily at 1 PM.
 		*
 		* @remarks
 		* - Checks transactions with future dates (`isFutureDated = true`).
 		* - If the transaction date has arrived, updates the currency rate and clears the flag.
 	*/
	@Cron(CronExpression.EVERY_DAY_AT_9PM,)
	public async handleTransactionFutureDateRateUpdate(): Promise<void> {
		if (!isMainThread) {
			return
		}
		// const lockKey = this.cacheService.buildLockKey({
		// 	context:   this.redlockContext,
		// 	operation: cronjobOperations.handleTransactionFutureDateRateUpdate,
		// },)
		// await this.cacheService.runWithLock({
		// 	lockKey,
		// 	ttlMs:    TTL_CACHE_TIME,
		// 	callback: async() => {
		// 		try {
		// 			await this.transactionService.transactionFutureDateRateUpdate()
		// 			await this.cacheService.clear()
		// 			this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
		// 			this.logger.log(cronjobsMessages.transactionsRateSuccess,)
		// 		} catch (error) {
		// 			this.logger.error(cronjobsErrors.transactionsFutureRateUpdate, error.message,)
		// 		}
		// 	},
		// },)
		try {
			await this.transactionService.transactionFutureDateRateUpdate()
			await this.cacheService.clear()
			this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
			this.logger.log(cronjobsMessages.transactionsRateSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.transactionsFutureRateUpdate, error.message,)
		}
	}

	/**
 		* Task - 10.4
 		* Scheduled job that runs every hour.
 		* @remarks
 		* - Crypto update from Binance API.
 		* - Crypto assets computation triggered with updated crypto rate values.
 	*/
	@Cron(CronExpression.EVERY_HOUR,)
	public async handleCryptoDataUpdate(): Promise<void> {
		if (!isMainThread) {
			return
		}
		try {
			await this.binanceService.getSpotPrices()
			this.eventEmitter.emit(eventNames.BINANCE_DATA_UPDATED,)
			this.logger.log(cronjobsMessages.binanceUpdateSuccessSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.binanceUpdate, error.message,)
		}
	}

	/**
 		* Task - 10.4
 		* Scheduled job that runs once per day at 12:05.
 		* @remarks
 		* - Saves daily snapshot of crypto exchange rates to history storage.
 		* - Uses already updated spot prices to avoid redundant external API calls.
 		* - Intended for historical analytics, reporting, and charting purposes.
 		* - Executed only in the main thread to prevent duplicate history records.
 	*/
	@Cron('30 17 * * *', {
		timeZone: 'Europe/Nicosia',
	},)
	public async handleDailyCryptoHistorySnapshot(): Promise<void> {
		if (!isMainThread) {
			return
		}
		try {
			await this.binanceService.handleDailyCryptoHistorySnapshot()
			this.logger.log(cronjobsMessages.cryptoHistorySnapshotSuccess,)
		} catch (error) {
			this.logger.error(cronjobsErrors.cryptoHistorySnapshot, error.message,)
		}
	}

	/**
 		* ⚠ Use with caution in production — ensure proper filtering to exclude
		* unnecessary or duplicate ISINs before execution to avoid excessive load
		* on the database and redundant data in the results.
 	*/
	// @Cron('42 13 * * *',)
	public async dbRefactorInteracts(): Promise<void> {
		if (!isMainThread) {
			return
		}
		if (process.env.NODE_ENV !== 'development') {
			return
		}
		try {
			// CR-167 - Asset refactor
			// await this.assetService.bondAssetRefactoredHandle()
			// await this.assetService.equityAssetRefactoredHandle()
			// await this.assetService.depositAssetRefactoredHandle()
			// await this.assetService.cryptoAssetRefactoredHandle()
			// await this.assetService.metalAssetRefactoredHandle()
			// await this.assetService.optionAssetRefactoredHandle()
			// await this.assetService.realEstateAssetRefactoredHandle()
			// await this.assetService.otherInvestmentsAssetRefactoredHandle()
			// await this.assetService.privateEquityAssetRefactoredHandle()
			// await this.assetService.cashAssetRefactoredHandle()
			// await this.computationsService.updateAllClientsTotals()

			// this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
			// this.eventEmitter.emit(eventNames.BINANCE_DATA_UPDATED,)
			// this.eventEmitter.emit(eventNames.TOTALS_UPDATED,)

			// await this.dbMigrationService.clientsMigration()
			// await this.dbMigrationService.portfoliosMigration()
			// await this.dbMigrationService.entitiesMigration()
			// await this.dbMigrationService.banksMigration()
			// await this.dbMigrationService.accountsMigration()
			// await this.dbMigrationService.depositAssetMigration()
			// await this.dbMigrationService.metalAssetMigration()
			// await this.dbMigrationService.bondAssetMigration()
			// await this.dbMigrationService.equityAssetMigration()
			// await this.dbMigrationService.optionsAssetMigration()
			// await this.dbMigrationService.peAssetMigration()
			// await this.dbMigrationService.migrateCashAssetFromTransaction()
			// await this.dbMigrationService.transactionsFromStockToEquity()

			// await this.dbMigrationService.transactionMigration()
			// await this.transactionService.encryptionServicesCheck()
			// await this.dbMigrationService.setNAProviderForEmptyTransactions()

			// await this.dbMigrationService.migrateMissingEquityFromTransaction()
			// await this.dbMigrationService.migrateMissingBondsFromTransaction()

			// this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)
			// this.eventEmitter.emit(eventNames.CLIENTS_TOTALS_UPDATE,)
			// await this.cBondsApiService.absentIsinsMigration()
			// await this.cBondsApiService.unnecessaryIsinsFilter()

			// await this.cBondsApiService.processCBondsExtensionData()

			// await this.cBondsApiService.historyMigrationForTrhirdDB()
			// await this.cBondsApiService.historyMigrationForMainDB()
			// await this.assetService.migrateLegacyTransactionTypesToVersions()
			// await this.assetService.applyTransactionTypeRelations()
			// await this.assetService.applyAnnualAssetsFromIncomeUsdFilter()

			// await this.cBondsApiService.bondsHistoryStoringMainDbFromExcel()
			// await this.cBondsApiService.equitiesHistoryStoringMainDbFromExcel()
			// await this.cBondsApiService.etfsHistoryStoringMainDbFromExcel()

			// await this.cBondsApiService.bondsHistoryStoringFromExcel()
			// await this.cBondsApiService.equitiesHistoryStoringFromExcel()
			// await this.cBondsApiService.etfsHistoryStoringFromExcel()

			// await this.cBondsApiService.removeUnnecessaryHistory()
		} catch (error) {
			this.logger.error(cronjobsErrors.cBondsDataUpdate, error.message,)
		}
	}

	/**
	* CR - 114 / 138
	* * Scheduled every two minutes.
	* Cron task that update totals through the app.
	*/
	// todo: Remove if refactor approved
	// @Cron('*/5 * * * *',)
	// public async updateTotals(): Promise<void> {
	// 	if (!isMainThread) {
	// 		return
	// 	}
	// 	if (process.env.NODE_ENV !== 'production') {
	// 		return
	// 	}
	// 	const lockKey = this.cacheService.buildLockKey({
	// 		context:   this.redlockContext,
	// 		operation: cronjobOperations.updateTotals,
	// 	},)
	// 	await this.cacheService.runWithLock({
	// 		lockKey,
	// 		ttlMs:    MINUTE_CACHE_TIME,
	// 		callback: async() => {
	// 			this.eventEmitter.emit(eventNames.TOTALS_UPDATED,)
	// 		},
	// 	},)
	// }

	/**
	 * CR - 144 / 138
	 * * Scheduled daily at 5AM.
	 * Cron task that emits the `CLIENTS_CACHE_UPDATE` event to update client-related analytics cache across the app.
	 */
	// todo: Remove if refactor approved
	// @Cron(CronExpression.EVERY_DAY_AT_5AM, {
	// 	timeZone: 'Europe/Nicosia',
	// },)
	// public async clientsPortalCacheUpdate(): Promise<void> {
	// 	if (!isMainThread) {
	// 		return
	// 	}
	// 	const lockKey = this.cacheService.buildLockKey({
	// 		context:   this.redlockContext,
	// 		operation: cronjobOperations.clientsPortalCacheUpdate,
	// 	},)
	// 	await this.cacheService.runWithLock({
	// 		lockKey,
	// 		ttlMs:    TTL_CACHE_TIME,
	// 		callback: async() => {
	// 			this.eventEmitter.emit(eventNames.CLIENTS_CACHE_UPDATE,)
	// 		},
	// 	},)
	// }

	/**
	* CR - 030
	* * Scheduled daily at midnight.
	* Cron task that deactivates ISINs with zero net units (buy - sell = 0).
	*/
	// todo: Needs clarification if needed
	// @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT,)
	// public async checkEquityIsinsUnits(): Promise<void> {
	// 	if (!isMainThread) {
	// 		return
	// 	}
	// 	const lockKey = this.cacheService.buildLockKey({
	// 		context:   this.redlockContext,
	// 		operation: cronjobOperations.checkEquityIsinsUnits,
	// 	},)
	// 	await this.cacheService.runWithLock({
	// 		lockKey,
	// 		ttlMs:    TTL_CACHE_TIME,
	// 		callback: async() => {
	// 			try {
	// 				await this.cBondsEquityStocksService.checkEquityIsinsUnits()
	// 				this.logger.log(cronjobsMessages.checkEquityIsinsSuccess,)
	// 			} catch (error) {
	// 				this.logger.error(cronjobsErrors.equityUnitsCheck, error.message,)
	// 			}
	// 		},
	// 	},)
	// }

	/**
	* CR - 030
	* Scheduled daily at midnight.
	* Deactivates bond ISINs whose emissions have already matured.
	*/
	// todo: Needs clarification if needed
	// @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT,)
	// public async checkBondIsinsUnits(): Promise<void> {
	// 	if (!isMainThread) {
	// 		return
	// 	}
	// 	const lockKey = this.cacheService.buildLockKey({
	// 		context:   this.redlockContext,
	// 		operation: cronjobOperations.checkBondIsinsUnits,
	// 	},)
	// 	await this.cacheService.runWithLock({
	// 		lockKey,
	// 		ttlMs:    TTL_CACHE_TIME,
	// 		callback: async() => {
	// 			try {
	// 				await this.cBondsEmissionsService.checkBondIsinsUnits()
	// 				this.logger.log(cronjobsMessages.checkBondsIsinsSuccess,)
	// 			} catch (error) {
	// 				this.logger.error(cronjobsErrors.bondUnitsCheck,error.message,)
	// 			}
	// 		},
	// 	},)
	// }

	/**
 		* CR - 121
 		* Scheduled job that runs daily at 1 PM.
 		*
 		* @remarks
 		* - Checks assets with future dates (`isFutureDated = true`).
 		* - If the asset date has arrived, updates the currency rate and clears the flag.
 	*/
	// todo: Needs clarification if needed
	// @Cron(CronExpression.EVERY_DAY_AT_1PM,)
	// public async handleAssetFutureDateRateUpdate(): Promise<void> {
	// 	if (!isMainThread) {
	// 		return
	// 	}
	// 	const lockKey = this.cacheService.buildLockKey({
	// 		context:   this.redlockContext,
	// 		operation: cronjobOperations.handleAssetFutureDateRateUpdate,
	// 	},)
	// 	await this.cacheService.runWithLock({
	// 		lockKey,
	// 		ttlMs:    TTL_CACHE_TIME,
	// 		callback: async() => {
	// 			try {
	// 				await this.assetService.assetFutureDateRateUpdate()
	// 				this.logger.log(cronjobsMessages.assetsRateSuccess,)
	// 			} catch (error) {
	// 				this.logger.error(cronjobsErrors.assetsFutureRateUpdate, error.message,)
	// 			}
	// 		},
	// 	},)
	// }
}