/* eslint-disable no-negated-condition */
import {
	create,
} from 'zustand'

interface IRangeStore {
  value: Array<number> | null;
  setRange: (value: Array<number> | null) => void;
  maxValue: number | null;
  setMaxValue: (newValue: number | null) => void;
  resetRange: () => void;
}

export const rangeInitalValues = {
	value:    null,
	maxValue: null,
}

export const useRangeStore = create<IRangeStore>((set,) => {
	return {
		...rangeInitalValues,
		setRange: (value: Array<number> | null,): void => {
			set({
				value,
			},)
		},
		setMaxValue: (maxValue: number | null,): void => {
			set({
				maxValue,
			},)
		},
		resetRange: (): void => {
			set((state,) => {
				return {
					value: state.maxValue !== null ?
						[0, state.maxValue,] :
						null,
				}
			},)
		},
	}
},)