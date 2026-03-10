import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'

export interface IOrderDetailsFormValues {
	security: string;
	isin: { value: string; label: string} | undefined;
	units: number | string;
	priceType: { value: string; label: string } | undefined;
	price: number | string;
	currency: { value: string; label: string } | undefined;
	unitExecuted?: number | string | undefined | null
	priceExecuted?: number | string | undefined | null
	yield?: number | string | undefined | null
	id?: string
}

const orderDetailsSchema: yup.ObjectSchema<IOrderDetailsFormValues> = yup.object({
	security: yup.string().required('Security is required',),
	isin:     yup
		.object({
			value: yup.string().required('ISIN value is required',),
			label: yup.string().required('ISIN label is required',),
		},)
		.required('ISIN is required',),
	units: yup
		.number()
		.required('Units are required',)
		.min(0, 'Units must be at least 1',),
	priceType: yup
		.object({
			value: yup.string().required('Price type value is required',),
			label: yup.string().required('Price type label is required',),
		},)
		.required('Currency is required',),
	price: yup
		.number()
		.required('Price is required',)
		.min(0, 'Price must be a positive number',),
	currency: yup
		.object({
			value: yup.string().required('Currency value is required',),
			label: yup.string().required('Currency label is required',),
		},)
		.required('Currency is required',),
	unitExecuted:  yup.number().transform((v, ov,) => {
		return (ov === '' ?
			undefined :
			v)
	},)
		.notRequired()
		.nullable(),
	priceExecuted: yup.number().transform((v, ov,) => {
		return (ov === '' ?
			undefined :
			v)
	},)
		.notRequired()
		.nullable(),
	yield: yup.number().transform((v, ov,) => {
		return (ov === '' ?
			undefined :
			v)
	},)
		.notRequired()
		.nullable(),
	id:
		yup.string()
			.optional(),

},)

export const validateOrderDetailsForm = async(
	values: IOrderDetailsFormValues,
): Promise<ValidationErrors> => {
	try {
		await orderDetailsSchema.validate(values, {
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
