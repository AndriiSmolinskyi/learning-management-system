/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'
import type {
	IEditLoanFormFieldsValues,
	ILoanFormFieldsValues,
} from '../../components/drawer-content/components/form-asset/form-variables/loan/loan-content.types'

const getAssetName = (values: ILoanFormFieldsValues,): string => {
	return values.assetName?.value ?
		values.assetName.label :
		'Choose the asset from the list to proceed.'
}

const getLoanDetails = (values: ILoanFormFieldsValues,): string => {
	const loanName = values.loanName ?
		`Loan Name: ${values.loanName}` :
		'Loan Name: not filled'
	const startDate = values.startDate ?
		`Start Date: ${formatDateToDDMMYYYY(values.startDate,)}` :
		'Start Date: not selected'
	const maturityDate = values.maturityDate ?
		`Maturity Date: ${formatDateToDDMMYYYY(values.maturityDate,)}` :
		'Maturity Date: not selected'
	const currency = values.currency?.label ?
		`Currency: ${values.currency.label}` :
		'Currency: not selected'
	const currencyValue = values.currencyValue ?
		`Value on Currency: ${localeString(Number(values.currencyValue,), '', 0,)}` :
		'Value on Currency: not filled'
	const usdValue = values.usdValue ?
		`Value in USD: ${localeString(Number(values.usdValue,), 'USD', 0,)}` :
		'Value in USD: not filled'
	const interest = values.interest ?
		`Interest: ${localeString(Number(values.interest,), '', 0,)}` :
		'Interest: not filled'
	const todayInterest = values.todayInterest ?
		`Interest Today: ${localeString(Number(values.todayInterest,), '', 0,)}` :
		'Interest Today: not filled'
	const maturityInterest = values.maturityInterest ?
		`Interest to Maturity: ${localeString(Number(values.maturityInterest,), '', 0,)}` :
		'Interest to Maturity: not filled'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		loanName,
		startDate,
		maturityDate,
		currency,
		currencyValue,
		usdValue,
		interest,
		todayInterest,
		maturityInterest,
		comment,
	].join(', ',)
}

const getEditLoanDetails = (values: IEditLoanFormFieldsValues,): string => {
	const loanName = values.loanName ?
		`Loan Name: ${values.loanName}` :
		'Loan Name: not filled'
	const startDate = values.startDate ?
		`Start Date: ${formatDateToDDMMYYYY(values.startDate,)}` :
		'Start Date: not selected'
	const maturityDate = values.maturityDate ?
		`Maturity Date: ${formatDateToDDMMYYYY(values.maturityDate,)}` :
		'Maturity Date: not selected'
	const currency = values.currency ?
		`Currency: ${values.currency}` :
		'Currency: not selected'
	const currencyValue = values.currencyValue ?
		`Value on Currency: ${localeString(Number(values.currencyValue,), '', 0,)}` :
		'Value on Currency: not filled'
	const usdValue = values.usdValue ?
		`Value in USD: ${localeString(Number(values.usdValue,), 'USD', 0,)}` :
		'Value in USD: not filled'
	const interest = values.interest ?
		`Interest: ${values.interest}` :
		'Interest: not filled'
	const todayInterest = values.todayInterest ?
		`Interest Today: ${values.todayInterest}` :
		'Interest Today: not filled'
	const maturityInterest = values.maturityInterest ?
		`Interest to Maturity: ${values.maturityInterest}` :
		'Interest to Maturity: not filled'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		loanName,
		startDate,
		maturityDate,
		currency,
		currencyValue,
		usdValue,
		interest,
		todayInterest,
		maturityInterest,
		comment,
	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the client (optional).`
}

export const getAssetLoanFormSteps = (values: ILoanFormFieldsValues, isEdit?: boolean,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Asset details',
			labelDesc:  isEdit ?
				getEditLoanDetails(values as IEditLoanFormFieldsValues,) :
				getLoanDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
