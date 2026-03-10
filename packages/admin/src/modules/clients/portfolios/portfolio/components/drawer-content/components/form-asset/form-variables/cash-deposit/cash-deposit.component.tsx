import * as React from 'react'
import {
	useForm, useFormState,
} from 'react-final-form'

import {
	CustomDatePickerField,
} from '../../../../../../../../../../shared/components/datepicker-mui/datepicker.component'
import {
	FormField,
	FormTextArea,
	SelectField,
} from '../../../../../../../../../../shared/components'
import {
	currencyOptions,
	policyOptions,
} from '../../form-asset.constants'
import {
	validateDate,
	requiredSelect,
} from '../../../../../../../../../../shared/utils/validators'
import {
	requiredNumericWithDecimal, requiredNumericWithDecimalAndNegative,
} from '../../form-asset.validate'
import {
	useAddTransactionStore,
} from '../../../../../../../../../operations/transactions/add-transaction.store'

import type {
	LinkedTransactionType,
} from '../../../../../../../../../operations/transactions'
import type {
	IOptionType,
} from '../../../../../../../../../../shared/types'
import type {
	CurrencyList,
} from '../../../../../../../../../../shared/types'
import type {
	ICashDepositFormValues,
} from './cash-deposit.types'
import {
	composeValidators,
} from '../../../../../../../../../../shared/utils'

import * as styles from '../../form-asset.styles'

interface IDepositContentProps{
	transactionTypeId?: IOptionType<LinkedTransactionType>
	isEditing?: boolean
	step?: number
}

export const CashDepositContent: React.FC<IDepositContentProps> = ({
	transactionTypeId,
	isEditing,
	step,
},) => {
	const {
		currency,
	} = useAddTransactionStore()
	const {
		values,
	} = useFormState()
	const form = useForm()

	React.useEffect(() => {
		if (step === 1) {
			Object.keys(form.getState().touched ?? {
			},).forEach((fieldName,) => {
				form.resetFieldState(fieldName,)
			},)
		}
	}, [step,],)
	React.useEffect(() => {
		if (values['policy']?.value === 'Daily') {
			form.change('maturityDate', undefined,)
		}
	}, [values['policy']?.value,],)

	const conditionalValidateDate = (value: string | undefined, allValues: ICashDepositFormValues,): string | undefined => {
		if (allValues.policy?.value === 'Daily') {
			return undefined
		}
		return validateDate(value,)
	}

	const conditionalCurrencyValueValidator = (
		value: string | undefined,
		allValues: ICashDepositFormValues,
	): string | undefined => {
		const numericValue = parseFloat(value ?? '',)

		const isDailyPolicy = allValues.policy?.value === 'Daily'
		if (isEditing && isDailyPolicy && numericValue === 0) {
			return undefined
		}
		if (!value) {
			return 'Currency value required'
		}
		return composeValidators(requiredNumericWithDecimal,)(value, allValues,)
	}

	React.useEffect(() => {
		if (values['maturityDate'] && new Date(values['maturityDate'],) > new Date()) {
			form.change('toBeMatured', true,)
		} else {
			form.change('toBeMatured', false,)
		}
	}, [values['maturityDate'],values['policy'],],)
	return (
		<div className={styles.formBankWrapper}>
			<div>
				<p className={styles.fieldTitle}>Currency</p>
				<SelectField<CurrencyList>
					validate={requiredSelect}
					name='currency'
					placeholder='Select currency'
					isMulti={false}
					options={currencyOptions}
					isSearchable
					tabIndex={0}
					initialValue={transactionTypeId && currency as IOptionType<CurrencyList>}
					isDisabled={Boolean(currency && transactionTypeId,)}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Interest %</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='interest'
					placeholder='Enter interest'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Value on Currency</p>
				<FormField
					validate={conditionalCurrencyValueValidator}
					name='currencyValue'
					placeholder='Enter value on currency'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Start date</p>
				<CustomDatePickerField
					name='startDate'
					validate={validateDate} tabIndex={0}
					disableFuture={false}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Policy</p>
				<SelectField
					validate={requiredSelect}
					name='policy'
					placeholder='Select policy'
					isMulti={false}
					options={policyOptions}
					isSearchable
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Maturity date</p>
				<CustomDatePickerField
					name='maturityDate'
					disableFuture={Boolean(false,)}
					disabled={values['policy']?.value === 'Daily'}
					validate={conditionalValidateDate}
					tabIndex={0}
				/>
			</div>
			<div>
				<FormTextArea
					name='comment'
					label='Comment (optional)'
					placeholder='Enter comment (optional)'
					tabIndex={0}
				/>
			</div>
		</div>
	)
}
