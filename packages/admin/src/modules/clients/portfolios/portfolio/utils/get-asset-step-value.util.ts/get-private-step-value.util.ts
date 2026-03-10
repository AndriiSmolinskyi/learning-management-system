/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import type {
	IAssetPrivateValues, IEditAssetPrivateValues,
} from '../../components/drawer-content/components/form-asset/form-variables/private-equity/private-equity-content.types'
import {
	formatDateToDDMMYYYY, localeString,
} from '../../../../../../shared/utils'

const getAssetName = (values: IAssetPrivateValues,): string => {
	return values.assetName?.label ?
		values.assetName.label :
		'Choose the asset from the list to proceed.'
}

const getPrivateEquityDetails = (values: IAssetPrivateValues,): string => {
	const currency = values.currency?.label ?
		`Currency: ${values.currency.label}` :
		'Currency: not selected'
	const entryDate = values.entryDate ?
		`Entry Date: ${formatDateToDDMMYYYY(values.entryDate,)}` :
		null
	const currentValue = values.currencyValue ?
		`Current Value: ${localeString(Number(values.currencyValue,), '', 0,)}` :
		'Current Value: not filled'
	const serviceProvider = values.serviceProvider?.label ?
		`Service Provider: ${values.serviceProvider.label}` :
		'Service Provider: not selected'
	const geography = values.geography ?
		`Geography: ${values.geography}` :
		'Geography: not filled'
	const fundName = values.fundName ?
		`Fund Name: ${values.fundName}` :
		'Fund Name: not filled'
	const fundID = values.fundID ?
		`Fund ID: ${values.fundID}` :
		'Fund ID: not filled'
	const fundType = values.fundType ?
		`Fund Type: ${values.fundType}` :
		'Fund Type: not filled'
	const fundSize = values.fundSize?.label ?
		`Fund Size: ${values.fundSize.label}` :
		'Fund Size: not selected'
	const aboutFund = values.aboutFund ?
		`About Fund: ${values.aboutFund}` :
		'About Fund: not filled'
	const investmentPeriod = values.investmentPeriod ?
		`Investment Period: ${values.investmentPeriod}` :
		'Investment Period: not filled'
	const fundTermDate = values.fundTermDate ?
		`Fund Term Date: ${formatDateToDDMMYYYY(values.fundTermDate,)}` :
		'Fund Term Date: not filled'
	const capitalCalled = values.capitalCalled ?
		`Capital Called: ${localeString(Number(values.capitalCalled,), '', 0,)}` :
		'Capital Called: not filled'
	const lastValuationDate = values.lastValuationDate ?
		`Last Valuation Date: ${values.lastValuationDate}` :
		'Last Valuation Date: not filled'
	const moic = values.moic ?
		`MOIC: ${localeString(Number(values.moic,), '', 0,)}` :
		'MOIC: not filled'
	const irr = values.irr ?
		`IRR: ${localeString(Number(values.irr,), '', 0,)}` :
		'IRR: not filled'
	const liquidity = values.liquidity ?
		`Liquidity: ${values.liquidity}` :
		'Liquidity: not filled'
	const totalCommitment = values.totalCommitment ?
		`Total Commitment: ${localeString(Number(values.totalCommitment,), '', 0,)}` :
		'Total Commitment: not filled'
	const tvpi = values.tvpi ?
		`TVPI: ${localeString(Number(values.tvpi,), '', 0,)}` :
		'TVPI: not filled'
	const managementExpenses = values.managementExpenses ?
		`Management Expenses: ${localeString(Number(values.managementExpenses,), '', 0,)}` :
		'Management Expenses: not filled'
	const otherExpenses = values.otherExpenses ?
		`Other Expenses: ${localeString(Number(values.otherExpenses,), '', 0,)}` :
		'Other Expenses: not filled'
	const carriedInterest = values.carriedInterest ?
		`Carried Interest: ${localeString(Number(values.carriedInterest,), '', 0,)}` :
		'Carried Interest: not filled'
	const distributions = values.distributions ?
		`Distributions: ${localeString(Number(values.distributions,), '', 0,)}` :
		'Distributions: not filled'
	const holdingEntity = values.holdingEntity ?
		`Entity of Holding: ${values.holdingEntity}` :
		'Entity of Holding: not filled'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		entryDate,
		currentValue,
		serviceProvider,
		geography,
		fundName,
		fundID,
		fundType,
		fundSize,
		aboutFund,
		investmentPeriod,
		fundTermDate,
		capitalCalled,
		lastValuationDate,
		moic,
		irr,
		liquidity,
		totalCommitment,
		tvpi,
		managementExpenses,
		otherExpenses,
		carriedInterest,
		distributions,
		holdingEntity,
		comment,
	]
		.join(', ',)
}

const getEditPrivateEquityDetails = (values: IEditAssetPrivateValues,): string => {
	const currency = values.currency ?
		`Currency: ${values.currency}` :
		'Currency: not selected'
	const entryDate = values.entryDate ?
		`Entry Date: ${formatDateToDDMMYYYY(values.entryDate,)}` :
		null
	const currentValue = values.currencyValue ?
		`Current Value: ${localeString(Number(values.currencyValue,), '', 0,)}` :
		'Current Value: not filled'
	const serviceProvider = values.serviceProvider ?
		`Service Provider: ${values.serviceProvider}` :
		'Service Provider: not selected'
	const geography = values.geography ?
		`Geography: ${values.geography}` :
		'Geography: not filled'
	const fundName = values.fundName ?
		`Fund Name: ${values.fundName}` :
		'Fund Name: not filled'
	const fundID = values.fundID ?
		`Fund ID: ${values.fundID}` :
		'Fund ID: not filled'
	const fundType = values.fundType ?
		`Fund Type: ${values.fundType}` :
		'Fund Type: not filled'
	const fundSize = values.fundSize ?
		`Fund Size: ${values.fundSize}` :
		'Fund Size: not selected'
	const aboutFund = values.aboutFund ?
		`About Fund: ${values.aboutFund}` :
		'About Fund: not filled'
	const investmentPeriod = values.investmentPeriod ?
		`Investment Period: ${values.investmentPeriod}` :
		'Investment Period: not filled'
	const fundTermDate = values.fundTermDate ?
		`Fund Term Date: ${formatDateToDDMMYYYY(values.fundTermDate,)}` :
		'Fund Term Date: not filled'
	const capitalCalled = values.capitalCalled ?
		`Capital Called: ${values.capitalCalled}` :
		'Capital Called: not filled'
	const lastValuationDate = values.lastValuationDate ?
		`Last Valuation Date: ${values.lastValuationDate}` :
		'Last Valuation Date: not filled'
	const moic = values.moic ?
		`MOIC: ${values.moic}` :
		'MOIC: not filled'
	const irr = values.irr ?
		`IRR: ${values.irr}` :
		'IRR: not filled'
	const liquidity = values.liquidity ?
		`Liquidity: ${values.liquidity}` :
		'Liquidity: not filled'
	const totalCommitment = values.totalCommitment ?
		`Total Commitment: ${values.totalCommitment}` :
		'Total Commitment: not filled'
	const tvpi = values.tvpi ?
		`TVPI: ${values.tvpi}` :
		'TVPI: not filled'
	const managementExpenses = values.managementExpenses ?
		`Management Expenses: ${values.managementExpenses}` :
		'Management Expenses: not filled'
	const otherExpenses = values.otherExpenses ?
		`Other Expenses: ${values.otherExpenses}` :
		'Other Expenses: not filled'
	const carriedInterest = values.carriedInterest ?
		`Carried Interest: ${values.carriedInterest}` :
		'Carried Interest: not filled'
	const distributions = values.distributions ?
		`Distributions: ${values.distributions}` :
		'Distributions: not filled'
	const holdingEntity = values.holdingEntity ?
		`Entity of Holding: ${values.holdingEntity}` :
		'Entity of Holding: not filled'
	const comment = values.comment ?
		`Comment: ${values.comment}` :
		'Comment: no comment provided'
	if (Object.keys(values,).length === 1 && 'assetName' in values) {
		return 'Provide the information according to the asset.'
	}
	return [
		currency,
		entryDate,
		currentValue,
		serviceProvider,
		geography,
		fundName,
		fundID,
		fundType,
		fundSize,
		aboutFund,
		investmentPeriod,
		fundTermDate,
		capitalCalled,
		lastValuationDate,
		moic,
		irr,
		liquidity,
		totalCommitment,
		tvpi,
		managementExpenses,
		otherExpenses,
		carriedInterest,
		distributions,
		holdingEntity,
		comment,
	]
		.join(', ',)
}

const getDocumentsDesc = (): string => {
	return `Add relevant documents for the client (optional).`
}

export const getAssetPrivateEquityFormSteps = (values: IAssetPrivateValues, isEdit?: boolean,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Select asset',
			labelDesc:  getAssetName(values,),
		},
		{
			labelTitle: 'Asset details',
			labelDesc:  isEdit ?
				getEditPrivateEquityDetails(values as IEditAssetPrivateValues,) :
				getPrivateEquityDetails(values,),
		},
		{
			labelTitle: 'Documents',
			labelDesc:  getDocumentsDesc(),
		},
	]
}
