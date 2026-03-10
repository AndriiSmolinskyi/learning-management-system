import {
	create,
} from 'zustand'
import type {
	IFilterProps,
} from './portfolio.types'

type TPortfolioStoreActions = {
	setFilterStoreFilters: (filters: IFilterProps) => void
	resetFilterStore: () => void
}

type TPortfolioState = {
	storeFilters: IFilterProps
}

export const initialFilterStoreState: IFilterProps = {
	clients:       undefined,
	types:         undefined,
	isActivated:   undefined,
	isDeactivated: undefined,
	range:         undefined,
	search:        undefined,
}

export const initialState: TPortfolioState = {
	storeFilters:        initialFilterStoreState,
}

export const usePortfolioFilterStore = create<TPortfolioState & TPortfolioStoreActions>()((set,) => {
	return {
		...initialState,
		setFilterStoreFilters: (storeFilters: IFilterProps,): void => {
			set({
				storeFilters,
			},)
		},
		resetFilterStore: (): void => {
			set(initialState,)
		},
	}
},)