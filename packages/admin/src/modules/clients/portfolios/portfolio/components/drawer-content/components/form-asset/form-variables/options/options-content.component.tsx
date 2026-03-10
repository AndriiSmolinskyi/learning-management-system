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
	currencyOptions,
} from '../../form-asset.constants'
import {
	required,
	requiredSelect,
	maxLengthValidator,
	validateDate,
} from '../../../../../../../../../../shared/utils/validators'
import {
	requiredNumeric, requiredNumericWithDecimalAndNegative,
} from '../../form-asset.validate'
import {
	composeValidators,
} from '../../../../../../../../../../shared/utils'

import type {
	CurrencyList,
} from '../../../../../../../../../../shared/types'
import {
	useAddTransactionStore,
} from '../../../../../../../../../operations/transactions/add-transaction.store'
import type {
	IOptionType,
} from '../../../../../../../../../../shared/types'
import type {
	LinkedTransactionType,
} from '../../../../../../../../../operations/transactions'
import * as styles from '../../form-asset.styles'

interface IOptionsContentProps{
	transactionTypeId?: IOptionType<LinkedTransactionType>
	step?: number
}

export const OptionsContent: React.FC<IOptionsContentProps> = ({
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
				<p className={styles.fieldTitle}>Currency</p>
				<SelectField<CurrencyList>
					validate={requiredSelect}
					name='currency'
					placeholder='Select currency'
					isMulti={false}
					options={currencyOptions}
					isSearchable
					tabIndex={0}
					initialValue={(transactionTypeId && currency) as IOptionType<CurrencyList>}
					isDisabled={Boolean(currency && transactionTypeId,)}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Start date</p>
				<CustomDatePickerField name='startDate' validate={validateDate} tabIndex={0} disableFuture={false}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Maturity date</p>
				<CustomDatePickerField name='maturityDate' validate={validateDate} disableFuture={Boolean(false,)} tabIndex={0}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Currency pair or asset</p>
				<FormField
					validate={composeValidators(required, maxLengthValidator(50,),)}
					name='pairAssetCurrency'
					placeholder='Enter currency pair or asset'
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Principal value</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='principalValue'
					placeholder='Enter principal value'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Strike</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='strike'
					placeholder='Enter strike'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Premium</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='premium'
					placeholder='Enter premium'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Market value at open</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='marketOpenValue'
					placeholder='Enter market value at open'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Current market value</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='currentMarketValue'
					placeholder='Enter current market value'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Contracts</p>
				<FormField
					validate={requiredNumeric}
					name='contracts'
					placeholder='Enter contracts'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				{/* <p className={styles.fieldTitle}>Comment</p>
				<FormField
					name='comment'
					placeholder=' Enter comment (optional)'
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