/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import type {
	IEditMetalsFormValues,
	IMetalsFormValues,
} from '../../components/drawer-content/components/form-asset/form-variables/metals/metals-content.types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'

const getAssetName = (values: IMetalsFormValues,): string => {
	return values.assetName?.label ?
		values.assetName.label :
		'Choose the asset from the list to proceed.'
}

const getMetalDetails = (values: IMetalsFormValues,): string => {
	const metalType = values.metalType?.value ?
		`Metal Type: ${values.metalType.value}` :
		'Metal Type: not selected'
	const transactionDate = values.transactionDate ?
		`Transaction Date: ${formatDateToDDMMYYYY(values.transactionDate,)}` :
		'Transaction Date: not selected'
	const purchasePrice = values.purchasePrice ?
		`Purchase Price: ${localeString(Number(values.purchasePrice,), '', 0,)}` :
		'Purchase Price: not filled'
	const units = values.units ?
		`Units: ${localeString(Number(values.units,), '', 0,)}` :
		'Units: not filled'
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
		metalType,
		transactionDate,
		purchasePrice,
		units,
		operation,
		comment,
	].join(', ',)
}

const getEditMetalDetails = (values: IEditMetalsFormValues,): string => {
	const metalType = values.metalType ?
		`Metal Type: ${values.metalType}` :
		'Metal Type: not selected'
	const transactionDate = values.transactionDate ?
		`Transaction Date: ${formatDateToDDMMYYYY(values.transactionDate,)}` :
		'Transaction Date: not selected'
	const purchasePrice = values.purchasePrice ?
		`Purchase Price: ${localeString(Number(values.purchasePrice,), '', 0,)}` :
		'Purchase Price: not filled'
	const units = values.units ?
		`Units: ${localeString(Number(values.units,), '', 0,)}` :
		'Units: not filled'
	const operation = values.operation ?
		`Operation: ${values.operation}` :
		'Operation: not selected'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		metalType,
		transactionDate,
		purchasePrice,
		units,
		operation,
		comment,
	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return 'Add relevant documents for the client (optional).'
}

export const getMetalsFormSteps = (values: IMetalsFormValues, isEdit?: boolean,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Metal details',
			labelDesc:  isEdit ?
				getEditMetalDetails(values as IEditMetalsFormValues,) :
				getMetalDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
