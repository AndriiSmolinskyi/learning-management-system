import {
	create,
} from 'zustand'

import type {
	IRequest,
	RequestStatusType,
	TRequestFilter,
} from '../../../shared/types'
import {
	RequestType,
	SortOrder,
} from '../../../shared/types'

type TRequestState = {
	filter: TRequestFilter
}

type TRequestActions = {
	setSortBy: (value: keyof Pick<IRequest, 'id' | 'updatedAt'> | undefined) => void;
	setSortOrder: (value: SortOrder | undefined) => void;
	setType: (value: RequestType) => void;
	setSearch: (value: string | undefined) => void;
	setPortfolioId: (value: string | undefined) => void;
	setEntityId: (value: string | undefined) => void;
	setBankId: (value: string | undefined) => void;
	setAssetId: (value: string | undefined) => void;
	setStatuses: (value: Array<RequestStatusType> | undefined) => void;
	resetRequestStore: () => void
}

export const initialState: TRequestState = {
	filter: {
		sortBy:    'updatedAt',
		sortOrder: SortOrder.DESC,
		type:      RequestType.SELL,
	},
}

export const useRequestStore = create<TRequestState & TRequestActions>()((set,) => {
	return {
		...initialState,
		setSortBy: (sortBy: keyof Pick<IRequest, 'id' | 'updatedAt'> | undefined,): void => {
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
		setType: (type: RequestType,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						type,
					},
				}
			},)
		},
		setPortfolioId: (portfolioId: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						portfolioId,
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
		setAssetId: (assetId: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						assetId,
					},
				}
			},)
		},
		setStatuses: (statuses: Array<RequestStatusType> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter,
						statuses,
					},
				}
			},)
		},
		resetRequestStore: (): void => {
			set(initialState,)
		},
	}
},)