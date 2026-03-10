import type {
	AssetNamesType, SortOrder,
} from '../../../shared/types'

export enum TOtherInvestmentsTableSortVariants {
	USD_VALUE = 'usdValue',
	CURRENCY_VALUE = 'currencyValue',
	INVESTMENT_DATE = 'investmentDate',
	PROFIT_USD = 'profitUSD',
	PROFIT_PER = 'profitPercentage',
	MARKET_VALUE_USD = 'marketValueUSD',
}

export type TOtherInvestmentsSortFilter = {
	sortBy: TOtherInvestmentsTableSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TOtherInvestmentsFilter = {
	type: AssetNamesType.OTHER
	currency?: Array<string>
	bankId?: string
	assetIds?: Array<string>
}

export type TOtherInvestmentsAnalytics = {
	type: AssetNamesType.OTHER
	clientIds?: Array<string>
	portfolioIds?: Array<string>
	bankIds?: Array<string>
	entitiesIds?: Array<string>
	currencies?: Array<string>
	serviceProvider?: Array<string>
	investmentAssetNames?: Array<string>
}

