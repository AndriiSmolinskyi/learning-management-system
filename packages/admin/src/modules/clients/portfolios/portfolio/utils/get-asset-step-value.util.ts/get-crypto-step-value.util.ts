/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import type {
	ICryptoFormStepDetailsValues,
	IEditCryptoFormValues,
} from '../../components/drawer-content/components/form-asset/form-variables/crypto/crypto-content.types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'

const getAssetName = (values: ICryptoFormStepDetailsValues,): string => {
	return values.assetName?.label ?
		values.assetName.label :
		'Choose the asset from the list to proceed.'
}

const getCryptoDetails = (values: ICryptoFormStepDetailsValues,): string => {
	const cryptoCurrencyType = values.cryptoCurrencyType?.value ?
		`Crypto Currency Type: ${values.cryptoCurrencyType.value}` :
		'Crypto Currency Type: not selected'

	const cryptoAmount = values.cryptoAmount ?
		`Crypto Amount: ${localeString(Number(values.cryptoAmount,), '', 0,)}` :
		'Crypto Amount: not filled'

	const exchangeWallet = values.exchangeWallet ?
		`Exchange / Wallet: ${values.exchangeWallet}` :
		'Exchange / Wallet: not provided'

	const purchaseDate = values.purchaseDate ?
		`Purchase Date: ${formatDateToDDMMYYYY(values.purchaseDate,)}` :
		'Purchase Date: not selected'

	const purchasePrice = values.purchasePrice ?
		`Purchase Price: ${localeString(Number(values.purchasePrice,), '', 0,)}` :
		'Purchase Price: not filled'

	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		cryptoCurrencyType,
		cryptoAmount,
		exchangeWallet,
		purchaseDate,
		purchasePrice,
		comment,
	].join(', ',)
}

const getEditCryptoDetails = (values: IEditCryptoFormValues,): string => {
	const cryptoCurrencyType = values.cryptoCurrencyType ?
		`Crypto Currency Type: ${values.cryptoCurrencyType}` :
		'Crypto Currency Type: not selected'

	const cryptoAmount = values.cryptoAmount ?
		`Crypto Amount: ${localeString(Number(values.cryptoAmount,), '', 0,)}` :
		'Crypto Amount: not filled'

	const exchangeWallet = values.exchangeWallet ?
		`Exchange / Wallet: ${values.exchangeWallet}` :
		'Exchange / Wallet: not provided'

	const purchaseDate = values.purchaseDate ?
		`Purchase Date: ${formatDateToDDMMYYYY(values.purchaseDate,)}` :
		'Purchase Date: not selected'

	const purchasePrice = values.purchasePrice ?
		`Purchase Price: ${values.purchasePrice}` :
		'Purchase Price: not filled'

	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		cryptoCurrencyType,
		cryptoAmount,
		exchangeWallet,
		purchaseDate,
		purchasePrice,
		comment,
	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the crypto asset (optional).`
}

export const getAssetCryptoFormSteps = (values: ICryptoFormStepDetailsValues, isEdit?: boolean,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Crypto details',
			labelDesc:  isEdit ?
				getEditCryptoDetails(values as IEditCryptoFormValues,) :
				getCryptoDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
