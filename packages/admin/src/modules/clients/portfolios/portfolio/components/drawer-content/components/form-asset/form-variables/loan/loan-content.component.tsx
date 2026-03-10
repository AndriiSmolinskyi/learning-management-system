import * as React from 'react'
import {
	useForm,
} from 'react-final-form'

import {
	FormField,
	FormTextArea,
	SelectField,
} from '../../../../../../../../../../shared/components'
import {
	CustomDatePickerField,
} from '../../../../../../../../../../shared/components/datepicker-mui/datepicker.component'
import {
	required,
	requiredSelect,
	validateDate,
} from '../../../../../../../../../../shared/utils/validators'
import {
	requiredNumericWithDecimalAndNegative,
} from '../../form-asset.validate'
import {
	currencyOptions,
} from '../../form-asset.constants'
import {
	useAddTransactionStore,
} from '../../../../../../../../../operations/transactions/add-transaction.store'

import type {
	IOptionType,
} from '../../../../../../../../../../shared/types'
import type {
	LinkedTransactionType,
} from '../../../../../../../../../operations/transactions'
import type {
	CurrencyList,
} from '../../../../../../../../../../shared/types'

import * as styles from '../../form-asset.styles'

interface ILoanContentProps{
	transactionTypeId?: IOptionType<LinkedTransactionType>
	step?: number
}

export const LoanContent: React.FC<ILoanContentProps> = ({
	transactionTypeId,
	step,
},) => {
	const {
		currency,
	} = useAddTransactionStore()
	const form = useForm()
	React.useEffect(() => {
		if (step === 1) {
			Object.keys(form.getState().touched ?? {
			},).forEach((fieldName,) => {
				form.resetFieldState(fieldName,)
			},)
		}
	}, [step,],)

	return (
		<div className={styles.formBankWrapper}>
			<div>
				<p className={styles.fieldTitle}>Loan name</p>
				<FormField
					validate={required}
					name='loanName'
					placeholder='Enter loan name'
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Start date</p>
				<CustomDatePickerField	name='startDate' validate={validateDate} tabIndex={0} disableFuture={false}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Maturity date</p>
				<CustomDatePickerField	name='maturityDate' validate={validateDate} disableFuture={Boolean(false,)} tabIndex={0}/>
			</div>
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
				<p className={styles.fieldTitle}>Value on Currency</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='currencyValue'
					placeholder='Enter value on currency'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Value in USD</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='usdValue'
					placeholder='Select value in USD'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
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
				<p className={styles.fieldTitle}>Interest today %</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='todayInterest'
					placeholder='Enter today interest'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Interest to maturity %</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='maturityInterest'
					placeholder='Enter maturity interest'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				{/* <p className={styles.fieldTitle}>Comment (optional)</p>
				<FormField
					name='comment'
					placeholder='Enter comment (optional)'
					tabIndex={0}
				/> */}
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