import {
	create,
} from 'zustand'
import {
	persist,
} from 'zustand/middleware'
import type {
	MultiValue,
} from 'react-select'
import type {
	IOptionType, TAssetTransfer,
} from '../../shared/types'
import type {
	MetalProductTypeSelectOptionType,
	OperationSelectOptionType, ProductTypeSelectOptionType,
} from './layout/components/analytics-filter/analytics-filter.types'

type TAnalyticsState = {
	analyticsFilter: TAnalyticsStoreFilter
	assetTransferProps: TAssetTransfer | undefined

}

export type SelectOptionType = {
	id: string
	name: string
}

type TAnalyticsStoreFilterItem = MultiValue<IOptionType<SelectOptionType>> | undefined

export type TAnalyticsStoreFilter = {
	clientIds?: TAnalyticsStoreFilterItem
	portfolioIds?: TAnalyticsStoreFilterItem
	entitiesIds?: TAnalyticsStoreFilterItem
	bankIds?: TAnalyticsStoreFilterItem
	accountIds?: TAnalyticsStoreFilterItem
	isins?: TAnalyticsStoreFilterItem
	securities?: TAnalyticsStoreFilterItem
	currencies?: TAnalyticsStoreFilterItem
	pairs?: TAnalyticsStoreFilterItem
	loanNames?: TAnalyticsStoreFilterItem
	investmentAssetNames?: TAnalyticsStoreFilterItem
	cryptoTypes?: TAnalyticsStoreFilterItem
	wallets?: TAnalyticsStoreFilterItem
	productTypes?: IOptionType<ProductTypeSelectOptionType> | undefined
	metalProductTypes?: IOptionType<MetalProductTypeSelectOptionType> | undefined
	metals?: TAnalyticsStoreFilterItem
	otherNames?: TAnalyticsStoreFilterItem
	serviceProviders?: TAnalyticsStoreFilterItem
	operations?: TAnalyticsStoreFilterItem
	projectTransactions?: TAnalyticsStoreFilterItem
	cities?: TAnalyticsStoreFilterItem
	countries?: TAnalyticsStoreFilterItem
	equityTypes?: TAnalyticsStoreFilterItem
	privateEquityNames?: TAnalyticsStoreFilterItem,
	privateEquityTypes?: TAnalyticsStoreFilterItem,
	date?: string | undefined
	tradeOperation?: IOptionType<OperationSelectOptionType> | undefined
}

export type TAnalyticsAction = (value: TAnalyticsStoreFilterItem) => void

type TAnalyticsActions = {
	setClientsIds: TAnalyticsAction
	setPortfolioIds: TAnalyticsAction
	setEntitiesIds: TAnalyticsAction
	setBankIds: TAnalyticsAction
	setAccountIds: TAnalyticsAction
	setCurrencies: TAnalyticsAction
	setISINs: TAnalyticsAction
	setSecurities: TAnalyticsAction
	setPairs: TAnalyticsAction
	setLoanNames: TAnalyticsAction
	setInvestmentAssetNames: TAnalyticsAction
	setCryptoTypes: TAnalyticsAction
	setWallets: TAnalyticsAction
	setProductTypes: (productType: IOptionType<ProductTypeSelectOptionType> | undefined) => void
	setMetalProductTypes: (productType: IOptionType<MetalProductTypeSelectOptionType> | undefined) => void
	setMetals: TAnalyticsAction
	setOtherNames: TAnalyticsAction
	setServiceProviders: TAnalyticsAction
	setOperations: TAnalyticsAction
	setProjectTransactions: TAnalyticsAction
	setCities: TAnalyticsAction
	setCountries: TAnalyticsAction
	setEquityTypes: TAnalyticsAction
	setPrivateEquityTypes: TAnalyticsAction
	setPrivateEquityNames: TAnalyticsAction
	setDate: (date: string | undefined) => void
	setTradeOperation: (tradeOperation: IOptionType<OperationSelectOptionType> | undefined) => void
	setAssetTransferProps: (data: TAssetTransfer | undefined) => void
	resetAnalyticsFilterStore: () => void
}

export const initialState: TAnalyticsState = {
	analyticsFilter: {
		clientIds:            undefined,
		portfolioIds:         undefined,
		entitiesIds:          undefined,
		bankIds:              undefined,
		accountIds:           undefined,
		isins:                undefined,
		securities:           undefined,
		currencies:           undefined,
		pairs:                undefined,
		loanNames:            undefined,
		investmentAssetNames: undefined,
		cryptoTypes:          undefined,
		wallets:              undefined,
		productTypes:         undefined,
		metalProductTypes:         undefined,
		metals:               undefined,
		otherNames:           undefined,
		serviceProviders:     undefined,
		operations:           undefined,
		projectTransactions:  undefined,
		cities:               undefined,
		countries:            undefined,
		privateEquityNames:   undefined,
		privateEquityTypes:   undefined,
		equityTypes:          undefined,
		date:                 undefined,
		tradeOperation:       undefined,
	},
	assetTransferProps: undefined,
}

export const useAnalyticsFilterStore = create<TAnalyticsState & TAnalyticsActions>()(
	persist(
		(set, get,) => {
			return {
				...initialState,
				setClientsIds: (clientIds,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, clientIds,
							},
						}
					},)
				},

				setAssetTransferProps: (data,): void => {
					set(() => {
						return {
							assetTransferProps: data,
						}
					},)
				},

				setPortfolioIds: (portfolioIds,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, portfolioIds,
							},
						}
					},)
				},

				setEntitiesIds: (entitiesIds,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, entitiesIds,
							},
						}
					},)
				},

				setBankIds: (bankIds,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, bankIds,
							},
						}
					},)
				},

				setAccountIds: (accountIds,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, accountIds,
							},
						}
					},)
				},

				setCurrencies: (currencies,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, currencies,
							},
						}
					},)
				},

				setISINs: (isins,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, isins,
							},
						}
					},)
				},

				setTradeOperation: (tradeOperation,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, tradeOperation,
							},
						}
					},)
				},

				setSecurities: (securities,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, securities,
							},
						}
					},)
				},

				setPairs: (pairs,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, pairs,
							},
						}
					},)
				},

				setLoanNames: (loanNames,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, loanNames,
							},
						}
					},)
				},

				setInvestmentAssetNames: (investmentAssetNames,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, investmentAssetNames,
							},
						}
					},)
				},

				setCryptoTypes: (cryptoTypes,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, cryptoTypes,
							},
						}
					},)
				},

				setWallets: (wallets,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, wallets,
							},
						}
					},)
				},

				setProductTypes: (productTypes,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, productTypes,
							},
						}
					},)
				},
				setMetalProductTypes: (metalProductTypes,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, metalProductTypes,
							},
						}
					},)
				},
				setMetals: (metals,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, metals,
							},
						}
					},)
				},

				setOtherNames: (otherNames,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, otherNames,
							},
						}
					},)
				},

				setServiceProviders: (serviceProviders,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, serviceProviders,
							},
						}
					},)
				},

				setOperations: (operations,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, operations,
							},
						}
					},)
				},

				setProjectTransactions: (projectTransactions,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, projectTransactions,
							},
						}
					},)
				},

				setCountries: (countries,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, countries,
							},
						}
					},)
				},

				setCities: (cities,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, cities,
							},
						}
					},)
				},

				setEquityTypes: (equityTypes,): void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, equityTypes,
							},
						}
					},)
				},

				setPrivateEquityTypes: (privateEquityTypes,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, privateEquityTypes,
							},
						}
					},)
				},

				setPrivateEquityNames: (privateEquityNames,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, privateEquityNames,
							},
						}
					},)
				},

				setDate: (date,) : void => {
					set((state,) => {
						return {
							analyticsFilter: {
								...state.analyticsFilter, date,
							},
						}
					},)
				},
				resetAnalyticsFilterStore: (): void => {
					set((state,) => {
						return {
							...initialState,
						}
					},)
				},
			}
		},
		{
			name:       'analytics-filter-storage',
			partialize: (state,) => {
				return {
					analyticsFilter: state.analyticsFilter,
				}
			},
		},
	),
)