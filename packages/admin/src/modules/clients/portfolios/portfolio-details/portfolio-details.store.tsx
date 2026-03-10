import {
	create,
} from 'zustand'
import {
	persist,
} from 'zustand/middleware'

interface IPortfolioStore {
  focusedItemIds: Array<string> | undefined;
  setFocusedItemId: (id: string) => void;

  openEntities: Record<string, boolean>
  openBanks: Record<string, boolean>
  openAccounts: Record<string, boolean>
  openAssets: Record<string, boolean>

  toggleEntity: (entityId: string) => void
  toggleBank: (bankId: string) => void
  toggleAccount: (accountId: string) => void
  toggleAsset: (assetId: string) => void
}

type TPortfolioState = {
	focusedItemIds: Array<string> | undefined
	openNodes: Set<string>
}

export const initialState: TPortfolioState = {
	openNodes:      new Set(),
	focusedItemIds:        undefined,
}

export const usePortfolioTreeStore = create<IPortfolioStore & TPortfolioState>()(
	persist(
		(set,) => {
			return {
				...initialState,
				openEntities:     {
				},
				openBanks:        {
				},
				openAccounts:     {
				},
				openAssets:     {
				},
				setFocusedItemId: (id: string,): void => {
					set((state,) => {
						const currentIds = state.focusedItemIds ?? []
						const isAlreadyFocused = currentIds.includes(id,)

						return {
							focusedItemIds: isAlreadyFocused ?
								currentIds.filter((itemId,) => {
									return itemId !== id
								},) :
								[...currentIds, id,],
						}
					},)
				},
				toggleEntity: (entityId,): void => {
					set((state,) => {
						return {
							openEntities: {
								...state.openEntities,
								[entityId]: !state.openEntities[entityId],
							},
						}
					},)
				},

				toggleBank: (bankId,): void => {
					set((state,) => {
						return {
							openBanks: {
								...state.openBanks,
								[bankId]: !state.openBanks[bankId],
							},
						}
					},)
				},

				toggleAccount: (accountId,): void => {
					set((state,) => {
						return {
							openAccounts: {
								...state.openAccounts,
								[accountId]: !state.openAccounts[accountId],
							},
						}
					},)
				},

				toggleAsset: (assetId,): void => {
					set((state,) => {
						return {
							openAssets: {
								...state.openAssets,
								[assetId]: !state.openAssets[assetId],
							},
						}
					},)
				},
			}
		},
		{
			name:       'portfolio-tree',
			partialize: (state,) => {
				return {
					focusedItemIds: state.focusedItemIds,
					openEntities:   state.openEntities,
					openBanks:      state.openBanks,
					openAccounts:   state.openAccounts,
					openAssets:     state.openAssets,
				}
			},
		},
	),
)
