import {
	create,
} from 'zustand'

import type {
	TCashFilter,
} from './cash.types'

type TCashState = {
	filter: TCashFilter
}

type TCashActions = {
	setCurrency: (value: Array<string> | undefined) => void;
	setChartCurrency: (value: Array<string> | undefined) => void;
	setEntityId: (value: string | undefined) => void;
	setBankName: (value: string | undefined) => void;
	resetCashStore: () => void
}

export const initialBankStore = {
	bankId:        undefined,
	currency:      undefined,
	entityId:      undefined,
	chartCurrency: undefined,
}

export const initialState: TCashState = {
	filter: {
		bankId:        undefined,
		currency:      undefined,
		entityId:      undefined,
		chartCurrency: undefined,
	},
}

export const useCashStore = create<TCashState & TCashActions>()((set,) => {
	return {
		...initialState,
		setCurrency: (currency: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						currency,
					},
				}
			},)
		},
		setChartCurrency: (chartCurrency: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						chartCurrency,
					},
				}
			},)
		},
		setBankName: (bankId: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						bankId,
					},
				}
			},)
		},
		setEntityId: (entityId: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						entityId,
					},
				}
			},)
		},
		resetCashStore: (): void => {
			set(initialState,)
		},
	}
},)