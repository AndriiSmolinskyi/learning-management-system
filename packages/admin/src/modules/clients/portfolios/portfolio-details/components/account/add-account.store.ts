import {
	create,
} from 'zustand'
import type {
	IAccount,
} from '../../../../../../shared/types'

type TAccountState = {
  createdAccount: IAccount| null;
  openCreatedAccount: boolean;
};

type TAccountActions = {
	setCreatedAccount: (account: IAccount) => void;
	resetCreatedAccount: () => void;
	setOpenCreatedAccount: (isOpen: boolean) => void;
}

export const useCreatedAccountStore = create<TAccountState & TAccountActions>()((set,): TAccountState & TAccountActions => {
	return {
		createdAccount:     null,
		openCreatedAccount: false,

		setCreatedAccount: (account: IAccount,): void => {
			set({
				createdAccount: account,
			},)
		},

		resetCreatedAccount: (): void => {
			set({
				createdAccount:     null,
				openCreatedAccount: false,
			},)
		},

		setOpenCreatedAccount: (isOpen: boolean,): void => {
			set({
				openCreatedAccount: isOpen,
			},)
		},
	}
},)
