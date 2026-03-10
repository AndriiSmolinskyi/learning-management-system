import {
	create,
} from 'zustand'

import {
	STORAGE_KEYS, storageService,
} from '../services/storage'

type TUser = {
	name: string | null
	email: string | null
	roles: Array<string>
}

type TUserState = {
	userInfo: TUser,
}

type TUserActions = {
	setUser: (user: TUser) => void;
	resetUser: () => void
}

export const initialState: TUserState = {
	userInfo: {
		name:  storageService.getItem<string | null>(STORAGE_KEYS.NAME,) ?? null ,
		email: null,
		roles:  storageService.getItem<Array<string>>(STORAGE_KEYS.ROLES,) ?? [],
	},
}

export const useUserStore = create<TUserState & TUserActions>()((set,) => {
	return {
		...initialState,
		setUser: (userInfo: TUser,): void => {
			set({
				userInfo,
			},)
		},
		resetUser: (): void => {
			set(initialState,)
		},
	}
},)