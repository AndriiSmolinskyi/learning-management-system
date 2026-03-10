import type {
	IOptionType,
} from '../../../../../shared/types'

export type LinkedTransactionType = {
	id: string
	name: string
}

export type AddTransactionFormValues = {
	transactionTypes: Array<IOptionType<LinkedTransactionType>>
}