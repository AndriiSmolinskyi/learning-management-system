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
	privateEquitySizeOptions,
	privateEquityTypeOptions,
	privateEquityStatusVariables,
} from '../../form-asset.constants'
import {
	maxLengthValidator,
	required, requiredSelect, validateDate,
} from '../../../../../../../../../../shared/utils/validators'
import {
	requiredNumericWithDecimal,
	optionalNumericWithDecimal,
} from '../../form-asset.validate'
import {
	composeValidators,
} from '../../../../../../../../../../shared/utils'
import {
	useCreateServiceProvidersListItem,
	useGetServiceProvidersList,
} from '../../../../../../../../../../shared/hooks/list-hub'
import {
	CreatebleSelectEnum,
} from '../../../../../../../../../../shared/constants'
import type {
	CurrencyList,
	PrivateEquityStatusEnum,
	IOptionType,
} from '../../../../../../../../../../shared/types'
import type {
	LinkedTransactionType,
} from '../../../../../../../../../operations/transactions'
import {
	useAddTransactionStore,
} from '../../../../../../../../../operations/transactions/add-transaction.store'
import * as styles from '../../form-asset.styles'

interface IPEContentProps{
	transactionTypeId?: IOptionType<LinkedTransactionType>
	step?: number
}

export const PrivateEquityContent: React.FC<IPEContentProps> = ({
	transactionTypeId,
	step,
},) => {
	const {
		data,
	} = useGetServiceProvidersList()
	const {
		currency,
	} = useAddTransactionStore()
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
				<p className={styles.fieldTitle}>Fund type</p>
				<SelectField
					validate={requiredSelect}
					name='fundType'
					placeholder='Select fund type'
					isMulti={false}
					options={privateEquityTypeOptions}
					isSearchable
					tabIndex={0}
					initialValue={transactionTypeId && currency as IOptionType<CurrencyList>}
					isDisabled={Boolean(currency && transactionTypeId,)}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Status</p>
				<SelectField<PrivateEquityStatusEnum>
					validate={requiredSelect}
					name='status'
					placeholder='Select status'
					isMulti={false}
					options={privateEquityStatusVariables}
					isSearchable
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
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Entry Date</p>
				<CustomDatePickerField name='entryDate' validate={validateDate} tabIndex={0} disableFuture={false}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Current value</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='currencyValue'
					placeholder='Enter current value'
					isNumber={true}
					tabIndex={0}
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
					isSearchable
					isCreateble
					createbleStatus={CreatebleSelectEnum.SERVICE_PROVIDERS}
					tabIndex={0}
					createFn={handleCreateServiceProvider}
					isLoading={serviceAddLoading}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Geography</p>
				<FormField
					validate={maxLengthValidator(50,)}
					name='geography'
					placeholder='Enter geography (optional)'
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Fund name</p>
				<FormField
					validate={composeValidators(required, maxLengthValidator(50,),)}
					name='fundName'
					placeholder='Enter fund name'
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Fund ID</p>
				<FormField
					validate={composeValidators(required, maxLengthValidator(50,),)}
					name='fundID'
					placeholder='Enter fund ID'
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Fund size</p>
				<SelectField
					name='fundSize'
					placeholder='Select fund size'
					isMulti={false}
					options={privateEquitySizeOptions}
					isSearchable
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>About fund</p>
				<FormField
					validate={composeValidators(required, maxLengthValidator(50,),)}
					name='aboutFund'
					placeholder='Enter about fund'
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Investment Period</p>
				<FormField
					validate={maxLengthValidator(50,)}
					name='investmentPeriod'
					placeholder='Enter investment period (optional)'
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Fund term date</p>
				<CustomDatePickerField name='fundTermDate' validate={validateDate} disableFuture={Boolean(false,)} tabIndex={0}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Capital called</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='capitalCalled'
					placeholder='Enter capital called'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Last date of valuation</p>
				<CustomDatePickerField name='lastValuationDate' validate={validateDate} tabIndex={0} disableFuture={false}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>MOIC</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='moic'
					placeholder='Enter MOIC'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>IRR</p>
				<FormField
					validate={optionalNumericWithDecimal}
					name='irr'
					placeholder='Enter IRR (optional)'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Liquidity</p>
				<FormField
					validate={optionalNumericWithDecimal}
					name='liquidity'
					placeholder='Enter liquidity (optional)'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Total Commitment</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='totalCommitment'
					placeholder='Enter total commitment'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>TVPI</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='tvpi'
					placeholder='Enter TVPI'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Management expenses</p>
				<FormField
					validate={optionalNumericWithDecimal}
					name='managementExpenses'
					placeholder='Enter management expenses (optional)'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Other expenses</p>
				<FormField
					validate={optionalNumericWithDecimal}
					name='otherExpenses'
					placeholder='Enter other expenses (optional)'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Carried interest</p>
				<FormField
					validate={optionalNumericWithDecimal}
					name='carriedInterest'
					placeholder='Enter carried interest (optional)'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Distributions</p>
				<FormField
					validate={optionalNumericWithDecimal}
					name='distributions'
					placeholder='Enter Distributions (optional)'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Entity of holding</p>
				<FormField
					validate={maxLengthValidator(50,)}
					name='holdingEntity'
					placeholder='Enter entity of holding (optional)'
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