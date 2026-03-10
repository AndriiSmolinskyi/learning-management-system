/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'
import type {
	ICollateralFormValues, IEditCollateralFormValues,
} from '../../components/drawer-content/components/form-asset/form-variables/collateral/collateral-content.types'

const getAssetName = (values: ICollateralFormValues,): string => {
	return values.assetName?.label ?
		values.assetName.label :
		'Choose the asset from the list to proceed.'
}

const getCollateralDetails = (values: ICollateralFormValues,): string => {
	const currency = values.currency?.label ?
		`Currency: ${values.currency.label}` :
		'Currency: not selected'
	const startDate = values.startDate ?
		`Start Date: ${formatDateToDDMMYYYY(values.startDate,)}` :
		'Start Date: not selected'
	const endDate = values.endDate ?
		`End Date: ${formatDateToDDMMYYYY(values.endDate,)}` :
		'End Date: not selected'
	const currencyAmount = values.currencyValue ?
		`Currency Amount: ${localeString(Number(values.currencyValue,), '', 0,)}` :
		'Currency Amount: not filled'
	const usdAmount = values.usdValue ?
		`USD Amount: ${localeString(Number(values.usdValue,), 'USD', 0,)}` :
		'USD Amount: not filled'
	const creditProvider = values.creditProvider ?
		`Credit Provider: ${values.creditProvider}` :
		'Credit Provider: not filled'
	const creditAmount = values.creditAmount ?
		`Credit Amount: ${localeString(Number(values.creditAmount,), '', 0,)}` :
		'Credit Amount: not filled'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		startDate,
		endDate,
		currencyAmount,
		usdAmount,
		creditProvider,
		creditAmount,
		comment,
	].join(', ',)
}

const getEditCollateralDetails = (values: IEditCollateralFormValues,): string => {
	const currency = values.currency ?
		`Currency: ${values.currency}` :
		'Currency: not selected'
	const startDate = values.startDate ?
		`Start Date: ${formatDateToDDMMYYYY(values.startDate,)}` :
		'Start Date: not selected'
	const endDate = values.endDate ?
		`End Date: ${formatDateToDDMMYYYY(values.endDate,)}` :
		'End Date: not selected'
	const currencyAmount = values.currencyValue ?
		`Currency Amount: ${values.currencyValue}` :
		'Currency Amount: not filled'
	const usdAmount = values.usdValue ?
		`USD Amount: ${values.usdValue}` :
		'USD Amount: not filled'
	const creditProvider = values.creditProvider ?
		`Credit Provider: ${values.creditProvider}` :
		'Credit Provider: not filled'
	const creditAmount = values.creditAmount ?
		`Credit Amount: ${values.creditAmount}` :
		'Credit Amount: not filled'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		startDate,
		endDate,
		currencyAmount,
		usdAmount,
		creditProvider,
		creditAmount,
		comment,
	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the client (optional).`
}

export const getCollateralFormSteps = (values: ICollateralFormValues, isEdit?: boolean,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Collateral details',
			labelDesc:  isEdit ?
				getEditCollateralDetails(values as IEditCollateralFormValues,) :
				getCollateralDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
