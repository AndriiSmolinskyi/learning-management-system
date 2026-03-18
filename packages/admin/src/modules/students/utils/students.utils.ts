import type {
	IStudentFormValues,
} from '../students.types'
import type {
	IProgressBarStep,
} from '../../../shared/types'

const getStudentNameStep = (values: IStudentFormValues,): string => {
	const firstName = values.firstName.trim()
	const lastName = values.lastName.trim()

	if (!firstName || !lastName) {
		return 'Enter first name and last name.'
	}

	return `${firstName} ${lastName}`
}

const getStudentEmailStep = (values: IStudentFormValues,): string => {
	const email = values.email.trim()

	if (!email) {
		return 'Enter student email.'
	}

	return email
}

const getStudentPhoneStep = (values: IStudentFormValues,): string => {
	const phoneNumber = values.phoneNumber?.trim()

	if (!phoneNumber) {
		return 'Add phone number if needed.'
	}

	return phoneNumber
}

const getStudentAdditionalStep = (values: IStudentFormValues,): string => {
	const items = [
		values.country?.trim(),
		values.city?.trim(),
	].filter(Boolean,)

	if (items.length === 0) {
		return 'Add country and city if needed.'
	}

	return items.join(', ',)
}

export const getStudentFormSteps = (
	values: IStudentFormValues,
): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Name',
			labelDesc:  getStudentNameStep(values,),
		},
		{
			labelTitle: 'Email',
			labelDesc:  getStudentEmailStep(values,),
		},
		{
			labelTitle: 'Phone number',
			labelDesc:  getStudentPhoneStep(values,),
		},
		{
			labelTitle: 'Additional info',
			labelDesc:  getStudentAdditionalStep(values,),
		},
	]
}