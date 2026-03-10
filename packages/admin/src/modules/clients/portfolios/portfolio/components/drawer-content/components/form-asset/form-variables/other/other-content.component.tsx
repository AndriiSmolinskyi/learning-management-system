import * as React from 'react'
import {
	useForm,
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
} from '../../form-asset.constants'
import {
	requiredNumericWithDecimalAndNegative,
} from '../../form-asset.validate'
import {
	composeValidators,
} from '../../../../../../../../../../shared/utils'
import {
	required, requiredSelect, maxLengthValidator, validateDate,
} from '../../../../../../../../../../shared/utils/validators'
import {
	AddCustomField,
} from '../../../../../../../../../../shared/components/add-custom-field/add-custom-field.component'
import {
	useCreateServiceProvidersListItem,
	useGetServiceProvidersList,
} from '../../../../../../../../../../shared/hooks'
import {
	CreatebleSelectEnum,
} from '../../../../../../../../../../shared/constants'

import type {
	CurrencyList,
} from '../../../../../../../../../../shared/types'
import type {
	OtherFormValues,
} from '../../../../../../../portfolio-details/components/asset'
import type {
	CustomField,
} from '../../../../../../../portfolio-details/components/asset'
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

type Props = {
	transformedValues?: OtherFormValues,
	transactionTypeId?: IOptionType<LinkedTransactionType>
	onChange?: (values: Array<CustomField>) => void
	step?: number
}

export const OtherInvestmentsContent: React.FC<Props> = ({
	transformedValues,
	transactionTypeId,
	onChange,
	step,
},) => {
	const {
		data,
	} = useGetServiceProvidersList()
	const {
		mutateAsync: addServiceProviderItem,
		isPending: serviceAddLoading,
	} = useCreateServiceProvidersListItem()
	const handleCreateServiceProvider = async(name : string,): Promise<void> => {
		await addServiceProviderItem({
			name,
		},)
	}
	const serviceProviderOptions = data?.map((option,) => {
		return {
			value: option.name,
			label: option.name,
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
				<p className={styles.fieldTitle}>Asset name</p>
				<FormField
					validate={composeValidators(required, maxLengthValidator(50,),)}
					name='investmentAssetName'
					placeholder='Enter asset name'
					tabIndex={0}
				/>
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
				<p className={styles.fieldTitle}>Date of Investment</p>
				<CustomDatePickerField name='investmentDate' validate={validateDate} disableFuture={false}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Value FC</p>
				<FormField
					validate={requiredNumericWithDecimalAndNegative}
					name='currencyValue'
					placeholder='Enter value in currency'
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
					placeholder='Enter value in USD'
					isNumber={true}
					tabIndex={0}
					isNegative={true}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Service provider</p>
				<SelectField
					validate={requiredSelect}
					name='serviceProvider'
					placeholder='Select service provider'
					isMulti={false}
					options={serviceProviderOptions ?? []}
					isCreateble
					isSearchable
					createbleStatus={CreatebleSelectEnum.SERVICE_PROVIDERS}
					tabIndex={0}
					createFn={handleCreateServiceProvider}
					isLoading={serviceAddLoading}
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
			<AddCustomField
				initialValues={transformedValues?.customFields}
				onChange={onChange}
				tabIndex={0}
			/>
		</div>
	)
}