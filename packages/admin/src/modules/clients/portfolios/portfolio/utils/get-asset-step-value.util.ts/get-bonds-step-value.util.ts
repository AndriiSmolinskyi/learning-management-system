/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'
import type {
	IBondFormEditFields,
	IBondFormFields,
} from '../../components/drawer-content/components/form-asset/form-variables/bonds/bond-content.types'

const getAssetName = (values: IBondFormFields,): string => {
	return values.assetName?.value ?
		values.assetName.value :
		'Choose the asset from the list to proceed.'
}

const getBondDetails = (values: IBondFormFields,): string => {
	const currency = values.currency?.label ?
		`Currency: ${values.currency.label}` :
		'Currency: not selected'
	const valueDate = values.valueDate ?
		`Value Date: ${formatDateToDDMMYYYY(values.valueDate,)}` :
		'Value Date: not selected'
	const isin = values.isin?.label ?
		`ISIN: ${values.isin.label}` :
		'ISIN: not filled'
	const security = values.security ?
		`Security: ${values.security}` :
		'Security: not selected'
	const units = values.units ?
		`Units: ${localeString(Number(values.units,), '', 0,)}` :
		'Units: not filled'
	const unitPrice = values.unitPrice ?
		`Unit Price: ${localeString(Number(values.unitPrice,), '', 0,)}` :
		'Unit Price: not filled'
	const bankFee = values.bankFee ?
		`Bank Fee: ${localeString(Number(values.bankFee,), '', 0,)}` :
		'Bank Fee: not filled'
	const accrued = values.accrued ?
		`Accrued Value: ${localeString(Number(values.accrued,), '', 0,)}` :
		'Accrued Value: not filled'
	const operation = values.operation?.label ?
		`Operation: ${values.operation.label}` :
		'Operation: not selected'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'

	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	if (Object.keys(values,).length === 2 && 'assetName' in values && 'security' in values && !values.security) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		valueDate,
		isin,
		security,
		units,
		unitPrice,
		bankFee,
		accrued,
		operation,
		comment,
	].join(', ',)
}

const getEditBondDetails = (values: IBondFormEditFields,): string => {
	const currency = values.currency ?
		`Currency: ${values.currency}` :
		'Currency: not selected'
	const valueDate = values.valueDate ?
		`Value Date: ${formatDateToDDMMYYYY(values.valueDate,)}` :
		'Value Date: not selected'
	const isin = values.isin ?
		`ISIN: ${values.isin}` :
		'ISIN: not filled'
	const security = values.security ?
		`Security: ${values.security}` :
		'Security: not selected'
	const units = values.units ?
		`Units: ${localeString(Number(values.units,), '', 0,)}` :
		'Units: not filled'
	const unitPrice = values.unitPrice ?
		`Unit Price: ${localeString(Number(values.unitPrice,), '', 0,)}` :
		'Unit Price: not filled'
	const bankFee = values.bankFee ?
		`Bank Fee: ${localeString(Number(values.bankFee,), '', 0,)}` :
		'Bank Fee: not filled'
	const accrued = values.accrued ?
		`Accrued Value: ${localeString(Number(values.accrued,), '', 0,)}` :
		'Accrued Value: not filled'
	const operation = values.operation?.label ?
		`Operation: ${values.operation.label}` :
		'Operation: not selected'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'

	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	if (Object.keys(values,).length === 2 && 'assetName' in values && 'security' in values && !values.security) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		valueDate,
		isin,
		security,
		units,
		unitPrice,
		bankFee,
		accrued,
		operation,
		comment,
	].join(', ',)
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the client (optional).`
}

export const getAssetBondsFormSteps = (values: IBondFormFields, isEdit?: boolean,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Asset details',
			labelDesc:  isEdit ?
				getEditBondDetails(values as IBondFormEditFields,) :
				getBondDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
