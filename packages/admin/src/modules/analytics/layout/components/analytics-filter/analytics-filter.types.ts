import type {
	MultiValue,
} from 'react-select'
import type {
	AssetOperationType,
	CryptoType,
	IOptionType,
	MetalType,
} from '../../../../../shared/types'

export type SelectOptionType = {
	id: string
	name: string
}

export type OperationSelectOptionType = {
	id: AssetOperationType
	name: AssetOperationType
}

export type ProductTypeSelectOptionType = {
	id: CryptoType
	name: CryptoType
}

export type MetalProductTypeSelectOptionType = {
	id: MetalType
	name: MetalType
}

type TAnalyticsFilterItem = MultiValue<IOptionType<SelectOptionType>> | undefined

export type TAnalyticsFilter = {
	clientIds?: TAnalyticsFilterItem
	portfolioIds?: TAnalyticsFilterItem
	entitiesIds?: TAnalyticsFilterItem
	bankIds?: TAnalyticsFilterItem
	accountIds?: TAnalyticsFilterItem
	isins?: TAnalyticsFilterItem
	securities?: TAnalyticsFilterItem
	currencies?: TAnalyticsFilterItem
	pairs?: TAnalyticsFilterItem
	loanNames?: TAnalyticsFilterItem
	cryptoTypes?: TAnalyticsFilterItem
	wallets?: TAnalyticsFilterItem
	productTypes?: IOptionType<ProductTypeSelectOptionType> | undefined
	metalProductTypes?: IOptionType<MetalProductTypeSelectOptionType> | undefined
	metals?: TAnalyticsFilterItem
	investmentAssetNames?: TAnalyticsFilterItem
	otherNames?: TAnalyticsFilterItem
	serviceProviders?: TAnalyticsFilterItem
	operations?: TAnalyticsFilterItem
	projectTransactions?: TAnalyticsFilterItem
	cities?: TAnalyticsFilterItem
	countries?: TAnalyticsFilterItem
	equityTypes?: TAnalyticsFilterItem
	privateEquityNames?: TAnalyticsFilterItem,
	privateEquityTypes?: TAnalyticsFilterItem,
	date?: string | undefined
	tradeOperation?: IOptionType<OperationSelectOptionType> | undefined
}