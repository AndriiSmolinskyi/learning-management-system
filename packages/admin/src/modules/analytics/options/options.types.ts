import type {
	SortOrder,
} from '../../../shared/types'

export enum TOptionsSortVariants {
	START_DATE = 'startDate',
	MATURITY = 'maturityDate',
	MARKET_VALUE = 'marketValueUSD',
}

export type TOptionsTableFilter = {
	sortBy: TOptionsSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TOptionsFilter = {
	bankId?: string
	maturityYear?: number
	assetIds?: Array<string>
}