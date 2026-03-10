import type {
	CurrencyList,
} from '../../shared/types'

export type TLocationState = {
  clientId?: string
  portfolioId?: string
  entityId?: string
  bankId?: string
  accountId?: string
  currency?: CurrencyList
}