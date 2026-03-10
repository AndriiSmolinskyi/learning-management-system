/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import type {
	IEditRealEstateFormValues,
	IRealEstateFormValues,
} from '../../components/drawer-content/components/form-asset/form-variables/real-estate/real-estate-content.types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'

const getAssetName = (values: IRealEstateFormValues,): string => {
	return values.assetName?.label ?
		values.assetName.label :
		'Choose the asset from the list to proceed.'
}

const getRealEstateDetails = (values: IRealEstateFormValues,): string => {
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

	const projectTransaction = values.projectTransaction?.label ?
		`Project Transaction: ${values.projectTransaction.label}` :
		'Project Transaction: not selected'

	const country = values.country?.label ?
		`Country: ${values.country.label}` :
		'Country: not selected'

	const city = values.city ?
		`City: ${values.city}` :
		'City: not filled'

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
		investmentDate,
		currencyValue,
		usdValue,
		projectTransaction,
		country,
		city,
		operation,
		comment,

	].join(', ',)
}

const getEditRealEstateDetails = (values: IEditRealEstateFormValues,): string => {
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
		`USD Value: ${localeString(Number(values.usdValue,), '', 0,)}` :
		'USD Value: not filled'

	const projectTransaction = values.projectTransaction ?
		`Project Transaction: ${values.projectTransaction}` :
		'Project Transaction: not selected'

	const country = values.country ?
		`Country: ${values.country}` :
		'Country: not selected'

	const city = values.city ?
		`City: ${values.city}` :
		'City: not filled'

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
		currency,
		investmentDate,
		currencyValue,
		usdValue,
		projectTransaction,
		country,
		city,
		operation,
		comment,

	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the real estate asset (optional).`
}

export const getAssetRealEstateFormSteps = (values: IRealEstateFormValues, isEdit?: boolean,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Real estate details',
			labelDesc:  isEdit ?
				getEditRealEstateDetails(values as IEditRealEstateFormValues,) :
				getRealEstateDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
