/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import type {
	IEquityEditFormValues,
	IEquityFormValues,
} from '../../components/drawer-content/components/form-asset/form-variables/equity/equity-content.types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'

const getAssetName = (values: IEquityFormValues,): string => {
	return values.assetName?.value ?
		values.assetName.label :
		'Choose the asset from the list to proceed.'
}

const getEquityDetails = (values: IEquityFormValues,): string => {
	const currency = values.currency?.label ?
		`Currency: ${values.currency.label}` :
		'Currency: not selected'
	const transactionDate = values.transactionDate ?
		`Transaction Date: ${formatDateToDDMMYYYY(values.transactionDate,)}` :
		'Transaction Date: not selected'
	const isin = values.isin?.label ?
		`ISIN: ${values.isin.label}` :
		'ISIN: not filled'
	const units = values.units ?
		`Units: ${localeString(Number(values.units,), '', 0,)}` :
		'Units: not filled'
	const transactionPrice = values.transactionPrice ?
		`Transaction Price: ${localeString(Number(values.transactionPrice,), '', 0,)}` :
		'Transaction Price: not filled'
	const bankFee = values.bankFee ?
		`Bank Fee: ${localeString(Number(values.bankFee,), '', 0,)}` :
		'Bank Fee: not filled'
	const equityType = values.equityType?.label ?
		`Equity Type: ${values.equityType.label}` :
		'Equity Type: not selected'
	const operation = values.operation?.label ?
		`Operation: ${values.operation.label}` :
		'Operation: not selected'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		transactionDate,
		isin,
		units,
		transactionPrice,
		bankFee,
		equityType,
		operation,
		comment,
	].join(', ',)
}

const getEquityEditDetails = (values: IEquityEditFormValues,): string => {
	const currency = values.currency ?
		`Currency: ${values.currency}` :
		'Currency: not selected'
	const transactionDate = values.transactionDate ?
		`Transaction Date: ${formatDateToDDMMYYYY(values.transactionDate,)}` :
		'Transaction Date: not selected'
	const isin = values.isin ?
		`ISIN: ${values.isin}` :
		'ISIN: not filled'
	const units = values.units ?
		`Units: ${localeString(Number(values.units,), '', 0,)}` :
		'Units: not filled'
	const transactionPrice = values.transactionPrice ?
		`Transaction Price: ${localeString(Number(values.transactionPrice,), '', 0,)}` :
		'Transaction Price: not filled'
	const bankFee = values.bankFee ?
		`Bank Fee: ${localeString(Number(values.bankFee,), '', 0,)}` :
		'Bank Fee: not filled'
	const equityType = values.equityType?.label ?
		`Equity Type: ${values.equityType.label}` :
		'Equity Type: not selected'
	const operation = values.operation?.label ?
		`Operation: ${values.operation.label}` :
		'Operation: not selected'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		transactionDate,
		isin,
		units,
		transactionPrice,
		bankFee,
		equityType,
		operation,
		comment,
	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the client (optional).`
}

export const getAssetEquityFormSteps = (values: IEquityFormValues, isEdit?: boolean,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Asset details',
			labelDesc:  isEdit ?
				getEquityEditDetails(values as IEquityEditFormValues,) :
				getEquityDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
