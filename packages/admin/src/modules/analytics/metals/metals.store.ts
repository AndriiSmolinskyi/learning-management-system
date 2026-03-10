import {
	create,
} from 'zustand'

import {
	AssetNamesType,
	SortOrder,
} from '../../../shared/types'
import type {
	MetalsFilter,
	MetalsSortFilter,
	TMetalsProductType,
} from './metals.types'
import {
	MetalsTableSortVariants,
} from './metals.types'

type MetalsState = {
	filter: MetalsFilter
	sortFilter: MetalsSortFilter
	productType: TMetalsProductType
	productTypeFilter: TMetalsProductType
}

type MetalsActions = {
	setCurrency: (value: Array<string> | undefined) => void;
	setMetal: (value: Array<string> | undefined) => void;
	setBankId: (value: string | undefined) => void;
	setAssetIds: (value: Array<string> | undefined) => void;
	setSortFilters: (sortFilter: MetalsSortFilter) => void;
	setProductDirectHold: (type: boolean) => void
	setProductETF: (type: boolean) => void
	setProductFilterDirectHold: (type: boolean) => void
	setProductFilterETF: (type: boolean) => void
	resetMetalsStore: () => void
}

export const initialState: MetalsState = {
	productType: {
		isDirectHold: false,
		isETF:        false,
	},
	productTypeFilter: {
		isDirectHold: false,
		isETF:        false,
	},
	filter: {
		type:      AssetNamesType.METALS,
	},
	sortFilter: {
		sortBy:    MetalsTableSortVariants.VALUE_DATE,
		sortOrder: SortOrder.DESC,
	},
}

export const useMetalsStore = create<MetalsState & MetalsActions>()((set,) => {
	return {
		...initialState,
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
		setMetal: (metal: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						metal,
					},
				}
			},)
		},
		setAssetIds: (assetIds: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						assetIds,
					},
				}
			},)
		},
		setSortFilters: (sortFilter: MetalsSortFilter,): void => {
			set(() => {
				return {
					sortFilter,
				}
			},)
		},
		setProductDirectHold: (type: boolean,): void => {
			set((state,) => {
				return {
					productType: {
						...state.productType,
						isDirectHold: type,
					},
				}
			},)
		},
		setProductETF: (type: boolean,): void => {
			set((state,) => {
				return {
					productType: {
						...state.productType,
						isETF: type,
					},
				}
			},)
		},
		setProductFilterDirectHold: (type: boolean,): void => {
			set((state,) => {
				return {
					productTypeFilter: {
						...state.productTypeFilter,
						isDirectHold: type,
					},
				}
			},)
		},
		setProductFilterETF: (type: boolean,): void => {
			set((state,) => {
				return {
					productTypeFilter: {
						...state.productTypeFilter,
						isETF: type,
					},
				}
			},)
		},
		resetMetalsStore: (): void => {
			set(() => {
				return {
					...initialState,
				}
			},)
		},
	}
},)