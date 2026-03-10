import type {
	AssetNamesType,
} from '../../../shared/types'
import type {
	SortOrder,
} from '../../../shared/types'

export enum TCryptoTableSortVariants {
	USD_AMOUNT = 'usdAmount',
	CRYPTO_AMOUNT = 'cryptoAmount',
	PURCHASE_DATE = 'purchaseDate',
	PURCHASE_PRICE = 'purchasePrice',
	PROFIT_USD = 'profitUSD',
	PROFIT_PER = 'profitPercentage',
	COST_VALUE_USD = 'costValueUSD',
	MARKET_VALUE_USD = 'marketValueUSD',
	CURRENT_STOCK_PRICE = 'currentStockPrice',
	UNITS = 'totalUnits',
	VALUE_DATE = 'valueDate',
	COST_PRICE = 'costPrice',
}

export type TCryptoSortFilter = {
	sortBy: TCryptoTableSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TCryptoFilter = {
	type: AssetNamesType.CRYPTO
	currency?: Array<string>
	wallets?: Array<string>
	productTypes?: Array<string>
	assetId?: Array<string>
	bankId?: string
	cryptoTypes?: Array<string>
}

export type TCryptoProductType = {
	isDirectHold: boolean
	isETF: boolean
}