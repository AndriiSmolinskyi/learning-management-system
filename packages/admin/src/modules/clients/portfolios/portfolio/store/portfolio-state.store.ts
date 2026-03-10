import {
	create,
} from 'zustand'
import {
	persist,
} from 'zustand/middleware'

interface IPortfolioStore {
  isAddClientVisible: boolean;
  toggleIsAddClientVisible: () => void;
  setIsAddClientVisible: (value: boolean) => void;
  isSuccessModalVisible: boolean;
  toggleIsSuccessModalVisible: () => void;
  setIsSuccessModalVisible: (value: boolean) => void;
  setMutatedPortfolioIds: (id: string | Array<string>) => void
  resetMutatedPortfolioIds: () => void
  removeMutatedPortfolioId: (id: string | Array<string>) => void
}

type TPortfolioState = {
	isAddClientVisible: boolean
	isSuccessModalVisible: boolean
	mutatedPortfolioIds: Array<string> | undefined
}

export const initialState: TPortfolioState = {
	isAddClientVisible:        false,
	isSuccessModalVisible: false,
	mutatedPortfolioIds:   undefined,
}

export const usePortfolioStateStore = create<IPortfolioStore & TPortfolioState>()(
	persist(
		(set, get,) => {
			return {
				...initialState,
				toggleIsAddClientVisible: (): void => {
					set((state,) => {
						return {
							isAddClientVisible: !state.isAddClientVisible,
						}
					},)
				},
				setIsAddClientVisible: (value: boolean,): void => {
					set({
						isAddClientVisible: value,
					},)
				},
				toggleIsSuccessModalVisible: (): void => {
					set((state,) => {
						return {
							isSuccessModalVisible: !state.isSuccessModalVisible,
						}
					},)
				},
				setIsSuccessModalVisible: (value: boolean,): void => {
					set({
						isSuccessModalVisible: value,
					},)
				},
				setMutatedPortfolioIds: (ids: string | Array<string>,): void => {
					set((prevState,) => {
						const newIds = Array.isArray(ids,) ?
							ids :
							[ids,]
						return {
							mutatedPortfolioIds: [
								...(prevState.mutatedPortfolioIds ?? []),
								...newIds,
							],
						}
					},)
				},
				removeMutatedPortfolioId: (idsToRemove: string | Array<string>,): void => {
					set((prevState,) => {
						const idsArray = Array.isArray(idsToRemove,) ?
							idsToRemove :
							[idsToRemove,]
						return {
							mutatedPortfolioIds: (prevState.mutatedPortfolioIds ?? []).filter(
								(id,) => {
									return !idsArray.includes(id,)
								},
							),
						}
					},)
				},
				resetMutatedPortfolioIds: (): void => {
					set({
						mutatedPortfolioIds: [],
					},)
				},
			}
		},
		{
			name:       'portfolio-store',
			partialize: (state,) => {
				return {
					mutatedPortfolioIds: state.mutatedPortfolioIds,
				}
			},
		},
	),
)
