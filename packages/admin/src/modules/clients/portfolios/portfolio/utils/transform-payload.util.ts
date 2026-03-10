/* eslint-disable complexity */
import {
	formatToUTCISOString,
} from '../../../../../shared/utils'
import type {
	IOptionType,
} from '../../../../../shared/types'
import type {
	OtherFormValues,
} from '../../portfolio-details/components/asset'
import type {
	IBondFormFields,
	IAssetCashFormValues,
	IAssetPrivateValues,
	IAssetOtherValues,
	ICashDepositFormValues,
	ICollateralFormValues,
	ICryptoFormValues,
	ILoanFormFieldsValues,
	IEquityFormValues,
	IMetalsFormValues,
	IOptionsFormValues,
	IRealEstateFormValues,
} from '../components/drawer-content/components/form-asset/form-variables'

type AssetValue = string | IOptionType | number | boolean;
export type AssetValues = Record<string, AssetValue>

const FLOAT_KEYS = new Set([
	'currencyValue',
	'units',
	'unitPrice',
	'bankFee',
	'accrued',
	'interest',
	'creditAmount',
	'usdValue',
	'cryptoAmount',
	'purchasePrice',
	'transactionPrice',
	'todayInterest',
	'maturityInterest',
	'principalValue',
	'strike',
	'premium',
	'marketOpenValue',
	'currentMarketValue',
	'contracts',
	'moic',
	'irr',
	'liquidity',
	'managementExpenses',
	'otherExpenses',
	'carriedInterest',
	'distributions',
	'marketValueFC',
	'capitalCalled',
	'totalCommitment',
	'tvpi',
],)

const DATE_KEYS = new Set([
	'valueDate',
	'startDate',
	'maturityDate',
	'endDate',
	'purchaseDate',
	'transactionDate',
	'investmentDate',
	'entryDate',
	'fundTermDate',
	'lastValuationDate',
],)

export const transformValuesForPayload = (assetValues: AssetValues | OtherFormValues,): Record<string, string | number> => {
	return Object.fromEntries(
		Object.entries(assetValues,)
			.filter(([key, item,],) => {
				return item !== null
			},)
			.map(([key, item,],) => {
				let value: string | number = item as string

				if (typeof item === 'object' && 'label' in item && 'value' in item) {
					const {
						value: itemValue,
					} = item
					value = itemValue
				}

				if (FLOAT_KEYS.has(key,) && typeof value === 'string') {
					value = parseFloat(value,)
				}

				if (DATE_KEYS.has(key,)) {
					value = formatToUTCISOString(new Date(item,),)
				}

				return [key, value,]
			},),
	)
}

export type CommonAssetType = IBondFormFields &
	IAssetCashFormValues &
	IAssetPrivateValues &
	IAssetOtherValues &
	ICashDepositFormValues &
	ICollateralFormValues &
	ICryptoFormValues &
	ILoanFormFieldsValues &
	IEquityFormValues &
	IMetalsFormValues &
	IOptionsFormValues &
	IRealEstateFormValues

export const assetOptionKeysArray: Array<keyof CommonAssetType> = [
	'currency',
	'isin',
	'operation',
	'policy',
	'cryptoCurrencyType',
	'equityType',
	'metalType',
	'fundSize',
	'fundType',
	'projectTransaction',
	'country',
	'serviceProvider',
	'status',
	'productType',
]

export const transformPayloadForValues = (data: string,): AssetValues => {
	try {
		const payload = JSON.parse(data,) as Record<string, string>
		const result = Object.fromEntries(
			Object.entries(payload,).map(([key, item,],) => {
				let value: string | number | boolean = item

				if (assetOptionKeysArray.includes(key as keyof CommonAssetType,)) {
					return [key, {
						label: item, value,
					},]
				}
				if (FLOAT_KEYS.has(key,) && typeof value === 'number') {
					value = String(value,)
				}
				return [key, value,]
			},),
		)
		if ('policy' in payload && payload['toBeMatured'] === undefined) {
			result.toBeMatured = false
		}
		return result
	} catch (error) {
		return {
		}
	}
}

export 	const transformData = (data: Record<string, unknown>,): Record<string, unknown> => {
	const customFields: Array<{ label: string; info: string }> = []
	const result: Record<string, unknown> = {
	}
	Object.entries(data,).forEach(([key, value,],) => {
		if (key.startsWith('field',)) {
			if (typeof value === 'string') {
				// eslint-disable-next-line no-unused-vars
				const [label, labelTitle,] = key.split('-',)
				customFields.push({
					label: labelTitle ?? '',
					info:  value,
				},)
			}
		} else {
			result[key] = value
		}
	},)

	if (customFields.length > 0) {
		result['customFields'] = customFields
	}

	return result
}