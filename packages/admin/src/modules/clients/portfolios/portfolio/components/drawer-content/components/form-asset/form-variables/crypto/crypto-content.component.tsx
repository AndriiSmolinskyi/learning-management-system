
import * as React from 'react'
import {
	useForm,
} from 'react-final-form'
import {
	CustomDatePickerField,
} from '../../../../../../../../../../shared/components/datepicker-mui/datepicker.component'
import {
	FormField, FormTextArea, SelectField,
} from '../../../../../../../../../../shared/components'
import {
	maxLengthValidator,
	required,
	requiredSelect,
	validateDate,
} from '../../../../../../../../../../shared/utils/validators'
import {
	composeValidators,
} from '../../../../../../../../../../shared/utils'
import {
	requiredNumericWithDecimal,
} from '../../form-asset.validate'
import {
	cryptoCurrencyOptions,
	cryptoProductTypeOptions,
} from '../../form-asset.constants'
import {
	CryptoType,
} from '../../../../../../../../../../shared/types'
import type {
	CryptoList,
	IOptionType,
} from '../../../../../../../../../../shared/types'
import {
	EquityContent,
} from '../equity'
import type {
	AssetFormValues,
	StepType,
} from '../../../../../../../portfolio-details/components/asset'
import type {
	LinkedTransactionType,
} from '../../../../../../../../../operations/transactions'
import * as styles from '../../form-asset.styles'

interface ICryptoContentProps {
	accountId: string
	step?: StepType
	security?: string
	transactionTypeId?: IOptionType<LinkedTransactionType>
	isinTranscationValue?: string
	bankFee?: string
	amountTransactionValue?: string
	isEditing?: boolean
	handleSecurityState?: (isFetching: boolean)=>void
	values?: AssetFormValues
}

export const CryptoContent: React.FC<ICryptoContentProps> = ({
	step,
	security,
	transactionTypeId,
	isinTranscationValue,
	bankFee,
	amountTransactionValue,
	accountId,
	handleSecurityState,
	isEditing,
	values,
},) => {
	const [cryptoType, setCryptoType,] = React.useState<IOptionType<CryptoType> | undefined>(values?.productType as IOptionType<CryptoType> | undefined,)
	const form = useForm()
	const handleCryptoTypeChange = (option: IOptionType<CryptoType> | undefined,): void => {
		setCryptoType(option,)
		form.reset({
			assetName:   values?.assetName,
			productType: option,
		},)
	}
	React.useEffect(() => {
		if (step === 1) {
			setCryptoType(undefined,)
		}
	}, [step,],)
	return (
		<div className={styles.formBankWrapper}>
			<div>
				<p className={styles.fieldTitle}>Product Type</p>
				<SelectField<CryptoType>
					validate={requiredSelect}
					name='productType'
					placeholder='Select product type'
					isMulti={false}
					options={cryptoProductTypeOptions}
					isSearchable
					tabIndex={0}
					isDisabled={isEditing}
					value={cryptoProductTypeOptions.find((option,) => {
						return option.value === cryptoType?.value
					},) ?? undefined}
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							handleCryptoTypeChange((select as IOptionType<CryptoType>),)
						}
					}}
				/>
			</div>
			{cryptoType?.value === CryptoType.ETF && (
				<>
					<EquityContent
						defaultSecurity={security}
						step={step}
						transactionTypeId={transactionTypeId}
						isinTranscationValue={isinTranscationValue}
						bankFee={bankFee}
						amountTransactionValue={amountTransactionValue}
						accountId={accountId}
						isEditing={isEditing}
						handleSecurityState={handleSecurityState}
						isCryptoETF
						assetValues={values}
					/>
				</>
			)}
			{cryptoType?.value === CryptoType.DIRECT_HOLD && (
				<>
					<div>
						<p className={styles.fieldTitle}>Crypto Currency type</p>
						<SelectField<CryptoList>
							validate={requiredSelect}
							name='cryptoCurrencyType'
							placeholder='Select crypto currency'
							isMulti={false}
							options={cryptoCurrencyOptions}
							isSearchable
							tabIndex={0}
						/>
					</div>
					<div>
						<p className={styles.fieldTitle}>Amount in Crypto</p>
						<FormField
							validate={requiredNumericWithDecimal}
							name='cryptoAmount'
							placeholder='Enter amount in crypto'
							isNumber={true}
							tabIndex={0}
						/>
					</div>
					<div>
						<p className={styles.fieldTitle}>Exchange / Wallet</p>
						<FormField
							validate={composeValidators(required, maxLengthValidator(50,),)}
							name='exchangeWallet'
							placeholder=' Enter exchange / wallet'
							tabIndex={0}
						/>
					</div>
					<div>
						<p className={styles.fieldTitle}>Date of purchase</p>
						<CustomDatePickerField name='purchaseDate' validate={validateDate} tabIndex={0} disableFuture={false} />
					</div>
					<div>
						<p className={styles.fieldTitle}>Purchase price</p>
						<FormField
							validate={requiredNumericWithDecimal}
							name='purchasePrice'
							placeholder='Purchase price amount in USD'
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
				</>
			)}
		</div>
	)
}