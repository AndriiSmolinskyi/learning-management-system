import * as React from 'react'

import {
	FormField,
} from '../../../../../../../../shared/components'
import {
	useAddPortfolioStore,
} from '../../../../store/step.store'
import type {
	IAccountValidateValues,
} from './form-account.types'
import {
	StepProgressBar,
} from '../step-progress-bar/step-progress-bar.component'
import {
	getAccountFormSteps,
} from '../../../../utils/get-account-step-value.util'
import {
	validateFee,
	validateIBAN,
} from './form-account.validate'
import {
	CustomDatePickerField,
} from '../../../../../../../../shared/components/datepicker-mui/datepicker.component'
import {
	maxLengthValidator,
	required,
	alphanumericValidator,
} from '../../../../../../../../shared/utils/validators'
import {
	composeValidators,
} from '../../../../../../../../shared/utils'
import {
	optionalNumeric,
} from '../form-asset'

import * as styles from './form-account.styles'

interface IFormAccountProps {
	values: IAccountValidateValues
}
export const FormAccount: React.FC<IFormAccountProps> = ({
	values,
},) => {
	const {
		subStep,
	} = useAddPortfolioStore()
	const steps = getAccountFormSteps(values,)
	return (
		<div>
			<StepProgressBar currentStep={subStep} steps={steps}/>
			{subStep === 1 && <div className={styles.formBankWrapper}>
				<FormField
					validate={composeValidators(required, maxLengthValidator(50,),alphanumericValidator,)}
					name='accountName'
					placeholder='Enter account name'
				/>
			</div>}
			{subStep === 2 && <div className={styles.formBankWrapper}>
				<div>
					<p className={styles.fieldTitle}>Portfolio Management fee %</p>
					<FormField
						validate={validateFee}
						name='managementFee'
						placeholder='Enter percentage'
					/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Account Hold fee %</p>
					<FormField
						validate={validateFee}
						name='holdFee'
						placeholder='Enter percentage'
					/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Sell fee %</p>
					<FormField
						validate={validateFee}
						name='sellFee'
						placeholder='Enter percentage'
					/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Buy fee %</p>
					<FormField
						validate={validateFee}
						name='buyFee'
						placeholder='Enter percentage'
					/>
				</div>
			</div>}
			{subStep === 3 && <div className={styles.formBankWrapper}>
				<div>
					<p className={styles.fieldTitle}>Description</p>
					<FormField
						name='description'
						placeholder='Enter account description'
					/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Date created</p>
					<CustomDatePickerField	name='dataCreated' />
				</div>
				<div>
					<p className={styles.fieldTitle}>IBAN</p>
					<FormField
						validate={validateIBAN}
						name='iban'
						placeholder='IBAN'
					/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Account number</p>
					<FormField
						validate={composeValidators(maxLengthValidator(50,),optionalNumeric,)}
						name='accountNumber'
						placeholder='Enter account number'
					/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Comment</p>
					<FormField
						name='comment'
						placeholder='Enter comment'
					/>
				</div>
			</div>}
		</div>
	)
}