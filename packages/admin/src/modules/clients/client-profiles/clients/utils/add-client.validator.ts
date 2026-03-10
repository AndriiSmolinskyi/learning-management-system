import * as yup from 'yup'
import type {
	ValidationErrors,
} from 'final-form'
import {
	MAX_EMAIL_LENGTH, MAX_INPUT_LENGTH,
} from '../clients.constants'
import type {
	ClientFormValuesWithoutUser,
} from '../clients.types'

const addClientSchema: yup.ObjectSchema<ClientFormValuesWithoutUser> = yup.object({
	firstName:      yup
		.string()
		.trim()
		.min(2,)
		.max(MAX_INPUT_LENGTH,)
		.matches(/^[A-Za-zА-Яа-яЁёІіЄєҐґ ]*$/,)
		.required('First name is required',),
	lastName:       yup
		.string()
		.trim()
		.min(2,)
		.max(MAX_INPUT_LENGTH,)
		.matches(/^[A-Za-zА-Яа-яЁёІіЄєҐґ ]*$/,)
		.required('Last name is required',),
	residence:      yup
		.string()
		.max(MAX_INPUT_LENGTH,)
		.required('Residence is required',),
	country:        yup
		.string()
		.max(MAX_INPUT_LENGTH,)
		.required('Country is required',),
	region:         yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.matches(/^[A-Za-zА-Яа-яЁёІіЄєҐґ\s-]+$/,)
		.required('Region is required',),
	city:           yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.matches(/^[A-Za-zА-Яа-яЁёІіЄєҐґ\s-]+$/,)
		.required('City is required',),
	documents: yup.object({
		label: yup.string().trim(),
		value: yup.string().trim(),
	},),
	files:           yup
		.array(),
	streetAddress:  yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.matches(/^[A-Za-zА-Яа-яЁёІіЄєҐґ0-9\s\-#]+$/,)
		.required('Street address is required',),
	buildingNumber: yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,)
		.required('Building number is required',),
	postalCode:     yup
		.string()
		.trim()
		.matches(/^\d+$/,)
		.max(MAX_INPUT_LENGTH,)
		.required('Postal code is required',),
	contact:			 yup
		.string()
		.trim()
		.max(MAX_INPUT_LENGTH,),
	email:          yup
		.string()
		.email('Email is invalid',)
		.max(MAX_EMAIL_LENGTH,),
	comment: yup
		.string()
		.default('',),
},)

export const validateAddClientForm = async(values: ClientFormValuesWithoutUser,): Promise<ValidationErrors> => {
	try {
		await addClientSchema.validate(values, {
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

