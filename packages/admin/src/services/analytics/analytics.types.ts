/* eslint-disable max-lines */
import type {
	AssetNamesType,
	AssetOperationType,
	CryptoList,
	CryptoType,
	CurrencyList,
	IAssetExtended,
	MetalList,
	MetalType,
	PrivateEquityStatusEnum,
	SortOrder,
} from '../../shared/types'
import type {
	TLoanTableSortVariants,
} from '../../modules/analytics/loan'
import type {
	MetalsTableSortVariants,
} from '../../modules/analytics/metals'
import type {
	TOtherInvestmentsTableSortVariants,
} from '../../modules/analytics/other-investments'
import type {
	TBondTableSortVariants,
} from '../../modules/analytics/bonds'
import type {
	TEquityTableSortVariants,
} from '../../modules/analytics/equities'
import type {
	TCryptoTableSortVariants,
} from '../../modules/analytics/crypto'
import type {
	TDepositTableSortVariants,
} from '../../modules/analytics/deposit'

export type TGetRequestsBySourceProps = {
	clientId?: string
	portfolioId?: string
	entityId?: string
	bankId?: string
	accountId?: string
}

export type TCashProps = {
	type: AssetNamesType
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entitiesIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	currencies?: Array<string>
	assetIds?: Array<string>
	dateRange?: Array<string | null> | undefined
	transactionCreation?: boolean
}

export type TCurrencyAnalytics = {
	currency: CurrencyList | CryptoList | MetalList
	currencyValue: number
	productType?: CryptoType
	usdValue: number
}

export type TBondsCurrencyAnalytics = {
	currency: string
	usdValue: number
}

export type TEntityAnalytics = {
	id: string
	entityName: string
	usdValue: number
	portfolioName?: string
}

export type TBankAnalytics = {
	id: string
	bankName: string
	usdValue: number
	accountName?: string
	accountId?: string
	productType?: CryptoType
}

export type TCityAnalytics = {
	city: string
	usdValue: number
}

export type TOverviewAssetAnalytics = {
	assetName: AssetNamesType
	usdValue: number
	currencyValue: number
}

export type TOptionsAssetAnalytics = {
	id: string
	portfolio: string
	entity: string
	bank: string
	account: string
	currency: CurrencyList
	startDate: string
	maturity: string
	pair: string
	strike: number
	principalValue: number
	marketValue: number
	premium: number
	assetMainId?: string
	isTransferred: boolean
}

export type TMaturityAnalytics = {
	year: number
	usdValue: number
}

export type TRealEstateProps = {
	type: AssetNamesType.REAL_ESTATE
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	operations?: Array<string>
	projectTransactions?: Array<string>
	countries?: Array<string>
	cities?: Array<string>
	currencies?: Array<string>
	serviceProviders?: Array<string>
	assetIds?: Array<string>
	dateRange?: Array<string | null>
}

export type TOptionsProps = {
	type: AssetNamesType.OPTIONS
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	pairs?: Array<string>
	assetIds?: Array<string>
	maturityYear?: number
	dateRange?: Array<string | null>
	date?: string
}

export type TOverviewProps = {
	assetNames?: Array<AssetNamesType>
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
	accountIds?: Array<string>
	currencies?: Array<CurrencyList | MetalList | CryptoList>
}

export type TTransactionSelectProps = {
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
	accountIds?: Array<string>
	date?: string | undefined
	dateRange?: [string | null, string | null]
}

export type TCurrencyProps = {
	assetName: AssetNamesType
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entityIds?: Array<string>
	bankIds?: Array<string>
	accountIds?: Array<string>
}

export type TAssetExtendedWithUsd = IAssetExtended & { usdValue: number }

export interface IBondProperties {
	id: string
	portfolioName: string,
	entityName: string,
	bankName: string,
	accountName: string,
	isin: string,
	security: string,
	currency: string,
	costPrice: number,
	units: number,
	profitUsd: number,
	profitPercentage: number,
	marketValueUsd: number,
	costValueUsd: number,
	marketValueFC: number,
	costValueFC: number,
	currentAccrued: number,
	yield: number,
	nextCouponDate?: string,
	issuer: string,
	maturity?: string,
	sector: string,
	coupon: string,
	country: string,
	marketPrice: number
	operation: AssetOperationType
	valueDate: string
	mainAssetId?: string
	isTransferred?: boolean
}

export interface IAnalyticsBond extends IBondProperties {
	assets?: Array<IBondProperties>;
}

export interface IEquityProperties {
	id: string,
	equityType: string,
	portfolioName: string
	entityName: string,
	bankName: string,
	accountName: string,
	issuer: string,
	isin: string,
	security: string,
	currency: CurrencyList,
	profitUsd: number,
	profitPercentage: number,
	costValueUsd: number,
	marketValueUsd: number
	costValueFC: number,
	marketValueFC: number
	costPrice: number,
	units: number,
	currentStockPrice: number,
	country: string,
	sector?: string
	operation: AssetOperationType
	valueDate?: string
	mainAssetId?: string
	isTransferred?: boolean
}

export interface IAnalyticsEquity extends IEquityProperties {
	assets?: Array<IEquityProperties>;
}

export interface IPrivateAsset extends IAssetExtended {
	currency: CurrencyList
	entryDate: string
	currencyValue: number
	serviceProvider: string
	geography?: string
	fundName: string
	fundID?: string
	fundType: string
	fundSize?: string
	aboutFund: string
	investmentPeriod?: string
	fundTermDate: string
	capitalCalled: number
	lastValuationDate: string
	moic: number
	irr?: number
	liquidity?: number
	totalCommitment: number
	tvpi: number
	managementExpenses?: number
	otherExpenses?: number
	carriedInterest?: number
	distributions?: number
	holdingEntity?: string
	profitLossCurrency: string
	comment?: string
	usdValue?: number
}

export interface IAnalyticCrypto {
	id: string,
	portfolioName: string,
	entityName: string,
	bankName: string,
	accountName: string,
	productType: string,
	exchangeWallet?: string,
	cryptoCurrencyType?: CryptoList,
	cryptoAmount?: number,
	usdAmount: number,
	purchaseDate: string,
	purchasePrice: number,
	costValueUsd: number,
	marketValueUsd: number,
	profitUsd: number,
	profitPercentage: number,
	isin?: string,
	security?: string,
	units?: number,
	costPrice?: number,
	valueDate?: string,
	bankFee?: number,
	operation?: string,
	currency?: string,
	costValueFC?: number,
	marketValueFC?: number,
	currentStockPrice?: number,
	issuer?: string,
	sector?: string,
	country?: string,
	equityType?: string
	assets?: Array<IAnalyticCrypto>
	mainAssetId?: string
	isTransferred?: boolean
}

export interface ICryptoByFilters {
	list: Array<IAnalyticCrypto>
	totalAssets: number
}

export interface ILoanAnalytic {
	id: string,
	portfolioName: string,
	entityName: string,
	bankName: string,
	accountName: string,
	name: string,
	startDate: string,
	maturityDate: string,
	currency: CurrencyList,
	currencyValue: number,
	usdValue: number,
	interest: number,
	todayInterest: number,
	maturityInterest: number,
	assetMainId?: string
	isTransferred?: boolean
}
export interface ILoansByFilter {
	list: Array<ILoanAnalytic>
	totalAssets: number
}

export type IAnalyticPrivate = {
	assetId: string
	portfolioName: string | undefined
	entityName: string | undefined
	bankName: string | undefined
	accountName: string | undefined
	currency: string
	currencyValue: number
	fundType: string
	status: PrivateEquityStatusEnum
	fundName: string
	fundID: string
	entryDate: string
	capitalCalled: number
	totalCommitment: number
	usdValue: number
	pl: number
	assetMainId?: string
	isTransferred?: boolean
}

export interface IPrivateEquityByFilter {
	list: Array<IAnalyticPrivate>
	totalAssets: number
}

export type IAnalyticDeposit = {
	assetId: string
	portfolioName: string | undefined,
	entityName: string | undefined,
	bankName: string | undefined,
	accountName: string | undefined,
	startDate: string,
	maturityDate: string,
	currency: string,
	currencyValue: number,
	interest: number
	policy: string
	usdValue: number,
	mainAssetId?: string
	isTransferred: boolean
}

export interface IDepositByFilter {
	list: Array<IAnalyticDeposit>
	totalAssets: number
}

export interface IBondsByFilter {
	list: Array<IAnalyticsBond>
}

export interface IEquitiesByFilter {
	list: Array<IAnalyticsEquity>
}

export type TOtherInvestmentExtended = IAssetExtended & {
	portfolioName?: string
	entityName?: string
	bankName?: string
	accountName?: string
	investmentAssetName?: string
	serviceProvider?: string
	currency?: string
	currencyValue?: string
	investmentDate?: string
	usdValue?: number
	marketValueUsd?: number
	profitUsd: number
	percent: number
	assetMainId?: string
	isTransferred: boolean
}

export interface IOtherInvestmentsByFilter {
	list: Array<TOtherInvestmentExtended>
	totalUsdValue: number
}

export type IMetalProperties = IAssetExtended & {
	productType: MetalType

	portfolioName?: string
	entityName?: string
	bankName?: string
	accountName?: string,
	purchasePrice: number
	units: number
	operation: AssetOperationType
	costValueFC: number
	marketValueFC: number
	marketValueUsd:number
	comment?: string

	profitUsd: number
	currentStockPrice: number
	profitPercentage: number
	metalType?: string
	costPrice?: number
	metalName?: string
	metalPrice?: number
	costValueUsd: number
	currency: string

	isin?: string
	security?: string
	valueDate: string
	bankFee?: number
	issuer?: string
	sector?: string
	country?: string
	equityType?: string

	isTransferred?: boolean
}

export interface IMetalAssetExtended extends IMetalProperties {
	assets?: Array<IMetalProperties>;
}
export interface IMetalsByFilter {
	list: Array<IMetalAssetExtended>
	totalUsdValue: number
}

export interface IMetalsFilters {
	type: AssetNamesType.METALS
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entitiesIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	currencies?: Array<string>
	metals?: Array<string>
	sortBy?: MetalsTableSortVariants
	sortOrder?: SortOrder
	assetIds?: Array<string>
	date?: string
	tradeOperation?: AssetOperationType
}

export interface IOtherInvestmentFilters {
	type: AssetNamesType.OTHER
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	entitiesIds?: Array<string>
	accountIds?: Array<string>
	currencies?: Array<string>
	serviceProvider?: Array<string>
	investmentAssetNames?: Array<string>
	sortBy?: TOtherInvestmentsTableSortVariants
	sortOrder?: SortOrder
	assetIds?: Array<string>
	date?: string
}

export interface ILoansFilters {
	type: AssetNamesType.LOAN
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entitiesIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	currencies?: Array<string>
	loanNames?: Array<string>
	sortBy?: TLoanTableSortVariants
	sortOrder?: SortOrder
	assetIds?: Array<string>
	date?: string
}

export enum TPrivateEquityTableSortVariants {
	ENTRY_DATE = 'entryDate',
	USD_VALUE = 'marketValueUSD',
	TOTAL_COMMITMENT = 'totalCommitment',
	PROFIT = 'pl',
	CALLED_CAPITAL = 'capitalCalled'
}

export interface IPrivateEquityFilters {
	type: AssetNamesType.PRIVATE_EQUITY
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entitiesIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	currencies?: Array<string>
	fundTypes?: Array<string>
	fundNames?: Array<string>
	sortBy?: TPrivateEquityTableSortVariants
	sortOrder?: SortOrder
	assetIds?: Array<string>
	date?: string
}

export interface IDepositFilters {
	type: AssetNamesType.CASH_DEPOSIT
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entitiesIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	currencies?: Array<string>
	sortBy?: TDepositTableSortVariants
	sortOrder?: SortOrder
	assetIds?: Array<string>
	date?: string
}

export interface IBondsFilters {
	type: AssetNamesType.BONDS
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entitiesIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	currencies?: Array<string>
	isins?: Array<string>
	securities?: Array<string>
	sortBy?: TBondTableSortVariants
	sortOrder?: SortOrder
	assetIds?: Array<string>
	date?: string | undefined
	tradeOperation?: AssetOperationType
}

export interface IEquitiesFilters {
	type: AssetNamesType.EQUITY_ASSET
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entitiesIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	currencies?: Array<string>
	isins?: Array<string>
	securities?: Array<string>
	equityTypes?: Array<string>
	sortBy?: TEquityTableSortVariants
	sortOrder?: SortOrder
	assetIds?: Array<string>
	tradeOperation?: AssetOperationType
	date?: string
}
export interface ICryptoFilters {
	type: AssetNamesType.CRYPTO
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	entitiesIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	wallets?: Array<string>
	cryptoTypes?: Array<string>
	productTypes?: Array<string>
	sortBy?: TCryptoTableSortVariants
	sortOrder?: SortOrder
	assetIds?: Array<string>
	date?: string
}

export type TRealEstateAssetAnalytics = {
	id: string
	portfolio: string
	entity: string
	bank: string
	account: string
	country: string
	city: string
	projectTransaction: string
	operation?: string
	date: string
	currency: string
	currencyValue: number
	usdValue: number
	marketUsdValue: number
	marketValueFC?: number
	profitUsd: number
	profitPercentage: number
	assetMainId?: string
	isTransferred?: boolean
}

export type TransactionFilter = {
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	bankIds?: Array<string>
	bankListIds?: Array<string>
	accountIds?: Array<string>
	serviceProviders?: Array<string>
	currencies?: Array<string>
	transactionTypes?: Array<string>
	isins?: Array<string>
	securities?: Array<string>
	transactionIds?: Array<number>
	date?: string | undefined
	dateRange?: [string | null, string | null]
}

export interface ICryptoFilterSelectsData {
	cryptoTypes: Array<string>
	wallets: Array<string>
	productTypes: Array<string>
}

export interface IRealEstateFilterSelects {
	operations: Array<string>,
	projectTransactions: Array<string>,
	countries: Array<string>,
	cities: Array<string>,
}

export interface IEquityFilterSelectsData {
	equityTypes: Array<string>
	equityIsins: Array<string>
	equitySecurities: Array<string>
	metalCurrencies?: Array<MetalList>
	cryptoCurrencies?: Array<CryptoList>
	wallets?: Array<string>
}

export interface IPrivateEquityFilterSelectsData {
	peFundNames: Array<string>
	peFundTyped: Array<string>
}

export interface IAnalyticsAvailability {
	hasCash: boolean
	hasEquity: boolean
	hasMetal: boolean
	hasCrypto: boolean
	hasDeposit: boolean
	hasLoan: boolean
	hasBond: boolean
	hasOption: boolean
	hasOther: boolean
	hasPE: boolean
	hasRE: boolean
}