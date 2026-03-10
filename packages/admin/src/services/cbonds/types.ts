import type {
	CurrencyList,
} from '../../shared/types'

export interface ICurrency {
	id: string
	currency: CurrencyList
	rate: number
}