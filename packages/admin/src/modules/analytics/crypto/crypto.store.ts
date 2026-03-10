import {
	create,
} from 'zustand'

import {
	AssetNamesType,
	SortOrder,
} from '../../../shared/types'
import type {
	TCryptoSortFilter,
	TCryptoFilter,
	TCryptoProductType,
} from './'
import {
	TCryptoTableSortVariants,
} from './crypto.types'

type TCryptoState = {
	filter: TCryptoFilter
	sortFilter: TCryptoSortFilter
	productType: TCryptoProductType
	productTypeFilter: TCryptoProductType
}

type TCryptoActions = {
	setCurrency: (value: Array<string> | undefined) => void;
	setAssetId: (value: Array<string> | undefined) => void;
	setCryptoWallets: (value: Array<string> | undefined) => void;
	setCryptoTypes: (value: Array<string> | undefined) => void;
	setProductTypes: (value: Array<string> | undefined) => void;
	setSortFilters: (sortFilter: TCryptoSortFilter) => void;
	setProductDirectHold: (type: boolean) => void
	setProductETF: (type: boolean) => void
	setProductFilterDirectHold: (type: boolean) => void
	setProductFilterETF: (type: boolean) => void
	setBankId: (value: string | undefined) => void;
	resetCryptoStore: () => void
}

export const initialState: TCryptoState = {
	productType: {
		isDirectHold: false,
		isETF:        false,
	},
	productTypeFilter: {
		isDirectHold: false,
		isETF:        false,
	},
	filter: {
		type:      AssetNamesType.CRYPTO,
	},
	sortFilter: {
		sortBy:    TCryptoTableSortVariants.CRYPTO_AMOUNT,
		sortOrder:    SortOrder.DESC,
	},
}

export const useCryptoStore = create<TCryptoState & TCryptoActions>()((set,) => {
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
		setCryptoWallets: (wallets: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						wallets,
					},
				}
			},)
		},
		setCryptoTypes: (cryptoTypes: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						cryptoTypes,
					},
				}
			},)
		},
		setProductTypes: (productTypes: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						productTypes,
					},
				}
			},)
		},
		setAssetId: (assetId: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						assetId,
					},
				}
			},)
		},
		setSortFilters: (sortFilter: TCryptoSortFilter,): void => {
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
		resetCryptoStore: (): void => {
			set(() => {
				return {
					...initialState,
				}
			},)
		},
	}
},)