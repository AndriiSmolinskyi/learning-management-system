import type {
	SortOrder,
} from '../../../shared/types'

export enum TCashCurrencyTableSortVariants {
	USD_VALUE = 'usdValue',
	PERCENTAGE = 'percentage'
}

export type TCashCurrencyTableFilter = {
	sortBy: TCashCurrencyTableSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TCashFilter = {
	currency?: Array<string>
	chartCurrency?: Array<string>
	bankId?: string
	entityId?: string
}