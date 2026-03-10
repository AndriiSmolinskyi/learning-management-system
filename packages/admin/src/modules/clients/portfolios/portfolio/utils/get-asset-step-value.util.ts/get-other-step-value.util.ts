/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import type {
	IAssetOtherValues, IEditAssetOtherValues,
} from '../../components/drawer-content/components/form-asset/form-variables/other/other-content.types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'

const getAssetName = (values: IAssetOtherValues,): string => {
	return values.assetName?.label ?
		values.assetName.label :
		'Choose the asset from the list to proceed.'
}

const getOtherDetails = (values: IAssetOtherValues,): string => {
	const investmentAssetName = values.investmentAssetName ?
		`Asset Name: ${values.investmentAssetName}` :
		'Asset Name: not filled'

	const currency = values.currency?.label ?
		`Currency: ${values.currency.label}` :
		'Currency: not selected'

	const investmentDate = values.investmentDate ?
		`Investment Date: ${formatDateToDDMMYYYY(values.investmentDate,)}` :
		'Investment Date: not selected'

	const currencyValue = values.currencyValue ?
		`Currency Value: ${localeString(Number(values.currencyValue,), '', 0,)}` :
		'Currency Value: not filled'

	const usdValue = values.usdValue ?
		`USD Value: ${localeString(Number(values.usdValue,), 'USD', 0,)}` :
		'USD Value: not filled'

	const serviceProvider = values.serviceProvider ?
		`Service Provider: ${values.serviceProvider}` :
		'Service Provider: not filled'

	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		investmentAssetName,
		currency,
		investmentDate,
		currencyValue,
		usdValue,
		serviceProvider,
		comment,
	].join(', ',)
}

const getEditOtherDetails = (values: IEditAssetOtherValues,): string => {
	const investmentAssetName = values.investmentAssetName ?
		`Asset Name: ${values.investmentAssetName}` :
		'Asset Name: not filled'

	const currency = values.currency ?
		`Currency: ${values.currency}` :
		'Currency: not selected'

	const investmentDate = values.investmentDate ?
		`Investment Date: ${formatDateToDDMMYYYY(values.investmentDate,)}` :
		'Investment Date: not selected'

	const currencyValue = values.currencyValue ?
		`Currency Value: ${localeString(Number(values.currencyValue,), '', 0,)}` :
		'Currency Value: not filled'

	const usdValue = values.usdValue ?
		`USD Value: ${localeString(Number(values.usdValue,), 'USD', 0,)}` :
		'USD Value: not filled'

	const serviceProvider = values.serviceProvider ?
		`Service Provider: ${values.serviceProvider}` :
		'Service Provider: not filled'

	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		investmentAssetName,
		currency,
		investmentDate,
		currencyValue,
		usdValue,
		serviceProvider,
		comment,
	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return 'Add relevant documents for the client (optional).'
}

export const getOtherFormSteps = (values: IAssetOtherValues, isEdit?: boolean,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Investment details',
			labelDesc:  isEdit ?
				getEditOtherDetails(values as IEditAssetOtherValues,) :
				getOtherDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
