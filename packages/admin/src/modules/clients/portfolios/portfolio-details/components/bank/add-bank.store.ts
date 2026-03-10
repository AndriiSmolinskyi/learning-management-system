import {
	create,
} from 'zustand'
import type {
	IBank,
} from '../../../../../../shared/types'

type TBankState = {
  createdBank: IBank| null;
  openCreatedBank: boolean;
};

type TBankActions = {
	setCreatedBank: (entity: IBank) => void;
	resetCreatedBank: () => void;
	setOpenCreatedBank: (isOpen: boolean) => void;
}

export const useCreatedBankStore = create<TBankState & TBankActions>()((set,): TBankState & TBankActions => {
	return {
		createdBank:     null,
		openCreatedBank: false,

		setCreatedBank: (bank: IBank,): void => {
			set({
				createdBank: bank,
			},)
		},

		resetCreatedBank: (): void => {
			set({
				createdBank:     null,
				openCreatedBank: false,
			},)
		},

		setOpenCreatedBank: (isOpen: boolean,): void => {
			set({
				openCreatedBank: isOpen,
			},)
		},
	}
},)
