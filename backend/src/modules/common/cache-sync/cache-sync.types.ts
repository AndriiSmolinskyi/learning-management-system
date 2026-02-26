import type {CryptoData, CurrencyData, MetalData, Isins, Prisma, CurrencyHistoryData,} from '@prisma/client'
import type { AssetNamesType, CBondsType, TAssetExtended, } from '../../../modules/asset/asset.types'
import type { IPortfolio, TPortfolioForCalcsForCacheUpdate, TPortfolioForCalcsWithRelations, } from '../../../modules/portfolio/portfolio.types'
import type { Transaction, } from '@prisma/client'
import type { TClientsListRes, } from '../../../modules/client'
import type { BudgetPlanExtened, } from '../../../modules/budget/budget.types'

export interface IInitialThirdPartyList {
	clientsList: TClientsListRes
	portfolios: Array<TPortfolioForCalcsWithRelations>
	drafts: Array<IPortfolio>
	currencyList: Array<CurrencyData>,
	metalList: Array<MetalData>,
	cryptoList: Array<CryptoData>,
	cBonds: Array<CBondsType>,
	assets: Array<TAssetExtended>
	transactions: Array<Transaction>
	budgetPlans: Array<BudgetPlanExtened>
	equityIsins: Array<Isins>
}

// export interface IInitialThirdPartyListCbondsParted {
// 	clientsList: TClientsListRes
// 	portfolios: Array<TPortfolioForCalcsWithRelations>
// 	drafts: Array<IPortfolio>
// 	currencyList: Array<CurrencyData>,
// 	assets: Array<TAssetExtended>
// 	metalList: Array<MetalData>,
// 	bonds: Array<Bond>,
// 	equities: Array<Equity>,
// 	etfs: Array<Etf>,
// 	transactions: Array<Transaction>
// 	cryptoList: Array<CryptoData>,
// 	budgetPlans: Array<BudgetPlanExtened>
// 	equityIsins: Array<Isins>
// }

export interface ITransactionSelected {
	clientId: string
	amount: Prisma.Decimal
	currency: string
	accountId?: string | null
	bankId?: string | null
	rate?: number | null
}

export interface IInitialThirdPartyListCbondsParted {
	clientsList: TClientsListRes
	portfolios: Array<TPortfolioForCalcsForCacheUpdate>
	drafts: Array<IPortfolio>
	currencyList: Array<CurrencyData>,
	assets: Array<TAssetExtended>
	metalList: Array<MetalData>,
	bonds: Array<TBondSelected>,
	equities: Array<TEquitySelected>,
	etfs: Array<TEtfSelected>,
	transactions: Array<ITransactionSelected>
	cryptoList: Array<CryptoData>,
	budgetPlans: Array<BudgetPlanExtened>
	equityIsins: Array<Isins>
	costHistoryCurrencyList: Array<CurrencyHistoryData>
}

export type TInitialAnalyticsAssetList = Omit<IInitialThirdPartyList, 'assets'> & {
  assets: Array<TAssetExtended>;
}

export type TInitialAnalyticsAssetListCBondsParted = Omit<IInitialThirdPartyListCbondsParted, 'assets'> & {
  assets: Array<TAssetExtended>;
}

export type TOverviewInitials = {
	transactions: Array<ITransactionSelected>
	currencyList: Array<CurrencyData>
   cryptoList: Array<CryptoData>
   bonds: Array<TBondSelected>
	equities: Array<TEquitySelected>
	etfs: Array<TEtfSelected>
	metalList: Array<MetalData>
	assets: Array<TAssetExtended>
}

export type TBondInitials = {
	assets: Array<TAssetExtended>
	bonds: Array<TBondSelected>
	currencyList: Array<CurrencyData>
	costHistoryCurrencyList: Array<CurrencyHistoryData>
}

export type TClientListCache = {
	currencyList: Array<CurrencyData>
	cryptoList: Array<CryptoData>
	bonds: Array<TBondSelected>
	equities: Array<TEquitySelected>
	etfs: Array<TEtfSelected>
	clientsList: TClientsListRes
	metalList: Array<MetalData>
}

export type TAssetsGenerate = {
	assets: Array<TAssetExtended>
	bonds: Array<TBondSelected>
	equities: Array<TEquitySelected>
	etfs: Array<TEtfSelected>
	currencyList: Array<CurrencyData>
	equityIsins: Array<Isins>
	transactions: Array<ITransactionSelected>
	cryptoList: Array<CryptoData>
	metalList: Array<MetalData>
	costHistoryCurrencyList: Array<CurrencyHistoryData>
}

export type TEquityInitials = {
	assets: Array<TAssetExtended>
	equities: Array<TEquitySelected>
	etfs: Array<TEtfSelected>
	currencyList: Array<CurrencyData>
	equityIsins: Array<Isins>
}

export type TCacheInitials =  {
	assets: Array<TAssetExtended>
	transactions: Array<ITransactionSelected>
	currencyList: Array<CurrencyData>
}

export type TCryptoInitials = {
	assets: Array<TAssetExtended>
	cryptoList: Array<CryptoData>
	currencyList: Array<CurrencyData>
	equities: Array<TEquitySelected>
	etfs: Array<TEtfSelected>
	equityIsins: Array<Isins>
}

export type TAssetCacheInitials = {
	assets: Array<TAssetExtended>
	currencyList: Array<CurrencyData>
}

export type TOtherAssetCacheInitials = {
	assets: Array<TAssetExtended>
	currencyList: Array<CurrencyData>
	costHistoryCurrencyList: Array<CurrencyHistoryData>
}

export type TMetalAssetCache = {
	metalList: Array<MetalData>
	assets: Array<TAssetExtended>
	currencyList: Array<CurrencyData>
	equities: Array<TEquitySelected>
	etfs: Array<TEtfSelected>
	equityIsins: Array<Isins>
}

export type TBondSelected = {
	isin: string
	security: string
	marketPrice: number
	dirtyPriceCurrency: number | null
	yield: number | null
	accrued: number | null
	tradeDate: Date
	issuer: string | null
	nominalPrice: string | null
	maturityDate: Date | null
	country: string
	sector: string | null
	coupon: string | null
	nextCouponDate: Date | null
}

export type TEquitySelected = {
	isin: string
	ticker: string
	lastPrice: number
	currencyName: string
	emitentName: string
	stockCountryName: string
	branchName: string | null
}

export type TEtfSelected = {
	isin: string
	ticker: string
	close: number
	currencyName: string
	fundsName:               string,
	geographyInvestmentName: string,
	sectorName:              string,
}

export type THandleTransactionCreationEvent = {
	assetName: AssetNamesType
	portfolioId: string
}

export type THandleAssetCreationEvent = {
	assetName: AssetNamesType
	portfolioId?: string
}

export type TPortfolioCacheUpdate = {
	portfolioId: string
	currencyList: Array<CurrencyData>
	cryptoList: Array<CryptoData>
	bonds: Array<TBondSelected>
	equities: Array<TEquitySelected>
	etfs: Array<TEtfSelected>
	transactions: Array<ITransactionSelected>
	metalList: Array<MetalData>
}

export type TAssetCacheUpdate = {
	assetName: AssetNamesType
	assets: Array<TAssetExtended>
	transactions: Array<ITransactionSelected>
	bonds: Array<TBondSelected>
	equities: Array<TEquitySelected>
	etfs: Array<TEtfSelected>
	currencyList: Array<CurrencyData>
	cryptoList: Array<CryptoData>
	metalList: Array<MetalData>
	equityIsins: Array<Isins>
	clientId?: string
	costHistoryCurrencyList: Array<CurrencyHistoryData>
}