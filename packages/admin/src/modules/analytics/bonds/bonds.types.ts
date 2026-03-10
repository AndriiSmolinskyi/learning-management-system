import type {
	AssetNamesType,
} from '../../../shared/types'
import type {
	SortOrder,
} from '../../../shared/types'

// export enum TBondTableSortVariants {
// 	PROFIT_USD = 'profitUsd',
// 	PROFIT_PERCENTAGE = 'profitPercentage',
// 	COST_VALUE_USD = 'costValueUsd',
// 	COST_VALUE_FC = 'costValueFC',
// 	MARKET_VALUE_FC = 'marketValueFC',
// 	MARKET_VALUE_USD = 'marketValueUsd',
// 	ISIN = 'isin',
// 	SECURITY = 'security',
// }

export enum TBondTableSortVariants {
	PROFIT_USD = 'profitUSD',
	PROFIT_PERCENTAGE = 'profitPercentage',
	COST_VALUE_USD = 'costValueUSD',
	COST_VALUE_FC = 'costValueFC',
	MARKET_VALUE_FC = 'marketValueFC',
	MARKET_VALUE_USD = 'marketValueUSD',
	ISIN = 'isin',
	SECURITY = 'security',
	VALUE_DATE = 'valueDate',
	TOTAL_UNITS = 'totalUnits',
}

export type TBondSortFilter = {
	sortBy: TBondTableSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TBondFilter = {
	type: AssetNamesType.BONDS
	currency?: Array<string>
	bankId?: string
	assetId?: Array<string>
}