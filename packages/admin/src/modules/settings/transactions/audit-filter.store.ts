
import {
	create,
} from 'zustand'
import type {
	TAuditTrailFilter,
} from '../../../shared/types'
import type {
	TransactionTypeAuditType,
} from '../../../shared/types'

type TAuditTrailState = {
	filter: TAuditTrailFilter
}

type TAuditTrailActions = {
	setSearch: (value: string | undefined) => void;
	setUsers: (value: Array<string> | undefined) => void;
	setSettingsType: (value: Array<TransactionTypeAuditType> | undefined) => void;
	setEditCards: (value: boolean | undefined) => void;
	resetAuditStore: () => void
}

export const initialState: TAuditTrailState = {
	filter: {
		search:        undefined,
		userName:        undefined,
		settingsType: undefined,
		editCards:    undefined,
	},
}

export const useAuditTypeStore = create<TAuditTrailState & TAuditTrailActions>()((set,) => {
	return {
		...initialState,
		setSearch: (search: string | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, search,
					},
				}
			},)
		},

		setUsers: (userName: Array<string> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, userName,
					},
				}
			},)
		},

		setSettingsType: (settingsType: Array<TransactionTypeAuditType> | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, settingsType,
					},
				}
			},)
		},

		setEditCards: (editCards: boolean | undefined,): void => {
			set((state,) => {
				return {
					filter: {
						...state.filter, editCards,
					},
				}
			},)
		},

		resetAuditStore: (): void => {
			set(initialState,)
		},
	}
},)
