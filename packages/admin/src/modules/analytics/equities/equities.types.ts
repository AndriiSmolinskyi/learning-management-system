import type {
	AssetNamesType,
} from '../../../shared/types'
import type {
	SortOrder,
} from '../../../shared/types'

export enum TEquityTableSortVariants {
	PROFIT_USD = 'profitUSD',
	PROFIT_PERCENTAGE = 'profitPercentage',
	COST_VALUE_FC = 'costValueFC',
	MARKET_VALUE_FC = 'marketValueFC',
	COST_VALUE_USD = 'costValueUSD',
	MARKET_VALUE_USD = 'marketValueUSD',
	ISIN = 'isin',
	SECURITY = 'security',
	VALUE_DATE = 'transactionDate',
	TOTAL_UNITS = 'totalUnits'
}

export type TEquitySortFilter = {
	sortBy: TEquityTableSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TEquityFilter = {
	type: AssetNamesType.EQUITY_ASSET
	currency?: Array<string>
	bankId?: string
	assetId?: Array<string>
}