import type {
	AssetNamesType,
	CryptoList,
	CurrencyList,
	MetalList,
	SortOrder,
} from '../../../shared/types'

export enum TOverviewSortVariants {
	USD_VALUE = 'usdValue',
	PERCENTAGE = 'percentage'
}

export type TOverviewTableFilter = {
	sortBy: TOverviewSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TOverviewFilter = {
	pieEntityIds?: Array<string>
	tableEntityIds?: Array<string>
	pieAssetNames?: Array<AssetNamesType>
	tableAssetNames?: Array<AssetNamesType>
	tableBankIds?: Array<string>
	pieBankIds?: Array<string>
	tableAccountIds?: Array<string>
	pieCurrencies?: Array<CurrencyList | MetalList | CryptoList>
	tableCurrencies?: Array<CurrencyList | MetalList | CryptoList>
}