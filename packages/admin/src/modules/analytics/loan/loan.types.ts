import type {
	AssetNamesType,
} from '../../../shared/types'
import type {
	SortOrder,
} from '../../../shared/types'

export enum TLoanTableSortVariants {
	START_DATE = 'startDate',
	MATURITY_DATE = 'maturityDate',
	USD_VALUE = 'usdValue',
}

export type TLoanSortFilter = {
	sortBy: TLoanTableSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TLoanFilter = {
	type: AssetNamesType.LOAN
	currency?: Array<string>
	bankId?: string
	assetId?: Array<string>
}

