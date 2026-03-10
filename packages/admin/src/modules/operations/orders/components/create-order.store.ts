import {
	create,
} from 'zustand'

import type {
	IOrder,
} from '../../../../shared/types'

type TOrderState = {
  createdOrder: IOrder| null;
  openCreatedOrder: boolean;
};

type TOrderActions = {
  setCreatedOrder: (order: IOrder) => void;
  resetCreatedOrder: () => void;
  setOpenCreatedOrder: (isOpen: boolean) => void;
};

export const useCreatedOrderStore = create<TOrderState & TOrderActions>()((set,): TOrderState & TOrderActions => {
	return {
		createdOrder:     null,
		openCreatedOrder: false,

		setCreatedOrder: (order: IOrder,): void => {
			set({
				createdOrder: order,
			},)
		},

		resetCreatedOrder: (): void => {
			set({
				createdOrder:     null,
				openCreatedOrder: false,
			},)
		},

		setOpenCreatedOrder: (isOpen: boolean,): void => {
			set({
				openCreatedOrder: isOpen,
			},)
		},
	}
},)
