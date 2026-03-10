import {
	create,
} from 'zustand'

type TAddTransactionStore = {
  clientId: { label: string; value: { id: string; name: string } } | undefined;
  portfolioId: { label: string; value: { id: string; name: string } } | undefined;
  bankId: { label: string; value: { id: string; name: string } } | undefined;
  entityId: { label: string; value: { id: string; name: string } } | undefined;
  accountId: { label: string; value: { id: string; name: string } } | undefined;
  currency: { label: string; value: string } | undefined;
  transactionIds: Array<number> | undefined
};

type TAddTransactionActions = {
  setClientId: (clientId: { label: string; value: { id: string; name: string } } | undefined) => void;
  setPortfolioId: (portfolioId: { label: string; value: { id: string; name: string } } | undefined) => void;
  setBankId: (bankId: { label: string; value: { id: string; name: string } } | undefined) => void;
  setEntityId:(entityId: { label: string; value: { id: string; name: string } } | undefined) => void;
  setAccountId: (accountId: { label: string; value: { id: string; name: string } } | undefined) => void;
  setCurrency: (currency: { label: string; value: string } | undefined) => void;
  setTransactionIds: (id: number) => void
  clearTransactionIds: () => void
  resetTransactionStore: () => void;
};

export const useAddTransactionStore = create<TAddTransactionStore & TAddTransactionActions>((set,) => {
	return {
		clientId:       undefined,
		portfolioId:    undefined,
		bankId:         undefined,
		entityId:       undefined,
		accountId:      undefined,
		currency:       undefined,
		transactionIds:    undefined,

		setClientId: (clientId,): void => {
			set({
				clientId,
			},)
		},
		setPortfolioId: (portfolioId,): void => {
			set({
				portfolioId,
			},)
		},
		setBankId: (bankId,): void => {
			set({
				bankId,
			},)
		},
		setEntityId: (entityId,): void => {
			set({
				entityId,
			},)
		},
		setAccountId: (accountId,): void => {
			set({
				accountId,
			},)
		},
		setCurrency: (currency,): void => {
			set({
				currency,
			},)
		},
		setTransactionIds: (id: number,): void => {
			set((state,) => {
				const transactionIds = state.transactionIds ?? []
				return {
					transactionIds: transactionIds.includes(id,) ?
						state.transactionIds :
						[...transactionIds, id,],
				}
			},)
		},
		clearTransactionIds: (): void => {
			set({
				transactionIds: undefined,
			},)
		},
		resetTransactionStore: (): void => {
			set({
				clientId:    undefined,
				portfolioId: undefined,
				bankId:      undefined,
				entityId:    undefined,
				accountId:   undefined,
				currency:    undefined,
			},)
		},
	}
},)
