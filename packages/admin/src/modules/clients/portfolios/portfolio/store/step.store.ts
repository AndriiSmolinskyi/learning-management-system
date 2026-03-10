import {
	create,
} from 'zustand'
import {
	persist,
} from 'zustand/middleware'

type AddPortfolioState = {
	step: number
	subStep: number
	maxSubSteps: number
	portfolioId: string | null
	entityId: string | null
	bankId: string | null
	accountId: string | null
	createdPortfolioId: string | null
	createdMainPortfolioId: string | null
}

const initialState: AddPortfolioState = {
	step:                   1,
	subStep:                1,
	maxSubSteps:            1,
	portfolioId:            null,
	entityId:               null,
	bankId:                 null,
	accountId:              null,
	createdPortfolioId:     null,
	createdMainPortfolioId: null,
}

type AddPortfolioActions = {
   setStep: (step: number) => void;
	setSubStep: (subStep: number) => void;
	reset: () => void;
	setPortfolioId: (portfolioId: string | null) => void
	setEntityId: (entityId: string | null) => void
	setBankId: (bankId: string | null) => void
	setAccountId: (accountId: string | null) => void
	clearPortfolioId: () => void
	setCreatedPortfolioId: (createdPortfolioId: string | null) => void
	setCreatedMainPortfolioId: (createdMainPortfolioId: string | null) => void
	clearCreatedPortfolioId: () => void
  };

export const getMaxSubSteps = (step: number,): number => {
	const subStepConfig: Record<number, number> = {
		1: 3,
		2: 4,
		3: 3,
		4: 3,
		5: 3,
	}
	return subStepConfig[step] ?? 1
}

export const useAddPortfolioStore = create<AddPortfolioState & AddPortfolioActions>()(
	persist(
		(set,) => {
			return {
				...initialState,
				setStep: (step: number,): void => {
					const maxSubSteps = getMaxSubSteps(step,)
					set({
						step,
						subStep: 1,
						maxSubSteps,
					},)
				},
				setSubStep: (subStep: number,): void => {
					set({
						subStep,
					},)
				},
				reset: (): void => {
					set({
						...initialState,
					},)
				},
				setPortfolioId: (portfolioId: string | null,): void => {
					set({
						portfolioId,
					},)
				},
				setEntityId: (entityId: string | null,): void => {
					set({
						entityId,
					},)
				},
				setBankId: (bankId: string | null,): void => {
					set({
						bankId,
					},)
				},
				setAccountId: (accountId: string | null,): void => {
					set({
						accountId,
					},)
				},
				setCreatedPortfolioId: (createdPortfolioId: string | null,): void => {
					set({
						createdPortfolioId,
					},)
				},
				clearPortfolioId: (): void => {
					set({
						portfolioId: null,
					},)
				},
				clearCreatedPortfolioId: (): void => {
					set({
						createdPortfolioId: null,
					},)
				},
				setCreatedMainPortfolioId: (createdMainPortfolioId: string | null,): void => {
					set({
						createdMainPortfolioId,
					},)
				},
			}
		},
		{
			name:       'portfolio-id-storage',
			getStorage: () => {
				return localStorage
			},
			partialize: (state,) => {
				return {
					portfolioId: state.portfolioId,
				}
			},
		},
	),
)
