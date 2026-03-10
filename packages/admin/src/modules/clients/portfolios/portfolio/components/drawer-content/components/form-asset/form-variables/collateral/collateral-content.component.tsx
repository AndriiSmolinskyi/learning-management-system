import * as React from 'react'

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
} from '../../form-asset.constants'
import {
	required,
	requiredSelect,
	validateDate,
} from '../../../../../../../../../../shared/utils/validators'
import {
	requiredNumericWithDecimal,
} from '../../form-asset.validate'
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

interface ICollateralContentProps{
	transactionTypeId?: IOptionType<LinkedTransactionType>
	step?: number
}

export const CollateralContent: React.FC<ICollateralContentProps> = ({
	transactionTypeId,
	step,
},) => {
	const {
		currency,
	} = useAddTransactionStore()
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
				<p className={styles.fieldTitle}>Start date</p>
				<CustomDatePickerField name='startDate' validate={validateDate} tabIndex={0} disableFuture={false}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>End date</p>
				<CustomDatePickerField name='endDate' validate={validateDate} disableFuture={Boolean(false,)} tabIndex={0}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Amount in Currency</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='currencyValue'
					placeholder='Enter amount in vurrency'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Amount in USD</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='usdValue'
					placeholder='Enter amount in USD'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Credit provider</p>
				<FormField
					validate={required}
					name='creditProvider'
					placeholder=' Enter credit provider'
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Credit amount</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='creditAmount'
					placeholder=' Enter credit amount'
					isNumber={true}
					tabIndex={0}
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