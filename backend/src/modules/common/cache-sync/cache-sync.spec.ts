/* eslint-disable max-lines */
/* eslint-env jest */
/* eslint-disable @typescript-eslint/unbound-method */

import type { TestingModule, } from '@nestjs/testing'
import { Test, } from '@nestjs/testing'
import { CacheUpdateService, } from './cache-sync.service'
import { PrismaService, } from 'nestjs-prisma'
import { RedisCacheService, } from '../../redis-cache/redis-cache.service'
import { PortfolioService, } from '../../portfolio/services'
import {
	BondAssetService,
	CashService,
	CryptoAssetService,
	DepositService,
	EquityAssetService,
	LoanAssetService,
	MetalsService,
	OptionsService,
	OtherInvestmentsService,
	OverviewService,
	PrivateEquityAssetService,
	RealEstateService,
} from '../../analytics/services'
import { ClientService, } from '../../client/services/client.service'
import { BudgetService, } from '../../budget/services'
import { CBondsCurrencyService, } from '../../apis/cbonds-api/services/currency.service'
import { AssetNamesType, } from '../../asset/asset.types'
import {
	bondFilter,
	cashFilters,
	cryptoCurrencyFilter,
	cryptoFilter,
	depositCurrencyFilter,
	depositFilter,
	equityFilter,
	getClientsFilter,
	getPortfoliosFilter,
	loanCurrencyFilter,
	loanFilter,
	metalCurrencyFilter,
	metalFilter,
	optionsFilter,
	otherCurrencyFilter,
	otherFilter,
	privateCurrencyFilter,
	privateFilter,
	realEstateFilter,
} from './cache-sync.constants'
import { PortfolioRoutes, } from '../../portfolio/portfolio.constants'
import type { IPortfoliosThirdPartyListCBondsParted, } from '../../portfolio/portfolio.types'
import type { TAssetCacheInitials, TBondInitials, TCacheInitials, TClientListCache, TCryptoInitials, TEquityInitials, TMetalAssetCache, TOverviewInitials, } from './cache-sync.types'
import { AnalyticsRoutes, } from '../../analytics/analytics.constants'
import { ClientRoutes, } from '../../client/client.constants'
import type { TSyncGetBudgets, } from '../../budget/budget.types'
import { BudgetRoutes, } from '../../budget/budget.constants'
import { ClientRepository, } from '../../../repositories/client/client.repository'

const createMockService = (methods: Array<string> = [],): Record<string, jest.Mock> => {
	return methods.reduce<Record<string, jest.Mock>>((acc, method,) => {
		acc[method] = jest.fn().mockResolvedValue(undefined,)
		return acc
	}, {},)
}

/**
	* Task - 8.5
	* Runs the full cache update pipeline for all clients, invoking all dependent analytics and overview update methods.
	* @remarks
	* Ensures that all relevant data (portfolios, assets, transactions, currencies, etc.) is processed and cached.
	* Also verifies that errors during data preparation are logged correctly.
*/
describe('CacheUpdateService - routesWithTotalsCacheUpdate', () => {
	let service: CacheUpdateService

	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: RedisCacheService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: createMockService(['updateBondAnalytics',],), },
				{ provide: EquityAssetService, useValue: createMockService(['updateEquityAnalytics',],), },
				{ provide: CashService, useValue: createMockService(['updateCashAnalytics',],), },
				{ provide: CryptoAssetService, useValue: createMockService(['updateCryptoAnalytics',],), },
				{ provide: DepositService, useValue: createMockService(['updateDepositAnalytics',],), },
				{ provide: LoanAssetService, useValue: createMockService(['updateLoanAnalytics',],), },
				{ provide: MetalsService, useValue: createMockService(['updateMetalAnalytics',],), },
				{ provide: OptionsService, useValue: createMockService(['updateOptionsAnalytics',],), },
				{ provide: OtherInvestmentsService, useValue: createMockService(['updateOtherAnalytics',],), },
				{ provide: PrivateEquityAssetService, useValue: createMockService(['updatePEAnalytics',],), },
				{ provide: RealEstateService, useValue: createMockService(['updateRealEstateAnalytics',],), },
				{ provide: BudgetService, useValue: createMockService(['generateBudgetList',],), },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)

		jest.spyOn(service, 'initialPreparedSourceDataCBondsParted',).mockResolvedValue({
			portfolios:   [], drafts:       [], currencyList: [], cryptoList:   [],
			bonds:        [], equities:     [], etfs:         [], metalList:    [],
			assets:       [], transactions: [], equityIsins:  [],
			clientsList:  { list: [], total: 0, },
			budgetPlans:  [],
		},)
		jest.spyOn(service, 'parseAndFilterAssets',).mockReturnValue([],)
		const serviceMethods = [
			'syncUpdatePortfolioListCache',
			'updateClientListCache',
			'generateBudgetList',
			'updateOverviewCache',
			'updateBondAnalytics',
			'updateEquityAnalytics',
			'updateCashAnalytics',
			'updateCryptoAnalytics',
			'updateDepositAnalytics',
			'updateLoanAnalytics',
			'updateMetalAnalytics',
			'updateOptionsAnalytics',
			'updateOtherAnalytics',
			'updatePEAnalytics',
			'updateRealEstateAnalytics',
			'initialPortfoliosDetailsUpdate',
		] as const
		serviceMethods.forEach((method,) => {
			return jest.spyOn(service, method,).mockResolvedValue(undefined,)
		},)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should run full pipeline without errors', async() => {
		await service.routesWithTotalsCacheUpdate()

		const calledMethods = [
			'initialPreparedSourceDataCBondsParted',
			'parseAndFilterAssets',
			'syncUpdatePortfolioListCache',
			'updateClientListCache',
			'generateBudgetList',
			'updateOverviewCache',
			'updateBondAnalytics',
			'updateEquityAnalytics',
			'updateCashAnalytics',
			'updateCryptoAnalytics',
			'updateDepositAnalytics',
			'updateLoanAnalytics',
			'updateMetalAnalytics',
			'updateOptionsAnalytics',
			'updateOtherAnalytics',
			'updatePEAnalytics',
			'updateRealEstateAnalytics',
			'initialPortfoliosDetailsUpdate',
		] as const

		calledMethods.forEach((method,) => {
			expect(service[method],).toHaveBeenCalled()
		},)
	},)

	it('should catch error and log it', async() => {
		(service.initialPreparedSourceDataCBondsParted as jest.Mock).mockRejectedValueOnce(new Error('boom',),)
		await service.routesWithTotalsCacheUpdate()
		expect(service.logger.error,).toHaveBeenCalledWith(
			'[CacheSync]: RoutesWithTotalsCacheUpdate:',
			expect.any(Error,),
		)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.routesForClientsUpdate
 * @remarks
 * - Mocks PrismaService, CBondsCurrencyService, and other dependent services.
 * - Spies on internal methods to ensure they are called correctly.
 * - Verifies full update pipeline runs without errors.
 * - Confirms proper error logging when Prisma fails.
 */
describe('CacheUpdateService - routesForClientsUpdate', () => {
	let service: CacheUpdateService
	const prismaMock = {
		user:        { findMany: jest.fn().mockResolvedValue([{ clientId: 1, },],), },
		transaction: { findMany: jest.fn().mockResolvedValue([],), },
		cryptoData:  { findMany: jest.fn().mockResolvedValue([],), },
		bond:        { findMany: jest.fn().mockResolvedValue([],), },
		equity:      { findMany: jest.fn().mockResolvedValue([],), },
		etf:         { findMany: jest.fn().mockResolvedValue([],), },
		asset:       { findMany: jest.fn().mockResolvedValue([],), },
		isins:       { findMany: jest.fn().mockResolvedValue([],), },
	}

	beforeEach(async() => {
		jest.clearAllMocks()

		const cBondsCurrencyServiceMock = createMockService(['getAllCurrencies', 'getAllMetalsWithHistory',],)

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaMock, },
				{ provide: ClientRepository, useValue: createMockService([],), },
				{ provide: RedisCacheService, useValue: createMockService([],), },
				{ provide: CBondsCurrencyService, useValue: cBondsCurrencyServiceMock, },
				{ provide: PortfolioService, useValue: createMockService([],), },
				{ provide: OverviewService, useValue: createMockService(['updateOverviewCache',],), },
				{ provide: ClientService, useValue: createMockService([],), },
				{ provide: BondAssetService, useValue: createMockService(['updateBondAnalytics',],), },
				{ provide: EquityAssetService, useValue: createMockService(['updateEquityAnalytics',],), },
				{ provide: CashService, useValue: createMockService(['updateCashAnalytics',],), },
				{ provide: CryptoAssetService, useValue: createMockService(['updateCryptoAnalytics',],), },
				{ provide: DepositService, useValue: createMockService(['updateDepositAnalytics',],), },
				{ provide: LoanAssetService, useValue: createMockService(['updateLoanAnalytics',],), },
				{ provide: MetalsService, useValue: createMockService(['updateMetalAnalytics',],), },
				{ provide: OptionsService, useValue: createMockService(['updateOptionsAnalytics',],), },
				{ provide: OtherInvestmentsService, useValue: createMockService(['updateOtherAnalytics',],), },
				{ provide: PrivateEquityAssetService, useValue: createMockService(['updatePEAnalytics',],), },
				{ provide: RealEstateService, useValue: createMockService(['updateRealEstateAnalytics',],), },
				{ provide: BudgetService, useValue: createMockService([],), },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)

		jest.spyOn(service, 'parseAndFilterAssets',).mockReturnValue([],)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)

		const serviceMethods = [
			'syncUpdatePortfolioListCache',
			'updateClientListCache',
			'generateBudgetList',
			'updateOverviewCache',
			'updateBondAnalytics',
			'updateEquityAnalytics',
			'updateCashAnalytics',
			'updateCryptoAnalytics',
			'updateDepositAnalytics',
			'updateLoanAnalytics',
			'updateMetalAnalytics',
			'updateOptionsAnalytics',
			'updateOtherAnalytics',
			'updatePEAnalytics',
			'updateRealEstateAnalytics',
			'initialPortfoliosDetailsUpdate',
		] as const

		serviceMethods.forEach((method,) => {
			jest.spyOn(service, method,).mockResolvedValue(undefined,)
		},)
	},)

	it('should run full pipeline without errors', async() => {
		await service.routesForClientsUpdate()

		expect(prismaMock.user.findMany,).toHaveBeenCalled()
		expect(service.updateBondAnalytics,).toHaveBeenCalledWith(expect.any(Object,), 1,)
		expect(service.updateEquityAnalytics,).toHaveBeenCalledWith(expect.any(Object,), 1,)
		expect(service.updateCashAnalytics,).toHaveBeenCalledWith(expect.any(Object,), 1,)
		expect(service.updateOverviewCache,).toHaveBeenCalledWith(expect.any(Object,), 1,)
	},)

	it('should catch error and log it', async() => {
		prismaMock.user.findMany.mockRejectedValueOnce(new Error('boom',),)

		await service.routesForClientsUpdate()

		expect(service['logger'].error,).toHaveBeenCalledWith(
			'[CacheSync]: RoutesForClientsUpdateError:',
			expect.any(Error,),
		)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.initialPortfoliosDetailsUpdate
 * @remarks
 * - Mocks PrismaService and PortfolioService for controlled test data.
 * - Ensures the full portfolio details update pipeline runs without errors.
 * - Verifies proper error logging when Prisma query fails.
 */
describe('CacheUpdateService - initialPortfoliosDetailsUpdate', () => {
	let service: CacheUpdateService

	beforeEach(async() => {
		jest.clearAllMocks()

		const prismaMock = {
			portfolio: {
				findMany: jest.fn().mockResolvedValue([],),
			},
		}
		const portfolioServiceMock = {
			syncGetPortfolioDetailsById: jest.fn(),
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaMock, },
				{ provide: PortfolioService, useValue: portfolioServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: RedisCacheService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)

		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should run full pipeline without errors', async() => {
		const data = {
			currencyList: [],
			cryptoList:   [],
			bonds:        [],
			equities:     [],
			etfs:         [],
			transactions: [],
			metalList:    [],
		}
		await service.initialPortfoliosDetailsUpdate(data,)

		expect(service['prismaService'].portfolio.findMany,).toHaveBeenCalled()
		expect(service['logger'].error,).not.toHaveBeenCalled()
	},)

	it('should catch error and log it', async() => {
		(service['prismaService'].portfolio.findMany as jest.Mock).mockRejectedValueOnce(new Error('boom',),)

		const data = {
			currencyList: [],
			cryptoList:   [],
			bonds:        [],
			equities:     [],
			etfs:         [],
			transactions: [],
			metalList:    [],
		}

		await service.initialPortfoliosDetailsUpdate(data,)

		expect(service['logger'].error,).toHaveBeenCalledWith(
			'[CacheSync]: InitialPortfoliosDetailsUpdateError:',
			expect.any(Error,),
		)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.generatePortfoliosDetailsCache
 * @remarks
 * - Mocks PrismaService, PortfolioService, and RedisCacheService for controlled test data.
 * - Ensures the full portfolio details cache generation pipeline runs without errors.
 * - Verifies proper caching and that errors are logged when Prisma query fails.
 */
describe('CacheUpdateService - generatePortfoliosDetailsCache', () => {
	let service: CacheUpdateService

	beforeEach(async() => {
		jest.clearAllMocks()

		const prismaMock = {
			portfolio: {
				findUnique: jest.fn().mockResolvedValue({
					id:        '1',
					documents: [],
					entities:  [],
					banks:     [],
					accounts:  [],
					assets:    [],
					client:    { firstName: 'John', lastName: 'Doe', },
				},),
			},
		}
		const portfolioServiceMock = {
			syncGetPortfolioDetailsById: jest.fn().mockReturnValue({ some: 'cacheData', },),
		}
		const cacheServiceMock = {
			generateKey: jest.fn().mockReturnValue('cache-key',),
			set:         jest.fn().mockResolvedValue(undefined,),
		}
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaMock, },
				{ provide: PortfolioService, useValue: portfolioServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should run full pipeline without errors', async() => {
		const data = {
			currencyList: [],
			cryptoList:   [],
			bonds:        [],
			equities:     [],
			etfs:         [],
			transactions: [],
			metalList:    [],
		}

		await service.generatePortfoliosDetailsCache('1', data,)

		expect(service['prismaService'].portfolio.findUnique,).toHaveBeenCalled()
		expect(service['portfolioService'].syncGetPortfolioDetailsById,).toHaveBeenCalled()
		expect(service['cacheService'].set,).toHaveBeenCalled()
		expect(service['logger'].error,).not.toHaveBeenCalled()
	},)
	it('should catch error and log it', async() => {
		(service['prismaService'].portfolio.findUnique as jest.Mock).mockRejectedValueOnce(new Error('boom',),)
		const data = {
			currencyList: [],
			cryptoList:   [],
			bonds:        [],
			equities:     [],
			etfs:         [],
			transactions: [],
			metalList:    [],
		}

		await service.generatePortfoliosDetailsCache('1', data,)

		expect(service['logger'].error,).toHaveBeenCalledWith(
			'[CacheSync]: GeneratePortfoliosDetailsCacheError:',
			expect.any(Error,),
		)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.restoreCache
 * @remarks
 * - Mocks dependencies and spies on internal methods to control pipeline execution.
 * - Ensures full cache restoration pipeline runs correctly with and without specific parameters.
 * - Verifies conditional calls to generateAssetCache and generatePortfoliosDetailsCache.
 * - Confirms proper error logging when any part of the pipeline fails.
 */
describe('CacheUpdateService - restoreCache', () => {
	let service: CacheUpdateService

	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: PortfolioService, useValue: { syncGetPortfolioDetailsById: jest.fn(), }, },
				{ provide: RedisCacheService, useValue: {}, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)

		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)

		jest.spyOn(service, 'initialPreparedSourceDataCBondsParted',).mockResolvedValue({
			portfolios:   [],
			drafts:       [],
			currencyList: [],
			cryptoList:   [],
			bonds:        [],
			equities:     [],
			etfs:         [],
			metalList:    [],
			assets:       [],
			transactions: [],
			clientsList:  {list: [], total: 0, },
			budgetPlans:  [],
			equityIsins:  [],
		},)
		jest.spyOn(service, 'parseAndFilterAssets',).mockReturnValue([],)
		jest.spyOn(service, 'syncUpdatePortfolioListCache',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateOverviewCache',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateClientListCache',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'generateBudgetList',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'generateAssetCache',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'generatePortfoliosDetailsCache',).mockResolvedValue(undefined,)
	},)

	it('should run full pipeline without errors', async() => {
		await service.restoreCache()

		expect(service.initialPreparedSourceDataCBondsParted,).toHaveBeenCalled()
		expect(service.parseAndFilterAssets,).toHaveBeenCalled()
		expect(service.syncUpdatePortfolioListCache,).toHaveBeenCalled()
		expect(service.updateOverviewCache,).toHaveBeenCalled()
		expect(service.updateClientListCache,).toHaveBeenCalled()
		expect(service.generateBudgetList,).toHaveBeenCalled()
		expect(service.generateAssetCache,).not.toHaveBeenCalled()
		expect(service.generatePortfoliosDetailsCache,).not.toHaveBeenCalled()
		expect(service['logger'].error,).not.toHaveBeenCalled()
	},)

	it('should call generateAssetCache if assetName is provided', async() => {
		await service.restoreCache(AssetNamesType.BONDS,)

		expect(service.generateAssetCache,).toHaveBeenCalledWith(
			expect.objectContaining({},),
			AssetNamesType.BONDS,
		)
	},)

	it('should call generatePortfoliosDetailsCache if portfolioId is provided', async() => {
		await service.restoreCache(undefined, '123',)

		expect(service.generatePortfoliosDetailsCache,).toHaveBeenCalledWith(
			'123',
			expect.objectContaining({},),
		)
	},)

	it('should catch error and log it', async() => {
		jest.spyOn(service, 'initialPreparedSourceDataCBondsParted',).mockRejectedValueOnce(new Error('boom',),)

		await service.restoreCache()

		expect(service['logger'].error,).toHaveBeenCalledWith(
			'[CacheSync]: RestoreCacheError:',
			expect.any(Error,),
		)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.restorePortfolioListCache
 * @remarks
 * - Mocks PrismaService, CBondsCurrencyService, and RedisCacheService for controlled test data.
 * - Ensures full portfolio list restoration pipeline runs without errors.
 * - Verifies proper calls to asset generation and portfolio list update methods.
 * - Confirms error logging when Prisma queries fail.
 */
describe('CacheUpdateService - restorePortfolioListCache', () => {
	let service: CacheUpdateService

	beforeEach(async() => {
		jest.clearAllMocks()

		const prismaMock = {
			portfolio:      { findMany: jest.fn().mockResolvedValue([],), },
			portfolioDraft: { findMany: jest.fn().mockResolvedValue([],), },
			cryptoData:     { findMany: jest.fn().mockResolvedValue([],), },
			bond:           { findMany: jest.fn().mockResolvedValue([],), },
			equity:         { findMany: jest.fn().mockResolvedValue([],), },
			etf:            { findMany: jest.fn().mockResolvedValue([],), },
			isins:          { findMany: jest.fn().mockResolvedValue([],), },
			transaction:    { findMany: jest.fn().mockResolvedValue([],), },
			asset:          { findMany: jest.fn().mockResolvedValue([],), },
		}
		const cBondsCurrencyMock = {
			getAllCurrencies:        jest.fn().mockResolvedValue([],),
			getAllMetalsWithHistory: jest.fn().mockResolvedValue([],),
		}
		const redisCacheMock = {
			set: jest.fn().mockResolvedValue(undefined,),
			get: jest.fn().mockResolvedValue(undefined,),
		}
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaMock, },
				{ provide: RedisCacheService, useValue: redisCacheMock, },
				{ provide: CBondsCurrencyService, useValue: cBondsCurrencyMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.spyOn(service, 'generateAssetCache',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'syncUpdatePortfolioListCache',).mockResolvedValue(undefined,)
	},)

	it('should run full pipeline without errors', async() => {
		await service.restorePortfolioListCache()

		expect(service['prismaService'].portfolio.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].portfolioDraft.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].cryptoData.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].bond.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].equity.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].etf.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].isins.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].transaction.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].asset.findMany,).toHaveBeenCalled()
		expect(service['cBondsCurrencyService'].getAllCurrencies,).toHaveBeenCalled()
		expect(service['cBondsCurrencyService'].getAllMetalsWithHistory,).toHaveBeenCalled()
		expect(service.generateAssetCache,).toHaveBeenCalled()
		expect(service.syncUpdatePortfolioListCache,).toHaveBeenCalled()
		expect(service['logger'].error,).not.toHaveBeenCalled()
	},)

	it('should catch error and log it', async() => {
		(service['prismaService'].portfolio.findMany as jest.Mock).mockRejectedValueOnce(new Error('boom',),)

		await service.restorePortfolioListCache()

		expect(service['logger'].error,).toHaveBeenCalledWith(
			'[RestorePortfolioListCacheError]:',
			expect.any(Error,),
		)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.restoreClientListCache
 * @remarks
 * - Mocks PrismaService, ClientService, CBondsCurrencyService, and ClientRepository for controlled test data.
 * - Ensures full client list restoration pipeline runs without errors.
 * - Verifies proper calls to asset generation and client list update methods.
 * - Confirms error logging when any dependency fails.
 */
describe('CacheUpdateService - restoreClientListCache', () => {
	let service: CacheUpdateService
	const clientServiceMock = {
		getClients: jest.fn().mockResolvedValue([],),
	}
	const cBondsCurrencyServiceMock = {
		getAllCurrencies:        jest.fn().mockResolvedValue([],),
		getAllMetalsWithHistory: jest.fn().mockResolvedValue([],),
	}
	const clientRepositoryServiceMock = {
		getAllClients:     jest.fn().mockResolvedValue([],),
	}
	beforeEach(async() => {
		jest.clearAllMocks()

		const prismaMock = {
			cryptoData:   { findMany: jest.fn().mockResolvedValue([],), },
			bond:         { findMany: jest.fn().mockResolvedValue([],), },
			equity:       { findMany: jest.fn().mockResolvedValue([],), },
			etf:          { findMany: jest.fn().mockResolvedValue([],), },
			isins:        { findMany: jest.fn().mockResolvedValue([],), },
			transaction:  { findMany: jest.fn().mockResolvedValue([],), },
			asset:        { findMany: jest.fn().mockResolvedValue([],), },
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaMock, },
				{ provide: ClientService, useValue: clientServiceMock, },
				{ provide: CBondsCurrencyService, useValue: cBondsCurrencyServiceMock, },
				{ provide: ClientRepository, useValue: clientRepositoryServiceMock, },
				{ provide: RedisCacheService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)

		jest.spyOn(service, 'generateAssetCache',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateClientListCache',).mockResolvedValue(undefined,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should run full pipeline without errors', async() => {
		await service.restoreClientListCache()

		expect(clientRepositoryServiceMock.getAllClients,).toHaveBeenCalled()
		expect(service['cBondsCurrencyService'].getAllCurrencies,).toHaveBeenCalled()
		expect(service['prismaService'].cryptoData.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].bond.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].equity.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].etf.findMany,).toHaveBeenCalled()
		expect(service['cBondsCurrencyService'].getAllMetalsWithHistory,).toHaveBeenCalled()
		expect(service['prismaService'].isins.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].transaction.findMany,).toHaveBeenCalled()
		expect(service['prismaService'].asset.findMany,).toHaveBeenCalled()

		expect(service.generateAssetCache,).toHaveBeenCalled()
		expect(service.updateClientListCache,).toHaveBeenCalled()
		expect(service['logger'].error,).not.toHaveBeenCalled()
	},)

	it('should catch error and log it', async() => {
		(clientRepositoryServiceMock.getAllClients).mockRejectedValueOnce(new Error('boom',),)

		await service.restoreClientListCache()

		expect(service['logger'].error,).toHaveBeenCalledWith(
			'[RestoreClientListCacheError]:',
			expect.any(Error,),
		)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.restoreClientListWithPortfoliosCache
 * @remarks
 * - Mocks PrismaService, ClientService, CBondsCurrencyService, and ClientRepository for controlled test data.
 * - Ensures full client list with portfolios restoration pipeline runs without errors.
 * - Verifies proper calls to asset generation, client list update, and portfolio list update methods.
 * - Confirms error logging when any dependency fails and prevents further pipeline execution.
 */
describe('CacheUpdateService - restoreClientListWithPortfoliosCache', () => {
	let service: CacheUpdateService

	const prismaMock = {
		asset:           { findMany: jest.fn(), },
		portfolio:       { findMany: jest.fn(), },
		portfolioDraft:  { findMany: jest.fn(), },
		cryptoData:      { findMany: jest.fn(), },
		bond:            { findMany: jest.fn(), },
		equity:          { findMany: jest.fn(), },
		etf:             { findMany: jest.fn(), },
		isins:           { findMany: jest.fn(), },
		transaction:     { findMany: jest.fn(), },
	}
	const clientServiceMock = { getClients: jest.fn(), }
	const cBondsCurrencyServiceMock = {
		getAllCurrencies:        jest.fn(),
		getAllMetalsWithHistory: jest.fn(),
	}
	const clientRepositoryServiceMock = {
		getAllClients:     jest.fn().mockResolvedValue([],),
	}
	beforeEach(async() => {
		jest.clearAllMocks()

		prismaMock.asset.findMany.mockResolvedValue([],)
		prismaMock.portfolio.findMany.mockResolvedValue([],)
		prismaMock.portfolioDraft.findMany.mockResolvedValue([],)
		prismaMock.cryptoData.findMany.mockResolvedValue([],)
		prismaMock.bond.findMany.mockResolvedValue([],)
		prismaMock.equity.findMany.mockResolvedValue([],)
		prismaMock.etf.findMany.mockResolvedValue([],)
		prismaMock.isins.findMany.mockResolvedValue([],)
		prismaMock.transaction.findMany.mockResolvedValue([],)

		clientServiceMock.getClients.mockResolvedValue([],)
		cBondsCurrencyServiceMock.getAllCurrencies.mockResolvedValue([],)
		cBondsCurrencyServiceMock.getAllMetalsWithHistory.mockResolvedValue([],)

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaMock, },
				{ provide: ClientService, useValue: clientServiceMock, },
				{ provide: CBondsCurrencyService, useValue: cBondsCurrencyServiceMock, },
				{ provide: ClientRepository, useValue: clientRepositoryServiceMock, },
				{ provide: RedisCacheService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)

		jest.spyOn(service, 'updateClientListCache',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'generateAssetCache',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'syncUpdatePortfolioListCache',).mockResolvedValue(undefined,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should run full pipeline without errors', async() => {
		await service.restoreClientListWithPortfoliosCache()

		expect(prismaMock.asset.findMany,).toHaveBeenCalled()
		expect(prismaMock.portfolio.findMany,).toHaveBeenCalled()
		expect(prismaMock.portfolioDraft.findMany,).toHaveBeenCalled()
		expect(cBondsCurrencyServiceMock.getAllCurrencies,).toHaveBeenCalled()
		expect(prismaMock.cryptoData.findMany,).toHaveBeenCalled()
		expect(prismaMock.bond.findMany,).toHaveBeenCalled()
		expect(prismaMock.equity.findMany,).toHaveBeenCalled()
		expect(prismaMock.etf.findMany,).toHaveBeenCalled()
		expect(cBondsCurrencyServiceMock.getAllMetalsWithHistory,).toHaveBeenCalled()
		expect(clientRepositoryServiceMock.getAllClients,).toHaveBeenCalled()
		expect(prismaMock.isins.findMany,).toHaveBeenCalled()
		expect(prismaMock.transaction.findMany,).toHaveBeenCalled()
		expect(service.updateClientListCache,).toHaveBeenCalled()
		expect(service.generateAssetCache,).toHaveBeenCalled()
		expect(service.syncUpdatePortfolioListCache,).toHaveBeenCalled()
		expect(service['logger'].error,).not.toHaveBeenCalled()
	},)

	it('should catch error and log it', async() => {
		clientRepositoryServiceMock.getAllClients.mockRejectedValueOnce(new Error('boom',),)

		await service.restoreClientListWithPortfoliosCache()

		expect(service['logger'].error,).toHaveBeenCalledWith(
			'[RestoreClientListWithPortfoliosCacheError]:',
			expect.any(Error,),
		)
		expect(service.updateClientListCache,).not.toHaveBeenCalled()
		expect(service.generateAssetCache,).not.toHaveBeenCalled()
		expect(service.syncUpdatePortfolioListCache,).not.toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.generateAssetCache
 * @remarks
 * - Verifies that analytics methods for all asset types are called when no specific assetName is provided.
 * - Ensures that only the relevant analytics method is called when a specific assetName (e.g., BONDS) is provided.
 * - Confirms proper error logging when any analytics method throws an error.
 * - Mocks all dependent services and logger for controlled test execution.
 */
describe('CacheUpdateService - generateAssetCache', () => {
	let service: CacheUpdateService

	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: RedisCacheService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)

		jest.spyOn(service, 'updateBondAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateEquityAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateCashAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateCryptoAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateDepositAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateLoanAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateMetalAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateOptionsAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateOtherAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updatePEAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateRealEstateAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	const baseData = {
		assets:       [],
		bonds:        [],
		equities:     [],
		etfs:         [],
		currencyList: [],
		equityIsins:  [],
		transactions: [],
		cryptoList:   [],
		metalList:    [],
	}

	it('should call all analytics if assetName not provided', async() => {
		await service.generateAssetCache(baseData,)

		expect(service.updateBondAnalytics,).toHaveBeenCalled()
		expect(service.updateEquityAnalytics,).toHaveBeenCalled()
		expect(service.updateCashAnalytics,).toHaveBeenCalled()
		expect(service.updateCryptoAnalytics,).toHaveBeenCalled()
		expect(service.updateDepositAnalytics,).toHaveBeenCalled()
		expect(service.updateLoanAnalytics,).toHaveBeenCalled()
		expect(service.updateMetalAnalytics,).toHaveBeenCalled()
		expect(service.updateOptionsAnalytics,).toHaveBeenCalled()
		expect(service.updateOtherAnalytics,).toHaveBeenCalled()
		expect(service.updatePEAnalytics,).toHaveBeenCalled()
		expect(service.updateRealEstateAnalytics,).toHaveBeenCalled()
		expect(service['logger'].error,).not.toHaveBeenCalled()
	},)

	it('should call only updateBondAnalytics when assetName = BONDS', async() => {
		await service.generateAssetCache(baseData, AssetNamesType.BONDS,)

		expect(service.updateBondAnalytics,).toHaveBeenCalled()
		expect(service.updateEquityAnalytics,).not.toHaveBeenCalled()
		expect(service.updateCashAnalytics,).not.toHaveBeenCalled()
		expect(service.updateCryptoAnalytics,).not.toHaveBeenCalled()
		expect(service.updateDepositAnalytics,).not.toHaveBeenCalled()
		expect(service.updateLoanAnalytics,).not.toHaveBeenCalled()
		expect(service.updateMetalAnalytics,).not.toHaveBeenCalled()
		expect(service.updateOptionsAnalytics,).not.toHaveBeenCalled()
		expect(service.updateOtherAnalytics,).not.toHaveBeenCalled()
		expect(service.updatePEAnalytics,).not.toHaveBeenCalled()
		expect(service.updateRealEstateAnalytics,).not.toHaveBeenCalled()
	},)

	it('should log error if analytics throws', async() => {
		(service.updateBondAnalytics as jest.Mock).mockRejectedValueOnce(new Error('boom',),)

		await service.generateAssetCache(baseData, AssetNamesType.BONDS,)

		expect(service['logger'].error,).toHaveBeenCalledWith(
			'[GenerateAssetCacheError]:',
			expect.any(Error,),
		)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateAssetCache
 * @remarks
 * - Verifies that the appropriate analytics method is called when a specific assetName is provided.
 * - Ensures updateOverviewCache is called when a clientId is provided.
 * - Confirms proper error logging if Prisma queries fail.
 * - Mocks dependent services and logger to control test execution and isolate CacheUpdateService behavior.
 */
describe('CacheUpdateService - updateAssetCache', () => {
	let service: CacheUpdateService

	const prismaMock = {
		asset:       { findMany: jest.fn(), },
		transaction: { findMany: jest.fn(), },
		bond:        { findMany: jest.fn(), },
		equity:      { findMany: jest.fn(), },
		etf:         { findMany: jest.fn(), },
		cryptoData:  { findMany: jest.fn(), },
		isins:       { findMany: jest.fn(), },
	}

	const cBondsCurrencyServiceMock = {
		getAllCurrencies:        jest.fn(),
		getAllMetalsWithHistory: jest.fn(),
	}

	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaMock, },
				{ provide: CBondsCurrencyService, useValue: cBondsCurrencyServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: RedisCacheService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
			],
		},).compile()

		service = module.get(CacheUpdateService,)

		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)

		jest.spyOn(service, 'updateBondAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateEquityAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateCashAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateCryptoAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateDepositAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateLoanAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateMetalAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateOptionsAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateOtherAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updatePEAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateRealEstateAnalytics',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'updateOverviewCache',).mockResolvedValue(undefined,)
		jest.spyOn(service, 'parseAndFilterAssets',).mockReturnValue([],)
	},)

	it('should call bond analytics when assetName is BONDS', async() => {
		prismaMock.asset.findMany.mockResolvedValue([{ assetName: AssetNamesType.BONDS, },],)
		prismaMock.transaction.findMany.mockResolvedValue([],)
		prismaMock.bond.findMany.mockResolvedValue([],)
		prismaMock.equity.findMany.mockResolvedValue([],)
		prismaMock.etf.findMany.mockResolvedValue([],)
		cBondsCurrencyServiceMock.getAllCurrencies.mockResolvedValue([],)
		prismaMock.cryptoData.findMany.mockResolvedValue([],)
		cBondsCurrencyServiceMock.getAllMetalsWithHistory.mockResolvedValue([],)
		prismaMock.isins.findMany.mockResolvedValue([],)

		await service.updateAssetCache(AssetNamesType.BONDS,)

		expect(service.updateBondAnalytics,).toHaveBeenCalled()
	},)

	it('should log error if prisma throws', async() => {
		prismaMock.asset.findMany.mockRejectedValue(new Error('DB fail',),)

		await service.updateAssetCache(AssetNamesType.BONDS,)

		expect(service['logger'].error,).toHaveBeenCalledWith('[UpdateAssetCacheError]:', expect.any(Error,),)
	},)

	it('should call updateOverviewCache when clientId is provided', async() => {
		prismaMock.asset.findMany.mockResolvedValue([],)
		prismaMock.transaction.findMany.mockResolvedValue([],)
		prismaMock.bond.findMany.mockResolvedValue([],)
		prismaMock.equity.findMany.mockResolvedValue([],)
		prismaMock.etf.findMany.mockResolvedValue([],)
		cBondsCurrencyServiceMock.getAllCurrencies.mockResolvedValue([],)
		prismaMock.cryptoData.findMany.mockResolvedValue([],)
		cBondsCurrencyServiceMock.getAllMetalsWithHistory.mockResolvedValue([],)
		prismaMock.isins.findMany.mockResolvedValue([],)

		await service.updateAssetCache(AssetNamesType.BONDS, 'client-123',)

		expect(service.updateOverviewCache,).toHaveBeenCalledWith(expect.any(Object,), 'client-123',)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updatePortfolioListCache
 * @remarks
 * - Ensures that the portfolio list cache is updated successfully by:
 *   - Calling getPortfolioListFiltered from PortfolioService
 *   - Generating a cache key
 *   - Deleting old cache by URL path
 *   - Setting new cache with the fetched data
 * - Verifies proper error logging if PortfolioService throws an error.
 * - Uses mocks for PortfolioService and RedisCacheService to isolate CacheUpdateService behavior.
 */
describe('CacheUpdateService - updatePortfolioListCache', () => {
	let service: CacheUpdateService

	const portfolioServiceMock = {
		getPortfolioListFiltered: jest.fn(),
	}

	const cacheServiceMock = {
		generateKey:             jest.fn(),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}

	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PortfolioService, useValue: portfolioServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: PrismaService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
			],
		},).compile()

		service = module.get(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should update portfolio list cache successfully', async() => {
		const mockResponse = [{ id: 1, name: 'Portfolio 1', },]
		portfolioServiceMock.getPortfolioListFiltered.mockResolvedValue(mockResponse,)
		cacheServiceMock.generateKey.mockReturnValue('mock-key',)
		cacheServiceMock.deleteAllCacheByUrlPath.mockResolvedValue(undefined,)
		cacheServiceMock.set.mockResolvedValue(undefined,)

		await service.updatePortfolioListCache()

		expect(portfolioServiceMock.getPortfolioListFiltered,).toHaveBeenCalledWith(getPortfoliosFilter,)
		expect(cacheServiceMock.generateKey,).toHaveBeenCalledWith({
			method: 'GET',
			url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
		},)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledWith(
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
		)
		expect(cacheServiceMock.set,).toHaveBeenCalledWith('mock-key', mockResponse,)
	},)

	it('should log error when service throws', async() => {
		const error = new Error('boom',)
		portfolioServiceMock.getPortfolioListFiltered.mockRejectedValue(error,)

		await service.updatePortfolioListCache()

		expect(service['logger'].error,).toHaveBeenCalledWith(error,)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.syncUpdatePortfolioListCache
 * @remarks
 * - Ensures that the portfolio list cache is synchronized successfully by:
 *   - Calling syncGetPortfolioListFiltered from PortfolioService with prepared data
 *   - Generating a cache key
 *   - Deleting old cache by URL path
 *   - Setting new cache with the fetched data
 * - Verifies proper error logging if PortfolioService throws an error.
 * - Uses mocks for PortfolioService and RedisCacheService to isolate CacheUpdateService behavior.
 */
describe('CacheUpdateService - syncUpdatePortfolioListCache', () => {
	let service: CacheUpdateService

	const portfolioServiceMock = {
		syncGetPortfolioListFiltered: jest.fn(),
	}

	const cacheServiceMock = {
		generateKey:             jest.fn(),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}

	const mockData: IPortfoliosThirdPartyListCBondsParted = {
		portfolios:   [],
		drafts:       [],
		currencyList: [],
		cryptoList:   [],
		bonds:        [],
		equities:     [],
		etfs:         [],
		metalList:    [],
	}

	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PortfolioService, useValue: portfolioServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: PrismaService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
			],
		},).compile()

		service = module.get(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should sync and update portfolio list cache successfully', async() => {
		const mockResponse = [{ id: 1, name: 'Portfolio 1', },]
		portfolioServiceMock.syncGetPortfolioListFiltered.mockReturnValue(mockResponse,)
		cacheServiceMock.generateKey.mockReturnValue('mock-key',)
		cacheServiceMock.deleteAllCacheByUrlPath.mockResolvedValue(undefined,)
		cacheServiceMock.set.mockResolvedValue(undefined,)

		await service.syncUpdatePortfolioListCache(mockData,)

		expect(portfolioServiceMock.syncGetPortfolioListFiltered,).toHaveBeenCalledWith(mockData, getPortfoliosFilter,)
		expect(cacheServiceMock.generateKey,).toHaveBeenCalledWith({
			method: 'GET',
			url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
		},)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledWith(
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
		)
		expect(cacheServiceMock.set,).toHaveBeenCalledWith('mock-key', mockResponse,)
	},)

	it('should log error when service throws', async() => {
		const error = new Error('boom',)
		portfolioServiceMock.syncGetPortfolioListFiltered.mockImplementation(() => {
			throw error
		},)

		await service.syncUpdatePortfolioListCache(mockData,)

		expect(service['logger'].error,).toHaveBeenCalledWith(error,)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateOverviewCache
 * @remarks
 * - Ensures that the overview cache is updated correctly by:
 *   - Fetching analytics from OverviewService (bank, entity, asset, currency)
 *   - Generating Redis cache keys
 *   - Setting new cache entries in Redis
 * - Verifies behavior for:
 *   - Without clientId
 *   - With clientId (checks key generation includes clientId)
 * - Confirms proper error logging if OverviewService throws.
 * - Uses mocks for RedisCacheService, OverviewService, PortfolioService, and ClientRepository.
 */
describe('CacheUpdateService - updateOverviewCache', () => {
	let service: CacheUpdateService
	const overviewServiceMock = {
		syncGetBankAnalytics:     jest.fn().mockReturnValue({ bank: 'data', },),
		syncGetEntityAnalytics:   jest.fn().mockReturnValue({ entity: 'data', },),
		syncGetAssetAnalytics:    jest.fn().mockReturnValue({ asset: 'data', },),
		syncGetCurrencyAnalytics: jest.fn().mockReturnValue({ currency: 'data', },),
	}

	const portfolioServiceMock = {
		getPortfolioListFiltered:     jest.fn(),
		syncGetPortfolioListFiltered: jest.fn(),
	}

	const redisCacheServiceMock = {
		generateKey:             jest.fn().mockImplementation((key,) => {
			return `key-${key.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}

	const prismaServiceMock = {}

	const overviewInitialsMock: TOverviewInitials = {
		assets:       [],
		transactions: [],
		currencyList: [],
		cryptoList:   [],
		bonds:        [],
		equities:     [],
		etfs:         [],
		metalList:    [],
	}
	const clientRepositoryServiceMock = {
		getAllClients:     jest.fn().mockResolvedValue([],),
	}
	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: RedisCacheService, useValue: redisCacheServiceMock, },
				{ provide: OverviewService, useValue: overviewServiceMock, },
				{ provide: PortfolioService, useValue: portfolioServiceMock, },
				{ provide: PrismaService, useValue: prismaServiceMock, },
				{ provide: ClientRepository, useValue: clientRepositoryServiceMock, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should update overview cache without clientId', async() => {
		await service.updateOverviewCache(overviewInitialsMock,)
		expect(redisCacheServiceMock.set,).toHaveBeenCalledTimes(1,)
	},)

	it('should update overview cache with clientId', async() => {
		const clientId = '123'
		await service.updateOverviewCache(overviewInitialsMock, clientId,)
		expect(redisCacheServiceMock.set,).toHaveBeenCalledTimes(1,)
		expect(redisCacheServiceMock.generateKey,).toHaveBeenCalledWith(
			expect.objectContaining({ clientId, },),
		)
	},)

	it('should log error if something throws', async() => {
		overviewServiceMock.syncGetBankAnalytics.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)
		await service.updateOverviewCache(overviewInitialsMock,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.generateOverviewCache
 * @remarks
 * - Ensures that the overview cache is generated correctly by:
 *   - Fetching analytics data (bank, entity, asset, currency)
 *   - Generating Redis cache keys
 *   - Setting cache entries in Redis
 * - Confirms correct number of cache sets (4: bank, entity, asset, currency)
 * - Verifies proper error logging if any underlying service (Prisma or OverviewService) throws.
 * - Uses mocks for PrismaService, CBondsCurrencyService, OverviewService, RedisCacheService,
 *   PortfolioService, ClientService, and ClientRepository.
 */
describe('CacheUpdateService - generateOverviewCache', () => {
	let service: CacheUpdateService

	const prismaServiceMock = {
		asset:        { findMany: jest.fn().mockResolvedValue([],), },
		transaction:  { findMany: jest.fn().mockResolvedValue([],), },
		etf:          { findMany: jest.fn().mockResolvedValue([],), },
		equity:       { findMany: jest.fn().mockResolvedValue([],), },
		bond:         { findMany: jest.fn().mockResolvedValue([],), },
		cryptoData:   { findMany: jest.fn().mockResolvedValue([],), },
	}
	const cBondsCurrencyServiceMock = {
		getAllCurrencies:        jest.fn().mockResolvedValue([],),
		getAllMetalsWithHistory: jest.fn().mockResolvedValue([],),
	}
	const overviewServiceMock = {
		syncGetBankAnalytics:     jest.fn().mockReturnValue({ bank: 'data', },),
		syncGetEntityAnalytics:   jest.fn().mockReturnValue({ entity: 'data', },),
		syncGetAssetAnalytics:    jest.fn().mockReturnValue({ asset: 'data', },),
		syncGetCurrencyAnalytics: jest.fn().mockReturnValue({ currency: 'data', },),
	}
	const cacheServiceMock = {
		generateKey:             jest.fn().mockImplementation((key,) => {
			return `key-${key.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}

	const portfolioServiceMock = {
		getPortfolioListFiltered:     jest.fn().mockResolvedValue([],),
		syncGetPortfolioListFiltered: jest.fn().mockResolvedValue([],),
	}
	const clientServiceMock = {
		getAllClients: jest.fn().mockResolvedValue([],),
	}
	const clientRepositoryServiceMock = {
		getAllClients:     jest.fn().mockResolvedValue([],),
	}
	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaServiceMock, },
				{ provide: CBondsCurrencyService, useValue: cBondsCurrencyServiceMock, },
				{ provide: OverviewService, useValue: overviewServiceMock, },
				{ provide: ClientService, useValue: clientServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: PortfolioService, useValue: portfolioServiceMock, },
				{ provide: ClientRepository, useValue: clientRepositoryServiceMock, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should generate overview cache', async() => {
		await service.generateOverviewCache()

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(4,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledWith(
			expect.objectContaining({ url: `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`, },),
		)
		expect(cacheServiceMock.generateKey,).toHaveBeenCalledWith(
			expect.objectContaining({ url: `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`, },),
		)
		expect(cacheServiceMock.generateKey,).toHaveBeenCalledWith(
			expect.objectContaining({ url: `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`, },),
		)
		expect(cacheServiceMock.generateKey,).toHaveBeenCalledWith(
			expect.objectContaining({ url: `/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`, },),
		)
	},)

	it('should log error if something throws', async() => {
		prismaServiceMock.asset.findMany.mockRejectedValueOnce(new Error('fail',),)
		await service.generateOverviewCache()
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateClientListCache
 * @remarks
 * - Ensures client list cache is updated correctly by:
 *   - Fetching client data via ClientService.syncGetClients
 *   - Generating Redis cache key
 *   - Deleting old cache and setting new cache in Redis
 * - Confirms correct cache key generation and set behavior
 * - Verifies proper error logging if ClientService or Redis operations throw
 * - Uses mocks for RedisCacheService and ClientService
 */
describe('CacheUpdateService - updateClientListCache', () => {
	let service: CacheUpdateService

	const prismaServiceMock = {}
	const redisCacheServiceMock = {
		generateKey:             jest.fn().mockImplementation((key,) => {
			return `key-${key.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}
	const clientServiceMock = {
		syncGetClients: jest.fn().mockReturnValue([{ id: 1, name: 'Test Client', },],),
	}

	const data: TClientListCache = {
		clientsList:  {total: 0, list: [],},
		currencyList: [],
		cryptoList:   [],
		bonds:        [],
		equities:     [],
		etfs:         [],
		metalList:    [],
	}

	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaServiceMock, },
				{ provide: RedisCacheService, useValue: redisCacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: clientServiceMock, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should update client list cache', async() => {
		await service.updateClientListCache(data,)

		expect(clientServiceMock.syncGetClients,).toHaveBeenCalledWith(data, getClientsFilter,)
		expect(redisCacheServiceMock.generateKey,).toHaveBeenCalledWith({
			method: 'GET',
			url:    `/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,
		},)
		expect(redisCacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledWith(
			`/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,
		)
		expect(redisCacheServiceMock.set,).toHaveBeenCalledWith(
			`key-/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,
			[{ id: 1, name: 'Test Client', },],
		)
	},)

	it('should log error if something throws', async() => {
		clientServiceMock.syncGetClients.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)
		await service.updateClientListCache(data,)
		expect(service['logger'].error,).toHaveBeenCalledWith(['CacheSync',], expect.any(Error,),)
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.generateClientListCache
 * @remarks
 * - Ensures full client list cache generation:
 *   - Fetches all clients from ClientRepository
 *   - Retrieves currencies and metals via CBondsCurrencyService
 *   - Fetches crypto, bond, equity, ETF data from Prisma
 *   - Calls ClientService.syncGetClients with aggregated data
 *   - Generates Redis cache key and sets cache
 * - Verifies proper method calls and cache key usage
 * - Confirms error logging if any service throws
 * - Uses mocks for PrismaService, ClientService, RedisCacheService, ClientRepository, CBondsCurrencyService
 */
describe('CacheUpdateService - generateClientListCache', () => {
	let service: CacheUpdateService

	const prismaServiceMock = {
		cryptoData: { findMany: jest.fn().mockResolvedValue([],), },
		bond:       { findMany: jest.fn().mockResolvedValue([],), },
		equity:     { findMany: jest.fn().mockResolvedValue([],), },
		etf:        { findMany: jest.fn().mockResolvedValue([],), },
	}
	const redisCacheServiceMock = {
		generateKey:             jest.fn((key,) => {
			return `key-${key.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}
	const clientServiceMock = {
		getClients:     jest.fn().mockResolvedValue([],),
		syncGetClients: jest.fn().mockReturnValue({ some: 'response', },),
	}
	const clientRepositoryServiceMock = {
		getAllClients:     jest.fn().mockResolvedValue([],),
	}
	const cBondsCurrencyServiceMock = {
		getAllCurrencies:        jest.fn().mockResolvedValue([],),
		getAllMetalsWithHistory: jest.fn().mockResolvedValue([],),
	}
	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaServiceMock, },
				{ provide: RedisCacheService, useValue: redisCacheServiceMock, },
				{ provide: ClientService, useValue: clientServiceMock, },
				{ provide: CBondsCurrencyService, useValue: cBondsCurrencyServiceMock, },
				{ provide: ClientRepository, useValue: clientRepositoryServiceMock, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should generate client list cache', async() => {
		await service.generateClientListCache()

		expect(clientRepositoryServiceMock.getAllClients,).toHaveBeenCalled()
		expect(cBondsCurrencyServiceMock.getAllCurrencies,).toHaveBeenCalled()
		expect(prismaServiceMock.cryptoData.findMany,).toHaveBeenCalled()
		expect(prismaServiceMock.bond.findMany,).toHaveBeenCalled()
		expect(prismaServiceMock.equity.findMany,).toHaveBeenCalled()
		expect(prismaServiceMock.etf.findMany,).toHaveBeenCalled()
		expect(cBondsCurrencyServiceMock.getAllMetalsWithHistory,).toHaveBeenCalled()

		expect(clientServiceMock.syncGetClients,).toHaveBeenCalledWith(
			{
				clientsList:  [],
				currencyList: [],
				cryptoList:   [],
				bonds:        [],
				equities:     [],
				etfs:         [],
				metalList:    [],
			},
			expect.anything(),
		)
		expect(redisCacheServiceMock.generateKey,).toHaveBeenCalledWith(
			expect.objectContaining({ url: `/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`, },),
		)
		expect(redisCacheServiceMock.set,).toHaveBeenCalledWith(
			expect.any(String,),
			{ some: 'response', },
		)
	},)

	it('should log error if something throws', async() => {
		clientServiceMock.syncGetClients.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.generateClientListCache()
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateBondAnalytics
 * @remarks
 * - Ensures bond analytics cache updates correctly:
 *   - Calls BondAssetService methods to get bonds, bank analytics, and currency analytics
 *   - Generates Redis cache keys, deletes old cache, and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if BondAssetService throws
 * - Uses mocks for BondAssetService and RedisCacheService
 */
describe('CacheUpdateService - updateBondAnalytics', () => {
	let service: CacheUpdateService

	const bondAssetServiceMock = {
		syncGetAllByFilters:           jest.fn().mockReturnValue({ bonds: [], },),
		syncGetBondsBankAnalytics:     jest.fn().mockReturnValue({ bankAnalytics: [], },),
		syncGetBondsCurrencyAnalytics: jest.fn().mockReturnValue({ currencyAnalytics: [], },),
	}
	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}

	const data: TBondInitials = {
		assets:       [],
		bonds:        [],
		currencyList: [],
	}

	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: BondAssetService, useValue: bondAssetServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
	},)

	it('should update bond analytics cache without clientId', async() => {
		await service.updateBondAnalytics(data,)

		expect(bondAssetServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, bondFilter, undefined,)
		expect(bondAssetServiceMock.syncGetBondsBankAnalytics,).toHaveBeenCalledWith(data, { type: AssetNamesType.BONDS, }, undefined,)
		expect(bondAssetServiceMock.syncGetBondsCurrencyAnalytics,).toHaveBeenCalledWith(data, { type: AssetNamesType.BONDS, }, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update bond analytics cache with clientId', async() => {
		const clientId = 'client123'

		await service.updateBondAnalytics(data, clientId,)

		expect(bondAssetServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, bondFilter, clientId,)
		expect(bondAssetServiceMock.syncGetBondsBankAnalytics,).toHaveBeenCalledWith(data, { type: AssetNamesType.BONDS, }, clientId,)
		expect(bondAssetServiceMock.syncGetBondsCurrencyAnalytics,).toHaveBeenCalledWith(data, { type: AssetNamesType.BONDS, }, clientId,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should log error if something throws', async() => {
		bondAssetServiceMock.syncGetAllByFilters.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateBondAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateEquityAnalytics
 * @remarks
 * - Ensures equity analytics cache updates correctly:
 *   - Calls EquityAssetService methods to get equities, bank analytics, and currency analytics
 *   - Generates Redis cache keys, deletes old cache (unless clientId provided), and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if EquityAssetService throws
 * - Uses mocks for EquityAssetService and RedisCacheService
 */
describe('CacheUpdateService - updateEquityAnalytics', () => {
	let service: CacheUpdateService

	const equityAssetServiceMock = {
		syncGetAllByFilters:            jest.fn().mockReturnValue({ equities: [], },),
		syncGetEquityBankAnalytics:     jest.fn().mockReturnValue({ bankAnalytics: [], },),
		syncGetEquityCurrencyAnalytics: jest.fn().mockReturnValue({ currencyAnalytics: [], },),
	}
	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}
	const data: TEquityInitials = {
		assets:       [],
		equities:     [],
		currencyList: [],
		etfs:         [],
		equityIsins:  [],
	}
	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: EquityAssetService, useValue: equityAssetServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should update equity analytics cache without clientId', async() => {
		await service.updateEquityAnalytics(data,)

		expect(equityAssetServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, equityFilter, undefined,)
		expect(equityAssetServiceMock.syncGetEquityBankAnalytics,).toHaveBeenCalledWith(data, { type: AssetNamesType.EQUITY_ASSET, }, undefined,)
		expect(equityAssetServiceMock.syncGetEquityCurrencyAnalytics,).toHaveBeenCalledWith(data, { type: AssetNamesType.EQUITY_ASSET, }, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update equity analytics cache with clientId', async() => {
		const clientId = 'client123'
		await service.updateEquityAnalytics(data, clientId,)

		expect(equityAssetServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, equityFilter, clientId,)
		expect(equityAssetServiceMock.syncGetEquityBankAnalytics,).toHaveBeenCalledWith(data, { type: AssetNamesType.EQUITY_ASSET, }, clientId,)
		expect(equityAssetServiceMock.syncGetEquityCurrencyAnalytics,).toHaveBeenCalledWith(data, { type: AssetNamesType.EQUITY_ASSET, }, clientId,)

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).not.toHaveBeenCalled()
	},)
	it('should log error if something throws', async() => {
		equityAssetServiceMock.syncGetAllByFilters.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateEquityAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateCashAnalytics
 * @remarks
 * - Ensures cash analytics cache updates correctly:
 *   - Calls CashService methods to get bank, entity, and currency analytics
 *   - Generates Redis cache keys, deletes old cache (unless clientId provided), and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if CashService throws
 * - Uses mocks for CashService and RedisCacheService
 */
describe('CacheUpdateService - updateCashAnalytics', () => {
	let service: CacheUpdateService

	const cashServiceMock = {
		syncGetBankAnalytics:     jest.fn().mockReturnValue({ bankAnalytics: [], },),
		syncGetEntityAnalytics:   jest.fn().mockReturnValue({ entityAnalytics: [], },),
		syncGetCurrencyAnalytics: jest.fn().mockReturnValue({ currencyAnalytics: [], },),
	}
	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}
	const data: TCacheInitials = {
		assets:       [],
		currencyList: [],
		transactions:         [],
	}
	beforeEach(async() => {
		jest.clearAllMocks()

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: CashService, useValue: cashServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should update cash analytics cache without clientId', async() => {
		await service.updateCashAnalytics(data,)

		expect(cashServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, cashFilters, undefined,)
		expect(cashServiceMock.syncGetEntityAnalytics,).toHaveBeenCalledWith(data, cashFilters, undefined,)
		expect(cashServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, cashFilters, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update cash analytics cache with clientId', async() => {
		const clientId = 'client123'
		await service.updateCashAnalytics(data, clientId,)

		expect(cashServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, cashFilters, clientId,)
		expect(cashServiceMock.syncGetEntityAnalytics,).toHaveBeenCalledWith(data, cashFilters, clientId,)
		expect(cashServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, cashFilters, clientId,)

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).not.toHaveBeenCalled()
	},)
	it('should log error if something throws', async() => {
		cashServiceMock.syncGetBankAnalytics.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateCashAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateCryptoAnalytics
 * @remarks
 * - Ensures crypto analytics cache updates correctly:
 *   - Calls CryptoAssetService methods to get crypto data, bank, and currency analytics
 *   - Generates Redis cache keys, deletes old cache (unless clientId provided), and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if CryptoAssetService throws
 * - Uses mocks for CryptoAssetService and RedisCacheService
 */
describe('CacheUpdateService - updateCryptoAnalytics', () => {
	let service: CacheUpdateService

	const cryptoServiceMock = {
		syncGetAllByFilters:            jest.fn().mockReturnValue({ crypto: [], },),
		syncGetCryptoBankAnalytics:     jest.fn().mockReturnValue({ bankAnalytics: [], },),
		syncGetCryptoCurrencyAnalytics: jest.fn().mockReturnValue({ currencyAnalytics: [], },),
	}
	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}
	const data: TCryptoInitials = {
		assets:       [],
		cryptoList:   [],
		currencyList: [],
		equities:     [],
		etfs:         [],
		equityIsins:  [],
	}

	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: cryptoServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should update crypto analytics cache without clientId', async() => {
		await service.updateCryptoAnalytics(data,)

		expect(cryptoServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, cryptoFilter, undefined,)
		expect(cryptoServiceMock.syncGetCryptoBankAnalytics,).toHaveBeenCalledWith(data, cryptoCurrencyFilter, undefined,)
		expect(cryptoServiceMock.syncGetCryptoCurrencyAnalytics,).toHaveBeenCalledWith(data, cryptoCurrencyFilter, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update crypto analytics cache with clientId', async() => {
		const clientId = 'client123'
		await service.updateCryptoAnalytics(data, clientId,)

		expect(cryptoServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, cryptoFilter, clientId,)
		expect(cryptoServiceMock.syncGetCryptoBankAnalytics,).toHaveBeenCalledWith(data, cryptoCurrencyFilter, clientId,)
		expect(cryptoServiceMock.syncGetCryptoCurrencyAnalytics,).toHaveBeenCalledWith(data, cryptoCurrencyFilter, clientId,)

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).not.toHaveBeenCalled()
	},)
	it('should log error if something throws', async() => {
		cryptoServiceMock.syncGetAllByFilters.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateCryptoAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateDepositAnalytics
 * @remarks
 * - Ensures deposit analytics cache updates correctly:
 *   - Calls DepositService methods to get deposits, bank, and currency analytics
 *   - Generates Redis cache keys, deletes old cache (unless clientId provided), and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if DepositService throws
 * - Uses mocks for DepositService and RedisCacheService
 */
describe('CacheUpdateService - updateDepositAnalytics', () => {
	let service: CacheUpdateService

	const depositServiceMock = {
		syncGetAllByFilters:      jest.fn().mockReturnValue({ deposits: [], },),
		syncGetBankAnalytics:     jest.fn().mockReturnValue({ bankAnalytics: [], },),
		syncGetCurrencyAnalytics: jest.fn().mockReturnValue({ currencyAnalytics: [], },),
	}
	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}
	const data: TAssetCacheInitials = {
		assets:       [],
		currencyList: [],
	}
	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: DepositService, useValue: depositServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should update deposit analytics cache without clientId', async() => {
		await service.updateDepositAnalytics(data,)

		expect(depositServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, depositFilter, undefined,)
		expect(depositServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, depositCurrencyFilter, undefined,)
		expect(depositServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, depositCurrencyFilter, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update deposit analytics cache with clientId', async() => {
		const clientId = 'client123'
		await service.updateDepositAnalytics(data, clientId,)

		expect(depositServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, depositFilter, clientId,)
		expect(depositServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, depositCurrencyFilter, clientId,)
		expect(depositServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, depositCurrencyFilter, clientId,)

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).not.toHaveBeenCalled()
	},)
	it('should log error if something throws', async() => {
		depositServiceMock.syncGetAllByFilters.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateDepositAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateLoanAnalytics
 * @remarks
 * - Ensures loan analytics cache updates correctly:
 *   - Calls LoanAssetService methods to get loans, bank, and currency analytics
 *   - Generates Redis cache keys, deletes old cache (unless clientId provided), and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if LoanAssetService throws
 * - Uses mocks for LoanAssetService and RedisCacheService
 */
describe('CacheUpdateService - updateLoanAnalytics', () => {
	let service: CacheUpdateService

	const loanAssetServiceMock = {
		syncGetAllByFilters:      jest.fn().mockReturnValue({ loans: [], },),
		syncGetBankAnalytics:     jest.fn().mockReturnValue({ bankAnalytics: [], },),
		syncGetCurrencyAnalytics: jest.fn().mockReturnValue({ currencyAnalytics: [], },),
	}
	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}
	const data: TAssetCacheInitials = {
		assets:       [],
		currencyList: [],
	}
	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: LoanAssetService, useValue: loanAssetServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should update loan analytics cache without clientId', async() => {
		await service.updateLoanAnalytics(data,)

		expect(loanAssetServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, loanFilter, undefined,)
		expect(loanAssetServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, loanCurrencyFilter, undefined,)
		expect(loanAssetServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, loanCurrencyFilter, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update loan analytics cache with clientId', async() => {
		const clientId = 'client123'
		await service.updateLoanAnalytics(data, clientId,)

		expect(loanAssetServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, loanFilter, clientId,)
		expect(loanAssetServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, loanCurrencyFilter, clientId,)
		expect(loanAssetServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, loanCurrencyFilter, clientId,)

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).not.toHaveBeenCalled()
	},)
	it('should log error if something throws', async() => {
		loanAssetServiceMock.syncGetAllByFilters.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateLoanAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateMetalAnalytics
 * @remarks
 * - Ensures metal analytics cache updates correctly:
 *   - Calls MetalsService methods to get metals, bank, and currency analytics
 *   - Generates Redis cache keys, deletes old cache (unless clientId provided), and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if MetalsService throws
 * - Uses mocks for MetalsService and RedisCacheService
 */
describe('CacheUpdateService - updateMetalAnalytics', () => {
	let service: CacheUpdateService

	const metalsServiceMock = {
		syncGetFilteredMetals:    jest.fn().mockReturnValue({ metals: [], },),
		syncGetBankAnalytics:     jest.fn().mockReturnValue({ bankAnalytics: [], },),
		syncGetCurrencyAnalytics: jest.fn().mockReturnValue({ currencyAnalytics: [], },),
	}
	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}
	const data: TMetalAssetCache = {
		assets:       [],
		metalList:    [],
		currencyList: [],
		equities:     [],
		etfs:         [],
		equityIsins:  [],
	}
	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: MetalsService, useValue: metalsServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should update metal analytics cache without clientId', async() => {
		await service.updateMetalAnalytics(data,)

		expect(metalsServiceMock.syncGetFilteredMetals,).toHaveBeenCalledWith(data, metalFilter, undefined,)
		expect(metalsServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, metalCurrencyFilter, undefined,)
		expect(metalsServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, metalCurrencyFilter, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update metal analytics cache with clientId', async() => {
		const clientId = 'client123'
		await service.updateMetalAnalytics(data, clientId,)

		expect(metalsServiceMock.syncGetFilteredMetals,).toHaveBeenCalledWith(data, metalFilter, clientId,)
		expect(metalsServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, metalCurrencyFilter, clientId,)
		expect(metalsServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, metalCurrencyFilter, clientId,)

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).not.toHaveBeenCalled()
	},)
	it('should log error if something throws', async() => {
		metalsServiceMock.syncGetFilteredMetals.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateMetalAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateOptionsAnalytics
 * @remarks
 * - Ensures options analytics cache updates correctly:
 *   - Calls OptionsService methods to get asset, bank, and maturity analytics
 *   - Generates Redis cache keys, deletes old cache (unless clientId provided), and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if OptionsService throws
 * - Uses mocks for OptionsService and RedisCacheService
 */
describe('CacheUpdateService - updateOptionsAnalytics', () => {
	let service: CacheUpdateService

	const optionsServiceMock = {
		syncGetAssetAnalytics:    jest.fn().mockReturnValue({ assetAnalytics: [], },),
		syncGetBankAnalytics:     jest.fn().mockReturnValue({ bankAnalytics: [], },),
		syncGetMaturityAnalytics: jest.fn().mockReturnValue({ maturityAnalytics: [], },),
	}
	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}
	const data: TAssetCacheInitials = {
		assets:       [],
		currencyList: [],
	}
	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: OptionsService, useValue: optionsServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should update options analytics cache without clientId', async() => {
		await service.updateOptionsAnalytics(data,)

		expect(optionsServiceMock.syncGetAssetAnalytics,).toHaveBeenCalledWith(data, optionsFilter, undefined,)
		expect(optionsServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, optionsFilter, undefined,)
		expect(optionsServiceMock.syncGetMaturityAnalytics,).toHaveBeenCalledWith(data, optionsFilter, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update options analytics cache with clientId', async() => {
		const clientId = 'client123'
		await service.updateOptionsAnalytics(data, clientId,)

		expect(optionsServiceMock.syncGetAssetAnalytics,).toHaveBeenCalledWith(data, optionsFilter, clientId,)
		expect(optionsServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, optionsFilter, clientId,)
		expect(optionsServiceMock.syncGetMaturityAnalytics,).toHaveBeenCalledWith(data, optionsFilter, clientId,)

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should log error if something throws', async() => {
		optionsServiceMock.syncGetAssetAnalytics.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateOptionsAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateOtherAnalytics
 * @remarks
 * - Ensures other investments analytics cache updates correctly:
 *   - Calls OtherInvestmentsService methods to get filtered items, bank, and currency analytics
 *   - Generates Redis cache keys, deletes old cache (unless clientId provided), and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if OtherInvestmentsService throws
 * - Uses mocks for OtherInvestmentsService and RedisCacheService
 */
describe('CacheUpdateService - updateOtherAnalytics', () => {
	let service: CacheUpdateService

	const otherInvestmentsServiceMock = {
		syncGetFilteredOtherInvestments: jest.fn().mockReturnValue({ items: [], },),
		syncGetBankAnalytics:            jest.fn().mockReturnValue({ bankAnalytics: [], },),
		syncGetCurrencyAnalytics:        jest.fn().mockReturnValue({ currencyAnalytics: [], },),
	}

	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}

	const data: TAssetCacheInitials = {
		assets:       [],
		currencyList: [],
	}

	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: otherInvestmentsServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should update other investments analytics cache without clientId', async() => {
		await service.updateOtherAnalytics(data,)

		expect(otherInvestmentsServiceMock.syncGetFilteredOtherInvestments,).toHaveBeenCalledWith(data, otherFilter, undefined,)
		expect(otherInvestmentsServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, otherCurrencyFilter, undefined,)
		expect(otherInvestmentsServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, otherCurrencyFilter, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update other investments analytics cache with clientId', async() => {
		const clientId = 'client123'

		await service.updateOtherAnalytics(data, clientId,)

		expect(otherInvestmentsServiceMock.syncGetFilteredOtherInvestments,).toHaveBeenCalledWith(data, otherFilter, clientId,)
		expect(otherInvestmentsServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, otherCurrencyFilter, clientId,)
		expect(otherInvestmentsServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, otherCurrencyFilter, clientId,)

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).not.toHaveBeenCalled()
	},)
	it('should log error if something throws', async() => {
		otherInvestmentsServiceMock.syncGetFilteredOtherInvestments.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateOtherAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updatePEAnalytics
 * @remarks
 * - Ensures private equity analytics cache updates correctly:
 *   - Calls PrivateEquityAssetService methods to get filtered items, bank, and currency analytics
 *   - Generates Redis cache keys, deletes old cache (unless clientId provided), and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if PrivateEquityAssetService throws
 * - Uses mocks for PrivateEquityAssetService and RedisCacheService
 */
describe('CacheUpdateService - updatePEAnalytics', () => {
	let service: CacheUpdateService

	const privateEquityAssetServiceMock = {
		syncGetAllByFilters:      jest.fn().mockReturnValue({ items: [], },),
		syncGetBankAnalytics:     jest.fn().mockReturnValue({ bankAnalytics: [], },),
		syncGetCurrencyAnalytics: jest.fn().mockReturnValue({ currencyAnalytics: [], },),
	}

	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}

	const data: TAssetCacheInitials = {
		assets:       [],
		currencyList: [],
	}

	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: privateEquityAssetServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should update private equity analytics cache without clientId', async() => {
		await service.updatePEAnalytics(data,)

		expect(privateEquityAssetServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, privateFilter, undefined,)
		expect(privateEquityAssetServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, privateCurrencyFilter, undefined,)
		expect(privateEquityAssetServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, privateCurrencyFilter, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update private equity analytics cache with clientId', async() => {
		const clientId = 'client123'

		await service.updatePEAnalytics(data, clientId,)

		expect(privateEquityAssetServiceMock.syncGetAllByFilters,).toHaveBeenCalledWith(data, privateFilter, clientId,)
		expect(privateEquityAssetServiceMock.syncGetBankAnalytics,).toHaveBeenCalledWith(data, privateCurrencyFilter, clientId,)
		expect(privateEquityAssetServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, privateCurrencyFilter, clientId,)

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).not.toHaveBeenCalled()
	},)
	it('should log error if something throws', async() => {
		privateEquityAssetServiceMock.syncGetAllByFilters.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updatePEAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateRealEstateAnalytics
 * @remarks
 * - Ensures real estate analytics cache updates correctly:
 *   - Calls RealEstateService methods to get asset, city, and currency analytics
 *   - Generates Redis cache keys, deletes old cache (unless clientId provided), and sets new cache
 *   - Supports optional clientId for per-client caching
 * - Verifies proper method calls and cache operations
 * - Confirms error logging if RealEstateService throws
 * - Uses mocks for RealEstateService and RedisCacheService
 */
describe('CacheUpdateService - updateRealEstateAnalytics', () => {
	let service: CacheUpdateService

	const realEstateServiceMock = {
		syncGetAssetAnalytics:    jest.fn().mockReturnValue({ assets: [], },),
		syncGetCityAnalytics:     jest.fn().mockReturnValue({ cityAnalytics: [], },),
		syncGetCurrencyAnalytics: jest.fn().mockReturnValue({ currencyAnalytics: [], },),
	}

	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}

	const data: TAssetCacheInitials = {
		assets:       [],
		currencyList: [],
	}

	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: RealEstateService, useValue: realEstateServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should update real estate analytics cache without clientId', async() => {
		await service.updateRealEstateAnalytics(data,)

		expect(realEstateServiceMock.syncGetAssetAnalytics,).toHaveBeenCalledWith(data, realEstateFilter, undefined,)
		expect(realEstateServiceMock.syncGetCityAnalytics,).toHaveBeenCalledWith(data, realEstateFilter, undefined,)
		expect(realEstateServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, realEstateFilter, undefined,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
	},)

	it('should update real estate analytics cache with clientId', async() => {
		const clientId = 'client123'

		await service.updateRealEstateAnalytics(data, clientId,)

		expect(realEstateServiceMock.syncGetAssetAnalytics,).toHaveBeenCalledWith(data, realEstateFilter, clientId,)
		expect(realEstateServiceMock.syncGetCityAnalytics,).toHaveBeenCalledWith(data, realEstateFilter, clientId,)
		expect(realEstateServiceMock.syncGetCurrencyAnalytics,).toHaveBeenCalledWith(data, realEstateFilter, clientId,)

		expect(cacheServiceMock.set,).toHaveBeenCalledTimes(3,)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).not.toHaveBeenCalled()
	},)
	it('should log error if something throws', async() => {
		realEstateServiceMock.syncGetAssetAnalytics.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateRealEstateAnalytics(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.generateBudgetList
 * @remarks
 * - Ensures budget list cache is generated correctly:
 *   - Calls BudgetService.syncGetBudgetPlans with full data
 *   - Generates Redis cache key, deletes old cache, and sets new cache
 * - Verifies proper cache operations and method calls
 * - Confirms error logging if BudgetService throws
 * - Uses mocks for BudgetService and RedisCacheService
 */
describe('CacheUpdateService - generateBudgetList', () => {
	let service: CacheUpdateService

	const budgetServiceMock = {
		syncGetBudgetPlans: jest.fn().mockReturnValue({ budgets: [], },),
	}

	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}

	const data: TSyncGetBudgets = {
		currencyList: [],
		budgetPlans:  [],
		assets:       [],
		transactions: [],
		cryptoList:   [],
		bonds:        [],
		equities:     [],
		etfs:         [],
		metalList:    [],
	}

	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: {}, },
				{ provide: BudgetService, useValue: budgetServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
				{ provide: CBondsCurrencyService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)
		jest.clearAllMocks()
	},)
	it('should generate budget list cache', async() => {
		await service.generateBudgetList(data,)

		expect(budgetServiceMock.syncGetBudgetPlans,).toHaveBeenCalledWith(data,)

		expect(cacheServiceMock.generateKey,).toHaveBeenCalledWith({
			method: 'GET',
			url:    `/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
		},)

		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledWith(
			`/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
		)

		expect(cacheServiceMock.set,).toHaveBeenCalledWith(
			`key-/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
			{ budgets: [], },
		)
	},)
	it('should log error if something throws', async() => {
		budgetServiceMock.syncGetBudgetPlans.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.generateBudgetList(data,)
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.updateBudgetList
 * @remarks
 * - Ensures full budget list cache update works correctly:
 *   - Fetches budgets, assets, transactions, crypto, bonds, equities, ETFs, metals via Prisma and CBondsCurrencyService
 *   - Calls BudgetService.syncGetBudgetPlans with aggregated data
 *   - Generates Redis cache key, deletes old cache, sets new cache
 * - Confirms proper cache operations and method calls
 * - Verifies error logging if any service throws
 * - Uses mocks for PrismaService, BudgetService, RedisCacheService, and CBondsCurrencyService
 */
describe('CacheUpdateService - updateBudgetList', () => {
	let service: CacheUpdateService

	const budgetServiceMock = {
		syncGetBudgetPlans: jest.fn().mockReturnValue({ budgets: [], },),
	}

	const cacheServiceMock = {
		generateKey:             jest.fn((opts,) => {
			return `key-${opts.url}`
		},),
		deleteAllCacheByUrlPath: jest.fn(),
		set:                     jest.fn(),
	}

	const prismaServiceMock = {
		budgetPlan:  { findMany: jest.fn(), },
		asset:       { findMany: jest.fn(), },
		transaction: { findMany: jest.fn(), },
		cryptoData:  { findMany: jest.fn(), },
		bond:        { findMany: jest.fn(), },
		equity:      { findMany: jest.fn(), },
		etf:         { findMany: jest.fn(), },
	}

	const cBondsCurrencyServiceMock = {
		getAllCurrencies:        jest.fn(),
		getAllMetalsWithHistory: jest.fn(),
	}

	const emptyData: TSyncGetBudgets = {
		budgetPlans:  [],
		currencyList: [],
		assets:       [],
		transactions: [],
		cryptoList:   [],
		bonds:        [],
		equities:     [],
		etfs:         [],
		metalList:    [],
	}

	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaServiceMock, },
				{ provide: BudgetService, useValue: budgetServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: CBondsCurrencyService, useValue: cBondsCurrencyServiceMock, },
				{ provide: ClientRepository, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: ClientService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)
		jest.spyOn(service['logger'], 'error',).mockImplementation(jest.fn(),)

		prismaServiceMock.budgetPlan.findMany.mockResolvedValue(emptyData,)
		prismaServiceMock.asset.findMany.mockResolvedValue(emptyData,)
		prismaServiceMock.transaction.findMany.mockResolvedValue(emptyData,)
		prismaServiceMock.cryptoData.findMany.mockResolvedValue(emptyData,)
		prismaServiceMock.bond.findMany.mockResolvedValue(emptyData,)
		prismaServiceMock.equity.findMany.mockResolvedValue(emptyData,)
		prismaServiceMock.etf.findMany.mockResolvedValue(emptyData,)
		cBondsCurrencyServiceMock.getAllCurrencies.mockResolvedValue(emptyData,)
		cBondsCurrencyServiceMock.getAllMetalsWithHistory.mockResolvedValue(emptyData,)
	},)

	it('should update budget list cache', async() => {
		await service.updateBudgetList()
		expect(budgetServiceMock.syncGetBudgetPlans,).toHaveBeenCalledWith({
			budgetPlans:  emptyData,
			currencyList: emptyData,
			assets:       emptyData,
			transactions: emptyData,
			cryptoList:   emptyData,
			bonds:        emptyData,
			equities:     emptyData,
			etfs:         emptyData,
			metalList:    emptyData,
		},)

		const cacheKey = `key-/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`
		expect(cacheServiceMock.generateKey,).toHaveBeenCalledWith({
			method: 'GET',
			url:    `/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
		},)
		expect(cacheServiceMock.deleteAllCacheByUrlPath,).toHaveBeenCalledWith(
			`/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
		)
		expect(cacheServiceMock.set,).toHaveBeenCalledWith(cacheKey, { budgets: [], },)
	},)

	it('should log error if something throws', async() => {
		budgetServiceMock.syncGetBudgetPlans.mockImplementationOnce(() => {
			throw new Error('fail',)
		},)

		await service.updateBudgetList()
		expect(service['logger'].error,).toHaveBeenCalled()
	},)
},)

/**
 * Task - 8.5
 * Unit tests for CacheUpdateService.initialPreparedSourceDataCBondsParted
 * @remarks
 * - Ensures the method fetches and aggregates all required third-party and internal data:
 *   - Clients, portfolios, drafts, assets, transactions, budget plans, crypto, bonds, equities, ETFs, metals, equity ISINs
 * - Verifies correct structure of returned object
 * - Confirms all underlying service calls (PrismaService, CBondsCurrencyService, ClientRepository) are invoked
 * - Uses mocks for PrismaService, CBondsCurrencyService, ClientService, ClientRepository, and RedisCacheService
 */
describe('CacheUpdateService - initialPreparedSourceDataCBondsParted', () => {
	let service: CacheUpdateService

	const prismaServiceMock = {
		portfolio:      { findMany: jest.fn(), },
		portfolioDraft: { findMany: jest.fn(), },
		asset:          { findMany: jest.fn(), },
		transaction:    { findMany: jest.fn(), },
		budgetPlan:     { findMany: jest.fn(), },
		cryptoData:     { findMany: jest.fn(), },
		bond:           { findMany: jest.fn(), },
		equity:         { findMany: jest.fn(), },
		etf:            { findMany: jest.fn(), },
		isins:          { findMany: jest.fn(), },
	}

	const cBondsCurrencyServiceMock = {
		getAllCurrencies:        jest.fn(),
		getAllMetalsWithHistory: jest.fn(),
	}

	const clientServiceMock = {
		getClients: jest.fn(),
	}

	const clientRepositoryServiceMock = {
		getAllClients: jest.fn(),
	}

	const cacheServiceMock = {
		generateKey:             jest.fn(),
		set:                     jest.fn(),
		deleteAllCacheByUrlPath: jest.fn(),
	}

	beforeEach(async() => {
		jest.clearAllMocks()
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CacheUpdateService,
				{ provide: PrismaService, useValue: prismaServiceMock, },
				{ provide: CBondsCurrencyService, useValue: cBondsCurrencyServiceMock, },
				{ provide: ClientService, useValue: clientServiceMock, },
				{ provide: RedisCacheService, useValue: cacheServiceMock, },
				{ provide: ClientRepository, useValue: clientRepositoryServiceMock, },
				{ provide: PortfolioService, useValue: {}, },
				{ provide: OverviewService, useValue: {}, },
				{ provide: BondAssetService, useValue: {}, },
				{ provide: EquityAssetService, useValue: {}, },
				{ provide: CashService, useValue: {}, },
				{ provide: CryptoAssetService, useValue: {}, },
				{ provide: DepositService, useValue: {}, },
				{ provide: LoanAssetService, useValue: {}, },
				{ provide: MetalsService, useValue: {}, },
				{ provide: OptionsService, useValue: {}, },
				{ provide: PrivateEquityAssetService, useValue: {}, },
				{ provide: OtherInvestmentsService, useValue: {}, },
				{ provide: RealEstateService, useValue: {}, },
				{ provide: BudgetService, useValue: {}, },
			],
		},).compile()

		service = module.get<CacheUpdateService>(CacheUpdateService,)

		prismaServiceMock.portfolio.findMany.mockResolvedValue([{ id: 1, assets: [], },],)
		prismaServiceMock.portfolioDraft.findMany.mockResolvedValue([{ id: 1, },],)
		prismaServiceMock.asset.findMany.mockResolvedValue([{ id: 1, },],)
		prismaServiceMock.transaction.findMany.mockResolvedValue([{ id: 1, },],)
		prismaServiceMock.budgetPlan.findMany.mockResolvedValue([{ id: 1, },],)
		prismaServiceMock.cryptoData.findMany.mockResolvedValue([{ id: 1, },],)
		prismaServiceMock.bond.findMany.mockResolvedValue([{ id: 1, },],)
		prismaServiceMock.equity.findMany.mockResolvedValue([{ id: 1, },],)
		prismaServiceMock.etf.findMany.mockResolvedValue([{ id: 1, },],)
		prismaServiceMock.isins.findMany.mockResolvedValue([{ id: 1, },],)
		cBondsCurrencyServiceMock.getAllCurrencies.mockResolvedValue([{ id: 1, },],)
		cBondsCurrencyServiceMock.getAllMetalsWithHistory.mockResolvedValue([{ id: 1, },],)
		clientRepositoryServiceMock.getAllClients.mockResolvedValue([{ id: 1, },],)
	},)

	it('should return correctly structured initial third-party data', async() => {
		const result = await service.initialPreparedSourceDataCBondsParted()

		expect(result,).toEqual({
			clientsList:  [{ id: 1, },],
			portfolios:   [{ id: 1, assets: [], },],
			drafts:       [{ id: 1, },],
			currencyList: [{ id: 1, },],
			cryptoList:   [{ id: 1, },],
			bonds:        [{ id: 1, },],
			equities:     [{ id: 1, },],
			etfs:         [{ id: 1, },],
			metalList:    [{ id: 1, },],
			assets:       [{ id: 1, },],
			transactions: [{ id: 1, },],
			budgetPlans:  [{ id: 1, },],
			equityIsins:  [{ id: 1, },],
		},)

		expect(prismaServiceMock.portfolio.findMany,).toHaveBeenCalled()
		expect(prismaServiceMock.portfolioDraft.findMany,).toHaveBeenCalled()
		expect(prismaServiceMock.asset.findMany,).toHaveBeenCalled()
		expect(prismaServiceMock.transaction.findMany,).toHaveBeenCalled()
		expect(prismaServiceMock.budgetPlan.findMany,).toHaveBeenCalled()
		expect(clientRepositoryServiceMock.getAllClients,).toHaveBeenCalled()
		expect(cBondsCurrencyServiceMock.getAllCurrencies,).toHaveBeenCalled()
		expect(cBondsCurrencyServiceMock.getAllMetalsWithHistory,).toHaveBeenCalled()
		expect(prismaServiceMock.isins.findMany,).toHaveBeenCalled()
	},)
},)
