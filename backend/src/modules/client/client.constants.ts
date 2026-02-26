import { AnalyticsRoutes, } from '../analytics/analytics.constants'
import { PortfolioRoutes, } from '../portfolio/portfolio.constants'
import { TransactionRoutes, } from '../transaction/transaction.constants'

export const ClientRoutes = {
	MODULE:              'client',
	LIST:                'list',
	SELECT_LIST:         'select-list',
	ID:                  ':id',
	ACTIVATE_ID:         'activate/:id',
	RESEND_CONFIRMATION: 'resend-confirmation/:id',
	CREATE:              'create',
	RESET_PASSWORD:              'reset-password/:email',
}

export const ClientDraftRoutes = {
	MODULE:  'draft',
	LIST:    'list',
	CREATE:  'create',
	ID:     ':id',
	DELETE: 'delete',
	UPDATE: 'update',
}

export const SwaggerDescriptions = {
	CLIENT_TAG:     'Clients',
	DRAFT_TAG:      'Client drafts',
}

export const cacheKeysToDeleteClient = [
	`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
	`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
	`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.ISINS}`,
	`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.SECURITIES}`,
	`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
	`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.ENTITY}`,
	`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.CRYPTO_SELECTS}`,
	`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
	`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
	`/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.TYPES}`,
	`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
	`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.GET_NAMES}`,
	`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
	`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.METALS}`,
	`/${AnalyticsRoutes.METALS}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.METALS}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.METALS}/${AnalyticsRoutes.GET_ALL}`,
	`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.GET_PAIRS_BY_BANKS_IDS}`,
	`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.ASSET}`,
	`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.MATURITY}`,
	`/${AnalyticsRoutes.OTHER_INVESTMEN}/${AnalyticsRoutes.GET_NAMES}`,
	`/${AnalyticsRoutes.OTHER_INVESTMEN}`,
	`/${AnalyticsRoutes.OTHER_INVESTMEN}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.OTHER_INVESTMEN}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.GET_NAMES}`,
	`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
	`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.BANK}`,
	`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.CURRENCY}`,
	`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.CITY}`,
	`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.ASSET}`,
	`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.GET_FILTER_SELECTS}`,
	`/${AnalyticsRoutes.TRANSACTION}`,
	`/${AnalyticsRoutes.TRANSACTION}/${AnalyticsRoutes.TRANSACTION_PL}`,
	`/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,
	`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_CHART}`,
	`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
	`/${TransactionRoutes.TRANSACTION}/${TransactionRoutes.FILTER}`,
]

export const cacheKeysToDeleteClientUpdate = [
	`/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,
]

export const cacheKeysToDeleteClientCreate = [
	`/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,
	// `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
]
