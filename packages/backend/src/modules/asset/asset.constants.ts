import { AnalyticsRoutes, } from '../analytics/analytics.constants'
import { ClientRoutes, } from '../client/client.constants'
import { PortfolioRoutes, } from '../portfolio/portfolio.constants'

export const AssetRoutes = {
	MODULE:                     'asset',
	CREATE:                     'create',
	ID:                         ':id',
	CREATE_DOCUMENT:            'create-document',
	GET_ASSET_LIST:             'get-list/:portfolioId',
	GET_TOTAL_ASSETS:           'get-total-assets/:portfolioId',
	DELETE_DOCUMENTS:           'delete-document',
	GET_ASSETS_BY_ACCOUNT_NAME: 'get-assets-by-account-name',
	SOURCE:                     'source',
	ASSET_LIST_BY_IDS:          'asset-list',
	ASSET_TOTAL_UNITS:          'total-units',
	TRANSFER:                   'transfer',
	GET_ASSET:                  'get-asset',
	ASSET_NAME:                 'asset-name',
	ASSETS_FOR_REQUEST:         'asset-for-request',
}

export const AssetDocumentsRoutes = {
	MODULE:                  'document',
	CREATE:                  'document/create',
	ASSET_DOCUMENT_LIST:     'document/list/:id',
	DOWNLOAD_DOCUMENT_ASSET: 'download-document-asset',
}

export const ApiBodyDescriptions = {
	ASSET_ID:                'Asset ID',
	CREATE_ASSET:            'Create new asset',
	CREATE_ASSET_DOCUMENT:   'Create new asset document',
	GET_ASSET_LIST:          'Get asset list',
	PORTFOLIO_ID:            'Portfolio ID',
	DELETE_DOCUMENTS:        'Delete documents',
	UPDATE_ASSET:            'Update asset',
	ACCOUNT_ID:              'Account ID',
	ASSET_NAME:              'Asset Name',
	OPTION_PAIRS:            'Get option pairs',
	LOAN_NAMES:              'Get loan names',
	OTHER_NAMES:             'Get other investments names',
	REAL_ESTATE_FILTERS:     'Get real estate filter selects',
	CRYPTO_FILTER_SELECTS:   'Get crypto filter selects',
	GET_ASSETS_BY_BANKS_IDS: 'Get asset list by banks ids',
	SOURCE_ID:               'Source id',
	TOTAL_UNITS:               'Asset total units',
	TRANSFER_ASSET:               'Transfer asset',
}

export const OptionAssetRoutes = {
	MODULE:                 'asset/option',
	GET_PAIRS_BY_BANKS_IDS: 'get-pairs-by-banks-ids',
	ACCOUNT_ID:             'Account id',
	ASSET_NAME:             'Asset name',
}

export const LoanAssetRoutes = {
	MODULE:             'asset/loan',
	GET_NAMES:          'get-names',
	GET_ALL_BY_FILTERS: 'get-all-by-filters',
}

export const CryptoAssetRoutes = {
	MODULE:             'asset/crypto',
	GET_FILTER_SELECTS: 'get-filter-selects',
}

export const MetalAssetRoutes = {
	MODULE:  'asset/metal',
	GET_ALL: 'get-all',
}

export const OtherAssetRoutes = {
	MODULE:    'asset/other',
	GET_NAMES: 'get-names',
}

export const RealEstateAssetRoutes = {
	MODULE:             'asset/real-estate',
	GET_FILTER_SELECTS: 'get-filter-selects',
}

export const cacheKeysToDeleteAsset = {
	bond: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.ISINS}`,
		`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.SECURITIES}`,
		`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
		`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.BOND}/${AnalyticsRoutes.CURRENCY}`,
	],
	cash: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.CASH}/${AnalyticsRoutes.CURRENCY}`,
	],
	crypto: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.CRYPTO_SELECTS}`,
		`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
		`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.CRYPTO}/${AnalyticsRoutes.CURRENCY}`,
	],
	deposit: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
		`/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.DEPOSIT}/${AnalyticsRoutes.CURRENCY}`,
	],
	equity: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.TYPES}`,
		`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
		`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.EQUITY}/${AnalyticsRoutes.CURRENCY}`,
	],
	loan: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.GET_NAMES}`,
		`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
		`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.LOAN}/${AnalyticsRoutes.CURRENCY}`,
	],
	metals: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.METALS}`,
		`/${AnalyticsRoutes.METALS}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.METALS}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.METALS}/${AnalyticsRoutes.GET_ALL}`,
	],
	options: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.GET_PAIRS_BY_BANKS_IDS}`,
		`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OPTIONS}/${AnalyticsRoutes.MATURITY}`,
	],
	other: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.OTHER_INVESTMEN}/${AnalyticsRoutes.GET_NAMES}`,
		`/${AnalyticsRoutes.OTHER_INVESTMEN}`,
		`/${AnalyticsRoutes.OTHER_INVESTMEN}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OTHER_INVESTMEN}/${AnalyticsRoutes.CURRENCY}`,
	],
	private: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.GET_NAMES}`,
		`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.LOAN_BY_FILTERS}`,
		`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.PRIVATE_EQUITY}/${AnalyticsRoutes.CURRENCY}`,
	],
	real: [
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.BANK}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ENTITY}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.OVERVIEW}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.CURRENCY}`,
		`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.CITY}`,
		`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.ASSET}`,
		`/${AnalyticsRoutes.REAL_ESTATE}/${AnalyticsRoutes.GET_FILTER_SELECTS}`,
	],
	portfolio: [
		`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
	],
	client: [
		`/${ClientRoutes.MODULE}/${ClientRoutes.LIST}`,
	],
}
