import type {
	SortOrder,
} from '../../../shared/types'

export enum TRealEstateSortVariants {
	DATE = 'investmentDate',
	CURRENCY_VALUE = 'currencyValue',
	PROFIT_USD = 'profitUSD',
	PROFIT_PER = 'profitPercentage',
	MARKET_VALUE_USD = 'marketValueUSD',
	COST_VALUE_USD = 'usdValue',
}

export type TRealEstateTableFilter = {
	sortBy: TRealEstateSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TRealEstateFilter = {
	currency?: Array<string>
	city?: string
	assetIds?: Array<string>
}