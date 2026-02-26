/* eslint-disable no-unused-vars */
/* eslint-disable complexity */
/* eslint-disable max-lines */
import type { OnModuleInit,} from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { Injectable, Logger, } from '@nestjs/common'
import type { ParsedQs, } from 'qs'

import { RedisCacheService, } from '../../redis-cache/redis-cache.service'
import { PortfolioService, } from '../../portfolio/services'
import { PortfolioRoutes, } from '../../portfolio/portfolio.constants'
import { OverviewService, } from '../../analytics/services'
import { AnalyticsRoutes, } from '../../analytics/analytics.constants'
import { ClientService, } from '../../client/services/client.service'
import { ClientRoutes, } from '../../client/client.constants'
import type { TAssetExtended,} from '../../asset/asset.types'
import { AssetNamesType, } from '../../asset/asset.types'
import {
	BondAssetService,
	EquityAssetService,
	CashService,
	CryptoAssetService,
	DepositService,
	LoanAssetService,
	MetalsService,
	OptionsService,
	OtherInvestmentsService,
	PrivateEquityAssetService,
	RealEstateService,
} from '../../analytics/services'
import {
	equityFilter,
	bondFilter,
	cashFilters,
	cryptoFilter,
	cryptoCurrencyFilter,
	depositFilter,
	depositCurrencyFilter,
	loanFilter,
	loanCurrencyFilter,
	metalCurrencyFilter,
	metalFilter,
	optionsFilter,
	otherFilter,
	otherCurrencyFilter,
	privateFilter,
	privateCurrencyFilter,
	realEstateFilter,
	getPortfoliosFilter,
	getClientsFilter,
} from './cache-sync.constants'
import { BudgetService, } from '../../../modules/budget/services'
import { BudgetRoutes, } from '../../../modules/budget/budget.constants'
import { CBondsCurrencyService, } from '../../../modules/apis/cbonds-api/services'
import type { IPortfolioDetailedThirdPartyListCBondsParted, IPortfoliosThirdPartyListCBondsParted, } from '../../../modules/portfolio/portfolio.types'
import type {
	IInitialThirdPartyListCbondsParted,
	TOverviewInitials,
	TBondInitials,
	TClientListCache,
	TAssetsGenerate,
	TEquityInitials,
	TCacheInitials,
	TCryptoInitials,
	TAssetCacheInitials,
	TMetalAssetCache,
	THandleTransactionCreationEvent,
	TPortfolioCacheUpdate,
	TAssetCacheUpdate,
	THandleAssetCreationEvent,
	TOtherAssetCacheInitials,
} from './cache-sync.types'
import type { UnionAssetType,} from '../../../shared/utils'
import { assetParser, } from '../../../shared/utils'
import { isMainThread, } from 'worker_threads'
import type { TSyncGetBudgets, } from '../../budget/budget.types'
import { ClientRepository, } from '../../../repositories/client/client.repository'
import { ComputationsService, } from '../computations/computations.service'

@Injectable()
export class CacheUpdateService implements OnModuleInit {
// export class CacheUpdateService {
	public readonly logger = new Logger(CacheUpdateService.name,)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly cacheService: RedisCacheService,
		private readonly portfolioService: PortfolioService,
		private readonly overviewService: OverviewService,
		private readonly clientService: ClientService,
		private readonly bondAssetService: BondAssetService,
		private readonly equityAssetService: EquityAssetService,
		private readonly cashService: CashService,
		private readonly cryptoAssetService: CryptoAssetService,
		private readonly depositService: DepositService,
		private readonly loanAssetService: LoanAssetService,
		private readonly metalsService: MetalsService,
		private readonly optionsService: OptionsService,
		private readonly otherInvestmentsService: OtherInvestmentsService,
		private readonly privateEquityAssetService: PrivateEquityAssetService,
		private readonly realEstateService: RealEstateService,
		private readonly budgetService: BudgetService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly clientRepository: ClientRepository,
		private readonly computationsService: ComputationsService,
	) {}

	/**
	   * CR-114/138
 		* Triggered automatically when the module is initialized.
 		* Executes cache warm-up for the analytics/portfolio/client endpoints to reduce latency on first access.
 	*/
	public async onModuleInit(): Promise<void> {
		if (process.env.NODE_ENV === 'development') {
			return
		}
		try {
			if (!isMainThread) {
				return
			}
			// await Promise.all([
			// 	this.routesWithTotalsCacheUpdate(),
			// 	this.routesForClientsUpdate(),
			// ],)
			await this.computationsService.updateAllComputations()
		} catch (error) {
			this.logger.error(error,)
		}
	}

	/**
	   * CR-114/138
		* Executes parallel cache warm-up for all analytics and portfolio/client endpoints.
		* This method is invoked during module initialization to reduce latency for the first requests.
		* Uses Promise.allSettled to ensure all update methods are attempted regardless of individual failures.
	*/
	public async routesWithTotalsCacheUpdate(): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('routesWithTotalsCacheUpdate', 'Start',)
			const data = await this.initialPreparedSourceDataCBondsParted()
			// eslint-disable-next-line no-unused-vars
			const {costHistoryCurrencyList,currencyList,cryptoList, bonds, equities, etfs, metalList, assets, transactions, equityIsins, clientsList, budgetPlans,} = data
			const parsedAssets = this.parseAndFilterAssets(assets,)
			const bondsAssets: Array<TAssetExtended> = []
			const equityAssets: Array<TAssetExtended> = []
			const cashAssets: Array<TAssetExtended> = []
			const cryptoAssets: Array<TAssetExtended> = []
			const depositAssets: Array<TAssetExtended> = []
			const loanAssets: Array<TAssetExtended> = []
			const metalAssets: Array<TAssetExtended> = []
			const optionAssets: Array<TAssetExtended> = []
			const otherAssets: Array<TAssetExtended> = []
			const peAssets: Array<TAssetExtended> = []
			const reAssets: Array<TAssetExtended> = []
			assets.forEach((asset,) => {
				switch (asset.assetName) {
				case AssetNamesType.BONDS:
					bondsAssets.push(asset,)
					break
				case AssetNamesType.EQUITY_ASSET:
					equityAssets.push(asset,)
					break
				case AssetNamesType.CASH:
					cashAssets.push(asset,)
					break
				case AssetNamesType.CRYPTO:
					cryptoAssets.push(asset,)
					break
				case AssetNamesType.CASH_DEPOSIT:
					depositAssets.push(asset,)
					break
				case AssetNamesType.LOAN:
					loanAssets.push(asset,)
					break
				case AssetNamesType.METALS:
					metalAssets.push(asset,)
					break
				case AssetNamesType.OPTIONS:
					optionAssets.push(asset,)
					break
				case AssetNamesType.OTHER:
					otherAssets.push(asset,)
					break
				case AssetNamesType.PRIVATE_EQUITY:
					peAssets.push(asset,)
					break
				case AssetNamesType.REAL_ESTATE:
					reAssets.push(asset,)
				default:
					break
				}
			},)
			// await this.syncUpdatePortfolioListCache({portfolios,drafts,currencyList,cryptoList, bonds, equities, etfs, metalList,},)
			// await this.updateClientListCache({clientsList,currencyList,cryptoList, bonds, equities, etfs, metalList,},)
			await this.generateBudgetList({budgetPlans,currencyList, assets, transactions, cryptoList, bonds, equities, etfs, metalList,},)
			await this.updateOverviewCache({transactions, cryptoList, bonds, equities, etfs, metalList, currencyList, assets: parsedAssets,},)
			await this.updateBondAnalytics({bonds, currencyList, assets: bondsAssets, costHistoryCurrencyList,},)
			await this.updateEquityAnalytics({equities, etfs, currencyList, equityIsins, assets: equityAssets,},)
			await this.updateCashAnalytics({currencyList, transactions, assets: cashAssets,},)
			await this.updateCryptoAnalytics({equities, etfs, cryptoList,currencyList, equityIsins, assets: cryptoAssets,},)
			await this.updateDepositAnalytics({currencyList, assets: depositAssets,},)
			await this.updateLoanAnalytics({currencyList, assets: loanAssets,},)
			await this.updateMetalAnalytics({equities, etfs, currencyList, equityIsins, metalList, assets: metalAssets,},)
			await this.updateOptionsAnalytics({currencyList, assets: optionAssets,},)
			await this.updateOtherAnalytics({currencyList, assets: otherAssets,costHistoryCurrencyList,},)
			await this.updatePEAnalytics({currencyList, assets: peAssets,},)
			await this.updateRealEstateAnalytics({currencyList, assets: reAssets,},)
			await this.initialPortfoliosDetailsUpdate({currencyList,cryptoList,bonds, equities, etfs,metalList, transactions,},)
			log('routesWithTotalsCacheUpdate', 'End',)
		} catch (error) {
			this.logger.error('[CacheSync]: RoutesWithTotalsCacheUpdate:', error,)
		}
	}

	/**
		* CR-114/138
		* Triggers a full analytics cache update for all clients.
		* @remarks
		* This async method performs the following actions:
		* 1. Retrieves all unique `clientId` values from the user database.
		* 2. Prepares and parses initial source data, including filtering by asset type.
		* 3. For each client, concurrently runs cache update functions for:
		*    - All supported asset types (bonds, equities, crypto, deposits, loans, etc.)
		*    - Overall overview analytics.
		* 4. Uses `Promise.all` to run updates in parallel per client, optimizing performance.
		* 5. Ensures isolation per client, so a failure for one does not block updates for others.
	*/
	public async routesForClientsUpdate(): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('routesForClientsUpdate', 'Start',)
			const users = await this.prismaService.user.findMany({
				select: {
					clientId: true,
				},
			},)
			const usersIds = users.map((user,) => {
				return user.clientId
			},)
			const [transactions, currencyList, cryptoList, bonds, equities, etfs, metalList, assets, equityIsins, costHistoryCurrencyList,] = await Promise.all([
				this.prismaService.transaction.findMany({
					where: {
						portfolio: {
							isActivated: true,
						},
					},
					select: {
						amount:    true,
						currency:  true,
						clientId:  true,
						bankId:    true,
						accountId: true,
					},
				},),
				this.cBondsCurrencyService.getAllCurrencies(),
				this.prismaService.cryptoData.findMany(),
				this.prismaService.bond.findMany(),
				this.prismaService.equity.findMany(),
				this.prismaService.etf.findMany(),
				this.cBondsCurrencyService.getAllMetalsWithHistory(),
				this.prismaService.asset.findMany({
					where: {
						isArchived: false,
						portfolio:  {
							is: {
								isActivated: true,
							},
						},
					},
					include: {
						portfolio: true,
						entity:    true,
						bank:      { include: { bankList: true, }, },
						account:   true,
					},
				},),
				this.prismaService.isins.findMany({
					where: {
						typeId: { in: ['2', '3',], },
					},
				},),
				this.prismaService.currencyHistoryData.findMany(),
			],)
			const parsedAssets = this.parseAndFilterAssets(assets,)

			const bondsAssets: Array<TAssetExtended> = []
			const equityAssets: Array<TAssetExtended> = []
			const cashAssets: Array<TAssetExtended> = []
			const cryptoAssets: Array<TAssetExtended> = []
			const depositAssets: Array<TAssetExtended> = []
			const loanAssets: Array<TAssetExtended> = []
			const metalAssets: Array<TAssetExtended> = []
			const optionAssets: Array<TAssetExtended> = []
			const otherAssets: Array<TAssetExtended> = []
			const peAssets: Array<TAssetExtended> = []
			const reAssets: Array<TAssetExtended> = []
			assets.forEach((asset,) => {
				switch (asset.assetName) {
				case AssetNamesType.BONDS:
					bondsAssets.push(asset,)
					break
				case AssetNamesType.EQUITY_ASSET:
					equityAssets.push(asset,)
					break
				case AssetNamesType.CASH:
					cashAssets.push(asset,)
					break
				case AssetNamesType.CRYPTO:
					cryptoAssets.push(asset,)
					break
				case AssetNamesType.CASH_DEPOSIT:
					depositAssets.push(asset,)
					break
				case AssetNamesType.LOAN:
					loanAssets.push(asset,)
					break
				case AssetNamesType.METALS:
					metalAssets.push(asset,)
					break
				case AssetNamesType.OPTIONS:
					optionAssets.push(asset,)
					break
				case AssetNamesType.OTHER:
					otherAssets.push(asset,)
					break
				case AssetNamesType.PRIVATE_EQUITY:
					peAssets.push(asset,)
					break
				case AssetNamesType.REAL_ESTATE:
					reAssets.push(asset,)
				default:
					break
				}
			},)
			await Promise.all(
				usersIds.map(async(clientId,) => {
					return Promise.all([
						this.updateBondAnalytics({ bonds, currencyList, assets: bondsAssets, costHistoryCurrencyList,}, clientId, true,),
						this.updateEquityAnalytics({currencyList, equities, etfs, equityIsins,  assets: equityAssets,}, clientId, true,),
						this.updateCashAnalytics({currencyList, transactions, assets: cashAssets,}, clientId, true,),
						this.updateCryptoAnalytics({currencyList, cryptoList, equities, etfs, equityIsins, assets: cryptoAssets,}, clientId, true,),
						this.updateDepositAnalytics({currencyList, assets: depositAssets,}, clientId, true,),
						this.updateLoanAnalytics({currencyList, assets: loanAssets,}, clientId, true,),
						this.updateMetalAnalytics({equities, etfs, currencyList, equityIsins, metalList, assets: metalAssets,}, clientId, true,),
						this.updateOptionsAnalytics({currencyList, assets: optionAssets,}, clientId, true,),
						this.updateOtherAnalytics({currencyList, assets: otherAssets, costHistoryCurrencyList,}, clientId, true,),
						this.updatePEAnalytics({currencyList, assets: peAssets,}, clientId, true,),
						this.updateRealEstateAnalytics({currencyList, assets: reAssets,}, clientId, true,),
						this.updateOverviewCache({transactions, currencyList, cryptoList, bonds, equities, etfs, metalList, assets: parsedAssets,}, clientId, true,),
					],)
				},
				),
			)
			log('routesForClientsUpdate', 'End',)
		} catch (error) {
			this.logger.error('[CacheSync]: RoutesForClientsUpdateError:', error,)
		}
	}

	/**
 		* CR-114/138
		* Rebuilds and updates the cache for portfolio details for all existing portfolios.
		* @remarks
		* This method retrieves all portfolio IDs from the database, prepares shared third-party data
		* (such as currency, crypto, CBonds, metals, and transactions), then generates detailed data
		* for each portfolio using `syncGetPortfolioDetailsById`. The resulting data is stored in the cache
		* under a key corresponding to each portfolio's details endpoint.
		* Used for full portfolio detail cache regeneration (e.g., during application bootstrap or cache warming).
	*/
	public async initialPortfoliosDetailsUpdate(data: IPortfolioDetailedThirdPartyListCBondsParted,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('initialPortfoliosDetailsUpdate', 'Start',)
			const portfolios = await this.prismaService.portfolio.findMany({
				include: {
					documents:       {
						orderBy: {
							createdAt: 'desc',
						},
					},
					entities:        {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					banks:     {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					accounts:  {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					assets:    {
						where: {
							isArchived: false,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					client: {
						select: {
							lastName:  true,
							firstName: true,
						},
					},
				},
			},)
			const {currencyList,cryptoList, bonds, equities, etfs, transactions, metalList,} = data
			await Promise.all(portfolios.map(async(portfolio,) => {
				const cacheData = this.portfolioService.syncGetPortfolioDetailsById(portfolio, {currencyList,cryptoList,bonds, equities, etfs, transactions, metalList,},)
				const cacheKey = this.cacheService.generateKey({
					method: 'GET',
					url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${portfolio.id}`,
					params: { id: portfolio.id, },
				},)
				await this.cacheService.set(cacheKey, cacheData,)
			},),)
			log('initialPortfoliosDetailsUpdate', 'End',)
		} catch (error) {
			this.logger.error('[CacheSync]: InitialPortfoliosDetailsUpdateError:', error,)
		}
	}

	/**
 		* CR-114/138
 		* Updates the cache for a specific portfolio's detailed view.
 		* @remarks
 		* This method fetches the full portfolio with its related entities, banks, accounts,
 		* assets, and documents from the database, then enriches it with third-party data
 		* such as currencies, crypto, CBonds, metals, and transactions. The enriched data is
 		* then cached for quick access on the portfolio details endpoint.
 		* @param portfolioId - The unique identifier of the portfolio to update the cache for.
 		* @param data - Pre-fetched third-party data required to compute and enrich the portfolio details.
 		* @returns A Promise that resolves when the cache has been updated.
 	*/
	public async generatePortfoliosDetailsCache(portfolioId: string, data: IPortfolioDetailedThirdPartyListCBondsParted,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('generatePortfoliosDetailsCache', 'Start',)
			const portfolio = await this.prismaService.portfolio.findUnique({
				where: {
					id: portfolioId,
				},
				include: {
					documents:       {
						orderBy: {
							createdAt: 'desc',
						},
					},
					entities:        {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					banks:     {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					accounts:  {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					assets:    {
						where: {
							isArchived: false,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					client: {
						select: {
							lastName:  true,
							firstName: true,
						},
					},
				},
			},)
			if (!portfolio) {
				return
			}
			const {currencyList,cryptoList,bonds, equities, etfs, transactions, metalList,} = data
			const cacheData = this.portfolioService.syncGetPortfolioDetailsById(portfolio, {currencyList,cryptoList,bonds, equities, etfs, transactions, metalList,},)
			const cacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${portfolio.id}`,
				params: { id: portfolio.id, },
			},)
			await this.cacheService.set(cacheKey, cacheData,)
			log('generatePortfoliosDetailsCache', 'End',)
		} catch (error) {
			this.logger.error('[CacheSync]: GeneratePortfoliosDetailsCacheError:', error,)
		}
	}

	/**
	 * CR-114/138
	 * Updates the cache for a specific portfolio’s detailed view by fetching and preparing all required data internally.
	 * @remarks
	 * This method retrieves the full portfolio object from the database, including associated documents,
	 * entities, banks, accounts, assets, and transactions. It also fetches and prepares third-party data
	 * such as currencies, crypto, CBonds, metals, and transactions using the `initialPreparedSourceData` method.
	 * The portfolio is then enriched and cached for optimized access in the portfolio details view.
	 * Unlike `generatePortfoliosDetailsCache`, this method does not require external data input and performs
	 * all data preparation internally.
	 *
	 * @param portfolioId - The unique identifier of the portfolio to update the cache for.
	 * @returns A Promise that resolves once the cache has been updated.
	 */
	public async portfoliosDetailsCacheUpdate(portfolioId: string,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('portfoliosDetailsCacheUpdate', 'Start',)
			const portfolio = await this.prismaService.portfolio.findUnique({
				where: {
					id: portfolioId,
				},
				include: {
					documents:       {
						orderBy: {
							createdAt: 'desc',
						},
					},
					entities:        {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					banks:     {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					accounts:  {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					assets:    {
						where: {
							isArchived: false,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					client: {
						select: {
							lastName:  true,
							firstName: true,
						},
					},
				},
			},)
			if (!portfolio) {
				return
			}
			const data = await this.initialPreparedSourceDataCBondsParted()
			const {currencyList,cryptoList,bonds, equities, etfs, transactions, metalList,} = data
			const cacheData = this.portfolioService.syncGetPortfolioDetailsById(portfolio, {currencyList,cryptoList,bonds, equities, etfs, transactions, metalList,},)
			const cacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${portfolio.id}`,
				params: { id: portfolio.id, },
			},)
			await this.cacheService.set(cacheKey, cacheData,)
			log('portfoliosDetailsCacheUpdate', 'End',)
		} catch (error) {
			this.logger.error('[CacheSync]: PortfoliosDetailsCacheUpdateError:', error,)
		}
	}

	public async portfoliosDetailsCacheUpdateWithPreparedData(data: TPortfolioCacheUpdate,): Promise<void> {
		try {
			const {portfolioId,} = data
			const log = this.getTimestampLogger()
			log('portfoliosDetailsCacheUpdate', 'Start',)
			const portfolio = await this.prismaService.portfolio.findUnique({
				where: {
					id: portfolioId,
				},
				include: {
					documents:       {
						orderBy: {
							createdAt: 'desc',
						},
					},
					entities:        {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					banks:     {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					accounts:  {
						include: {
							assets: {
								orderBy: {
									createdAt: 'desc',
								},
							},
							transactions: true,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					assets:    {
						where: {
							isArchived: false,
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
					client: {
						select: {
							lastName:  true,
							firstName: true,
						},
					},
				},
			},)
			if (!portfolio) {
				return
			}
			const {currencyList,cryptoList,bonds, equities, etfs, transactions, metalList,} = data
			const cacheData = this.portfolioService.syncGetPortfolioDetailsById(portfolio, {currencyList,cryptoList,bonds, equities, etfs, transactions, metalList,},)
			const cacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${portfolio.id}`,
				params: { id: portfolio.id, },
			},)
			await this.cacheService.set(cacheKey, cacheData,)
			log('portfoliosDetailsCacheUpdate', 'End',)
		} catch (error) {
			this.logger.error('[CacheSync]: PortfoliosDetailsCacheUpdateError:', error,)
		}
	}

	/**
 		* CR-114/138
 		* Restores or warms up the Redis cache for a specific asset type.
 		* This method is responsible for repopulating cached data for both shared and asset-specific analytics endpoints.
 		*
 		* Common (non-asset-specific) cache warm-up includes:
 		*  - Portfolio list
 		*  - Overview analytics
 		*  - Client list
 		*
 		* Depending on the provided `assetName`, additional analytics cache is restored for:
 		*  - Bonds
 		*  - Equity
 		*  - Cash
 		*  - Crypto
 		*  - Deposits
 		*  - Loans
 		*  - Metals
 		*  - Options
 		*  - Other investments
 		*  - Private equity
 		*  - Real estate
 		*
 		* Each asset-specific branch triggers the corresponding `update*Analytics()` method,
 		* which loads and stores relevant filtered analytics data into Redis using consistent cache keys.
 		*
 		* Note: Currently, both `PRIVATE_EQUITY` and `REAL_ESTATE` map to `AssetNamesType.PRIVATE_EQUITY`.
 		* Ensure that asset type enum values are correct and unique to avoid logical overlap.
 		*
 		* @param assetName - The name of the asset type for which analytics cache should be restored.
 		* @returns A Promise that resolves once all applicable cache entries are populated.
 	*/
	public async restoreCache(assetName?: AssetNamesType, portfolioId?: string,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('restoreCache', 'Start',)
			// const {portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList,assets, transactions, clientsList, budgetPlans,equityIsins,} = await this.initialPreparedSourceDataCBondsParted()
			const [
				assets,
				transactions,
				budgetPlans,
				currencyList,
				cryptoList,
				bonds,
				equities,
				etfs,
				metalList,
				equityIsins,
				costHistoryCurrencyList,
			] = await Promise.all([
				this.prismaService.asset.findMany({
					where: {
						isArchived: false,
						portfolio:  {
							is: {
								isActivated: true,
							},
						},
					},
					include: {
						portfolio: true,
						entity:    true,
						bank:      { include: { bankList: true, }, },
						account:   true,
					},
				},),
				this.prismaService.transaction.findMany({
					where: {
						portfolio: {
							isActivated: true,
						},
					},
					select: {
						amount:    true,
						currency:  true,
						clientId:  true,
						accountId: true,
						bankId:    true,
					},
				},),
				this.prismaService.budgetPlan.findMany({
					where: {
						client: {
							isActivated: true,
						},
					},
					include: {
						budgetPlanBankAccounts: {
							include: {
								bank:    {
									include: {
										assets: true,
									},
								},
								account: true,
							},
						},
						allocations: true,
						client:      true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},),
				this.cBondsCurrencyService.getAllCurrencies(),
				this.prismaService.cryptoData.findMany(),
				this.prismaService.bond.findMany({
					select: {
						isin:               true,
						security:           true,
						marketPrice:        true,
						dirtyPriceCurrency: true,
						yield:              true,
						accrued:            true,
						tradeDate:          true,
						issuer:             true,
						nominalPrice:       true,
						maturityDate:       true,
						country:            true,
						sector:             true,
						coupon:             true,
						nextCouponDate:     true,
					},
				},),
				this.prismaService.equity.findMany({
					select: {
						isin:               true,
						ticker:             true,
						lastPrice:          true,
						currencyName:     true,
						emitentName:      true,
						stockCountryName: true,
						branchName:       true,
					},
				},),
				this.prismaService.etf.findMany({
					select: {
						isin:                    true,
						ticker:                  true,
						close:                   true,
						currencyName:            true,
						fundsName:               true,
						geographyInvestmentName: true,
						sectorName:              true,
					},
				},),
				this.cBondsCurrencyService.getAllMetalsWithHistory(),
				this.prismaService.isins.findMany({
					where: {
						typeId: { in: ['2', '3',], },
					},
				},),
				this.prismaService.currencyHistoryData.findMany(),
			],)
			const parsedAssets = this.parseAndFilterAssets(assets,)
			await Promise.all([
				// this.syncUpdatePortfolioListCache({portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList,},),
				// this.updateClientListCache({clientsList, currencyList, cryptoList, bonds, equities, etfs, metalList,},),
				this.updateOverviewCache({transactions, currencyList, cryptoList, bonds, equities, etfs, metalList, assets: parsedAssets,},),
				this.generateBudgetList({budgetPlans, currencyList, assets, transactions,cryptoList,bonds, equities, etfs,metalList,},),
				assetName ?
					this.generateAssetCache({cryptoList,bonds, equities, etfs,metalList,assets, transactions, currencyList, equityIsins,costHistoryCurrencyList,}, assetName,) :
					this.generateAssetCache({cryptoList,bonds, equities, etfs,metalList,assets, transactions, currencyList, equityIsins, costHistoryCurrencyList,},),
				portfolioId && this.generatePortfoliosDetailsCache(portfolioId, {currencyList,cryptoList,bonds, equities, etfs,metalList, transactions,},),
			].filter(Boolean,),)
			log('restoreCache', 'End',)
			// if (assetName) {
			// 	await this.generateAssetCache({cryptoList,bonds, equities, etfs,metalList,assets, transactions, currencyList, equityIsins,}, assetName,)
			// 	log('restoreCache', 'End with generateAssetCache',)
			// }

			// if (portfolioId) {
			// 	await this.generatePortfoliosDetailsCache(portfolioId, {currencyList,cryptoList,bonds, equities, etfs,metalList, transactions,},)
			// 	log('restoreCache', 'End with generatePortfoliosDetailsCache',)
			// }
		} catch (error) {
			this.logger.error('[CacheSync]: RestoreCacheError:', error,)
		}
	}

	/**
		* CR - 114/138
		* Restores the cache for the portfolio list with updated data.
		* @remarks
		* This method fetches the initial prepared source data (portfolios, drafts, currencies, etc.)
		* and updates the portfolio list cache using the `syncUpdatePortfolioListCache` method.
		* Should be called from a worker thread to avoid blocking the event loop.
	*/
	public async restorePortfolioListCache(): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('restorePortfolioListCache', 'Start',)
			const [portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList, equityIsins, transactions, assets, costHistoryCurrencyList,] = await Promise.all([
				this.prismaService.portfolio.findMany({
					where: {
						mainPortfolioId: null,
					},
					include: {
						documents:    true,
						banks:           true,
						entities:        true,
						accounts:     true,
						assets:       {
							where: {
								isArchived: false,
							},
							include: {
								portfolio: true,
								entity:    true,
								bank:      {include: { bankList: true, },},
								account:   true,
							},
						},
						transactions: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},),
				this.prismaService.portfolioDraft.findMany({
					include: {
						banks:           true,
						entities:        true,
						accounts:  true,
						documents: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},),
				this.cBondsCurrencyService.getAllCurrencies(),
				this.prismaService.cryptoData.findMany(),
				this.prismaService.bond.findMany(),
				this.prismaService.equity.findMany(),
				this.prismaService.etf.findMany(),
				this.cBondsCurrencyService.getAllMetalsWithHistory(),
				this.prismaService.isins.findMany({
					where: {
						typeId: { in: ['2', '3',], },
					},
				},),
				this.prismaService.transaction.findMany({
					where: {
						portfolio: {
							isActivated: true,
						},
					},
					select: {
						amount:    true,
						currency:  true,
						clientId:  true,
						bankId:    true,
						accountId: true,
					},
				},),
				this.prismaService.asset.findMany({
					where: {
						isArchived: false,
						portfolio:  {
							is: {
								isActivated: true,
							},
						},
					},
					include: {
						portfolio: true,
						entity:    true,
						bank:      { include: { bankList: true, }, },
						account:   true,
					},
				},),
				this.prismaService.currencyHistoryData.findMany(),
			],)
			await this.generateAssetCache({assets, bonds, equities, etfs, currencyList, equityIsins, transactions, cryptoList, metalList, costHistoryCurrencyList,},)
			await this.syncUpdatePortfolioListCache({portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList,},)
			log('restorePortfolioListCache', 'End',)
		} catch (error) {
			this.logger.error('[RestorePortfolioListCacheError]:', error,)
		}
	}

	/**
		* CR - 114/138
		* Restores the cache for the client list with updated data.
		* @remarks
		* This method fetches the initial prepared source data (portfolios, drafts, currencies, etc.)
		* and updates the client list cache using the `updateClientListCache` method.
		* Should be called from a worker thread to avoid blocking the event loop.
	*/
	public async restoreClientListCache(): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('restoreClientListCache', 'Start',)
			const [clientsList, currencyList,cryptoList,bonds, equities, etfs,metalList,equityIsins,transactions,assets, costHistoryCurrencyList,] = await Promise.all([
				this.clientRepository.getAllClients(getClientsFilter,),
				this.cBondsCurrencyService.getAllCurrencies(),
				this.prismaService.cryptoData.findMany(),
				this.prismaService.bond.findMany(),
				this.prismaService.equity.findMany(),
				this.prismaService.etf.findMany(),
				this.cBondsCurrencyService.getAllMetalsWithHistory(),
				this.prismaService.isins.findMany({
					where: {
						typeId: { in: ['2', '3',], },
					},
				},),
				this.prismaService.transaction.findMany({
					where: {
						portfolio: {
							isActivated: true,
						},
					},
					select: {
						amount:    true,
						currency:  true,
						bankId:    true,
						clientId:  true,
						accountId: true,
					},
				},),
				this.prismaService.asset.findMany({
					where: {
						isArchived: false,
						portfolio:  {
							is: {
								isActivated: true,
							},
						},
					},
					include: {
						portfolio: true,
						entity:    true,
						bank:      { include: { bankList: true, }, },
						account:   true,
					},
				},),
				this.prismaService.currencyHistoryData.findMany(),
			],)
			await this.generateAssetCache({assets, bonds, equities, etfs, currencyList, equityIsins, transactions, cryptoList, metalList, costHistoryCurrencyList,},)
			await this.updateClientListCache({clientsList, currencyList,cryptoList,bonds, equities, etfs,metalList,},)
			log('restoreClientListCache', 'End',)
		} catch (error) {
			this.logger.error('[RestoreClientListCacheError]:', error,)
		}
	}

	/**
		* CR - 114/138
		* Restores the cache for the client list with updated data.
		* @remarks
		* This method fetches the initial prepared source data (portfolios, drafts, currencies, etc.)
		* and updates the client list cache using the `updateClientListCache` method.
		* and updates the portfolio list cache using the `syncUpdatePortfolioListCache` method.
		* Should be called from a worker thread to avoid blocking the event loop.
	*/
	public async restoreClientListWithPortfoliosCache(): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('restoreClientListWithPortfoliosCache', 'Start',)
			const [assets, portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList, clientsList, equityIsins, transactions, costHistoryCurrencyList,] = await Promise.all([
				this.prismaService.asset.findMany({
					where: {
						isArchived: false,
						portfolio:  {
							is: {
								isActivated: true,
							},
						},
					},
					include: {
						portfolio: true,
						entity:    true,
						bank:      { include: { bankList: true, }, },
						account:   true,
					},
				},),
				this.prismaService.portfolio.findMany({
					where: {
						mainPortfolioId: null,
					},
					include: {
						documents:    true,
						banks:           true,
						entities:        true,
						accounts:     true,
						assets:       {
							where: {
								isArchived: false,
							},
							include: {
								portfolio: true,
								entity:    true,
								bank:      {include: { bankList: true, },},
								account:   true,
							},
						},
						transactions: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},),
				this.prismaService.portfolioDraft.findMany({
					include: {
						banks:           true,
						entities:        true,
						accounts:  true,
						documents: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},),
				this.cBondsCurrencyService.getAllCurrencies(),
				this.prismaService.cryptoData.findMany(),
				this.prismaService.bond.findMany(),
				this.prismaService.equity.findMany(),
				this.prismaService.etf.findMany(),
				this.cBondsCurrencyService.getAllMetalsWithHistory(),
				this.clientRepository.getAllClients(getClientsFilter,),
				this.prismaService.isins.findMany({
					where: {
						typeId: { in: ['2', '3',], },
					},
				},),
				this.prismaService.transaction.findMany({
					where: {
						portfolio: {
							isActivated: true,
						},
					},
					select: {
						amount:    true,
						currency:  true,
						clientId:  true,
						bankId:    true,
						accountId: true,
					},
				},),
				this.prismaService.currencyHistoryData.findMany(),
			],)
			await this.updateClientListCache({clientsList, currencyList,cryptoList,bonds, equities, etfs,metalList,},)
			await this.generateAssetCache({assets, bonds, equities, etfs, currencyList, equityIsins, transactions, cryptoList, metalList, costHistoryCurrencyList,},)
			await this.syncUpdatePortfolioListCache({portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList,},)
			log('restoreClientListWithPortfoliosCache', 'End',)
		} catch (error) {
			this.logger.error('[RestoreClientListWithPortfoliosCacheError]:', error,)
		}
	}

	/**
		* CR - 114/138
		* Updates the cache for a specific asset type using the corresponding analytics updater.
		*
		* This method takes in the asset name (`assetName`) and the full initial data object (`data`),
		* filters the `assets` array to include only items matching the given asset type,
		* and then calls the appropriate analytics update method with the filtered assets.
		*
		* For each asset type (e.g., BONDS, EQUITY_ASSET, CASH, etc.):
		*  - Filters the `assets` array to select only assets of the specified type.
		*  - Invokes the corresponding analytics updater with the filtered data.
		*
		* A type guard (`asset is TAssetExtended`) is used to ensure proper typing of the filtered array.
		*
		* @param assetName The name of the asset type for which the cache should be updated.
		* @param data The initial data object containing the full list of assets and other related data.
	*/
	public async generateAssetCache(data: TAssetsGenerate, assetName?: AssetNamesType,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			const {assets, bonds, equities, etfs, currencyList, equityIsins, transactions, cryptoList, metalList, costHistoryCurrencyList, } = data
			log('generateAssetCache', 'Start',)
			const bondsAssets: Array<TAssetExtended> = []
			const equityAssets: Array<TAssetExtended> = []
			const cashAssets: Array<TAssetExtended> = []
			const cryptoAssets: Array<TAssetExtended> = []
			const depositAssets: Array<TAssetExtended> = []
			const loanAssets: Array<TAssetExtended> = []
			const metalAssets: Array<TAssetExtended> = []
			const optionAssets: Array<TAssetExtended> = []
			const otherAssets: Array<TAssetExtended> = []
			const peAssets: Array<TAssetExtended> = []
			const reAssets: Array<TAssetExtended> = []
			assets.forEach((asset,) => {
				switch (asset.assetName) {
				case AssetNamesType.BONDS:
					bondsAssets.push(asset,)
					break
				case AssetNamesType.EQUITY_ASSET:
					equityAssets.push(asset,)
					break
				case AssetNamesType.CASH:
					cashAssets.push(asset,)
					break
				case AssetNamesType.CRYPTO:
					cryptoAssets.push(asset,)
					break
				case AssetNamesType.CASH_DEPOSIT:
					depositAssets.push(asset,)
					break
				case AssetNamesType.LOAN:
					loanAssets.push(asset,)
					break
				case AssetNamesType.METALS:
					metalAssets.push(asset,)
					break
				case AssetNamesType.OPTIONS:
					optionAssets.push(asset,)
					break
				case AssetNamesType.OTHER:
					otherAssets.push(asset,)
					break
				case AssetNamesType.PRIVATE_EQUITY:
					peAssets.push(asset,)
					break
				case AssetNamesType.REAL_ESTATE:
					reAssets.push(asset,)
				default:
					break
				}
			},)
			if (assetName) {
				if (assetName === AssetNamesType.BONDS) {
					await this.updateBondAnalytics({bonds, currencyList, assets: bondsAssets, costHistoryCurrencyList,},)
				}
				if (assetName === AssetNamesType.EQUITY_ASSET) {
					await this.updateEquityAnalytics({equities, etfs, currencyList, equityIsins, assets: equityAssets,},)
				}
				if (assetName === AssetNamesType.CASH) {
					await this.updateCashAnalytics({transactions, currencyList, assets: cashAssets,},)
				}
				if (assetName === AssetNamesType.CRYPTO) {
					await this.updateCryptoAnalytics({cryptoList, currencyList, equities, etfs, equityIsins, assets: cryptoAssets,},)
				}
				if (assetName === AssetNamesType.CASH_DEPOSIT) {
					await this.updateDepositAnalytics({currencyList, assets: depositAssets,},)
				}
				if (assetName === AssetNamesType.LOAN) {
					await this.updateLoanAnalytics({currencyList, assets: loanAssets,},)
				}
				if (assetName === AssetNamesType.METALS) {
					await this.updateMetalAnalytics({equities, etfs, currencyList, equityIsins, metalList, assets: metalAssets,},)
				}
				if (assetName === AssetNamesType.OPTIONS) {
					await this.updateOptionsAnalytics({currencyList, assets: optionAssets,},)
				}
				if (assetName === AssetNamesType.OTHER) {
					await this.updateOtherAnalytics({currencyList, assets: otherAssets, costHistoryCurrencyList,},)
				}
				if (assetName === AssetNamesType.PRIVATE_EQUITY) {
					await this.updatePEAnalytics({currencyList, assets: peAssets,},)
				}
				if (assetName === AssetNamesType.REAL_ESTATE) {
					await this.updateRealEstateAnalytics({currencyList, assets: reAssets,},)
				}
			} else {
				await this.updateBondAnalytics({bonds, currencyList, assets: bondsAssets, costHistoryCurrencyList,},)
				await this.updateEquityAnalytics({equities, etfs, currencyList, equityIsins, assets: equityAssets,},)
				await this.updateCashAnalytics({transactions, currencyList, assets: cashAssets,},)
				await this.updateCryptoAnalytics({cryptoList, currencyList, equities, etfs, equityIsins, assets: cryptoAssets,},)
				await this.updateDepositAnalytics({currencyList, assets: depositAssets,},)
				await this.updateLoanAnalytics({currencyList, assets: loanAssets,},)
				await this.updateMetalAnalytics({equities, etfs, currencyList, equityIsins, metalList, assets: metalAssets,},)
				await this.updateOptionsAnalytics({currencyList, assets: optionAssets,},)
				await this.updateOtherAnalytics({currencyList, assets: otherAssets, costHistoryCurrencyList,},)
				await this.updatePEAnalytics({currencyList, assets: peAssets,},)
				await this.updateRealEstateAnalytics({currencyList, assets: reAssets,},)
			}
			log('generateAssetCache', 'End',)
		} catch (error) {
			this.logger.error('[GenerateAssetCacheError]:', error,)
		}
	}

	/**
		* CR - 114/138
		*  Updates the analytics cache for a specific asset type.
		*  This asynchronous method internally retrieves the full initial data set,
		*  then filters the assets array to include only those matching the specified asset type.
		*  After filtering, it calls the corresponding analytics update method for that asset type,
		*  passing along the filtered assets along with the rest of the data.
		*  The method supports all asset types defined in `AssetNamesType` enum and
		*  uses type guards to ensure proper typing of filtered assets.
		*  Error handling is implemented to log any issues during the cache generation process.
		*  @param assetName - The asset type (from `AssetNamesType`) for which the cache should be generated and updated.
 	*/
	public async updateAssetCache(assetName: AssetNamesType, clientId?: string,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateAssetCache', 'Start',)
			const [assets, transactions, bonds, equities, etfs, currencyList, cryptoList, metalList, equityIsins, costHistoryCurrencyList,] = await Promise.all([
				this.prismaService.asset.findMany({
					where: {
						isArchived: false,
						portfolio:  {
							is: {
								isActivated: true,
							},
						},
					},
					include: {
						portfolio: true,
						entity:    true,
						bank:      { include: { bankList: true, }, },
						account:   true,
					},
				},),
				this.prismaService.transaction.findMany({
					where: {
						portfolio: {
							isActivated: true,
						},
					},
					select: {
						amount:    true,
						currency:  true,
						clientId:  true,
						bankId:    true,
						accountId: true,
					},
				},),
				this.prismaService.bond.findMany(),
				this.prismaService.equity.findMany(),
				this.prismaService.etf.findMany(),
				this.cBondsCurrencyService.getAllCurrencies(),
				this.prismaService.cryptoData.findMany(),
				this.cBondsCurrencyService.getAllMetalsWithHistory(),
				this.prismaService.isins.findMany({
					where: {
						typeId: { in: ['2', '3',], },
					},
				},),
				this.prismaService.currencyHistoryData.findMany(),
			],)
			if (clientId) {
				const parsedAssets = this.parseAndFilterAssets(assets,)
				await this.updateOverviewCache({transactions, currencyList, cryptoList, bonds, equities, etfs, metalList, assets: parsedAssets,}, clientId,)
			}
			if (assetName === AssetNamesType.BONDS) {
				const bondsAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.BONDS
				},)
				if (clientId) {
					await this.updateBondAnalytics({bonds,currencyList, assets: bondsAssets, costHistoryCurrencyList,}, clientId,)
				} else {
					await this.updateBondAnalytics({bonds,currencyList, assets: bondsAssets, costHistoryCurrencyList,},)
				}
			}
			if (assetName === AssetNamesType.EQUITY_ASSET) {
				const equityAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.EQUITY_ASSET
				},)
				if (clientId) {
					await this.updateEquityAnalytics({equities, etfs, equityIsins, currencyList, assets: equityAssets,}, clientId,)
				} else {
					await this.updateEquityAnalytics({equities, etfs, currencyList, equityIsins, assets: equityAssets,},)
				}
			}
			if (assetName === AssetNamesType.CASH) {
				const cashAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.CASH
				},)
				await this.updateCashAnalytics({transactions, currencyList, assets: cashAssets,},)
				await this.updateCashAnalytics({transactions, currencyList, assets: cashAssets,}, clientId,)
			}
			if (assetName === AssetNamesType.CRYPTO) {
				const cryptoAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.CRYPTO
				},)
				if (clientId) {
					await this.updateCryptoAnalytics({equities, etfs, currencyList, equityIsins, cryptoList, assets: cryptoAssets,},clientId,)
				} else {
					await this.updateCryptoAnalytics({equities, etfs, currencyList, equityIsins, cryptoList, assets: cryptoAssets,},)
				}
			}
			if (assetName === AssetNamesType.CASH_DEPOSIT) {
				const depositAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.CASH_DEPOSIT
				},)
				if (clientId) {
					await this.updateDepositAnalytics({currencyList, assets: depositAssets,},clientId,)
				} else {
					await this.updateDepositAnalytics({currencyList, assets: depositAssets,},)
				}
			}
			if (assetName === AssetNamesType.LOAN) {
				const loanAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.LOAN
				},)
				if (clientId) {
					await this.updateLoanAnalytics({currencyList, assets: loanAssets,},clientId,)
				} else {
					await this.updateLoanAnalytics({currencyList, assets: loanAssets,},)
				}
			}
			if (assetName === AssetNamesType.METALS) {
				const metalAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.METALS
				},)
				if (clientId) {
					await this.updateMetalAnalytics({equities, etfs, currencyList, equityIsins, metalList, assets: metalAssets,},clientId,)
				} else {
					await this.updateMetalAnalytics({equities, etfs, currencyList, equityIsins, metalList, assets: metalAssets, },)
				}
			}
			if (assetName === AssetNamesType.OPTIONS) {
				const optionAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.OPTIONS
				},)
				if (clientId) {
					await this.updateOptionsAnalytics({currencyList, assets: optionAssets,},clientId,)
				} else {
					await this.updateOptionsAnalytics({currencyList, assets: optionAssets,},)
				}
			}
			if (assetName === AssetNamesType.OTHER) {
				const otherAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.OTHER
				},)
				if (clientId) {
					await this.updateOtherAnalytics({currencyList, assets: otherAssets, costHistoryCurrencyList,},clientId,)
				} else {
					await this.updateOtherAnalytics({currencyList, assets: otherAssets, costHistoryCurrencyList,},)
				}
			}
			if (assetName === AssetNamesType.PRIVATE_EQUITY) {
				const peAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.PRIVATE_EQUITY
				},)
				if (clientId) {
					await this.updatePEAnalytics({currencyList, assets: peAssets,},clientId,)
				} else {
					await this.updatePEAnalytics({currencyList, assets: peAssets,},)
				}
			}
			if (assetName === AssetNamesType.REAL_ESTATE) {
				const reAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.REAL_ESTATE
				},)
				if (clientId) {
					await this.updateRealEstateAnalytics({currencyList, assets: reAssets,},clientId,)
				} else {
					await this.updateRealEstateAnalytics({currencyList, assets: reAssets,},)
				}
			}
			log('updateAssetCache', 'End',)
		} catch (error) {
			this.logger.error('[UpdateAssetCacheError]:', error,)
		}
	}

	public async updateAssetCacheWithPreparedData(data: TAssetCacheUpdate,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateAssetCache', 'Start',)
			const {assets, transactions, bonds, equities, etfs, currencyList, cryptoList, metalList, equityIsins, assetName, clientId, costHistoryCurrencyList,} = data
			if (clientId) {
				const parsedAssets = this.parseAndFilterAssets(assets,)
				await this.updateOverviewCache({transactions, currencyList, cryptoList, bonds, equities, etfs, metalList, assets: parsedAssets,}, clientId,)
			}
			if (assetName === AssetNamesType.BONDS) {
				const bondsAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.BONDS
				},)
				if (clientId) {
					await this.updateBondAnalytics({bonds,currencyList, assets: bondsAssets, costHistoryCurrencyList,}, clientId,)
				} else {
					await this.updateBondAnalytics({bonds,currencyList, assets: bondsAssets, costHistoryCurrencyList,},)
				}
			}
			if (assetName === AssetNamesType.EQUITY_ASSET) {
				const equityAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.EQUITY_ASSET
				},)
				if (clientId) {
					await this.updateEquityAnalytics({equities, etfs, equityIsins, currencyList, assets: equityAssets,}, clientId,)
				} else {
					await this.updateEquityAnalytics({equities, etfs, currencyList, equityIsins, assets: equityAssets,},)
				}
			}
			if (assetName === AssetNamesType.CASH) {
				const cashAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.CASH
				},)
				await this.updateCashAnalytics({transactions, currencyList, assets: cashAssets,},)
				await this.updateCashAnalytics({transactions, currencyList, assets: cashAssets,}, clientId,)
			}
			if (assetName === AssetNamesType.CRYPTO) {
				const cryptoAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.CRYPTO
				},)
				if (clientId) {
					await this.updateCryptoAnalytics({equities, etfs, currencyList, equityIsins, cryptoList, assets: cryptoAssets,},clientId,)
				} else {
					await this.updateCryptoAnalytics({equities, etfs, currencyList, equityIsins, cryptoList, assets: cryptoAssets,},)
				}
			}
			if (assetName === AssetNamesType.CASH_DEPOSIT) {
				const depositAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.CASH_DEPOSIT
				},)
				if (clientId) {
					await this.updateDepositAnalytics({currencyList, assets: depositAssets,},clientId,)
				} else {
					await this.updateDepositAnalytics({currencyList, assets: depositAssets,},)
				}
			}
			if (assetName === AssetNamesType.LOAN) {
				const loanAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.LOAN
				},)
				if (clientId) {
					await this.updateLoanAnalytics({currencyList, assets: loanAssets,},clientId,)
				} else {
					await this.updateLoanAnalytics({currencyList, assets: loanAssets,},)
				}
			}
			if (assetName === AssetNamesType.METALS) {
				const metalAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.METALS
				},)
				if (clientId) {
					await this.updateMetalAnalytics({equities, etfs, currencyList, equityIsins, metalList, assets: metalAssets,},clientId,)
				} else {
					await this.updateMetalAnalytics({equities, etfs, currencyList, equityIsins, metalList, assets: metalAssets, },)
				}
			}
			if (assetName === AssetNamesType.OPTIONS) {
				const optionAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.OPTIONS
				},)
				if (clientId) {
					await this.updateOptionsAnalytics({currencyList, assets: optionAssets,},clientId,)
				} else {
					await this.updateOptionsAnalytics({currencyList, assets: optionAssets,},)
				}
			}
			if (assetName === AssetNamesType.OTHER) {
				const otherAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.OTHER
				},)
				if (clientId) {
					await this.updateOtherAnalytics({currencyList, assets: otherAssets, costHistoryCurrencyList,},clientId,)
				} else {
					await this.updateOtherAnalytics({currencyList, assets: otherAssets, costHistoryCurrencyList,},)
				}
			}
			if (assetName === AssetNamesType.PRIVATE_EQUITY) {
				const peAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.PRIVATE_EQUITY
				},)
				if (clientId) {
					await this.updatePEAnalytics({currencyList, assets: peAssets,},clientId,)
				} else {
					await this.updatePEAnalytics({currencyList, assets: peAssets,},)
				}
			}
			if (assetName === AssetNamesType.REAL_ESTATE) {
				const reAssets = assets.filter((asset,) => {
					return asset.assetName === AssetNamesType.REAL_ESTATE
				},)
				if (clientId) {
					await this.updateRealEstateAnalytics({currencyList, assets: reAssets,},clientId,)
				} else {
					await this.updateRealEstateAnalytics({currencyList, assets: reAssets,},)
				}
			}
			log('updateAssetCache', 'End',)
		} catch (error) {
			this.logger.error('[UpdateAssetCacheError]:', error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with the default response of the portfolio list endpoint.
 		* This method is triggered during the application module initialization phase (onModuleInit).
 		* It preloads a filtered portfolio list (with empty filters) and stores it in the cache,
 		* ensuring that the first user request receives a fast cached response.
 		*
 		* The cache key is generated using the default GET method and URL '/portfolio/list-filtered',
 		* and the resulting data is stored via the cacheService.
 		*
 		* @returns A Promise that resolves when the warm-up is complete.
 	*/
	public async updatePortfolioListCache(): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updatePortfolioListCache', 'Start',)
			const response = await this.portfolioService.getPortfolioListFiltered(getPortfoliosFilter,)
			const cacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
			},)

			await this.cacheService.deleteAllCacheByUrlPath(`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,)
			await this.cacheService.set(cacheKey, response,)
			log('updatePortfolioListCache', 'End',)
		} catch (error) {
			this.logger.error(error,)
		}
	}

	/**
 		* CR-114/138
 		* Updates the portfolio list cache with freshly filtered data.
 		* @remarks
 		* This method filters the provided portfolio-related data using the `syncGetPortfolioListFiltered` method,
 		* generates the appropriate cache key for the `GET /portfolio/get-portfolio-list-filtered` endpoint,
 		* and writes the result into the cache.
 		* Used during cache rebuilds (e.g., after portfolio create/delete operations or periodic cache updates).
 		* @param data - The full third-party data set required for filtering and preparing the portfolio list.
  */
	public async syncUpdatePortfolioListCache(data: IPortfoliosThirdPartyListCBondsParted,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('syncUpdatePortfolioListCache', 'Start',)
			const response = this.portfolioService.syncGetPortfolioListFiltered(data,getPortfoliosFilter,)
			const cacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
			},)

			await this.cacheService.deleteAllCacheByUrlPath(`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,)
			await this.cacheService.set(cacheKey, response,)
			log('syncUpdatePortfolioListCache', 'End',)
		} catch (error) {
			this.logger.error(error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the analytics overview endpoints.
 		* This method is executed during module initialization (via `onModuleInit`) and preloads
 		* analytics data for banks, entities, assets, and currencies using empty filters.
 		*
 		* The resulting responses are stored in Redis using consistently generated cache keys,
 		* allowing the first API request to benefit from a prefilled cache and reduce response latency.
 		*
 		* Filters used in this warm-up are undefined for all parameters, representing the base query state.
 		* Matching cache keys are generated using the same key structure as in the caching interceptor.
 		*
 		* @returns A Promise that resolves once all four cache entries are populated.
 	*/
	public async updateOverviewCache(data: TOverviewInitials, clientId?: string, isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateOverviewCache', 'Start',)
			const filters = {
				assetNames:   undefined,
				clientIds:    undefined,
				portfolioIds: undefined,
				entityIds:    undefined,
				bankIds:      undefined,
				bankListIds:  undefined,
				accountIds:   undefined,
				currencies:   undefined,
				date:         undefined,
			}

			const bankResponse = this.overviewService.syncGetBankAnalytics(data,filters, clientId,)
			const bankCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(bankCacheKey, bankResponse,)

			const entityResponse = this.overviewService.syncGetEntityAnalytics(data, filters, clientId,)
			const entityCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,)
			}
			await this.cacheService.set(entityCacheKey, entityResponse,)

			const assetResponse = this.overviewService.syncGetAssetAnalytics(data, filters, clientId,)
			const assetCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,)
			}
			await this.cacheService.set(assetCacheKey, assetResponse,)

			const currencyResponse = this.overviewService.syncGetCurrencyAnalytics(data, filters, clientId,)
			const currencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(currencyCacheKey, currencyResponse,)
			log('updateOverviewCache', 'End',)
		} catch (error) {
			this.logger.error(error,)
		}
	}

	public async generateOverviewCache(): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('generateOverviewCache', 'Start',)
			const [assets, transactions, etfs, equities, bonds, metalList, cryptoList, currencyList,] = await Promise.all([
				this.prismaService.asset.findMany({
					where: {
						isArchived: false,
						portfolio:  {
							is: {
								isActivated: true,
							},
						},
					},
					include: {
						portfolio: true,
						entity:    true,
						bank:      { include: { bankList: true, }, },
						account:   true,
					},
				},),
				this.prismaService.transaction.findMany({
					where: {
						portfolio: {
							isActivated: true,
						},
					},
					select: {
						amount:    true,
						currency:  true,
						clientId:  true,
						bankId:    true,
						accountId: true,
					},
				},),
				this.prismaService.etf.findMany(),
				this.prismaService.equity.findMany(),
				this.prismaService.bond.findMany(),
				this.cBondsCurrencyService.getAllMetalsWithHistory(),
				this.prismaService.cryptoData.findMany(),
				this.cBondsCurrencyService.getAllCurrencies(),
			],)
			const parsedAssets = this.parseAndFilterAssets(assets,)
			const filters = {
				assetNames:   undefined,
				clientIds:    undefined,
				portfolioIds: undefined,
				entityIds:    undefined,
				bankIds:      undefined,
				bankListIds:  undefined,
				accountIds:   undefined,
				currencies:   undefined,
				date:         undefined,
			}
			const bankResponse = this.overviewService.syncGetBankAnalytics({transactions, etfs, equities, bonds, metalList, cryptoList, currencyList, assets: parsedAssets,},filters,)
			const bankCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
			},)

			await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,)
			await this.cacheService.set(bankCacheKey, bankResponse,)

			const entityResponse = this.overviewService.syncGetEntityAnalytics({transactions, etfs, equities, bonds, metalList, cryptoList, currencyList, assets: parsedAssets,}, filters,)
			const entityCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
			},)

			await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,)
			await this.cacheService.set(entityCacheKey, entityResponse,)

			const assetResponse = this.overviewService.syncGetAssetAnalytics({transactions, etfs, equities, bonds, metalList, cryptoList, currencyList, assets: parsedAssets,}, filters,)
			const assetCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
			},)

			await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,)
			await this.cacheService.set(assetCacheKey, assetResponse,)

			const currencyResponse = this.overviewService.syncGetCurrencyAnalytics({transactions, etfs, equities, bonds, metalList, cryptoList, currencyList, assets: parsedAssets,}, filters,)
			const currencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
			},)

			await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,)
			await this.cacheService.set(currencyCacheKey, currencyResponse,)
			log('generateOverviewCache', 'End',)
		} catch (error) {
			this.logger.error(error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with the default response of the client list endpoint.
 		* This method is triggered during the application module initialization phase (onModuleInit).
 		* It preloads a filtered client list (with empty filters) and stores it in the cache,
 		* ensuring that the first user request receives a fast cached response.
 		*
 		* The cache key is generated using the default GET method and URL '/client/list',
 		* and the resulting data is stored via the cacheService.
 		*
 		* @returns A Promise that resolves when the warm-up is complete.
 	*/
	public async updateClientListCache(data: TClientListCache,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateClientListCache', 'Start',)
			const response = this.clientService.syncGetClients(data, getClientsFilter,)
			const cacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,
			},)

			await this.cacheService.deleteAllCacheByUrlPath(`/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,)
			await this.cacheService.set(cacheKey, response,)
			log('updateClientListCache', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	public async generateClientListCache(): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('generateClientListCache', 'Start',)
			const [clientsList, currencyList, cryptoList, bonds, equities, etfs, metalList,] = await Promise.all([
				this.clientRepository.getAllClients(getClientsFilter,),
				this.cBondsCurrencyService.getAllCurrencies(),
				this.prismaService.cryptoData.findMany(),
				this.prismaService.bond.findMany(),
				this.prismaService.equity.findMany(),
				this.prismaService.etf.findMany(),
				this.cBondsCurrencyService.getAllMetalsWithHistory(),
			],)
			const response = this.clientService.syncGetClients({clientsList, currencyList, cryptoList, bonds, equities, etfs, metalList,}, getClientsFilter,)
			const cacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,
			},)

			await this.cacheService.deleteAllCacheByUrlPath(`/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,)
			await this.cacheService.set(cacheKey, response,)
			log('generateClientListCache', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the bond analytics endpoints.
 		* This method is executed during module initialization (`onModuleInit`) and preloads:
 		*  - Full bond table data (`/bond/loan-by-filters`)
 		*  - Bank-based bond analytics (`/bond/bank`)
 		*  - Currency-based bond analytics (`/bond/currency`)
 		*
 		* Two separate filter objects are used:
 		*  - `bondFilter` for the full bond table response (includes sorting options)
 		*  - `chartFilters` for the chart-based endpoints (bank and currency analytics)
 		*
 		* These responses are stored in the cache using consistent cache key generation,
 		* allowing the application to serve initial bond-related analytics requests faster.
 		*
 		* @returns A Promise that resolves once all bond-related cache entries are populated.
 	*/

	// New Version
	public async updateBondAnalytics(data: TBondInitials, clientId?: string,isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateBondAnalytics', 'Start',)
			const bondResponse = this.bondAssetService.syncGetAllByFilters(data, bondFilter, clientId,)
			const bondCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.GET_ALL_BY_FILTERS}`,
				query:  bondFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)
			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.GET_ALL_BY_FILTERS}`,)
			}
			await this.cacheService.set(bondCacheKey, bondResponse,)

			const chartFilters = {
				type:           AssetNamesType.BONDS,
			}
			const bankResponse = this.bondAssetService.syncGetBondsBankAnalytics(data, chartFilters, clientId,)
			const bankCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.BANK}`,
				query:  chartFilters,
				...(clientId ?
					{ clientId, } :
					{}),
			},)
			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(bankCacheKey, bankResponse,)

			const currencyResponse = this.bondAssetService.syncGetBondsCurrencyAnalytics(data, chartFilters, clientId,)
			const currencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.CURRENCY}`,
				query:  chartFilters,
				...(clientId ?
					{ clientId, } :
					{}),
			},)
			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(currencyCacheKey, currencyResponse,)
			log('updateBondAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the equity analytics endpoints.
 		* This method is executed during module initialization (`onModuleInit`) and preloads:
 		*  - Full equity table data (`/equity/loan-by-filters`)
 		*  - Bank-based equity analytics (`/equity/bank`)
 		*  - Currency-based equity analytics (`/equity/currency`)
 		*
 		* Two separate filter objects are used:
 		*  - `equityFilter` for the full equity table response (includes sorting options)
 		*  - `chartFilters` for the chart-based endpoints (bank and currency analytics)
 		*
 		* These responses are stored in the cache using consistent cache key generation,
 		* allowing the application to serve initial equity-related analytics requests faster.
 		*
 		* @returns A Promise that resolves once all equity-related cache entries are populated.
 	*/
	public async updateEquityAnalytics(data: TEquityInitials, clientId?: string, isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateEquityAnalytics', 'Start',)
			const equityResponse = this.equityAssetService.syncGetAllByFilters(data, equityFilter, clientId,)
			const bankCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.GET_ALL_BY_FILTERS}`,
				query:  equityFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)
			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.GET_ALL_BY_FILTERS}`,)
			}

			await this.cacheService.set(bankCacheKey, equityResponse,)

			const chartFilters = {
				type:           AssetNamesType.EQUITY_ASSET,
			}
			const bankResponse = this.equityAssetService.syncGetEquityBankAnalytics(data, chartFilters, clientId,)
			const entityCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.BANK}`,
				query:  chartFilters,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(entityCacheKey, bankResponse,)

			const assetResponse = this.equityAssetService.syncGetEquityCurrencyAnalytics(data, chartFilters, clientId,)
			const assetCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.CURRENCY}`,
				query:  chartFilters,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(assetCacheKey, assetResponse,)
			log('updateEquityAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the cash analytics endpoints.
 		* This method preloads and caches the following cash-related analytics data:
 		*  - Bank analytics (/cash/bank)
 		*  - Entity analytics (/cash/entity)
 		*  - Currency analytics (/cash/currency)
 		*
 		* The cache keys are generated consistently using the current cashFilters,
 		* ensuring that subsequent requests for the same filters are served quickly from cache.
 		*
 		* This function is typically called during module initialization or cache synchronization
 		* to improve application responsiveness by preloading frequently requested data.
 		*
 		* @returns A Promise that resolves once all specified cash analytics cache entries are set.
 	*/
	public async updateCashAnalytics(data: TCacheInitials, clientId?: string, isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateCashAnalytics', 'Start',)
			const cashBankResponse = this.cashService.syncGetBankAnalytics(data, cashFilters, clientId,)
			const bankCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.BANK}`,
				query:  cashFilters as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(bankCacheKey, cashBankResponse,)

			const cashEntityResponse = this.cashService.syncGetEntityAnalytics(data,cashFilters, clientId,)
			const entityCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.ENTITY}`,
				query:  cashFilters as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.ENTITY}`,)
			}
			await this.cacheService.set(entityCacheKey, cashEntityResponse,)

			const cashCurrencyResponse = this.cashService.syncGetCurrencyAnalytics(data,cashFilters, clientId,)
			const currencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.CURRENCY}`,
				query:  cashFilters as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(currencyCacheKey, cashCurrencyResponse,)
			log('updateCashAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the crypto asset analytics endpoints.
 		* This method preloads and caches the following crypto-related analytics data:
 		*  - Full crypto asset data filtered by criteria (/crypto/get-all-by-filters)
 		*  - Bank-based crypto analytics (/crypto/bank)
 		*  - Currency-based crypto analytics (/crypto/currency)
 		*
 		* Cache keys are generated consistently using the current filters (`cryptoFilter` and `cryptoCurrencyFilter`),
 		* ensuring that repeated requests with the same filters are served efficiently from cache.
 		*
 		* This method is designed to be executed during module initialization or cache refresh,
 		* improving application performance by preloading frequently accessed crypto analytics data.
 		*
 		* @returns A Promise that resolves once all crypto-related cache entries are populated.
 	*/
	public async updateCryptoAnalytics(data: TCryptoInitials, clientId?: string, isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateCryptoAnalytics', 'Start',)
			const cryptoResponse = this.cryptoAssetService.syncGetAllByFilters(data, cryptoFilter, clientId,)
			const cryptoCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.GET_ALL_BY_FILTERS}`,
				query:  cryptoFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.GET_ALL_BY_FILTERS}`,)
			}
			await this.cacheService.set(cryptoCacheKey, cryptoResponse,)

			const cryptoBankResponse = this.cryptoAssetService.syncGetCryptoBankAnalytics(data, cryptoCurrencyFilter, clientId,)
			const cryptoBankKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.BANK}`,
				query:  cryptoCurrencyFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(cryptoBankKey, cryptoBankResponse,)

			const cryptoCurrencyResponse = this.cryptoAssetService.syncGetCryptoCurrencyAnalytics(data, cryptoCurrencyFilter, clientId,)
			const cryptoCurrencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.CURRENCY}`,
				query:  cryptoCurrencyFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(cryptoCurrencyCacheKey, cryptoCurrencyResponse,)
			log('updateCryptoAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the deposit analytics endpoints.
 		* This method preloads and caches the following deposit-related analytics data:
 		*  - Full deposit data filtered by criteria (/deposit/get-all-by-filters)
 		*  - Bank-based deposit analytics (/deposit/bank)
 		*  - Currency-based deposit analytics (/deposit/currency)
 		*
 		* Cache keys are generated consistently using the current filters (`depositFilter` and `depositCurrencyFilter`),
 		* ensuring efficient serving of repeated requests with identical filters from cache.
 		*
 		* This function is intended to be run during module initialization or cache synchronization,
 		* which improves performance by preloading commonly requested deposit analytics.
 		*
 		* @returns A Promise that resolves once all deposit-related cache entries have been populated.
 	*/
	public async updateDepositAnalytics(data: TAssetCacheInitials, clientId?: string,isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateDepositAnalytics', 'Start',)
			const depositResponse = this.depositService.syncGetAllByFilters(data, depositFilter, clientId,)
			const depositCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.GET_ALL_BY_FILTERS}`,
				query:  depositFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.GET_ALL_BY_FILTERS}`,)
			}
			await this.cacheService.set(depositCacheKey, depositResponse,)

			const depositBankResponse = this.depositService.syncGetBankAnalytics(data, depositCurrencyFilter, clientId,)
			const depositBankKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.BANK}`,
				query:  depositCurrencyFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(depositBankKey, depositBankResponse,)

			const depositCurrencyResponse = this.depositService.syncGetCurrencyAnalytics(data, depositCurrencyFilter, clientId,)
			const depositCurrencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.CURRENCY}`,
				query:  depositCurrencyFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)
			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(depositCurrencyCacheKey, depositCurrencyResponse,)
			log('updateDepositAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the loan asset analytics endpoints.
 		* This method preloads and caches the following loan-related analytics data:
 		*  - Full loan data filtered by criteria (/loan/loan-by-filters)
 		*  - Bank-based loan analytics (/loan/bank)
 		*  - Currency-based loan analytics (/loan/currency)
 		*
 		* Cache keys are generated consistently using the current filters (`loanFilter` and `loanCurrencyFilter`),
 		* ensuring that repeated requests with the same filters are efficiently served from cache.
 		*
 		* This method is designed to be called during module initialization or cache refresh,
 		* improving application responsiveness by preloading commonly requested loan analytics data.
 		*
 		* @returns A Promise that resolves once all loan-related cache entries are populated.
 	*/
	public async updateLoanAnalytics(data: TAssetCacheInitials, clientId?: string, isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateLoanAnalytics', 'Start',)
			const loanResponse = this.loanAssetService.syncGetAllByFilters(data ,loanFilter, clientId,)
			const loanCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
				query:  loanFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,)
			}
			await this.cacheService.set(loanCacheKey, loanResponse,)

			const loanBankResponse = this.loanAssetService.syncGetBankAnalytics(data, loanCurrencyFilter, clientId,)
			const loanBankKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.BANK}`,
				query:  loanCurrencyFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(loanBankKey, loanBankResponse,)

			const loanCurrencyResponse = this.loanAssetService.syncGetCurrencyAnalytics(data ,loanCurrencyFilter, clientId,)
			const loanCurrencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.CURRENCY}`,
				query:  loanCurrencyFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(loanCurrencyCacheKey, loanCurrencyResponse,)
			log('updateLoanAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the metals analytics endpoints.
 		* This method preloads and caches the following metals-related analytics data:
 		*  - Filtered metals data (/metals)
 		*  - Bank-based metals analytics (/metals/bank)
 		*  - Currency-based metals analytics (/metals/currency)
 		*
 		* Cache keys are generated consistently using the current filters (`metalFilter` and `metalCurrencyFilter`),
 		* allowing efficient serving of repeated requests with the same filters from cache.
 		*
 		* This method is intended to be run during module initialization or cache refresh,
 		* improving application performance by preloading frequently requested metals analytics.
 		*
 		* @returns A Promise that resolves once all metals-related cache entries have been populated.
 	*/
	public async updateMetalAnalytics(data: TMetalAssetCache, clientId?: string, isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateMetalAnalytics', 'Start',)
			const metalResponse = this.metalsService.syncGetFilteredMetals(data, metalFilter, clientId,)
			const metalCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.METALS}`,
				query:  metalFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.METALS}`,)
			}
			await this.cacheService.set(metalCacheKey, metalResponse,)

			const metalBankResponse = this.metalsService.syncGetBankAnalytics(data, metalCurrencyFilter, clientId,)
			const metalBankKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.METALS}/${AnalyticsRoutes.BANK}`,
				query:  metalCurrencyFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.METALS}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(metalBankKey, metalBankResponse,)

			const metalCurrencyResponse = this.metalsService.syncGetCurrencyAnalytics(data, metalCurrencyFilter, clientId,)
			const metalCurrencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.METALS}/${AnalyticsRoutes.CURRENCY}`,
				query:  metalCurrencyFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.METALS}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(metalCurrencyCacheKey, metalCurrencyResponse,)
			log('updateMetalAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the options analytics endpoints.
 		* This method preloads and caches the following options-related analytics data:
 		*  - Asset analytics data filtered by criteria (/options/asset)
 		*  - Bank-based options analytics (/options/bank)
 		*  - Maturity-based options analytics (/options/maturity)
 		*
 		* Cache keys are generated consistently using the current filters (`optionsFilter`),
 		* ensuring that repeated requests with the same filters are efficiently served from cache.
 		*
 		* This function is designed to be executed during module initialization or cache synchronization,
 		* improving performance by preloading commonly requested options analytics data.
 		*
 		* @returns A Promise that resolves once all options-related cache entries have been populated.
 	*/
	public async updateOptionsAnalytics(data: TAssetCacheInitials, clientId?: string, isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateOptionsAnalytics', 'Start',)
			const optionsResponse = this.optionsService.syncGetAssetAnalytics(data, optionsFilter, clientId,)
			const optionsCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.ASSET}`,
				query:  optionsFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.ASSET}`,)
			}
			await this.cacheService.set(optionsCacheKey, optionsResponse,)

			const optionsBankResponse = this.optionsService.syncGetBankAnalytics(data, optionsFilter, clientId,)
			const optionsBankKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.BANK}`,
				query:  optionsFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(optionsBankKey, optionsBankResponse,)

			const optionsCurrencyResponse = this.optionsService.syncGetMaturityAnalytics(data,optionsFilter, clientId,)
			const optionsCurrencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.MATURITY}`,
				query:  optionsFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.MATURITY}`,)
			}
			await this.cacheService.set(optionsCurrencyCacheKey, optionsCurrencyResponse,)
			log('updateOptionsAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the "other investments" analytics endpoints.
 		* This method preloads and caches the following analytics data for other investment types:
 		*  - Filtered investment data (/other-investmen)
 		*  - Bank-based analytics (/other-investmen/bank)
 		*  - Currency-based analytics (/other-investmen/currency)
 		*
 		* Cache keys are consistently generated using the current filters (`otherFilter` and `otherCurrencyFilter`),
 		* allowing for efficient retrieval of repeated requests from cache.
 		*
 		* This method is typically executed during module initialization or cache refresh,
 		* ensuring faster initial load times for views relying on "other investments" analytics.
 		*
 		* @returns A Promise that resolves once all related cache entries are populated.
 	*/
	public async updateOtherAnalytics(data: TOtherAssetCacheInitials, clientId?: string, isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateOtherAnalytics', 'Start',)
			const otherResponse = this.otherInvestmentsService.syncGetFilteredOtherInvestments(data,otherFilter, clientId,)
			const otherCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OTHER_INVESTMEN}`,
				query:  otherFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OTHER_INVESTMEN}`,)
			}
			await this.cacheService.set(otherCacheKey, otherResponse,)

			const otherBankResponse = this.otherInvestmentsService.syncGetBankAnalytics(data, otherCurrencyFilter, clientId,)
			const otherBankKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OTHER_INVESTMEN}/${AnalyticsRoutes.BANK}`,
				query:  otherCurrencyFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OTHER_INVESTMEN}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(otherBankKey, otherBankResponse,)

			const otherCurrencyResponse = this.otherInvestmentsService.syncGetCurrencyAnalytics(data, otherCurrencyFilter, clientId,)
			const otherCurrencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.OTHER_INVESTMEN}/${AnalyticsRoutes.CURRENCY}`,
				query:  otherCurrencyFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.OTHER_INVESTMEN}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(otherCurrencyCacheKey, otherCurrencyResponse,)
			log('updateOtherAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the private equity analytics endpoints.
 		* This method preloads and caches the following private equity-related analytics data:
 		*  - Full private equity data filtered by criteria (/private-equity/pe-by-filters)
 		*  - Bank-based private equity analytics (/private-equity/bank)
 		*  - Currency-based private equity analytics (/private-equity/currency)
 		*
 		* Cache keys are consistently generated using the current filters (`privateFilter` and `privateCurrencyFilter`),
 		* ensuring efficient cache hits for repeated requests with the same parameters.
 		*
 		* This method is typically executed during module initialization or scheduled cache updates,
 		* helping reduce latency for private equity analytics views by preloading relevant data.
 		*
 		* @returns A Promise that resolves once all private equity-related cache entries are populated.
 	*/
	public async updatePEAnalytics(data: TAssetCacheInitials, clientId?: string, isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updatePEAnalytics', 'Start',)
			const peResponse = this.privateEquityAssetService.syncGetAllByFilters(data, privateFilter, clientId,)
			const peCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.PE_BY_FILTERS}`,
				query:  privateFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.PE_BY_FILTERS}`,)
			}
			await this.cacheService.set(peCacheKey, peResponse,)

			const peBankResponse = this.privateEquityAssetService.syncGetBankAnalytics(data, privateCurrencyFilter, clientId,)
			const peBankKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.BANK}`,
				query:  privateCurrencyFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.BANK}`,)
			}
			await this.cacheService.set(peBankKey, peBankResponse,)

			const peCurrencyResponse = this.privateEquityAssetService.syncGetCurrencyAnalytics(data,privateCurrencyFilter, clientId,)
			const peCurrencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.CURRENCY}`,
				query:  privateCurrencyFilter,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(peCurrencyCacheKey, peCurrencyResponse,)
			log('updatePEAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
 		* CR-114/138
 		* Warms up the Redis cache with default responses for the real estate analytics endpoints.
 		* This method preloads and caches the following real estate-related analytics data:
 		*  - Asset-level analytics filtered by criteria (/real-estate/asset)
 		*  - City-based real estate analytics (/real-estate/city)
 		*  - Currency-based real estate analytics (/real-estate/currency)
 		*
 		* Cache keys are consistently generated using the current `realEstateFilter`,
 		* ensuring that repeated requests with identical filters are efficiently served from cache.
 		*
 		* This method is intended to run during module initialization or on cache sync jobs,
 		* improving performance by preloading frequently accessed real estate analytics data.
 		*
 		* @returns A Promise that resolves once all real estate-related cache entries have been populated.
 	*/
	public async updateRealEstateAnalytics(data: TAssetCacheInitials, clientId?: string, isClPortal?: boolean,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateRealEstateAnalytics', 'Start',)
			const reResponse = this.realEstateService.syncGetAssetAnalytics(data,realEstateFilter,clientId,)
			const reCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.ASSET}`,
				query:  realEstateFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.ASSET}`,)
			}
			await this.cacheService.set(reCacheKey, reResponse,)

			const reBankResponse = this.realEstateService.syncGetCityAnalytics(data, realEstateFilter,clientId,)
			const reBankKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.CITY}`,
				query:  realEstateFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.CITY}`,)
			}
			await this.cacheService.set(reBankKey, reBankResponse,)

			const reCurrencyResponse = this.realEstateService.syncGetCurrencyAnalytics(data,realEstateFilter,clientId,)
			const reCurrencyCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.CURRENCY}`,
				query:  realEstateFilter as unknown as ParsedQs,
				...(clientId ?
					{ clientId, } :
					{}),
			},)

			if (!isClPortal) {
				await this.cacheService.deleteAllCacheByUrlPath(`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.CURRENCY}`,)
			}
			await this.cacheService.set(reCurrencyCacheKey, reCurrencyResponse,)
			log('updateRealEstateAnalytics', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
		* CR-114/138
		* Warms up the Redis cache with the default response for the budget plans endpoint.
		* This method preloads and caches budget plan data using the default `budgetListFilter`:
		*  - Retrieves the list of budget plans from the budget service (/budget/plan)
		*  - Generates a consistent cache key based on the filter and endpoint
		*  - Stores the result in Redis for faster subsequent access
		*
		* This method is intended to run during module initialization or scheduled cache synchronization,
		* improving performance by avoiding redundant API calls on first client access.
		*
		* @returns A Promise that resolves once the budget plans cache has been populated.
	*/
	public async generateBudgetList(data: TSyncGetBudgets,): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('generateBudgetList', 'Start',)
			const budgetListResponse = this.budgetService.syncGetBudgetPlans(data,)
			const budgetListCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
			},)

			await this.cacheService.deleteAllCacheByUrlPath(`/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,)
			await this.cacheService.set(budgetListCacheKey, budgetListResponse,)
			log('generateBudgetList', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
		* CR-114/138
		* Updates the Redis cache with the latest response for the budget plans endpoint.
		* This method fetches updated budget plan data and refreshes the corresponding cache:
		*  - Prepares initial data required for fetching the latest budget plans
		*  - Retrieves the latest list of budget plans from the budget service (/budget/plan)
		*  - Generates a consistent cache key based on the request parameters
		*  - Deletes any existing cache entry for the endpoint to avoid stale data
		*  - Stores the latest response in Redis to serve future requests efficiently
		*
		* This method is intended for scheduled cache updates or manual revalidation
		* to ensure clients receive fresh and accurate budget plan data.
		*
		* @returns A Promise that resolves once the budget plans cache has been updated.
	*/
	public async updateBudgetList(): Promise<void> {
		try {
			const log = this.getTimestampLogger()
			log('updateBudgetList', 'Start',)
			const [budgetPlans, currencyList, assets, transactions, cryptoList, bonds, equities, etfs, metalList,] = await Promise.all([
				this.prismaService.budgetPlan.findMany({
					where: {
						client: {
							isActivated: true,
						},
					},
					include: {
						budgetPlanBankAccounts: {
							include: {
								bank:    {
									include: {
										assets: true,
									},
								},
								account: true,
							},
						},
						allocations: true,
						client:      true,
					},
					orderBy: {
						createdAt: 'desc',
					},
				},),
				this.cBondsCurrencyService.getAllCurrencies(),
				this.prismaService.asset.findMany({
					where: {
						isArchived: false,
						portfolio:  {
							is: {
								isActivated: true,
							},
						},
					},
					include: {
						portfolio: true,
						entity:    true,
						bank:      { include: { bankList: true, }, },
						account:   true,
					},
				},),
				this.prismaService.transaction.findMany({
					where: {
						portfolio: {
							isActivated: true,
						},
					},
					select: {
						amount:    true,
						currency:  true,
						clientId:  true,
						bankId:    true,
						accountId: true,
					},
				},),
				this.prismaService.cryptoData.findMany(),
				this.prismaService.bond.findMany(),
				this.prismaService.equity.findMany(),
				this.prismaService.etf.findMany(),
				this.cBondsCurrencyService.getAllMetalsWithHistory(),
			],
			)
			const budgetListResponse = this.budgetService.syncGetBudgetPlans({budgetPlans, currencyList, assets, transactions, cryptoList, bonds, equities, etfs, metalList,},)
			const budgetListCacheKey = this.cacheService.generateKey({
				method: 'GET',
				url:    `/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
			},)
			await this.cacheService.deleteAllCacheByUrlPath(`/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,)
			await this.cacheService.set(budgetListCacheKey, budgetListResponse,)
			log('updateBudgetList', 'End',)
		} catch (error) {
			this.logger.error(['CacheSync',],error,)
		}
	}

	/**
	 	* CR - 114/138
 		* Loads and aggregates initial source data from various Prisma services and external sources.
 		* This method is typically used for preparing a full dataset required for analytics or caching.
 		*
 		* Data sources include:
 		* - Portfolios without a mainPortfolioId, along with their related documents, banks, entities, accounts, assets (non-archived), and transactions.
 		* - Portfolio drafts with related banks, entities, accounts, and documents.
 		* - Assets belonging to activated portfolios (non-archived), with related entities, banks, and accounts.
 		* - Transactions related to activated portfolios.
 		* - Budget plans for activated clients, including nested bank accounts, allocations, and client data.
 		* - Clients list retrieved via the client service with custom filters.
 		* - Reference data:
 		*   - Currency list from CBonds service
 		*   - Crypto list from third-party Prisma
 		*   - CBonds-related trading and emission data
 		*   - Metal list with historical data
 		*   - ISINs of specific types (2 and 3)
 		*
 		* @returns A combined object containing all the above datasets, to be used in cache restoration or analytics.
	*/
	public async initialPreparedSourceDataCBondsParted(): Promise<IInitialThirdPartyListCbondsParted> {
		const log = this.getTimestampLogger()
		log('initialPreparedSourceData', 'Start',)
		const portfoliosPromise = this.prismaService.portfolio.findMany({
			where: {
				mainPortfolioId: null,
			},
			include: {
				banks:           true,
				entities:        true,
				accounts:     true,
				assets:       {
					where: {
						isArchived: false,
					},
					include: {
						portfolio: true,
						entity:    true,
						bank:      {include: { bankList: true, },},
						account:   true,
					},
				},
				transactions: {
					select: {
						amount:    true,
						currency:  true,
						clientId:  true,
						accountId: true,
						bankId:    true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		},)
		const draftsPromise = this.prismaService.portfolioDraft.findMany({
			include: {
				banks:           true,
				entities:        true,
				accounts:  true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		},)
		const assetsPromise = this.prismaService.asset.findMany({
			where: {
				isArchived: false,
				portfolio:  {
					is: {
						isActivated: true,
					},
				},
			},
			include: {
				portfolio: true,
				entity:    true,
				bank:      { include: { bankList: true, }, },
				account:   true,
			},
		},)
		const transactionsPromise = this.prismaService.transaction.findMany({
			where: {
				portfolio: {
					isActivated: true,
				},
			},
			select: {
				amount:    true,
				currency:  true,
				clientId:  true,
				accountId: true,
				bankId:    true,
			},
		},)
		const [
			assets,
			transactions,
			budgetPlans,
			clientsList,
			portfolios,
			drafts,
			currencyList,
			cryptoList,
			bonds,
			equities,
			etfs,
			metalList,
			equityIsins,
			costHistoryCurrencyList,
		] = await Promise.all([
			assetsPromise,
			transactionsPromise,
			this.prismaService.budgetPlan.findMany({
				where: {
					client: {
						isActivated: true,
					},
				},
				include: {
					budgetPlanBankAccounts: {
						include: {
							bank:    {
								include: {
									assets: true,
								},
							},
							account: true,
						},
					},
					allocations: true,
					client:      true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			},),
			this.clientRepository.getAllClients(getClientsFilter,),
			portfoliosPromise,
			draftsPromise,
			this.cBondsCurrencyService.getAllCurrencies(),
			this.prismaService.cryptoData.findMany(),
			this.prismaService.bond.findMany({
				select: {
					isin:               true,
					security:           true,
					marketPrice:        true,
					dirtyPriceCurrency: true,
					yield:              true,
					accrued:            true,
					tradeDate:          true,
					issuer:             true,
					nominalPrice:       true,
					maturityDate:       true,
					country:            true,
					sector:             true,
					coupon:             true,
					nextCouponDate:     true,
				},
			},),
			this.prismaService.equity.findMany({
				select: {
					isin:               true,
					ticker:             true,
					lastPrice:          true,
					currencyName:     true,
					emitentName:      true,
					stockCountryName: true,
					branchName:       true,
				},
			},),
			this.prismaService.etf.findMany({
				select: {
					isin:                    true,
					ticker:                  true,
					close:                   true,
					currencyName:            true,
					fundsName:               true,
					geographyInvestmentName: true,
					sectorName:              true,
				},
			},),
			this.cBondsCurrencyService.getAllMetalsWithHistory(),
			this.prismaService.isins.findMany({
				where: {
					typeId: { in: ['2', '3',], },
				},
			},),
			this.prismaService.currencyHistoryData.findMany(),
		],)
		log('initialPreparedSourceData', 'End',)
		return {
			clientsList,
			portfolios,
			drafts,
			currencyList,
			cryptoList,
			bonds,
			equities,
			etfs,
			metalList,
			assets,
			transactions,
			budgetPlans,
			equityIsins,
			costHistoryCurrencyList,
		}
	}

	public async handleClientListUpdateEvent(): Promise<void> {
		// const {portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList,assets, transactions, clientsList, budgetPlans,equityIsins,} = await this.initialPreparedSourceDataCBondsParted()
		const [
			assets,
			transactions,
			budgetPlans,
			currencyList,
			cryptoList,
			bonds,
			equities,
			etfs,
			metalList,
			equityIsins,
			costHistoryCurrencyList,
		] = await Promise.all([
			this.prismaService.asset.findMany({
				where: {
					isArchived: false,
					portfolio:  {
						is: {
							isActivated: true,
						},
					},
				},
				include: {
					portfolio: true,
					entity:    true,
					bank:      { include: { bankList: true, }, },
					account:   true,
				},
			},),
			this.prismaService.transaction.findMany({
				where: {
					portfolio: {
						isActivated: true,
					},
				},
				select: {
					amount:    true,
					currency:  true,
					clientId:  true,
					accountId: true,
					bankId:    true,
				},
			},),
			this.prismaService.budgetPlan.findMany({
				where: {
					client: {
						isActivated: true,
					},
				},
				include: {
					budgetPlanBankAccounts: {
						include: {
							bank:    {
								include: {
									assets: true,
								},
							},
							account: true,
						},
					},
					allocations: true,
					client:      true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			},),
			this.cBondsCurrencyService.getAllCurrencies(),
			this.prismaService.cryptoData.findMany(),
			this.prismaService.bond.findMany({
				select: {
					isin:               true,
					security:           true,
					marketPrice:        true,
					dirtyPriceCurrency: true,
					yield:              true,
					accrued:            true,
					tradeDate:          true,
					issuer:             true,
					nominalPrice:       true,
					maturityDate:       true,
					country:            true,
					sector:             true,
					coupon:             true,
					nextCouponDate:     true,
				},
			},),
			this.prismaService.equity.findMany({
				select: {
					isin:               true,
					ticker:             true,
					lastPrice:          true,
					currencyName:     true,
					emitentName:      true,
					stockCountryName: true,
					branchName:       true,
				},
			},),
			this.prismaService.etf.findMany({
				select: {
					isin:                    true,
					ticker:                  true,
					close:                   true,
					currencyName:            true,
					fundsName:               true,
					geographyInvestmentName: true,
					sectorName:              true,
				},
			},),
			this.cBondsCurrencyService.getAllMetalsWithHistory(),
			this.prismaService.isins.findMany({
				where: {
					typeId: { in: ['2', '3',], },
				},
			},),
			this.prismaService.currencyHistoryData.findMany(),
		],)
		const parsedAssets = this.parseAndFilterAssets(assets,)
		await Promise.all([
			// this.syncUpdatePortfolioListCache({portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList,},),
			// this.updateClientListCache({clientsList, currencyList, cryptoList, bonds, equities, etfs, metalList,},),
			this.updateOverviewCache({transactions, currencyList, cryptoList, bonds, equities, etfs, metalList, assets: parsedAssets,},),
			this.generateBudgetList({budgetPlans, currencyList, assets, transactions,cryptoList,bonds, equities, etfs,metalList,},),
			this.generateAssetCache({assets, bonds, equities, etfs, currencyList, equityIsins, transactions, cryptoList, metalList, costHistoryCurrencyList,},),
		],)
	}

	public async handleTransactionCreationEvent(data: THandleTransactionCreationEvent,): Promise<void> {
		const log = this.getTimestampLogger()
		log('handleTransactionCreationEvent', 'Start',)
		// const {portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList,assets, transactions, clientsList, budgetPlans,equityIsins,} = await this.initialPreparedSourceDataCBondsParted()
		const [
			assets,
			transactions,
			budgetPlans,
			currencyList,
			cryptoList,
			bonds,
			equities,
			etfs,
			metalList,
			equityIsins,
			costHistoryCurrencyList,
		] = await Promise.all([
			this.prismaService.asset.findMany({
				where: {
					isArchived: false,
					portfolio:  {
						is: {
							isActivated: true,
						},
					},
				},
				include: {
					portfolio: true,
					entity:    true,
					bank:      { include: { bankList: true, }, },
					account:   true,
				},
			},),
			this.prismaService.transaction.findMany({
				where: {
					portfolio: {
						isActivated: true,
					},
				},
				select: {
					amount:    true,
					currency:  true,
					clientId:  true,
					accountId: true,
					bankId:    true,
				},
			},),
			this.prismaService.budgetPlan.findMany({
				where: {
					client: {
						isActivated: true,
					},
				},
				include: {
					budgetPlanBankAccounts: {
						include: {
							bank:    {
								include: {
									assets: true,
								},
							},
							account: true,
						},
					},
					allocations: true,
					client:      true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			},),
			this.cBondsCurrencyService.getAllCurrencies(),
			this.prismaService.cryptoData.findMany(),
			this.prismaService.bond.findMany({
				select: {
					isin:               true,
					security:           true,
					marketPrice:        true,
					dirtyPriceCurrency: true,
					yield:              true,
					accrued:            true,
					tradeDate:          true,
					issuer:             true,
					nominalPrice:       true,
					maturityDate:       true,
					country:            true,
					sector:             true,
					coupon:             true,
					nextCouponDate:     true,
				},
			},),
			this.prismaService.equity.findMany({
				select: {
					isin:               true,
					ticker:             true,
					lastPrice:          true,
					currencyName:     true,
					emitentName:      true,
					stockCountryName: true,
					branchName:       true,
				},
			},),
			this.prismaService.etf.findMany({
				select: {
					isin:                    true,
					ticker:                  true,
					close:                   true,
					currencyName:            true,
					fundsName:               true,
					geographyInvestmentName: true,
					sectorName:              true,
				},
			},),
			this.cBondsCurrencyService.getAllMetalsWithHistory(),
			this.prismaService.isins.findMany({
				where: {
					typeId: { in: ['2', '3',], },
				},
			},),
			this.prismaService.currencyHistoryData.findMany(),
		],)
		const parsedAssets = this.parseAndFilterAssets(assets,)
		const {assetName,} = data
		await Promise.all([
			this.updateOverviewCache({transactions, currencyList, cryptoList, bonds, equities, etfs, metalList, assets: parsedAssets,},),
			this.generateBudgetList({budgetPlans, currencyList, assets, transactions,cryptoList,bonds, equities, etfs,metalList,},),
			this.updateAssetCacheWithPreparedData({assets, transactions, bonds, equities, etfs, currencyList, cryptoList, metalList, equityIsins, assetName, costHistoryCurrencyList,},),
			// this.updateClientListCache({clientsList, currencyList, cryptoList, bonds, equities, etfs, metalList,},),
			// this.syncUpdatePortfolioListCache({portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList,},),
			// this.portfoliosDetailsCacheUpdateWithPreparedData({currencyList,cryptoList,bonds, equities, etfs, transactions, metalList, portfolioId,},),
		],)
		log('handleTransactionCreationEvent', 'End',)
	}

	public async handleAssetCreationEvent(data: THandleAssetCreationEvent,): Promise<void> {
		const log = this.getTimestampLogger()
		log('handleAssetCreationEvent', 'Start',)
		// const {portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList,assets, transactions, clientsList, budgetPlans,equityIsins,} = await this.initialPreparedSourceDataCBondsParted()
		const [
			assets,
			transactions,
			budgetPlans,
			currencyList,
			cryptoList,
			bonds,
			equities,
			etfs,
			metalList,
			equityIsins,
			costHistoryCurrencyList,
		] = await Promise.all([
			this.prismaService.asset.findMany({
				where: {
					isArchived: false,
					portfolio:  {
						is: {
							isActivated: true,
						},
					},
				},
				include: {
					portfolio: true,
					entity:    true,
					bank:      { include: { bankList: true, }, },
					account:   true,
				},
			},),
			this.prismaService.transaction.findMany({
				where: {
					portfolio: {
						isActivated: true,
					},
				},
				select: {
					amount:    true,
					currency:  true,
					clientId:  true,
					accountId: true,
					bankId:    true,
				},
			},),
			this.prismaService.budgetPlan.findMany({
				where: {
					client: {
						isActivated: true,
					},
				},
				include: {
					budgetPlanBankAccounts: {
						include: {
							bank:    {
								include: {
									assets: true,
								},
							},
							account: true,
						},
					},
					allocations: true,
					client:      true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			},),
			this.cBondsCurrencyService.getAllCurrencies(),
			this.prismaService.cryptoData.findMany(),
			this.prismaService.bond.findMany({
				select: {
					isin:               true,
					security:           true,
					marketPrice:        true,
					dirtyPriceCurrency: true,
					yield:              true,
					accrued:            true,
					tradeDate:          true,
					issuer:             true,
					nominalPrice:       true,
					maturityDate:       true,
					country:            true,
					sector:             true,
					coupon:             true,
					nextCouponDate:     true,
				},
			},),
			this.prismaService.equity.findMany({
				select: {
					isin:               true,
					ticker:             true,
					lastPrice:          true,
					currencyName:     true,
					emitentName:      true,
					stockCountryName: true,
					branchName:       true,
				},
			},),
			this.prismaService.etf.findMany({
				select: {
					isin:                    true,
					ticker:                  true,
					close:                   true,
					currencyName:            true,
					fundsName:               true,
					geographyInvestmentName: true,
					sectorName:              true,
				},
			},),
			this.cBondsCurrencyService.getAllMetalsWithHistory(),
			this.prismaService.isins.findMany({
				where: {
					typeId: { in: ['2', '3',], },
				},
			},),
			this.prismaService.currencyHistoryData.findMany(),
		],)

		const parsedAssets = this.parseAndFilterAssets(assets,)

		const {assetName,} = data

		await Promise.all([
			this.updateAssetCacheWithPreparedData({assets, transactions, bonds, equities, etfs, costHistoryCurrencyList, currencyList, cryptoList, metalList, equityIsins, assetName,},),
			this.updateOverviewCache({transactions, currencyList, cryptoList, bonds, equities, etfs, metalList, assets: parsedAssets,},),
			this.generateBudgetList({budgetPlans, currencyList, assets, transactions,cryptoList,bonds, equities, etfs,metalList,},),
			// this.updateClientListCache({clientsList, currencyList, cryptoList, bonds, equities, etfs, metalList,},),
			// this.syncUpdatePortfolioListCache({portfolios,drafts,currencyList,cryptoList,bonds, equities, etfs,metalList,},),
			// portfolioId && this.portfoliosDetailsCacheUpdateWithPreparedData({currencyList,cryptoList,bonds, equities, etfs, transactions, metalList, portfolioId,},),
		].filter(Boolean,),)
		log('handleAssetCreationEvent', 'End',)
	}

	/**
 		* Parses and filters a list of raw asset objects, returning only valid parsed assets.
 		*
 		* @template T - The expected asset type after parsing (must extend UnionAssetType).
 		* @param assets - An array of raw extended asset objects to be parsed.
 		* @returns An array of parsed and non-null assets of type T.
 		*
 		* This function uses a generic `assetParser<T>` to convert each raw asset into its typed form.
 		* Assets that fail to parse (return null) are filtered out from the result.
	*/
	public parseAndFilterAssets<T extends UnionAssetType = UnionAssetType>(assets: Array<TAssetExtended>,): Array<T> {
		const parsedAssets = assets
			.map((asset,) => {
				const parsedAsset = assetParser<T>(asset,)
				if (!parsedAsset) {
					return null
				}
				return parsedAsset
			},)
			.filter((item,): item is T => {
				return item !== null
			},)
		return parsedAssets
	}

	private getTimestampLogger = (): ((functionName: string, label: string) => void) => {
		const start = performance.now()
		return (functionName: string, label: string,): void => {
			const now = performance.now()
			this.logger.warn(`[CacheSyncService-${functionName}]: [${label}] ${Math.round(now - start,)} ms`,)
		}
	}
}