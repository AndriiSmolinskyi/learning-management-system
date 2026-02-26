/* eslint-disable max-lines */
import type {Account, Asset, CurrencyDataList, Document, Entity, Portfolio, PortfolioDraft,} from '@prisma/client'
import type {CryptoData, CryptoList, CurrencyData, MetalData, MetalDataList, Prisma,} from '@prisma/client'
import type {AssetOperationType, CryptoType, MetalType,} from '../../shared/types'
import type {TBankExtended,} from '../bank/bank.types'
import type { TBondSelected, TEquitySelected, TEtfSelected, } from '../common/cache-sync/cache-sync.types'
import type { IAnalyticMetalETF, IAnalyticMetalETFWithInnerAssets, } from '../analytics/analytics.types'

export type AssetWithRelationsDecrypted = Asset & {
	portfolio: { name: string } | null
	entity: { name: string } | null
	bank: { bankName: string } | null
	account: { accountName: string } | null
	groupId?: string
	totalUnitsToTransfer?: number
}

export type CBondsType = Prisma.CBondsGetPayload<{
	select: {
		tradingsStocksFullNew: true,
		stocksTradingGrounds: true,
		etfQuotes: true,
		emissions: true,
		tradingsNew: true,
		etfTradingGrounds: true,
	};
}>

export type CEquityType = Prisma.CBondsGetPayload<{
	select: {
		tradingsStocksFullNew: true,
		stocksTradingGrounds: true,
		etfQuotes: true,
		etfTradingGrounds: true,
		stocksFull: true,
		etfFunds: true,
		emitents: true,
	};
}>

export interface ITotalLists {
	currencyList: Array<CurrencyData>,
	metalList: Array<MetalData>,
	cryptoList: Array<CryptoData>,
	cBonds: Array<CBondsType>,
}

export interface IGetTotalByAssetLists {
	currencyList: Array<CurrencyData>
	cryptoList: Array<CryptoData>
	cBonds: Array<CBondsType>
	metalList: Array<MetalData>
}

export interface IGetTotalByAssetListsCBondsParted {
	currencyList: Array<CurrencyData>
	cryptoList: Array<CryptoData>
	metalList: Array<MetalData>
	bonds: Array<TBondSelected>
	equities: Array<TEquitySelected>
	etfs: Array<TEtfSelected>
}

export type TAssetExtended = Asset & {
	documents?: Array<Document>
	portfolio?: Portfolio | null
	portfolioDraft?: PortfolioDraft | null
	entity?: Entity | null
	bank?: TBankExtended | null
	account?: Account | null
}

export enum AssetNamesType {
	BONDS = 'Bonds',
	CASH = 'Cash',
	CASH_DEPOSIT = 'Deposit',
	COLLATERAL = 'Collateral',
	CRYPTO = 'Crypto',
	EQUITY_ASSET = 'Equity asset',
	OTHER = 'Other investments',
	METALS = 'Metals',
	OPTIONS = 'Options',
	PRIVATE_EQUITY = 'Private equity',
	REAL_ESTATE = 'Real estate',
	LOAN = 'Loan'
}

export type TDeleteRefactoredAssetPayload = {
	assetName: AssetNamesType
	userInfo: {
		name: string
		email: string | null
		reason: string
	}
}

export interface ICryptoFilterSelectsData {
	cryptoTypes: Array<string>
	wallets: Array<string>
}

export interface IBondsAsset extends TAssetExtended {
	currency: CurrencyDataList
	valueDate: string
	isin: string
	security: string
	units: number
	unitPrice: number
	bankFee: number
	accrued: number
	operation: AssetOperationType
	comment?: string
}

export interface ICashAsset extends TAssetExtended {
	bank: TBankExtended
	currency: CurrencyDataList
	comment?: string
}

export interface IDepositAsset extends TAssetExtended {
	currency: CurrencyDataList
	interest: number
	currencyValue: number
	startDate: string
	maturityDate?: string
	toBeMatured?: boolean
	policy: string
	comment?: string
}

export interface ICollateralAsset extends TAssetExtended {
	currency: CurrencyDataList
	startDate: string
	endDate: string
	currencyValue: number
	usdValue: number
	creditProvider: string
	creditAmount: number
	comment?: string
}

export interface ICryptoAsset extends TAssetExtended {
	productType: CryptoType

	cryptoCurrencyType?: CryptoList
	cryptoAmount?: number
	exchangeWallet?: string
	purchaseDate?: Date
	purchasePrice?: number

	currency?: CurrencyDataList
	transactionDate?: Date
	isin?: string
	units?: number
	transactionPrice?: number
	bankFee?: number
	operation?: AssetOperationType
	security?: string

	comment?: string
}

export interface IEquityAsset extends TAssetExtended {
	currency: CurrencyDataList
	transactionDate: string
	isin: string
	security: string
	units: number
	transactionPrice: number
	bankFee: number
	equityType: string
	operation: AssetOperationType
	comment?: string
}

export interface ILoanAsset extends TAssetExtended {
	loanName: string
	startDate: string
	maturityDate: string
	currency: CurrencyDataList
	currencyValue: number
	usdValue: number
	interest: number
	todayInterest: number
	maturityInterest: number
	comment?: string
}

export interface IMetalsAsset extends TAssetExtended {
	productType: MetalType
	transactionDate: string
	units: number
	operation: AssetOperationType
	currency: CurrencyDataList

	metalType?: MetalDataList
	purchasePrice?: number

	isin?: string
	transactionPrice?: number
	bankFee?: number
	security?: string

	comment?: string
}

export interface IOptionAsset extends TAssetExtended {
	currency: CurrencyDataList
	startDate: string
	maturityDate: string
	pairAssetCurrency: string
	principalValue: number
	strike: number
	premium: number
	marketOpenValue: number
	currentMarketValue: number
	contracts: number
	comment?: string
}

export interface IOtherAsset extends TAssetExtended {
	investmentAssetName: string
	currency: CurrencyDataList
	investmentDate: string
	currencyValue: number
	usdValue: number
	serviceProvider: string
	comment?: string
}

export interface IPrivateAsset extends TAssetExtended {
	currency: CurrencyDataList
	entryDate: string
	currencyValue: number
	serviceProvider: string
	geography?: string
	fundName: string
	fundID: string
	fundType: string
	status: string
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
	comment?: string
}

export interface IRealEstateAsset extends TAssetExtended {
	currency: CurrencyDataList
	investmentDate: string
	currencyValue: number
	usdValue: number
	marketValueFC?: number
	projectTransaction: string
	operation?: string
	comment?: string
	country: string
	city: string
}

export interface IBondsAssetPayload {
	currency: string
	valueDate: string
	isin: string
	security: string
	units: number
	unitPrice: number
	bankFee: number
	accrued: number
	operation: AssetOperationType
	comment?: string
}

export interface ICashAssetPaylaod {
	currency: CurrencyDataList
	comment?: string
}

export interface IDepositPayloadAsset {
	currency: CurrencyDataList
	interest: number
	currencyValue: number
	startDate: Date
	toBeMatured?: boolean
	maturityDate?: Date
	policy: string
	comment?: string
}

export interface ICollateralPayloadAsset {
	currency: string
	startDate: Date
	endDate: Date
	currencyValue: number
	usdValue: number
	creditProvider: string
	creditAmount: number
	comment?: string
}

export interface ICryptoPayloadAsset {
	productType?: CryptoType

	cryptoCurrencyType?: CryptoList
	cryptoAmount?: number
	exchangeWallet?: string
	purchaseDate?: Date
	purchasePrice?: number

	currency?: CurrencyDataList
	transactionDate?: Date
	isin?: string
	security?: string
	units?: number
	transactionPrice?: number
	bankFee?: number
	equityType?: string
	operation?: AssetOperationType

	comment?: string
}

export interface IEquityPayloadAsset {
	currency: CurrencyDataList
	transactionDate: Date | string
	isin: string
	security: string
	units: number
	transactionPrice: number
	bankFee: number
	equityType: string
	operation: AssetOperationType
	comment?: string
}

export interface ILoanPayloadAsset {
	loanName: string
	startDate: Date
	maturityDate: Date
	currency: CurrencyDataList
	currencyValue: number
	usdValue: number
	interest: number
	todayInterest: number
	maturityInterest: number
	comment?: string
}

export interface IMetalsPayloadAsset {
	productType?: MetalType
	transactionDate: Date
	units: number
	operation: string
	currency: CurrencyDataList

	metalType?: MetalDataList
	purchasePrice?: number

	isin?: string
	security?: string
	transactionPrice?: number
	bankFee?: number
	equityType?: string

	comment?: string
}

export interface IOptionPayloadAsset {
	currency: CurrencyDataList
	startDate: Date
	maturityDate: Date
	pairAssetCurrency: string
	principalValue: number
	strike: number
	premium: number
	marketOpenValue: number
	currentMarketValue: number
	contracts: number
	comment?: string
}

export interface IOtherPayloadAsset {
	investmentAssetName: string
	currency: string
	investmentDate: Date
	currencyValue: number
	usdValue: number
	serviceProvider: string
	comment?: string
}

export interface IRealEstatePayloadAsset {
	currency: string
	investmentDate: Date
	currencyValue: number
	usdValue: number
	marketValueFC: number
	projectTransaction: string
	operation?: string
	comment?: string
	country: string
	city: string
}

export interface IPrivatePaylaodAsset {
	currency: string
	currencyValue: number
	entryDate: Date
	serviceProvider: string
	fundName: string
	fundID: string
	fundType: string
	status: string
	aboutFund: string
	totalCommitment: number
	tvpi: number
	fundTermDate: Date
	capitalCalled: number
	lastValuationDate: Date
	moic: number
	fundSize?: string
	geography?: string
	investmentPeriod?: string
	irr?: number
	liquidity?: number
	managementExpenses?: number
	otherExpenses?: number
	carriedInterest?: number
	distributions?: number
	holdingEntity?: string
	comment?: string
}

export interface IRealEstateFilterSelects {
	operations: Array<string>
	projectTransactions: Array<string>
	countries: Array<string>
	cities: Array<string>
}

type TAssetExtendedWithUsd = TAssetExtended & { usdValue: number }
export interface ILoansByFilter {
	list: Array<TAssetExtendedWithUsd>
	totalAssets: number
}

export enum TLoanTableSortVariants {
	START_DATE = 'startDate',
	MATURITY_DATE = 'maturityDate',
	USD_VALUE = 'usdValue',
}

export type TOtherInvestmenFiltered = {
	id: string;
	portfolioName?: string
	entityName?: string
	bankName?: string
	accountName?: string
	investmentAssetName?: string
	serviceProvider?: string
	currency?: string
	currencyValue?: number
	investmentDate: string
	usdValue: number
	marketValueUsd?: number
	profitUsd?: number
	percent?: number
	assetMainId?: string
	isTransferred?: boolean
}

export interface IOthersByFilter {
	list: Array<TOtherInvestmenFiltered>
	totalUsdValue: number
}

export enum OtherInvestmentsSortVariants {
	USD_VALUE = 'usdValue',
	CURRENCY_VALUE = 'currencyValue',
	INVESTMENT_DATE = 'investmentDate',
	PROFIT_USD = 'profitUSD',
	PROFIT_PER = 'profitPercentage',
	MARKET_VALUE_USD = 'marketValueUSD',
}

export enum TRealEstateSortVariants {
	DATE = 'investmentDate',
	CURRENCY_VALUE = 'currencyValue',
	PROFIT_USD = 'profitUSD',
	PROFIT_PER = 'profitPercentage',
	MARKET_VALUE_USD = 'marketValueUSD',
	COST_VALUE_USD = 'usdValue',
}

export enum TOptionsSortVariants {
	START_DATE = 'startDate',
	MATURITY = 'maturityDate',
	MARKET_VALUE = 'marketValueUSD',
}

export enum MetalsSortVariants {
	COST_VALUE_FC = 'costValueFC',
	MARKET_VALUE_FC = 'marketValueFC',
	MARKET_VALUE_USD = 'marketValueUSD',
	COST_VALUE_USD = 'costValueUSD',
	MARKET_PRICE = 'currentStockPrice',
	PERCENT = 'profitPercentage',
	USD_VALUE = 'profitUSD',
	VALUE_DATE = 'transactionDate',
	COST_PRICE = 'costPrice',
	UNITS = 'totalUnits',
}

export type TMetalsAssetExtended = IMetalsAsset & {
	portfolioName?: string
	entityName?: string
	bankName?: string
	accountName?: string
	currency: CurrencyDataList
	currencyValue: string
	costPrice: number
	currentStockPrice: number
	costValueUsd: number
	marketValueUsd: number
	metalPrice: number
	profitPercentage: number
	profitUsd: number
	operation: AssetOperationType
	metalName: string
	valueDate: string
	costValueFC: number
	marketValueFC: number
}

export type TMetalsWithInnerAssets = {
	productType: MetalType
	currency: CurrencyDataList
	id: string
	portfolioName?: string
	entityName?: string
	bankName?: string
	accountName?: string
	metalType: string
	costPrice: number
	units: number
	currentStockPrice: number
	costValueUsd: number
	valueDate: string
	profitPercentage: number
	profitUsd: number
	metalPrice: number
	metalName: string
	costValueFC: number
	marketValueUsd: number
	marketValueFC: number
	transactionPrice?: number
	operation: AssetOperationType
	assets: Array<TMetalsAssetExtended>
}

export interface IMetalsByFilter {
	list: Array<TMetalsAssetExtended | TMetalsWithInnerAssets | IAnalyticMetalETF | IAnalyticMetalETFWithInnerAssets>
	totalUsdValue: number
}
export enum TPrivateEquityTableSortVariants {
	ENTRY_DATE = 'entryDate',
	USD_VALUE = 'marketValueUSD',
	TOTAL_COMMITMENT = 'totalCommitment',
	PROFIT = 'pl',
	CALLED_CAPITAL = 'capitalCalled'
}

export type TAssetSelectItem = {
  label: string
  value: {
    id: string
    name: string
  }
}
