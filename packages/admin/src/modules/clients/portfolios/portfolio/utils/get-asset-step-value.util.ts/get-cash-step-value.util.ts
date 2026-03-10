import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
// todo: Maybe be used in future cr
// import {
// 	formatDateToDDMMYYYY,
// } from '../../../../../../shared/utils'
import type {
	IAssetCashFormValues,
} from '../../components/drawer-content/components/form-asset/form-variables/cash/cash-content.types'

const getAssetName = (values: IAssetCashFormValues,): string => {
	return values.assetName?.label ?
		values.assetName.label :
		'Choose the asset from the list to proceed.'
}

const getCashDetails = (values: IAssetCashFormValues,): string => {
	const currency = values.currency?.label ?
		`Currency: ${values.currency.label}` :
		'Currency: not selected'
	// const transactionDate = values.transactionDate ?
	// 	`Transaction Date: ${formatDateToDDMMYYYY(values.transactionDate,)}` :
	// 	'Transaction Date: not selected'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		comment,
	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the asset (optional).`
}

export const getAssetCashFormSteps = (values: IAssetCashFormValues,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Cash details',
			labelDesc:  getCashDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
