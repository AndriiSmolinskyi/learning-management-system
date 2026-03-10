import {
	create,
} from 'zustand'

import type {
	IOrder,
	OrderStatus,
	TOrderFilter,
} from '../../../../shared/types'
import {
	SortOrder,
	OrderType,
} from '../../../../shared/types'

type TOrderState = {
	filter: TOrderFilter
}

type TOrderActions = {
	setSortBy: (value: keyof Pick<IOrder, 'id' | 'updatedAt'> | undefined) => void;
	setSortOrder: (value: SortOrder | undefined) => void;
	setType: (value: OrderType) => void;
	setSearch: (value: string | undefined) => void;
	setBankId: (value: string | undefined) => void;
	setStatuses: (value: Array<OrderStatus> | undefined) => void;
	resetOrderStore: () => void
}

export const initialState: TOrderState = {
	filter: {
		sortBy:    'updatedAt',
		sortOrder: SortOrder.DESC,
		type:      OrderType.SELL,
	},
}

export const useOrderStore = create<TOrderState & TOrderActions>()((set,) => {
	return {
		...initialState,
		setSortBy: (sortBy: keyof Pick<IOrder, 'id' | 'updatedAt'> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						sortBy,
					},
				}
			},)
		},
		setSortOrder: (sortOrder: SortOrder | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						sortOrder,
					},
				}
			},)
		},
		setSearch: (search: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						search,
					},
				}
			},)
		},
		setType: (type: OrderType,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						type,
					},
				}
			},)
		},
		setBankId: (bankId: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						bankId,
					},
				}
			},)
		},
		setStatuses: (statuses: Array<OrderStatus> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						statuses,
					},
				}
			},)
		},
		resetOrderStore: (): void => {
			set(initialState,)
		},
	}
},)