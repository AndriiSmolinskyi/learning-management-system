import type {
	AssetNamesType,
} from '../../../shared/types'
import type {
	SortOrder,
} from '../../../shared/types'

export enum TDepositTableSortVariants {
	START_DATE = 'startDate',
	MATURITY_DATE = 'maturityDate',
	USD_VALUE = 'usdValue',
	PORTFOLIO_NAME = 'portfolioName',
	ENTITY_NAME = 'entityName',
	BANK_NAME = 'bankName',
	ACCOUNT_NAME = 'accountName',
	CURRENCY = 'currency',
	CURRENCY_VALUE = 'currencyValue',
	INTEREST = 'interest',
	POLICY = 'policy'
}

export type TDepositSortFilter = {
	sortBy: TDepositTableSortVariants | undefined
	sortOrder: SortOrder | undefined
}

export type TDepositFilter = {
	type: AssetNamesType.CASH_DEPOSIT
	currency?: Array<string>
	bankId?: string
	assetId?: Array<string>
}