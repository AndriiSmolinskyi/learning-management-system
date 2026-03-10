import {
	create,
} from 'zustand'

type BudgetDetailsState = {
	isYearly: boolean;
	setIsYearly: (value: boolean) => void;
	toggleIsYearly: () => void;
}

export const useBudgetDetailsStore = create<BudgetDetailsState>((set,) => {
	return {
		isYearly:       false,
		setIsYearly:    (value,): void => {
			set({
				isYearly: value,
			},)
		},
		toggleIsYearly: (): void => {
			set((state,) => {
				return {
					isYearly: !state.isYearly,
				}
			},)
		},
	}
},)
