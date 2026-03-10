import {
	create,
} from 'zustand'
import type {
	MultiValue,
} from 'react-select'
import type {
	IOptionType,
	OrderStatus,
} from '../../../../../shared/types'
import type {
	RequestStatusType,
} from '../../../../../shared/types'
import {
	persist,
} from 'zustand/middleware'

type TOperationsState = {
	operationsFilter: TOperationsStoreFilter
}

export type SelectOptionType = {
	id: string
	name: string
}

export type TOperationsOrderStatusOption = {
	id: OrderStatus
	name: OrderStatus
}

export type TOperationsOrderRequestOption = {
	id: RequestStatusType
	name: RequestStatusType
}

export type LinkedTransactionType = {
	id: string
	name: string
	category?: string
	cashFlow?: string
}

type TOperationsStoreFilterItem = MultiValue<IOptionType<SelectOptionType>> | undefined
type TOperationsStoreNamesFilterItem = MultiValue<IOptionType<LinkedTransactionType>> | undefined
type TOperationsStoreFilterStatusItem = MultiValue<IOptionType<TOperationsOrderStatusOption>> | undefined
type TOperationsStoreFilterRequestStatusItem = MultiValue<IOptionType<TOperationsOrderRequestOption>> | undefined

export type TOperationsStoreFilter = {
	clientIds?: TOperationsStoreFilterItem
	portfolioIds?: TOperationsStoreFilterItem
	entitiesIds?: TOperationsStoreFilterItem
	bankIds?: TOperationsStoreFilterItem
	accountIds?: TOperationsStoreFilterItem
	isins?: TOperationsStoreFilterItem
	securities?: TOperationsStoreFilterItem
	currencies?: TOperationsStoreFilterItem
	categories?: TOperationsStoreFilterItem
	names?: TOperationsStoreNamesFilterItem
	requestStatuses?: TOperationsStoreFilterRequestStatusItem
	orderStatuses?: TOperationsStoreFilterStatusItem
	search?: string | undefined
	date?: string | undefined
	serviceProviders?: TOperationsStoreFilterItem
}

type TOperationsAction = (value: TOperationsStoreFilterItem) => void
type TOperationsStatusAction = (value: TOperationsStoreFilterStatusItem) => void
type TOperationsRequestStatusAction = (value: TOperationsStoreFilterRequestStatusItem) => void
type TOperationsNamesAction = (value: TOperationsStoreNamesFilterItem) => void

type TOperationsActions = {
	setClientsIds: TOperationsAction
	setPortfolioIds: TOperationsAction
	setEntitiesIds: TOperationsAction
	setBankIds: TOperationsAction
	setAccountIds: TOperationsAction
	setCurrencies: TOperationsAction
	setISINs: TOperationsAction
	setSecurities: TOperationsAction
	setNames: TOperationsNamesAction
	setRequestStatuses: TOperationsRequestStatusAction
	setOrderStatuses: TOperationsStatusAction
	setCategories: TOperationsAction
	setSearch: (value: string | undefined) => void
	resetOperationsFilterStore: () => void
	setDate: (date: string | undefined) => void
	setServiceProviders: TOperationsAction
}

export const initialState: TOperationsState = {
	operationsFilter: {
		clientIds:        undefined,
		portfolioIds:     undefined,
		entitiesIds:        undefined,
		bankIds:          undefined,
		accountIds:       undefined,
		isins:            undefined,
		securities:       undefined,
		names:            undefined,
		categories:       undefined,
		currencies:       undefined,
		requestStatuses:  undefined,
		orderStatuses:    undefined,
		search:           undefined,
		serviceProviders: undefined,
		date:                 undefined,
	},
}

export const useOperationsFilterStore = create<TOperationsState & TOperationsActions>()(
	persist((set,) => {
		return {
			...initialState,
			setClientsIds: (clientIds: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							clientIds,
						},
					}
				},)
			},
			setPortfolioIds: (portfolioIds: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							portfolioIds,
						},
					}
				},)
			},
			setEntitiesIds: (entitiesIds: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter, entitiesIds,
						},
					}
				},)
			},
			setBankIds: (bankIds: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							bankIds,
						},
					}
				},)
			},
			setAccountIds: (accountIds: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							accountIds,
						},
					}
				},)
			},
			setAssetIds: (assetIds: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							assetIds,
						},
					}
				},)
			},
			setCurrencies: (currencies: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							currencies,
						},
					}
				},)
			},
			setISINs: (isins: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							isins,
						},
					}
				},)
			},
			setSecurities: (securities: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							securities,
						},
					}
				},)
			},
			setNames: (names: TOperationsStoreNamesFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							names,
						},
					}
				},)
			},
			setRequestStatuses: (requestStatuses: TOperationsStoreFilterRequestStatusItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							requestStatuses,
						},
					}
				},)
			},
			setOrderStatuses: (orderStatuses: TOperationsStoreFilterStatusItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							orderStatuses,
						},
					}
				},)
			},
			setCategories: (categories: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							categories,
						},
					}
				},)
			},
			setSearch: (search: string | undefined,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							search,
						},
					}
				},)
			},
			setDate: (date,) : void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter, date,
						},
					}
				},)
			},
			setServiceProviders: (serviceProviders: TOperationsStoreFilterItem,): void => {
				set((state,) => {
					return {
						operationsFilter: {
							...state.operationsFilter,
							serviceProviders,
						},
					}
				},)
			},

			resetOperationsFilterStore: (): void => {
				set(initialState,)
			},
		}
	},
	{
		name:       'operations-filter-storage',
		partialize: (state,) => {
			return {
				operationsFilter: state.operationsFilter,
			}
		},
	},
	),)