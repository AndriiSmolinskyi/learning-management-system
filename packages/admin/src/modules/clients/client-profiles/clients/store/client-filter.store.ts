import {
	create,
} from 'zustand'
import type {
	IFilterProps,
} from '../clients.types'

type TPortfolioStoreActions = {
	setFilterStoreFilters: (filters: IFilterProps) => void
	resetFilterStore: () => void
}
type TPortfolioState = {
	storeFilters: IFilterProps
}

export const initialFilterStoreState: IFilterProps = {
	isActivated:   undefined,
	isDeactivated: undefined,
	range:         undefined,
	search:        undefined,
}

export const initialState: TPortfolioState = {
	storeFilters: initialFilterStoreState,

}

export const useClientFilterStore = create<TPortfolioState & TPortfolioStoreActions>()((set,) => {
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