import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

import type {
	AssetFormValues,
} from './asset.types'
import type {
	AssetNamesType,
	IOptionType,
} from '../../../../../../shared/types'
import {
	CryptoType,

	MetalType,
} from '../../../../../../shared/types'

const addAssetSchema: yup.ObjectSchema<AssetFormValues> = yup.object({
	assetName: yup.object({
		value: yup
			.string()
			.trim()
			.required() as yup.MixedSchema<AssetNamesType>,
		label: yup
			.string()
			.required(),
	},).required(),
	isin: yup
		.object({
			value: yup
				.string()
				.matches(/^[A-Z]{2}[0-9A-Z]{10}$/, 'Invalid ISIN format',)
				.nullable(),
			label: yup.string().nullable(),
		},)
		.nullable() as yup.Schema<IOptionType<string> | undefined>,
	productType: yup.object({
		value: yup
			.mixed<CryptoType | MetalType>()
			.oneOf([
				...Object.values(CryptoType,),
				...Object.values(MetalType,),
			],)
			.optional(),
		label: yup.string().optional(),
	},).optional()
		.nullable() as yup.Schema<IOptionType<CryptoType> | undefined>,
	currencyValue: yup
		.string()
		.optional(),
	security: yup
		.string()
		.optional(),
	assetMainId: yup
		.string()
		.optional(),
},)

export const validateAddAssetForm = async(values: AssetFormValues,): Promise<ValidationErrors> => {
	try {
		await addAssetSchema.validate(values, {
			abortEarly: false,
		},)

		return {
		}
	} catch (err) {
		const errors: ValidationErrors = {
		}

		if (err instanceof yup.ValidationError) {
			err.inner.forEach((error,) => {
				if (error.path) {
					errors[error.path] = error.message
				}
			},)
		}
		return errors
	}
}

