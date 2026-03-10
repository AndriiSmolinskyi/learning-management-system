/* eslint-disable complexity */
import type {
	IProgressBarStep,
} from '../../../../../shared/types'
import type {
	IBankValidateValues,
} from '../components/drawer-content/components/form-bank'

const getBankName = (values: IBankValidateValues,): string => {
	return values.bankName ?
		values.bankName.value.name :
		'Fill in the bank’s name.'
}

const getBankLocation = (values: IBankValidateValues,): string => {
	return (values.branchName && values.country) ?
		`${values.country.label}(location), Branch name (${values.branchName})` :
		'Include bank details.'
}

const getPersonInfo = (values: IBankValidateValues,): string => {
	return values.firstName ?? values.lastName ?? values.email ?
		`${values.firstName ?
			values.firstName :
			''} ${values.lastName ?
			values.lastName :
			''} ${values.email ?
			values.email :
			''}` :
		`Provide the name and email of the contact person for this bank (optional).`
}

export const getBankFormSteps = (values: IBankValidateValues,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Bank name',
			labelDesc:  getBankName(values,),
		},
		{
			labelTitle: 'Bank details',
			labelDesc:  getBankLocation(values,),
		},
		{
			labelTitle: 'Contact person',
			labelDesc:  getPersonInfo(values,),
		},
	]
}
