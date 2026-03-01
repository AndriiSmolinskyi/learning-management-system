import type {
	CurrencyDataList,
	CurrencyData,
	CurrencyHistoryData,
	MetalData,
	MetalHistoryData,
	MetalDataList,
} from '@prisma/client'
import type { AssetNamesType, } from '../../../modules/asset/asset.types'

export enum IsinTypeIds {
	BOND = '1',
	EQUITY = '2',
	ETF = '3',
}
export interface IBondsMarketValueUSDCalculation {
	isin: string
	units: number
	dirtyPriceCurrency: string | null
	nominalPrice: string | null
	rate: number
	marketPrice: string
}

export interface IBondsMarketValueUSD {
	isin: string
	units: number
	dirtyPriceCurrency: number | null
	nominalPrice: string | null
	rate: number
	marketPrice: number
}

export type EquityStockItem = {
	id: string
	isin: string
	last_price?: string
	close?: string
	currency_id: string
	trading_ground_id?: string
}
export interface IEquitiesMarketValueUSDCalculation {
	isin: string
	units: number
	cbondList: Array<Partial<EquityStockItem>>
	stockGrounds: Array<IEquityStocksGrounds>
	etfTradingGrounds: Array<IEtfTradingGrounds>
	rate: number
	currencyId: string
}

export type TUsdToCurrencyData = {
	currency: CurrencyDataList
	usdValue: number
}

export interface IEntityCode {
	entity_type_id: string
}

export interface IEntityCodeResponse {
	items: Array<IEntityCode>
}

export interface IGetTradingsNewItem {
	isin: string
	marketPrice: string
	yield: string | null
	accrued: string | null
	tradeDate: string | null
	sellingQuote: string | null
	ytcOffer: string | null
	gSpread: string | null
	dirtyPriceCurrency: string | null
}

export interface IGetStocksTradingGroundsItem {
	id: string
   isin: string
   emitent_name_eng: string
   emitent_branch_id:string
   trading_ground_id: string
   trading_ground_name_eng: string
   ticker: string
}

export interface IGetEmissionsItem {
	isin:           string
	issuer:         string
	security:       string
	currency:       string
	nominalPrice:       string
	maturityDate:     string | null
	country:        string | null
	sector:         string | null
	coupon:        string | null
	nextCouponDate: string | null
	offertDateCall: string | null
}

export interface IGetTradingsNewItemResponse {
	isin_code: string
	indicative_price: string | null
	clearance_profit_effect: string | null
	aci: string | null
	date: string
	selling_quote: string
	ytc_offer: string | null
	g_spread: string | null
	dirty_price_currency: string | null
	trading_ground_id: string
}

export interface IGetTradingStocksFullNewItemResponse {
	isin: string
	last_price: string | null
	id: string
	currency_id: string
	trading_ground_id: string
	trading_date: string
}

export interface IGetEtfQuotesResponse {
	isin: string
	close: string | null
	trading_ground_id: string
	currency_id: string
}

export interface IGetEtfTradingGroundsResponse {
	isin: string
	trading_ground_id: string
	currency_id: string
	main_trading_ground: string
}

export interface IGetEtfFundsResponse {
	etf_currency_name: string
   funds_name_eng: string
   trading_ground_name_eng: string
   geography_investment_name_eng: string
   sector_name_eng: string
   isin: string
   ticker: string
}

export interface IGetEtfDividendsResponse {
	isin: string
   distribution_amount: string
}

export interface IMetalRateName {
	rate: number
	metalName: string
}

export interface IEquityData {
	tradingsStocksFullNew: string
	stocksTradingGrounds: string
	stocksFull: string
}

export interface IEquityETFData {
	etfFunds: string
	etfDividends: string
	etfTradingGrounds: string
	etfQuotes: string
}

export interface ICurrencyResponse {
	type_id: string
	value: string
}

export interface IIsinCurrencyIdBody {
	isin: string
	typeId: string
	currencyId: string
}

export interface IBondCurrencyId {
	currency_id: string
}

export interface IEquityCurrencyId {
	currency_id: string
}

export interface IETFCurrencyId {
	currency_id: string
}

export interface IBondCurrencyResponse {
	items: Array<IBondCurrencyId>
}

export interface IEquityCurrencyResponse {
	items: Array<IEquityCurrencyId>
}

export interface IETFCurrencyResponse {
	items: Array<IETFCurrencyId>
}

export interface IBondTradingItem {
	isin: string
	marketPrice: string
	yield: string  | null
	accrued?: string
	tradeDate?: string
	sellingQuote?: string
	ytcOffer?: string
	gSpread?: string
	dirtyPriceCurrency: string
}

export interface IBondEmissionItem {
	isin: string
	security: string
	nominalPrice: string
	issuer?: string
	currency?: string
	maturityDate?: string
	country?: string
	sector?: string
	coupon?: string
	nextCouponDate?: string
	offertDateCall?: string
}

export interface IBondParserResponse {
	bondsTradings: Array<IBondTradingItem>
	bondsEmissions: Array<IBondEmissionItem>
}
export interface IEquityTradingStocks {
	id: string
	isin: string
	last_price: string
	currency_id: string
	trading_ground_id: string
}

export interface IETFQuotes {
	isin: string
	close: string
	currency_id: string
	trading_ground_id: string
}

export interface IEquityStocksGrounds {
	id: string
	isin: string
	emitent_name_eng: string
	emitent_branch_id: string
	trading_ground_id?: string
	trading_ground_name_eng: string
	ticker: string
}

export interface IEtfTradingGrounds {
	isin: string
   trading_ground_id: string
   currency_id: string,
   main_trading_ground: string
}

export interface IEquityParserResponse {
	parsedCBonds: Array<IEquityTradingStocks>
	parsedETFBonds: Array<IETFQuotes>
	parsedEquityTradingGrounds: Array<IEquityStocksGrounds>
	parsedEtfTradingGrounds: Array<IEtfTradingGrounds>
	parsedEquityStocksFull: Array<IGetStocksFullResponse>
	parsedETtfFunds: Array<IGetEtfFundsResponse>
	parsedEmitents: Array<IGetEmitentsResponse>
}

export interface IGetEquityTickerResponse {
	ticker: string
}

export interface IGetBondTickerResponse {
	bbgid_ticker: string
}

export interface IGetEmitentsResponse {
	id: string
   branch_name_eng: string | null
}

export interface IGetStocksFullResponse {
	id: string
   isin: string
   currency_name: string
   emitent_id: string
   emitent_name_eng: string
   country_name_eng: string
}

export interface IGetEmissionsResponse {
	isin_code: string
   emitent_name_eng: string
   bbgid_ticker: string
   currency_name: string
   nominal_price: string
   maturity_date: string | null
   emitent_country_name_eng: string | null
   emitent_branch_name_eng: string | null
   curr_coupon_rate: string | null
   curr_coupon_date: string | null
   offert_date_call: string | null
}

export interface ICurrencyHistoryDate {
	currencyId: string
	rate: number
	date: string
}

export interface IGetCurrencyHistoryDate {
	typeIds: string
	date: string
	limit: number,
}

export interface IEquityDataForAnalytics {
	ticker?: 			 string
	lastPrice?:       string
	emitentNameEng?: string
	countryNameEng?: string
	branchNameEng?: string
}

export type TCurrencyDataWithHistory = CurrencyData & {
	currencyHistory?: Array<CurrencyHistoryData>
}

export interface ICurrencyRateExchangeWithHistory {
	currency: CurrencyDataList
	currencyValue: number
	currencyList: Array<TCurrencyDataWithHistory>
	historyDate?: string
}

export type TMetalDataWithHistory = MetalData & {
	currencyHistory?: Array<MetalHistoryData>
}

export interface IMetalRateExchangeWithHistory {
	metalType: MetalDataList
	units: number
	metalList: Array<TMetalDataWithHistory>
	historyDate?: string
}

export interface IGetMetalMarketPriceWithHistory {
	metalType: MetalDataList
	metalList: Array<TMetalDataWithHistory>
	currencyList: Array<TCurrencyDataWithHistory>
	currency: CurrencyDataList
	historyDate?: string
}

export type TBond = {
  isin: string
  security: string
  sellingQuote: number
  nominalPrice: string
  country: string
  dirtyPriceCurrency: number | null
  yield: number | null
  marketPrice: number
  ytcOffer: number | null
  gSpread: number | null
  accrued: number | null
  tradeDate: Date
  issuer: string
  maturityDate: Date | null
  sector: string | null
  coupon: string | null
  nextCouponDate: Date | null
  offertDateCall: Date | null
}

export type TEquity = {
  isin: string;
  ticker: string;
  tradingGroundId: number;
  lastPrice: number;
  emitentName: string;
  emitentBranchId: string;
  tradingGroundName: string;
  equityCurrencyId: string;
  currencyName: string;
  stockEmitentId: string;
  stockEmitentName: string;
  stockCountryName: string;
  isinId: number;
  currencyId: string;
}

export type TEtf = {
  isin: string
  ticker: string
  close: number
  distributionAmount: number
  currencyName: string
  fundsName: string
  tradingGroundName: string
  geographyInvestmentName: string
  sectorName: string
  tradingGroundId: number
  etfCurrencyId: string

  isinId: number
  currencyId: string
}

export type TEmitent = {
	id: string
	branchNameEng: string
}

export interface IPortfolioIsinsFilter {
	id: string
	assetName: AssetNamesType
}

export interface IBinanceTickerPriceResponse {
	symbol: string
	price: string
}

export interface IBinancePricesDto {
	BTCUSDT: number
	ETHUSDT: number
}