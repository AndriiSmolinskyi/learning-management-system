import { AnalyticsRoutes, } from '../analytics/analytics.constants'

export const TransactionRoutes = {
	TRANSACTION:               'transaction',
	LIST:                      'list',
	FILTER:                    'filter',
	DRAFT:                     'transaction/draft',
	CREATE:                    'create',
	ID:                        ':id',
	BUDGET:                    'budget',
	GET_TOTAL_CURRENCY_AMOUNT: 'currency-amount',
}

export const SwaggerDescriptions = {
	TRANSACTION_TAG:    'Transaction',
	DRAFT_TAG:          'Transaction draft',
	DRAFT_ID:           'Transaction draft ID',
	CREATE_TRANSACTION: 'Create new transaction',
	CREATE_DRAFT:       'Create new transaction draft',
	UPDATE_TRANSACTION: 'Update transaction',
	UPDATE_DRAFT:       'Update transaction draft',
	ID:                 'Transaction ID',
	FILTER:             'Transaction list filter',
	SOURCE_ID:          'Source ID',
}

export const cacheKeysToDeleteTransaction = [
	`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
	`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
	`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.ENTITY}`,
	`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.TRANSACTION}`,
	`/${AnalyticsRoutes.TRANSACTION}/${AnalyticsRoutes.TRANSACTION_PL}`,
]
