import {
	create,
} from 'zustand'
import type {
	TBudgetSearch,
	TBudgetStoreFilterItem,
} from './budget.types'
import {
	persist,
} from 'zustand/middleware'
import type {
	IBudgetPlan,
} from '../../../shared/types'

type TBudgetState = {
	isThirdStepValid: boolean
	isEnough: boolean
	total: number
	filter: TBudgetSearch
	mutatedBudgetIds: Array<string> | undefined
	mutatingBudgets: Array<IBudgetPlan> | undefined
}

type TBudgetActions = {
	setIsThirdStepValid: (isValid: boolean) => void
	setIsEnough: (IsEnough: boolean) => void
	setTotalAmount: (total: number) => void
	setClientIds: (clientIds:TBudgetStoreFilterItem) => void
	setIsActivated: (isActivated: boolean | undefined) => void
	setSearch: (search: string | undefined) => void
	resetBudgetStore: () => void
	setMutatedBudgetIds: (id: string | Array<string>) => void
	removeMutatedBudgetId: (id: string | Array<string>,) => void
   resetMutatedBudgetIds: () => void
	setMutatingBudget: (budget: IBudgetPlan) => void
   removeMutatingBudget: (id: string) => void
   resetMutatingBudgets: () => void
}

export const initialFilterValues = {
	clientIds:   undefined,
	isActivated: undefined,
	search:      undefined,
}

export const initialState: TBudgetState = {
	mutatedBudgetIds: undefined,
	mutatingBudgets:  undefined,
	isThirdStepValid: false,
	isEnough:         false,
	total:            0,
	filter:           {
		...initialFilterValues,
	},
}

export const useBudgetStore = create<TBudgetState & TBudgetActions>()(
	persist(
		(set,) => {
			return {
				...initialState,
				setMutatingBudget: (budget: IBudgetPlan,): void => {
					set((prevState,) => {
						const existingClients = prevState.mutatingBudgets ?? []
						const alreadyExists = existingClients.some((c,) => {
							return c.id === budget.id
						},)
						return {
							mutatingBudgets: alreadyExists ?
								existingClients :
								[...existingClients, budget,],
						}
					},)
				},

				removeMutatingBudget: (idToRemove: string,): void => {
					set((prevState,) => {
						return {
							mutatingBudgets: (prevState.mutatingBudgets ?? []).filter(
								(budget,) => {
									return budget.id !== idToRemove
								},
							),
						}
					},)
				},

				resetMutatingBudgets: (): void => {
					set({
						mutatingBudgets: undefined,
					},)
				},
				setMutatedBudgetIds: (ids: string | Array<string>,): void => {
					set((prevState,) => {
						const newIds = Array.isArray(ids,) ?
							ids :
							[ids,]
						return {
							mutatedBudgetIds: [
								...(prevState.mutatedBudgetIds ?? []),
								...newIds,
							],
						}
					},)
				},
				resetMutatedBudgetIds: (): void => {
					set({
						mutatedBudgetIds: [],
					},)
				},
				removeMutatedBudgetId: (idsToRemove: string | Array<string>,): void => {
					set((prevState,) => {
						const idsArray = Array.isArray(idsToRemove,) ?
							idsToRemove :
							[idsToRemove,]
						return {
							mutatedBudgetIds: (prevState.mutatedBudgetIds ?? []).filter(
								(id,) => {
									return !idsArray.includes(id,)
								},
							),
						}
					},)
				},

				setIsThirdStepValid: (isValid: boolean,): void => {
					set({
						isThirdStepValid: isValid,
					},)
				},
				setIsEnough: (isEnough: boolean,): void => {
					set({
						isEnough,
					},)
				},
				setTotalAmount: (total,): void => {
					set({
						total,
					},)
				},
				setClientIds: (clientIds: TBudgetStoreFilterItem,): void => {
					set((state,) => {
						return {
							filter: {
								...state.filter, clientIds,
							},
						}
					},)
				},
				setIsActivated: (isActivated,): void => {
					set((state,) => {
						return {
							filter: {
								...state.filter, isActivated,
							},
						}
					},)
				},
				setSearch: (search,): void => {
					set((state,) => {
						return {
							filter: {
								...state.filter, search,
							},
						}
					},)
				},
				resetBudgetStore: (): void => {
					set((state,) => {
						return {
							...initialState,
							mutatedBudgetIds: state.mutatedBudgetIds,
							mutatingBudgets:  state.mutatingBudgets,
						}
					},)
				},
			}
		},
		{
			name:       'budget-store',
			partialize: (state,) => {
				return {
					mutatedBudgetIds: state.mutatedBudgetIds,
					mutatingBudgets:  state.mutatingBudgets,
				}
			},
		},),)
