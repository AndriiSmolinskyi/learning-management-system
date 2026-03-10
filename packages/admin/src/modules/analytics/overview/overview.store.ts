import {
	create,
} from 'zustand'

import type {
	TOverviewFilter,
} from './overview.types'
import type {
	AssetNamesType,
	CryptoList,
	CurrencyList,
	MetalList,
} from '../../../shared/types'

type TOverviewState = {
	filter: TOverviewFilter
}

type TOverviewActions = {
	setTableBankIds: (value: Array<string> | undefined) => void;
	setPieBankIds: (value: Array<string> | undefined) => void;
	setTableAccountIds: (value: Array<string> | undefined) => void;
	setPieEntityIds: (value: Array<string> | undefined) => void;
	setTableEntityIds: (value: Array<string> | undefined) => void;
	setPieAssetNames: (value: Array<AssetNamesType> | undefined) => void;
	setTableAssetNames: (value: Array<AssetNamesType> | undefined) => void;
	setTableCurrencies: (value: Array<CurrencyList | MetalList | CryptoList> | undefined) => void;
	setPieCurrencies: (value: Array<CurrencyList | MetalList | CryptoList> | undefined) => void;
	resetOverviewStore: () => void
}
export const initialOverviewFilter = {
	pieEntityIds:    undefined,
	tableEntityIds:  undefined,
	pieAssetNames:   undefined,
	tableAssetNames: undefined,
	tableBankIds:    undefined,
	pieBankIds:      undefined,
	tableAccountIds: undefined,
	tableCurrencies: undefined,
	pieCurrencies:   undefined,
}
const initialState: TOverviewState = {
	filter: initialOverviewFilter,
}

export const useOverviewStore = create<TOverviewState & TOverviewActions>()((set,) => {
	return {
		...initialState,
		setTableBankIds: (tableBankIds: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						tableBankIds,
					},
				}
			},)
		},
		setTableAccountIds: (tableAccountIds: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						tableAccountIds,
					},
				}
			},)
		},
		setPieBankIds: (pieBankIds: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						pieBankIds,
					},
				}
			},)
		},
		setPieEntityIds: (pieEntityIds: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						pieEntityIds,
					},
				}
			},)
		},
		setTableEntityIds: (tableEntityIds: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						tableEntityIds,
					},
				}
			},)
		},
		setPieAssetNames: (pieAssetNames: Array<AssetNamesType> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						pieAssetNames,
					},
				}
			},)
		},
		setTableAssetNames: (tableAssetNames: Array<AssetNamesType> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						tableAssetNames,
					},
				}
			},)
		},
		setTableCurrencies: (tableCurrencies: Array<CurrencyList | MetalList | CryptoList> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						tableCurrencies,
					},
				}
			},)
		},
		setPieCurrencies: (pieCurrencies: Array<CurrencyList | MetalList | CryptoList> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						pieCurrencies,
					},
				}
			},)
		},
		resetOverviewStore: (): void => {
			set(initialState,)
		},
	}
},)