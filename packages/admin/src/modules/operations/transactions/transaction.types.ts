import type {
	IOptionType,
} from '../../../shared/types'

export type StepType = 1 | 2 | 3 | 4

export type LinkedTransactionType = {
	id: string
	name: string
	entityId?: string
	bankId?: string
	cashFlow?: string
	pl?: string
	relatedTypeId?: string
	asset?: string
}

export type CustomField = {
	label: string;
	info: string;
}

export type TransactionFormValues = {
	orderId?: IOptionType<{ id: number; name: string }>
	clientId?: IOptionType<LinkedTransactionType>
	portfolioId?: IOptionType<LinkedTransactionType>
	accountId?: IOptionType<LinkedTransactionType>
	bankId?: IOptionType<LinkedTransactionType>
	entityId?: IOptionType<LinkedTransactionType>
	transactionTypeId?: IOptionType<LinkedTransactionType>
	category?: string
	isin?: IOptionType<string>
	security?: string | undefined | number
	serviceProvider?: IOptionType<string>
	currency?: IOptionType<string>
   amount?: string
	transactionDate?: Date | string
	comment?: string
	customFields?: Array<CustomField>
	expenseCategory?: IOptionType<LinkedTransactionType>
	isSave?: boolean
}

export type FormatFormValues = {
	requestId?: string;
	orderId?: number;
	clientId?: string;
	portfolioId?: string;
	bankId?: string;
	accountId?: string;
	entityId?: string;
	transactionTypeId?: string
	isin?: string;
	security?: string;
	serviceProvider?: string;
	currency?: string;
	amount?: number;
	transactionDate?: Date | string;
	comment?: string;
	customFields?: string;
}

export type TransactionSearch = {
	clientId?: IOptionType<LinkedTransactionType>
	portfolioId?: IOptionType<LinkedTransactionType>
	bankId?: IOptionType<LinkedTransactionType>
	transactionName?: IOptionType<LinkedTransactionType>
   category?: IOptionType<string>
   currency?: IOptionType<LinkedTransactionType>
}

export type LinkedTransactionOrderType = {
  id: number
  name: string
};

