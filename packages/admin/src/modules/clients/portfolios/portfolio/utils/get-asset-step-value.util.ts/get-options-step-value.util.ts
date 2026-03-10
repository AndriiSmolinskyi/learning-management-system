/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import type {
	IOptionsFormValues,
} from '../../components/drawer-content/components/form-asset/form-variables/options/options-content.types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'

const getAssetName = (values: IOptionsFormValues,): string => {
	return values.assetName?.label ?
		values.assetName.label :
		'Choose the asset from the list to proceed.'
}

const getOptionsDetails = (values: IOptionsFormValues,): string => {
	const startDate = values.startDate ?
		`Start Date: ${formatDateToDDMMYYYY(values.startDate,)}` :
		'Start Date: not selected'
	const maturityDate = values.maturityDate ?
		`Maturity Date: ${formatDateToDDMMYYYY(values.maturityDate,)}` :
		'Maturity Date: not selected'

	const pairOrAsset = values.pairAssetCurrency ?
		`Currency Pair/Asset: ${values.pairAssetCurrency}` :
		'Currency Pair/Asset: not filled'
	const principalValue = values.principalValue ?
		`Principal Value: ${localeString(Number(values.principalValue,), '', 0,)}` :
		'Principal Value: not filled'
	const strike = values.strike ?
		`Strike: ${localeString(Number(values.strike,), '', 0,)}` :
		'Strike: not filled'
	const premium = values.premium ?
		`Premium: ${localeString(Number(values.premium,), '', 0,)}` :
		'Premium: not filled'
	const marketOpenValue = values.marketOpenValue ?
		`Market Open Value: ${localeString(Number(values.marketOpenValue,), '', 0,)}` :
		'Market Open Value: not filled'
	const currentMarketValue = values.currentMarketValue ?
		`Current Market Value: ${localeString(Number(values.currentMarketValue,), '', 0,)}` :
		'Current Market Value: not filled'
	const contracts = values.contracts ?
		`Contracts: ${localeString(Number(values.contracts,), '', 0,)}` :
		'Contracts: not filled'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		startDate,
		maturityDate,
		pairOrAsset,
		principalValue,
		strike,
		premium,
		marketOpenValue,
		currentMarketValue,
		contracts,
		comment,
	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return 'Add relevant documents for the client (optional).'
}

export const getOptionsFormSteps = (values: IOptionsFormValues,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Option details',
			labelDesc:  getOptionsDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
