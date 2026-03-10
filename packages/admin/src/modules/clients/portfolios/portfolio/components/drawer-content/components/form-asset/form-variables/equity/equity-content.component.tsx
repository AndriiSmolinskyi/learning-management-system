/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable max-depth */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import * as React from 'react'
import {
	useForm,
	useFormState,
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
	equityTypeOptions,
	equityOperationOptions,
} from '../../form-asset.constants'
import {
	validateDate,
	requiredSelect,
	required,
} from '../../../../../../../../../../shared/utils/validators'
import {
	notZero,
	requiredNumericWithDecimal,
} from '../../form-asset.validate'
import {
	useGetAssetTotalUnits,
	useGetEquityStocksIsins,
	useGetEquityStocksSecurityByIsin,
} from '../../../../../../../../../../shared/hooks'
import {
	IsinType,

	AssetOperationType,
	AssetNamesType,
} from '../../../../../../../../../../shared/types'
import {
	useCreateIsin,
} from '../../../../../../../../../../shared/hooks'
import {
	CreatebleSelectEnum,
} from '../../../../../../../../../../shared/constants'
import type {
	CurrencyList,
	IOptionType,
	SelectValueType,
	TAssetGetTotalUnits,
} from '../../../../../../../../../../shared/types'
import type {
	AssetFormValues,
	StepType,
} from '../../../../../../../portfolio-details/components/asset'
import type {
	LinkedTransactionType,
} from '../../../../../../../../../operations/transactions'
import {
	calculateAmountTextEquity,
} from '../../form-asset.validate'
import {
	composeValidators, localeString,
} from '../../../../../../../../../../shared/utils'
import {
	useAddTransactionStore,
} from '../../../../../../../../../operations/transactions/add-transaction.store'

import * as styles from '../../form-asset.styles'

interface IEquityContentProps{
	step?: StepType
	defaultSecurity?: string
	transactionTypeId?: IOptionType<LinkedTransactionType>
	isinTranscationValue?: string
	bankFee?: string
	amountTransactionValue?: string
	accountId: string
	isEditing?: boolean
	handleSecurityState?: (isFetching: boolean)=>void
	isCryptoETF?: boolean
	isMetalETF?: boolean
	assetValues?: AssetFormValues
}

export const EquityContent: React.FC<IEquityContentProps> = ({
	step,
	defaultSecurity,
	transactionTypeId,
	isinTranscationValue,
	bankFee,
	amountTransactionValue,
	accountId,
	handleSecurityState,
	isEditing,
	isCryptoETF,
	isMetalETF,
	assetValues,
},) => {
	const [isinValue, setIsinValue,] = React.useState<string | null>(null,)
	const [currencyValue, setCurrencyValue,] = React.useState<CurrencyList | undefined>(undefined,)
	const [initialUnits, setInitialUnits,] = React.useState<number>(0,)
	const [isinInitialValue, setIsinInitialValue,] = React.useState<IOptionType<string> | null>(null,)
	const [initialOperation, setInitialOperation,] = React.useState<IOptionType<AssetOperationType> | undefined>(undefined,)
	const [operation, setOperation,] = React.useState <IOptionType<AssetOperationType> | undefined>(undefined,)
	const [amountText, setAmountText,] = React.useState<string | undefined>('',)
	const [isAmountValid, setIsAmountValid,] = React.useState<boolean>(false,)
	const [isUnitAmountValid, setIsUnitAmountValid,] = React.useState<boolean | undefined>(undefined,)

	const {
		mutateAsync: createIsin,
		isPending: isinAddLoading,
	} = useCreateIsin(IsinType.EQUITY,)
	const {
		values,
	} = useFormState()
	const form = useForm()
	const shouldFetch =
  Boolean(isinValue && currencyValue,) ||
  Boolean(values['currency']?.value && values['isin']?.value,)
	const totaInitial: TAssetGetTotalUnits | undefined = shouldFetch ?
		{
			accountId,
			isin:      isinValue ?? values['isin']?.value,
			currency:  currencyValue ?? values['currency']?.value,
			assetName: isCryptoETF ?
				AssetNamesType.CRYPTO :
				isMetalETF ?
					AssetNamesType.METALS :
					AssetNamesType.EQUITY_ASSET,
		} :
		undefined
	const {
		data: unitsData,
	} = useGetAssetTotalUnits(shouldFetch ?
		totaInitial :
		undefined,)
	const handleIsinChange = (selectedOption: SelectValueType,): void => {
		const {
			value,
		} = selectedOption as IOptionType
		setIsinValue(value,)
	}
	const {
		data,
	} = useGetEquityStocksIsins(currencyValue ?? values['currency']?.value,)
	const {
		data: security,
		isFetching: isSecurityFetching,
	} = useGetEquityStocksSecurityByIsin(isinValue ?? isinTranscationValue ?? values['isin']?.value ?? '',)

	React.useEffect(() => {
		if (isEditing) {
			setInitialUnits(Number(values['units'],),)
			setInitialOperation(values['operation'],)
		}
	}, [],)
	React.useEffect(() => {
		if (handleSecurityState) {
			handleSecurityState(isSecurityFetching,)
		}
	}, [isSecurityFetching,],)
	const isinOptions = Array.from(new Set(data,),).map((isin,) => {
		return {
			value: isin,
			label: isin,
		}
	},)
	const handleCreateIsin = async(isin : string,): Promise<void> => {
		if (currencyValue) {
			await createIsin({
				name:     isin,
				currency: currencyValue,
			},)
		}
	}

	React.useEffect(() => {
		if (step === 1) {
			setIsinValue(null,)
			setCurrencyValue(undefined,)
			form.resetFieldState('units',)
			form.resetFieldState('transactionPrice',)
			form.resetFieldState('bankFee',)
		}
	}, [step,],)

	React.useEffect(() => {
		if (transactionTypeId) {
			const {
				cashFlow,
			} = transactionTypeId.value
			if (cashFlow === 'Inflow') {
				setOperation({
					value: AssetOperationType.SELL,
					label:  AssetOperationType.SELL,
				},)
			} else if (cashFlow === 'Outflow') {
				setOperation({
					value: AssetOperationType.BUY,
					label:  AssetOperationType.BUY,
				},)
			}
		}
	}, [transactionTypeId,],)

	React.useEffect(() => {
		if (isinTranscationValue) {
			setIsinInitialValue({
				value: isinTranscationValue,
				label:  isinTranscationValue,
			},)
		}
	}, [isinTranscationValue,],)

	React.useEffect(() => {
		if (unitsData) {
			const {
				totalUnits,
			} = unitsData
			const totalAmount = parseFloat(values['units'],)
			if (isEditing && initialOperation?.value) {
				const calcOperation = values['operation']?.value ?
					initialOperation.value === AssetOperationType.BUY ?
						values['operation'].value === AssetOperationType.BUY ?
							totalUnits - initialUnits + totalAmount :
							totalUnits - initialUnits - totalAmount :
						values['operation'].value === AssetOperationType.BUY ?
							totalUnits + initialUnits + totalAmount :
							totalUnits + initialUnits - totalAmount :
					totalUnits
				if (calcOperation >= 0) {
					setIsUnitAmountValid(true,)
				} else {
					setIsUnitAmountValid(false,)
				}
			} else if (isEditing && values['operation'].value === AssetOperationType.BUY && totalAmount > totalUnits) {
				setIsUnitAmountValid(true,)
			} else if (totalAmount > totalUnits || totalUnits === 0) {
				setIsUnitAmountValid(false,)
			} else {
				setIsUnitAmountValid(true,)
			}
		}
	}, [values, unitsData,],)
	React.useEffect(() => {
		const selectedOperation = values['operation']?.value

		if (!isEditing && selectedOperation === AssetOperationType.SELL && isUnitAmountValid !== undefined && !isUnitAmountValid) {
			form.change('operation', undefined,)
		}
		if (isEditing && selectedOperation && isUnitAmountValid !== undefined && !isUnitAmountValid) {
			form.change('operation', undefined,)
		}
	}, [isUnitAmountValid, values['operation'],],)
	React.useEffect(() => {
		if (amountTransactionValue) {
			const text = calculateAmountTextEquity(values['units'], values['transactionPrice'], amountTransactionValue,)
			setAmountText(text,)

			const totalAmount = parseFloat(values['units'],) * parseFloat(values['transactionPrice'],)
			const cleanedAmount = parseFloat(amountTransactionValue.replace(/,/g, '',),)

			const result = Math.abs(totalAmount - cleanedAmount,)
			if (result > 2000) {
				setIsAmountValid(true,)
			} else {
				setIsAmountValid(false,)
			}
		}
	}, [values,],)

	const {
		currency,
	} = useAddTransactionStore()
	const isEditedSellBlockedInBuy = isEditing && initialOperation?.value === AssetOperationType.BUY && ((unitsData?.totalUnits ?? 0) - Number(values['units'],)) < Number(values['units'],)
	const isEditedSellBlockedInSell = isEditing && initialOperation?.value === AssetOperationType.SELL && ((unitsData?.totalUnits ?? 0) + initialUnits - Number(values['units'],)) < 0
	const isEditedBuyBlockedInBuy = isEditing && initialOperation?.value === AssetOperationType.BUY && ((unitsData?.totalUnits ?? 0) - initialUnits + Number(values['units'],)) < 0
	const isEditedBuyBlockedInSell = isEditing && initialOperation?.value === AssetOperationType.BUY && ((unitsData?.totalUnits ?? 0) - initialUnits - Number(values['units'],)) < 0

	const filteredOperations = equityOperationOptions.filter((option,) => {
		if (!isUnitAmountValid && (option.value === AssetOperationType.SELL && !isEditing)) {
			return false
		}
		if (isEditing && option.value === AssetOperationType.SELL && (isEditedSellBlockedInBuy || isEditedSellBlockedInSell || isEditedBuyBlockedInSell)) {
			return false
		}
		if (isEditing && option.value === AssetOperationType.BUY && isEditedBuyBlockedInBuy) {
			return false
		}
		return true
	},)
	const totalUnits = isEditing && initialOperation?.value ?
		unitsData?.totalUnits !== undefined && (values['operation'] ?
			values['units'] && !isNaN(parseFloat(values['units'],),) ?
				initialOperation.value === AssetOperationType.BUY ?
					values['operation'].value === AssetOperationType.BUY ?
						unitsData.totalUnits + parseFloat(values['units'],) - initialUnits :
						unitsData.totalUnits - parseFloat(values['units'],) - initialUnits :
					values['operation'].value === AssetOperationType.BUY ?
						unitsData.totalUnits + initialUnits + parseFloat(values['units'],) :
						unitsData.totalUnits + initialUnits - parseFloat(values['units'],) :
				unitsData.totalUnits :
			unitsData.totalUnits) :
		unitsData?.totalUnits !== undefined && (values['operation'] ?
			values['units'] && !isNaN(parseFloat(values['units'],),) ?
				values['operation'].value === AssetOperationType.BUY ?
					unitsData.totalUnits + parseFloat(values['units'],) :
					unitsData.totalUnits - parseFloat(values['units'],) :
				unitsData.totalUnits :
			unitsData.totalUnits)

	return (
		<div className={isCryptoETF ?? isMetalETF ?
			styles.formEquityInsideCrypto :
			styles.formBankWrapper}>
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
					isDisabled={Boolean(currency && transactionTypeId,) || isEditing}
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setCurrencyValue((select as IOptionType<CurrencyList>).value,)
							form.change('isin', undefined,)
							form.change('security', undefined,)
							form.resetFieldState('security',)
						}
					}}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Transaction date</p>
				<CustomDatePickerField name='transactionDate' validate={validateDate} tabIndex={0} disableFuture={false}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>ISIN</p>
				<SelectField
					validate={requiredSelect}
					name='isin'
					placeholder='Select ISIN'
					isMulti={false}
					options={isinOptions}
					onChange={handleIsinChange}
					isSearchable
					isCreateble
					createbleStatus={CreatebleSelectEnum.ISIN}
					createFn={handleCreateIsin}
					isLoading={isinAddLoading}
					tabIndex={0}
					initialValue={isinInitialValue ?? values['isin'] ?? undefined}
					isDisabled={(!currencyValue && !values['currency']) || isEditing}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Security</p>
				<FormField
					validate={required}
					name='security'
					placeholder='Select ISIN'
					initiaValue={(security ?
						String(security,) :
						defaultSecurity ?? '')}
					readOnly
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Units</p>
				<FormField
					validate={composeValidators(
						requiredNumericWithDecimal,
						notZero,
					)}
					name='units'
					placeholder='Enter units'
					isNumber={true}
					tabIndex={0}
				/>
				{amountText && <p className={styles.errorText(isAmountValid,)}>{amountText}</p>}
			</div>
			<div>
				<p className={styles.fieldTitle}>Transaction price</p>
				<FormField
					validate={composeValidators(
						requiredNumericWithDecimal,
					)}
					name='transactionPrice'
					placeholder='Enter transaction price'
					isNumber={true}
					tabIndex={0}
				/>
				{amountText && <p className={styles.errorText(isAmountValid,)}>{amountText}</p>}
			</div>
			<div>
				<p className={styles.fieldTitle}>Bank fee</p>
				<FormField
					validate={requiredNumericWithDecimal}
					name='bankFee'
					placeholder=' Enter bank fee'
					isNumber={true}
					tabIndex={0}
					initiaValue={bankFee?.replace(/,/g, '',)}
				/>
			</div>
			{!isCryptoETF && !isMetalETF && <div>
				<p className={styles.fieldTitle}>Equity type</p>
				<SelectField
					validate={requiredSelect}
					name='equityType'
					placeholder='Select equity type'
					isMulti={false}
					options={equityTypeOptions}
					isSearchable
					tabIndex={0}
				/>
			</div>}
			<div>
				<p className={styles.fieldTitle}>Operation</p>
				<SelectField<AssetOperationType>
					validate={requiredSelect}
					name='operation'
					placeholder='Select operation'
					isMulti={false}
					options={filteredOperations}
					isSearchable
					tabIndex={0}
					initialValue={operation ?? undefined}
				/>
				{totalUnits !== false && !Boolean(assetValues?.assetMainId,) && <p className={styles.errorText(false,)}>
						Total units: {localeString(totalUnits, '', 0, false,)}
				</p>}
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