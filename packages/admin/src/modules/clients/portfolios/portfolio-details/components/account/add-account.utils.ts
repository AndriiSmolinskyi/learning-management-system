import type {
	IProgressBarStep,
} from '../../../../../../shared/types'
import type {
	AccountFormValues,
} from './add-account.types'

const getAccountName = (values: AccountFormValues,): string => {
	return values.accountName ?
		values.accountName :
		'Fill in the bank account’s name.'
}

const getBankFees = (values: AccountFormValues,): string => {
	return (values.buyFee && values.holdFee && values.sellFee && values.managementFee) ?
		`${values.managementFee}% (portfolio management), ${values.holdFee}% (account hold), 
${values.sellFee}% (sell), ${values.buyFee}% (buy)` :
		'Enter the required fee percentages for managing the portfolio, account holding, and transactions.'
}

const getPersonInfo = (values: AccountFormValues,): string => {
	return values.description ?
		`${values.description ?
			values.description :
			''}` :
		`Include extra account details (optional).`
}

export const getAccountFormSteps = (values: AccountFormValues,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Account name',
			labelDesc:  getAccountName(values,),
		},
		{
			labelTitle: 'Bank fees',
			labelDesc:  getBankFees(values,),
		},
		{
			labelTitle: 'Additional account details',
			labelDesc:  getPersonInfo(values,),
		},
	]
}
