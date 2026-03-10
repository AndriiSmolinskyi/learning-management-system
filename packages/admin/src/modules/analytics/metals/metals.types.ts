import type {
	AssetNamesType, SortOrder,
} from '../../../shared/types'

export enum MetalsTableSortVariants {
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

export type MetalsSortFilter = {
	sortBy: MetalsTableSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TMetalsProductType = {
	isDirectHold: boolean
	isETF: boolean
}

export type MetalsFilter = {
	type: AssetNamesType.METALS
	currency?: Array<string>
	metal?: Array<string>
	bankId?: string
	assetIds?: Array<string>
	productTypes?: Array<string>
}

export type MetalsAnalytics = {
	type: AssetNamesType.METALS
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	bankIds?: Array<string>
	entitiesIds?: Array<string>
	metals?: Array<string>
}

