import { TBondTableSortVariants, TCryptoTableSortVariants, TDepositTableSortVariants, TEquityTableSortVariants, } from '../../analytics/analytics.types'
import { AssetNamesType, MetalsSortVariants, OtherInvestmentsSortVariants, TLoanTableSortVariants, TPrivateEquityTableSortVariants, } from '../../asset/asset.types'
import { SortOrder, } from '../../../shared/types'
import type { CashFilterDto, MetalsFilterDto, OptionsFilterDto, OtherInvestmentsFilterDto, RealEstateFilterDto, } from '../../analytics/dto'

export const cashFilters: CashFilterDto = {
	type:                AssetNamesType.CASH,
}

export const equityFilter = {
	type:           AssetNamesType.EQUITY_ASSET,
	clientIds:      undefined,
	portfolioIds:   undefined,
	entitiesIds:    undefined,
	bankIds:        undefined,
	bankListIds:    undefined,
	accountIds:     undefined,
	isins:          undefined,
	equityTypes:    undefined,
	securities:     undefined,
	currencies:     undefined,
	sortBy:         TEquityTableSortVariants.PROFIT_USD,
	sortOrder:      SortOrder.DESC,
	date:           undefined,
	tradeOperation: undefined,
}

export const bondFilter = {
	type:           AssetNamesType.BONDS,
	sortBy:         TBondTableSortVariants.PROFIT_USD,
	sortOrder:      SortOrder.DESC,
	clientIds:      undefined,
	portfolioIds:   undefined,
	entitiesIds:    undefined,
	bankIds:        undefined,
	bankListIds:    undefined,
	accountIds:     undefined,
	isins:          undefined,
	equityTypes:    undefined,
	securities:     undefined,
	currencies:     undefined,
	date:           undefined,
	tradeOperation: undefined,
}

export const cryptoFilter = {
	type:         AssetNamesType.CRYPTO,
	sortBy:       TCryptoTableSortVariants.CRYPTO_AMOUNT,
	sortOrder:    SortOrder.DESC,
}

export const cryptoCurrencyFilter = {
	type:         AssetNamesType.CRYPTO,
}

export const depositFilter = {
	type:         AssetNamesType.CASH_DEPOSIT,
	sortBy:       TDepositTableSortVariants.START_DATE,
	sortOrder:    SortOrder.DESC,
}

export const depositCurrencyFilter = {
	type:         AssetNamesType.CASH_DEPOSIT,
}

export const loanFilter = {
	type:         AssetNamesType.LOAN,
	clientIds:    undefined,
	portfolioIds: undefined,
	entitiesIds:  undefined,
	bankIds:      undefined,
	bankListIds:  undefined,
	accountIds:   undefined,
	loanNames:    undefined,
	currencies:   undefined,
	sortBy:       TLoanTableSortVariants.START_DATE,
	sortOrder:    SortOrder.DESC,
	assetIds:     undefined,
	date:         undefined,
}

export const loanCurrencyFilter = {
	type:         AssetNamesType.LOAN,
	clientIds:    undefined,
	portfolioIds: undefined,
	entitiesIds:  undefined,
	bankIds:      undefined,
	bankListIds:  undefined,
	accountIds:   undefined,
	loanNames:    undefined,
	currencies:   undefined,
	assetIds:     undefined,
	date:         undefined,
}

export const metalFilter: MetalsFilterDto =   {
	type:           AssetNamesType.METALS,
	clientIds:      undefined,
	portfolioIds:   undefined,
	bankIds:        undefined,
	bankListIds:    undefined,
	accountIds:     undefined,
	entitiesIds:    undefined,
	currencies:     undefined,
	metals:         undefined,
	assetIds:       undefined,
	date:           undefined,
	sortBy:         MetalsSortVariants.VALUE_DATE,
	sortOrder:      SortOrder.DESC,
	tradeOperation: undefined,
}
export const metalCurrencyFilter: MetalsFilterDto =  {
	type:           AssetNamesType.METALS,
	clientIds:      undefined,
	portfolioIds:   undefined,
	bankIds:        undefined,
	bankListIds:    undefined,
	accountIds:     undefined,
	entitiesIds:    undefined,
	currencies:     undefined,
	metals:         undefined,
	assetIds:       undefined,
	date:           undefined,
	sortBy:         MetalsSortVariants.VALUE_DATE,
	sortOrder:      SortOrder.DESC,
	tradeOperation: undefined,
}

export const optionsFilter: OptionsFilterDto = {
	type:         AssetNamesType.OPTIONS,
	clientIds:    undefined,
	portfolioIds: undefined,
	entityIds:    undefined,
	bankIds:      undefined,
	bankListIds:  undefined,
	accountIds:   undefined,
	pairs:        undefined,
	assetIds:     undefined,
	maturityYear: undefined,
	date:         undefined,
}

export const otherFilter: OtherInvestmentsFilterDto =  {
	type:                 AssetNamesType.OTHER,
	clientIds:            undefined,
	portfolioIds:         undefined,
	bankIds:              undefined,
	bankListIds:          undefined,
	accountIds:           undefined,
	entitiesIds:          undefined,
	currencies:           undefined,
	investmentAssetNames: undefined,
	serviceProviders:     undefined,
	assetIds:             undefined,
	date:                 undefined,
	sortBy:               OtherInvestmentsSortVariants.INVESTMENT_DATE,
	sortOrder:            SortOrder.DESC,
}
export const otherCurrencyFilter: OtherInvestmentsFilterDto = {
	type:                 AssetNamesType.OTHER,
	clientIds:            undefined,
	portfolioIds:         undefined,
	bankIds:              undefined,
	bankListIds:          undefined,
	accountIds:           undefined,
	entitiesIds:          undefined,
	currencies:           undefined,
	investmentAssetNames: undefined,
	serviceProviders:     undefined,
	assetIds:             undefined,
	date:                 undefined,
	sortBy:               undefined,
	sortOrder:            undefined,
}

export const privateFilter = {
	type:         AssetNamesType.PRIVATE_EQUITY,
	sortBy:       TPrivateEquityTableSortVariants.ENTRY_DATE,
	sortOrder:    SortOrder.DESC,
}

export const privateCurrencyFilter = {
	type:         AssetNamesType.PRIVATE_EQUITY,
}

export const realEstateFilter: RealEstateFilterDto = {
	type:                AssetNamesType.REAL_ESTATE,
	clientIds:           undefined,
	portfolioIds:        undefined,
	entityIds:           undefined,
	bankIds:             undefined,
	bankListIds:         undefined,
	accountIds:          undefined,
	currencies:          undefined,
	operations:          undefined,
	projectTransactions: undefined,
	countries:           undefined,
	cities:              undefined,
	assetIds:            undefined,
	date:                undefined,
}

export const budgetListFilter = {
	clientIds:   undefined,
	search:      undefined,
	isActivated: undefined,
}

export const getPortfoliosFilter = {
	isActivated:   'false',
	isDeactivated: 'false',
	clients:       [],
	types:         [],
	range:         [],
	search:        '',
}

export const getClientsFilter = {
	sortBy:        undefined,
	sortOrder:     undefined,
	search:        undefined,
	skip:          undefined,
	take:          undefined,
	isActivated:   undefined,
	isDeactivated: undefined,
	range:         undefined,
}

export const getBudgetsFilter = {
	clientIds:   undefined,
	search:      undefined,
	isActivated: undefined,
}