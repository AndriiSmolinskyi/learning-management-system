export const CBondsRoutes = {
	MODULE:    'cbonds',
	Emissions: {
		MODULE:           'emissions',
		GET_ISINS:        'get-isins',
		GET_SECURITY:     'get-security',
		GET_SECURITIES:   'get-securities',
		CURRENCY_BY_ISIN: 'currency-by-isin',
		MARKET_BY_ISIN:      'market-by-isin',
		ISIN:             'isin',
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
		GET_CURRENCIES_CASH:               'get-currencies-for-cash',
		GET_ANALYTICS_FILTERED_CURRENCIES:      'get-analytics-filtered-currencies',
	},
}