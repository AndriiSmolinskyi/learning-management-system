export const queryKeys = {
	CBONDS: {
		EMISSIONS_ISINS:      'emissions-isins',
		EQUITY_ISINS:         'equity-isins',
		EMISSIONS_SECURITIES: 'emissions-securities',
		CURRENCIES:           'currencies',
		CASH_CURRENCIES:      'cash-currencies',
		SECURITY:             'security',
		ISSUER:               'issuer',
		CURRENCY_BY_ISIN:     'currency-by-isin',
		MARKET_BY_ISIN:       'market-by-isin',
	},
	USER:                             'user',
	CLIENT:                           'client',
	CLIENT_LIST:                      'client-list',
	CLIENT_DRAFT:                     'client-draft',
	DOCUMENT:                         'document',
	DOCUMENT_TYPES:                   'document-types',
	PORTFOLIO:                        'portfolio',
	PORTFOLIO_DETAILED:               'portfolio-detailed',
	PORTFOLIO_MAX_TOTALS:             'portfolio-max-totals',
	ENTITY:                           'entity',
	BANK:                             'bank',
	BANK_LIST:                        'bank-list',
	METAL_LIST:                       'metal-list',
	ENTITY_LIST:                      'entity-list',
	OPTION_PAIRS:                     'options-pairs',
	LOAN_NAMES:                       'loan-names',
	LOAN_ANALYTICS:                   'loan-analytics',
	DEPOSIT_ANALYTICS:                'deposit-analytics',
	PE_ANALYTICS:                     'pe-analytics',
	OTHER_NAMES:                      'other-names',
	BOND_ISINS:                       'bond-isins',
	BOND_SECURITIES:                  'bond-securities',
	BONDS_ANALYTICS:                  'bond-analytics',
	OTHER_INVESTMEN:                  'other-investment',
	METALS:                           'metals',
	REAL_ESTATE_FILTERS:              'real-estate-filters',
	TRANSACTION_TYPE_LIST:            'transaction-type-list',
	TRANSACTION_CATEGORY_LIST:        'transaction-category-list',
	TRANSACTION_CATEGORY_FOR_LIST:    'transaction-category-for-list',
	ACCOUNT:                          'account',
	ACCOUNT_LIST:                     'account-list',
	PORTFOLIO_LIST:                   'portfolio-list',
	PORTFOLIO_SELECT_LIST:            'portfolio-select_list',
	SUB_PORTFOLIO_LIST:               'subportfolio-list',
	ASSET:                            'asset',
	ASSET_LIST:                       'asset-list',
	ASSET_TOTAL_UNITS:                'asset-total-units',
	CRYPTO_FILTER_SELECTS:            'crypto-filter-selects',
	DOCUMENTS_ENTITY_PORTFOLIO:       'documents-entity-portfolio',
	ASSET_DOCUMENT_LIST:              'asset-document-list',
	ENTITY_DOCUMENT_LIST:             'entity-document-list',
	SERVICE_PROVIDERS_LIST:           'service-providers',
	ENCRYPTED_SERVICE_PROVIDERS_LIST:      'encrypted-service-providers',
	TOTAL_ASSETS_VALUE:               'total-assets',
	REQUEST:                          'request',
	REPORT:                           'report',
	REQUEST_DRAFT:                    'request-draft',
	REPORT_DRAFT:                     'report-draft',
	TRANSACTION:                      'transaction',
	TRANSACTION_FILTERED:             'transaction-filtered',
	TRANSACTION_DRAFT:                'transaction-draft',
	TRANSACTION_ANALYTICS:            'transaction-analytics',
	COMPLIANCE_CHECK_DOCUMENT:        'compliance-check-documents',
	ORDER:                            'order',
	ORDER_DRAFT:                      'order-draft',
	ORDER_LIST:                       'order-list',
	ORDER_UNITS:                      'order-units',
	ASSETS_BY_ACCOUNT_NAME:           'assets-by-account-hanme',
	ORDER_ASSETS:                     'order-assets',
	REAL_ESTATE:                      'real-estate',
	OPTIONS:                          'options',
	CASH:                             'cash',
	OVERVIEW:                         'overview',
	ANALYTICS_CURRENCY:               'analytics-currency',
	ANALYTICS_BONDS_CURRENCY:         'analytics--bonds-currency',
	ANALYTICS_CITY:                   'analytics-city',
	ANALYTICS_ASSET:                  'analytics-asset',
	ANALYTICS_BANK:                   'analytics-bank',
	ANALYTICS_MATURITY:               'analytics-maturity',
	ANALYTICS_BONDS_BANK:             'analytics-bonds-bank',
	ANALYTICS_ENTITY:                 'analytics-entity',
	ANALYTICS_EQUITY:                 'analytics-equity',
	ANALYTICS_EQUITY_BANK:            'analytics-equity-bank',
	ANALYTICS_EQUITY_CURRENCY:        'analytics-equity-currency',
	EQUITY_TYPES:                     'equity-types',
	PRIVATE_EQUITY_TYPES:             'private-equity-types',
	PRIVATE_EQUITY_NAMES:             'private-equity-names',
	ANALYTICS_DEPOSIT:                'analytics-deposit',
	ANALYTICS_CRYPTO:                 'analytics-crypto',
	ANALYTICS_CRYPTO_TYPES:           'analytics-crypto-types',
	ANALYTICS_CRYPTO_WALLETS:         'analytics-crypto-wallets',
	ANALYTICS_CRYPTO_BANK:            'analytics-crypto-bank',
	ANALYTICS_CRYPTO_CURRENCY:        'analytics-crypto-currency',
	PORTFOLIO_CHART:                  'portfolio-chart',
	BUDGET_LIST:                      'budget-list',
	BUDGET_DRAFT_LIST:                'budget-draft-list',
	BUDGET_DRAFT:                     'budget-draft',
	BUDGET_PLAN:                      'budget-plan',
	EXPENSE_CATEGORY_LIST:            'expense-category-list',
	EXPENSE_CATEGORIES:               'expense-categories',
	BUDGET_BANKS_CHART:               'budget-banks-chart',
	BUDGET_TRANSACTIONS:              'budget-transactions',
	EXPENSE_CATEGORY:                 'expense-category',
	BUDGET_CLIENT_LIST:               'budget-client-list',
	TRANSACTION_CURRENCY_TOTALS:      'transaction-currency-totals',
	TRANSACTION_FILTERED_SELECTS:      'transaction-filtered-selects',
	OPTION_PREMIUM:                   'option-premium',
	ANNUAL_INCOME:                    'annual-income',
	REAL_INCOME:                      'real-income',
	TRANSACTION_TYPES:                'transaction-types',
	TRANSACTION_TYPES_DRAFT:          'transaction-types-draft',
	TRANSACTION_TYPES_AUDIT:          'transaction-types-audit',
	PORTFOLIO_ISINS:                  'portfolio-isins',
	ASSETS_FOR_REQUEST:               'assets-for-request',
	ANALYTICS_AVAILABILITY:           'analytics-availability',
	TABLE_PREFERENCE:                 'TABLE_PREFERENCE',
}

export const keysToInvalidateMainRoutes = [
	[queryKeys.PORTFOLIO_LIST,],
	[queryKeys.CLIENT,],
	[queryKeys.PORTFOLIO_DETAILED,],
	[queryKeys.OVERVIEW,queryKeys.ANALYTICS_BANK,],
	[queryKeys.OVERVIEW,queryKeys.ANALYTICS_CURRENCY,],
	[queryKeys.OVERVIEW,queryKeys.ANALYTICS_ENTITY,],
	[queryKeys.OVERVIEW,queryKeys.ANALYTICS_ASSET,],
	[queryKeys.BUDGET_LIST,],
]

export const keysToInvalidateBondAnalytics = [
	[queryKeys.BONDS_ANALYTICS,],
	[queryKeys.ANALYTICS_BONDS_BANK,],
	[queryKeys.ANALYTICS_BONDS_CURRENCY,],
]

export const keysToInvalidateCashAnalytics = [
	[queryKeys.CASH, queryKeys.ANALYTICS_ENTITY,],
	[queryKeys.CASH, queryKeys.ANALYTICS_BANK,],
	[queryKeys.CASH, queryKeys.ANALYTICS_CURRENCY,],
]

export const keysToInvalidateCryptoAnalytics = [
	[queryKeys.ANALYTICS_CRYPTO,],
	[queryKeys.ANALYTICS_CRYPTO_BANK,],
	[queryKeys.ANALYTICS_CRYPTO_CURRENCY,],
]

export const keysToInvalidateDepositAnalytics = [
	[queryKeys.DEPOSIT_ANALYTICS,],
	[queryKeys.ANALYTICS_BANK,],
	[queryKeys.ANALYTICS_CURRENCY,],
]

export const keysToInvalidateEquityAnalytics = [
	[queryKeys.ANALYTICS_EQUITY,],
	[queryKeys.ANALYTICS_EQUITY_BANK,],
	[queryKeys.ANALYTICS_EQUITY_CURRENCY,],
]

export const keysToInvalidateLoanAnalytics = [
	[queryKeys.LOAN_ANALYTICS,],
]

export const keysToInvalidateMetalAnalytics = [
	[queryKeys.METALS,],
	[queryKeys.METALS, queryKeys.ANALYTICS_BANK,],
]

export const keysToInvalidateOptionAnalytics = [
	[queryKeys.OPTIONS, queryKeys.ANALYTICS_ASSET,],
	[queryKeys.OPTION_PREMIUM,],
	[queryKeys.OPTIONS, queryKeys.ANALYTICS_BANK,],
	[queryKeys.OPTIONS, queryKeys.ANALYTICS_MATURITY,,],
]

export const keysToInvalidateOtherAnalytics = [
	[queryKeys.OTHER_INVESTMEN,],
	[queryKeys.OTHER_INVESTMEN, queryKeys.ANALYTICS_BANK,],
	[queryKeys.OTHER_INVESTMEN, queryKeys.ANALYTICS_CURRENCY,],
]

export const keysToInvalidatePEAnalytics = [
	[queryKeys.PE_ANALYTICS,],
]

export const keysToInvalidateREAnalytics = [
	[queryKeys.REAL_ESTATE,	queryKeys.ANALYTICS_ASSET,],
	[queryKeys.REAL_ESTATE,	queryKeys.ANALYTICS_CURRENCY,],
	[queryKeys.REAL_ESTATE,	queryKeys.ANALYTICS_CITY,,],
]

export const keysToInvalidateCBondsUpdate = [
	...keysToInvalidateMainRoutes,
	...keysToInvalidateBondAnalytics,
	...keysToInvalidateCashAnalytics,
	...keysToInvalidateCryptoAnalytics,
	...keysToInvalidateDepositAnalytics,
	...keysToInvalidateEquityAnalytics,
	...keysToInvalidateLoanAnalytics,
	...keysToInvalidateMetalAnalytics,
	...keysToInvalidateOptionAnalytics,
	...keysToInvalidateOtherAnalytics,
	...keysToInvalidatePEAnalytics,
	...keysToInvalidateREAnalytics,
]

export const keysToInvalidateClientDeleted = [
	[queryKeys.PORTFOLIO_LIST,],
	[queryKeys.CLIENT,],
]