/* eslint-disable complexity */
import type {
	IProgressBarStep, ITransaction,
} from '../../../shared/types'
import {
	TransactionCashFlow,
} from '../../../shared/types'
import type {
	FormatFormValues, TransactionFormValues,
} from '../transactions/transaction.types'
import {
	formatDateToDDMMYYYY, formatToUTCISOString,
} from '../../../shared/utils'

export const getAccountDetails = (values: TransactionFormValues,): string => {
	const client = values.clientId ?
		`${values.clientId.value.name} (client), ` :
		''
	const portfolio = values.portfolioId ?
		`${values.portfolioId.value.name} (portfolio), ` :
		''
	const entity = values.entityId ?
		`${values.entityId.value.name} (entity), ` :
		''
	const bank = values.bankId ?
		`${values.bankId.value.name} (bank),` :
		''
	const account = values.accountId ?
		`${values.accountId.value.name} (bank account),` :
		''
	const currency = values.currency?.value ?
		`${values.currency.value} (currency).` :
		''
	return `${client}${portfolio}${entity}${bank}${account}${currency}` ||
		'Select account details for this transaction.'
}

export const getTransactionDetails = (values: TransactionFormValues,): string => {
	const amount = values.amount ?
		`${values.amount} (amount)` :
		''
	const transactionName = values.transactionTypeId ?
		`${values.transactionTypeId.value.name} (name)` :
		''
	const order = values.orderId ?
		`, ${values.orderId.value.name} (Order)` :
		''
	const isin = values.isin ?
		`, ${values.isin.value} (ISIN)` :
		''
	const serviceProvider = values.serviceProvider ?
		`, ${values.serviceProvider.value} (service provider)` :
		''
	const comment = values.comment ?
		`, ${values.comment.slice(0, 25,)} (comment).` :
		''
	const transactionDate = values.transactionDate ?
		`, ${formatDateToDDMMYYYY(values.transactionDate,)} (transaction date)` :
		''
	return `${amount}${transactionName}${order}${isin}${serviceProvider}${transactionDate}${comment}` ||
		'Provide the information according to the transaction.'
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the transaction (optional).`
}

export const getTransactionFormSteps = (values: TransactionFormValues,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Client information',
			labelDesc:  getAccountDetails(values,),
		},
		{
			labelTitle: 'Transaction details',
			labelDesc:  getTransactionDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}

export const getTransactionFormInitialValues = (transaction?: ITransaction,): TransactionFormValues => {
	return {
		customFields: transaction?.customFields ?
			JSON.parse(transaction.customFields,) :
			undefined,
		orderId: transaction?.order ?
			{
				label: `${transaction.order.id} (${transaction.order.type})`,
				value: {
					id:   transaction.order.id,
					name: `${transaction.order.id} (${transaction.order.type})`,
				},
			} :
			undefined,
		clientId: transaction?.client ?
			{
				label: `${transaction.client.firstName} ${transaction.client.lastName}`,
				value: {
					id:   transaction.client.id,
					name: `${transaction.client.firstName} ${transaction.client.lastName}`,
				},
			} :
			undefined,
		portfolioId: transaction?.portfolio ?
			{
				label: transaction.portfolio.name,
				value: {
					id:   transaction.portfolio.id,
					name: transaction.portfolio.name,
				},
			} :
			undefined,
		entityId: transaction?.entity ?
			{
				label: transaction.entity.name,
				value: {
					id:   transaction.entity.id,
					name: transaction.entity.name,
				},
			} :
			undefined,
		bankId: transaction?.bank ?
			{
				label: transaction.bank.bankName,
				value: {
					id:   transaction.bank.id,
					name: transaction.bank.bankName,
				},
			} :
			undefined,
		accountId: transaction?.account ?
			{
				label: transaction.account.accountName,
				value: {
					id:   transaction.account.id,
					name: transaction.account.accountName,
				},
			} :
			undefined,
		transactionTypeId: transaction?.transactionType ?
			{
				label: transaction.typeVersion?.name ?? '',
				value: {
					id:       transaction.transactionType.id ?? '',
					name:     transaction.typeVersion?.name ?? '',
					cashFlow: transaction.typeVersion?.cashFlow ?? '',
				},
			} :
			undefined,
		isin: transaction?.isin ?
			{
				label: transaction.isin,
				value: transaction.isin,
			} :
			undefined,
		serviceProvider: transaction?.serviceProvider ?
			{
				label: transaction.serviceProvider,
				value: transaction.serviceProvider,
			} :
			undefined,
		currency: transaction?.currency ?
			{
				label: transaction.currency,
				value: transaction.currency,
			} :
			undefined,
		amount: transaction?.amount ?
			`${Math.abs(transaction.amount,).toLocaleString('en-US',)}` :
			undefined,
		transactionDate: transaction?.transactionDate,
		expenseCategory: transaction?.expenseCategory ?
			{
				label: transaction.expenseCategory.name,
				value: {
					id:   transaction.expenseCategory.id,
					name: transaction.expenseCategory.name,
				},
			} :
			undefined,
		comment: transaction?.comment ?? undefined,
	}
}

export const initialFormValues: TransactionFormValues = {
	orderId:           undefined,
	clientId:          undefined,
	portfolioId:       undefined,
	bankId:            undefined,
	entityId:          undefined,
	accountId:         undefined,
	transactionTypeId: undefined,
	isin:              undefined,
	currency:          undefined,
	amount:            undefined,
	transactionDate:   undefined,
	comment:           undefined,
	customFields:      undefined,
	expenseCategory:   undefined,
}

export const formatValues = (data: TransactionFormValues,): FormatFormValues => {
	const amount = data.amount && data.transactionTypeId &&
		`${data.transactionTypeId.value.cashFlow === TransactionCashFlow.INFLOW ?
			'' :
			'-'}${data.amount.replace(/,/g, '',)}`

	return {
		orderId:           data.orderId?.value.id,
		clientId:          data.clientId?.value.id,
		portfolioId:       data.portfolioId?.value.id,
		entityId:          data.entityId?.value.id,
		accountId:         data.accountId?.value.id,
		transactionTypeId: data.transactionTypeId?.value.id,
		isin:              data.isin?.value,
		serviceProvider:   data.serviceProvider?.value,
		currency:          data.currency?.value,
		comment:           data.comment?.trim(),
		bankId:            data.bankId?.value.id,
		transactionDate:   data.transactionDate && formatToUTCISOString(new Date(data.transactionDate,),),
		customFields:      data.customFields && JSON.stringify(data.customFields,),
		amount:            amount ?
			Number(amount,) :
			undefined,
	}
}