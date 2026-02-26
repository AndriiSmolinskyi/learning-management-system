/* eslint-disable max-lines */
export const CBondsBaseUri: string = 'https://ws.cbonds.info/services/json'

export const CBondsUriParts = {
	GET_EMISSIONS:                         'get_emissions',
	GET_EMISSION_DEFAULT:                  'get_emission_default',
	GET_EMISSION_GUARANTORS:               'get_emission_guarantors',
	GET_FLOW_NEW:                          'get_flow_new',
	GET_OFFERT:                            'get_offert',
	GET_TRADINGS_NEW:                      'get_tradings_new',
	GET_INDEX_VALUE_NEW:                   'get_index_value_new',
	GET_TRADINGS_STOCKS_FULL_NEW:          'get_tradings_stocks_full_new',
	GET_STOCKS_TRADING_GROUNDS:            'get_stocks_trading_grounds',
	GET_STOCKS_FULL:                       'get_stocks_full',
	GET_EMITENTS:                          'get_emitents',
	LANGUAGE:                              'lang',
	GET_ENTITY_CODES:                      'get_entity_codes',
	GET_ETF_SHARE_CLASSES_DIVIDENDS:       'get_etf_share_classes_dividends',
	GET_ETF_FUNDS:                         'get_etf_funds',
	GET_ETF_SHARE_CLASSES_QUOTES:          'get_etf_share_classes_quotes',
	GET_ETF_SHARE_CLASSES_TRADING_GROUNDS: 'get_etf_share_classes_trading_grounds',
}

export const metalApiIDs = {
	XAG: '72387',
	XAU: '72391',
	XPD: '81303',
	XPT: '81307',
}

export const formatGetEmissionsLink = ():string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_EMISSIONS}`
}

export const formatGetEmissionDefaultLink = ():string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_EMISSION_DEFAULT}`
}

export const formatGetEmissionGuarantorsLink = ():string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_EMISSION_GUARANTORS}`
}

export const formatGetFlowNewLink = ():string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_FLOW_NEW}`
}

export const formatGetOffertLink = ():string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_OFFERT}`
}

export const formatGetTradingsNewLink = ():string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_TRADINGS_NEW}`
}

export const formatGetIndexValueNewLink = ():string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_INDEX_VALUE_NEW}`
}

export const formatGetTradingsStocksFullNewLink = ():string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_TRADINGS_STOCKS_FULL_NEW}`
}

export const formatGetStocksFullLink = (): string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_STOCKS_FULL}`
}

export const formatGetStocksTradingGroundsLink = (): string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_STOCKS_TRADING_GROUNDS}`
}

export const formatGetEmitentsLink = (): string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_EMITENTS}`
}

export const formatGetEntityCodes = (): string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_ENTITY_CODES}`
}

export const formatGetEtfShareClassesDividends = (): string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_ETF_SHARE_CLASSES_DIVIDENDS}`
}

export const formatGetEtfFunds = (): string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_ETF_FUNDS}`
}
export const formatGetEtfShareClassesQuotes = (): string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_ETF_SHARE_CLASSES_QUOTES}`
}

export const formatGetEtfShareClassesTradingGrounds = (): string => {
	return `${CBondsBaseUri}/${CBondsUriParts.GET_ETF_SHARE_CLASSES_TRADING_GROUNDS}`
}

export const filterOperators = {
	EQ: 'eq',
	NN: 'nn',
	LE: 'le',
	GE: 'ge',
	IN: 'in',
}

export const filterValues = {
	USD_CURRENCY_ID:                 '2',
	BONDS_MAIN_TRADING_GROUND_ID:    '4',
	EQUITIES_MAIN_TRADING_GROUND_ID: '1',
}

export const filterFields = {
	UPDATING_DATE:                 'updating_date',
	DATE:                          'date',
	ISIN_CODE:                     'isin_code',
	CREATED_AT:                    'created_at',
	TRADING_DATE:                  'trading_date',
	ISIN:                          'isin',
	TYPE_ID:                       'type_id',
	ETF_CURRENCY_NAME:             'etf_currency_name',
	GEOGRAPHY_INVESTMENT_NAME_ENG: 'geography_investment_name_eng',
	SECTOR_NAME_ENG:               'sector_name_eng',
	TICKER:                        'ticker',
	FUNDS_NAME_ENG:                'funds_name_eng',
	TRADING_GROUND_NAME_ENG:       'trading_ground_name_eng',
	CLOSE:                         'close',
	DISTRIBUTION_AMOUNT:           'distribution_amount',
	ID:                            'id',
	EMITENT_BRANCH_ID:             'emitent_branch_id',
	EMITENT_NAME_ENG:              'emitent_name_eng',
	BRANCH_NAME_ENG:               'branch_name_eng',
	EMITENT_ID:                    'emitent_id',
	COUNTRY_NAME_ENG:              'country_name_eng',
	CURRENCY_NAME:                 'currency_name',
	CURRENCY:                      'currency',
	CURRENCY_ID:                   'currency_id',
	ETF_CURRENCY_ID:               'etf_currency_id',
	LAST_PRICE:                    'last_price',
	BBGID_TICKER:                  'bbgid_ticker',
	MATURITY_DATE:                 'maturity_date',
	NOMINAL_PRICE:                 'nominal_price',
	EMITENT_COUNTRY_NAME_ENG:      'emitent_country_name_eng',
	EMITENT_BRANCH_NAME_ENG:       'emitent_branch_name_eng',
	CURR_COUPON_RATE:              'curr_coupon_rate',
	CURR_COUPON_DATE:              'curr_coupon_date',
	OFFERT_DATE_CALL:              'offert_date_call',
	INDICATIVE_PRICE:              'indicative_price',
	CLEARANCE_PROFIT_EFFECT:       'clearance_profit_effect',
	ACI:                           'aci',
	SELLING_QUOTE:                 'selling_quote',
	YTC_OFFER:                     'ytc_offer',
	G_SPREAD:                      'g_spread',
	DIRTY_PLACE_CURRENCY:          'dirty_price_currency',
	TRADING_GROUND_ID:             'trading_ground_id',
	SRC_UPDATED_AT:                'src_updated_at',
	CODE_VALUE:                    'code_value',
	ENTITY_TYPE_ID:                'entity_type_id',
	EMISSION_ISIN_CODE:            'emission_isin_code',
	RATE_VALUE:                    'value',
	MAIN_TRADING_GROUND:           'main_trading_ground',
}

export const CBondsRoutes = {
	MODULE:    'cbonds',
	Emissions: {
		MODULE:         'emissions',
		GET_ISINS:      'get-isins',
		GET_SECURITIES: 'get-securities',
		GET_SECURITY:   'get-security',
	},
	EquitySotcks: {
		MODULE:         'equity-stocks',
		GET_ISINS:      'get-isins',
		GET_SECURITIES: 'get-securities',
		GET_SECURITY:   'get-security',
		GET_ISSUER:     'get-issuer',
	},
	Currency: {
		MODULE:                            'currency',
		GET_CURRENCIES:                    'get-currencies',
		GET_ANALYTICS_FILTERED_CURRENCIES:      'get-analytics-filtered-currencies',
		GET_CURRENCIES_CASH:               'get-currencies-for-cash',
	},
	ISIN: {
		MODULE:                        'isin',
		CREATE:                        'create',
		GET_PORTFOLIO_ISINS: 'portfolio-isins',
		ID:                  ':id',
		CURRENCY_BY_ISIN:    'currency-by-isin',
		MARKET_BY_ISIN:      'market-by-isin',
	},
}

export const binanceApiConstants = {
	priceUrl:            'api/v3/ticker/price',
	btcSymbol:           'BTCUSDT',
	ethSymbol:           'ETHUSDT',
	retryBinanceContext: 'Binance getSpotPrices',
}

export const SwaggerDescriptions = {
	GET_SECURITY: 'Get security by ISIN',
}

// export const currenciesToUsdList = [
// 	{ currency: CurrencyDataList.CAD, typeId: '75371',},
// 	{ currency: CurrencyDataList.NOK, typeId: '75939',},
// 	{ currency: CurrencyDataList.EUR, typeId: '126',},
// 	{ currency: CurrencyDataList.AED, typeId: '75831',},
// 	{ currency: CurrencyDataList.ZAR, typeId: '75965',},
// 	{ currency: CurrencyDataList.GBP, typeId: '372',},
// 	{ currency: CurrencyDataList.AUD, typeId: '27729',},
// 	{ currency: CurrencyDataList.JPY, typeId: '75161',},
// 	{ currency: CurrencyDataList.CHF, typeId: '75219',},
// 	{ currency: CurrencyDataList.USD, typeId: '1',},
// 	{ currency: CurrencyDataList.KRW, typeId: '75971',},
// 	{ currency: CurrencyDataList.SEK, typeId: '75941',},
// 	{ currency: CurrencyDataList.KZT, typeId: '74555',},
// 	{ currency: CurrencyDataList.CNY, typeId: '75103',},
// 	{ currency: CurrencyDataList.RUB, typeId: '74727',},
// 	{ currency: CurrencyDataList.TRY, typeId: '75425',},
// 	{ currency: CurrencyDataList.ILS, typeId: '75715',},
// 	{ currency: CurrencyDataList.HKD, typeId: '75541',},
// 	{ currency: CurrencyDataList.BRL, typeId: '75969',},
// 	{ currency: CurrencyDataList.MXN, typeId: '75961',},
// 	{ currency: CurrencyDataList.DKK, typeId: '75937',},
// ]