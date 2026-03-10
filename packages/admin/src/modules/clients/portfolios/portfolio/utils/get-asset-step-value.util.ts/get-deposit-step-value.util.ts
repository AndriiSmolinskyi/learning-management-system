/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import type {
	ICashDepositFormValues, IDepositFormEditFields,
} from '../../components/drawer-content/components/form-asset/form-variables/cash-deposit/cash-deposit.types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'

const getAssetName = (values: ICashDepositFormValues,): string => {
	return values.currency?.label ?
		values.currency.label :
		'Choose the asset from the list to proceed.'
}

const getDepositDetails = (values: ICashDepositFormValues,): string => {
	const currency = values.currency?.label ?
		`Currency: ${values.currency.label}` :
		'Currency: not selected'
	const interest = values.interest ?
		`Interest: ${localeString(Number(values.interest,), '', 0,)}` :
		'Interest: not specified'
	const currencyValue = values.currencyValue ?
		`Currency Value: ${localeString(Number(values.currencyValue,), '', 0,)}` :
		'Currency Value: not filled'
	const startDate = values.startDate ?
		`Start Date: ${formatDateToDDMMYYYY(values.startDate,)}` :
		'Start Date: not selected'
	const maturityDate = values.maturityDate ?
		`Maturity Date: ${formatDateToDDMMYYYY(values.maturityDate,)}` :
		'Maturity Date: not selected'
	const policy = values.policy?.label ?
		`Policy: ${values.policy.label}` :
		'Policy: not selected'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		interest,
		currencyValue,
		startDate,
		maturityDate,
		policy,
		comment,
	].join(', ',)
}

const getEditDepositDetails = (values: IDepositFormEditFields,): string => {
	const currency = values.currency ?
		`Currency: ${values.currency}` :
		'Currency: not selected'
	const interest = values.interest ?
		`Interest: ${localeString(Number(values.interest,), '', 0,)}` :
		'Interest: not specified'
	const currencyValue = values.currencyValue ?
		`Currency Value: ${localeString(Number(values.currencyValue,), '', 0,)}` :
		'Currency Value: not filled'
	const startDate = values.startDate ?
		`Start Date: ${formatDateToDDMMYYYY(values.startDate,)}` :
		'Start Date: not selected'
	const maturityDate = values.maturityDate ?
		`Maturity Date: ${formatDateToDDMMYYYY(values.maturityDate,)}` :
		'Maturity Date: not selected'
	const policy = values.policy?.label ?
		`Policy: ${values.policy.label}` :
		'Policy: not selected'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		interest,
		currencyValue,
		startDate,
		maturityDate,
		policy,
		comment,
	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the asset (optional).`
}

export const getAssetDepositFormSteps = (values: ICashDepositFormValues, isEdit?: boolean,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Cash details',
			labelDesc:  isEdit ?
				getEditDepositDetails(values as IDepositFormEditFields,) :
				getDepositDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
