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
	projectTransactionOptions,
	realEstateOperationOptions,
} from '../../form-asset.constants'
import {
	maxLengthValidator,
	validateDate,
	requiredSelect,
	required,
} from '../../../../../../../../../../shared/utils/validators'
import {
	requiredNumericWithDecimal,
} from '../../form-asset.validate'
import {
	composeValidators,
} from '../../../../../../../../../../shared/utils'
import {
	filteredCountries,
} from '../../../../../../../../../../shared/constants'

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

interface IRealEstateContentProps{
	transactionTypeId?: IOptionType<LinkedTransactionType>
	step?: number
}

export const RealEstateContent: React.FC<IRealEstateContentProps> = ({
	transactionTypeId,
	step,
},) => {
	const countriesArray = filteredCountries.map((name,) => {
		return {
			value: name,
			label: name,
		}
	},)
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
					initialValue={transactionTypeId && currency as IOptionType<CurrencyList>}
					isDisabled={Boolean(currency && transactionTypeId,)}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Date of investment</p>
				<CustomDatePickerField name='investmentDate' validate={validateDate} tabIndex={0} disableFuture={false}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Value on currency</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='currencyValue'
					placeholder='Enter value on currency'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Value in USD</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='usdValue'
					placeholder='Enter value in USD'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Market Value in FC</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='marketValueFC'
					placeholder='Enter market value in FC'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Project transaction</p>
				<SelectField
					validate={requiredSelect}
					name='projectTransaction'
					placeholder='Select project transaction'
					isMulti={false}
					options={projectTransactionOptions}
					isSearchable
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Country</p>
				<SelectField
					validate={requiredSelect}
					name='country'
					placeholder='Select country'
					isSearchable
					isMulti={false}
					options={countriesArray}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>City</p>
				<FormField
					validate={composeValidators(required, maxLengthValidator(50,),)}
					name='city'
					placeholder='Enter city'
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Operation</p>
				<SelectField
					name='operation'
					placeholder='Select operation (optional)'
					isMulti={false}
					options={realEstateOperationOptions}
					isSearchable
					tabIndex={0}
					isClearable
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