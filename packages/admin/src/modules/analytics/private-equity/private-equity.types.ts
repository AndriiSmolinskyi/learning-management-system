import type {
	AssetNamesType,
} from '../../../shared/types'
import type {
	SortOrder,
} from '../../../shared/types'

export enum TPrivateEquityTableSortVariants {
	ENTRY_DATE = 'entryDate',
	USD_VALUE = 'marketValueUSD',
	TOTAL_COMMITMENT = 'totalCommitment',
	PROFIT = 'pl',
	CALLED_CAPITAL = 'capitalCalled'
}

export type TPrivateEquitySortFilter = {
	sortBy: TPrivateEquityTableSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TPrivateEquityFilter = {
	type: AssetNamesType.PRIVATE_EQUITY
	currency?: Array<string>
	bankId?: string
	assetId?: Array<string>
}