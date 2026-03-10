/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import * as React from 'react'
import {
	useForm, useFormState,
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
	metalOptions,
	equityOperationOptions,
	metalProductTypeOptions,
	currencyOptions,
} from '../../form-asset.constants'
import {
	validateDate,
	requiredSelect,
} from '../../../../../../../../../../shared/utils/validators'
import {
	notZero,
	requiredNumericWithDecimal,
} from '../../form-asset.validate'
import {
	AssetNamesType,
	AssetOperationType,

	MetalType,
} from '../../../../../../../../../../shared/types'
import type {
	MetalList,
	IOptionType,
	TAssetGetTotalUnits,
	CurrencyList,
} from '../../../../../../../../../../shared/types'
import type {
	LinkedTransactionType,
} from '../../../../../../../../../operations/transactions'
import {
	calculateAmountTextMetals,
} from '../../form-asset.validate'
import {
	composeValidators, localeString,
} from '../../../../../../../../../../shared/utils'
import {
	useGetAssetTotalUnits,
} from '../../../../../../../../../../shared/hooks'
import type {
	AssetFormValues,
	StepType,
} from '../../../../../../../portfolio-details/components/asset'

import * as styles from '../../form-asset.styles'
import {
	EquityContent,
} from '../equity'
import {
	useAddTransactionStore,
} from '../../../../../../../../../../modules/operations/transactions/add-transaction.store'

interface IMetalsContentProps{
	transactionTypeId?: IOptionType<LinkedTransactionType>
	amountTransactionValue?: string
	accountId: string
	step?: StepType
	isEditing?: boolean
	propValues?: AssetFormValues
	security?: string
	isinTranscationValue?: string
	bankFee?: string
	handleSecurityState?: (isFetching: boolean)=>void
	assetValues?: AssetFormValues
}

export const MetalsContent: React.FC<IMetalsContentProps> = ({
	transactionTypeId,
	amountTransactionValue,
	accountId,
	step,
	isEditing,
	propValues,
	security,
	isinTranscationValue,
	bankFee,
	handleSecurityState,
	assetValues,
},) => {
	const [operation, setOperation,] = React.useState <IOptionType<AssetOperationType> | undefined>(undefined,)
	const [totalUnits, setTotalUnits,] = React.useState <number | undefined>(undefined,)
	const [isUnitAmountValid, setIsUnitAmountValid,] = React.useState<boolean | undefined>(undefined,)
	const [initialOperation, setInitialOperation,] = React.useState<IOptionType<AssetOperationType> | undefined>(undefined,)
	const [metalTypeValue, setMetalTypeValue,] = React.useState<MetalList | undefined>(undefined,)
	const [currencyValue, setCurrencyValue,] = React.useState<CurrencyList | undefined>(undefined,)
	const [initialUnits, setInitialUnits,] = React.useState<number>(0,)
	const [amountText, setAmountText,] = React.useState<string | undefined>('',)
	const [isAmountValid, setIsAmountValid,] = React.useState<boolean>(false,)
	const [metalType, setMetalType,] = React.useState<IOptionType<MetalType> | undefined>(propValues?.productType as IOptionType<MetalType> | undefined,)

	const {
		currency,
	} = useAddTransactionStore()
	const {
		values,
	} = useFormState()
	const form = useForm()

	const shouldFetch = (Boolean(currencyValue,) || Boolean(values['currency']?.value,)) ||
	(Boolean(metalTypeValue,) || Boolean(values['metalType']?.value,))

	React.useEffect(() => {
		if (step === 1) {
			setTotalUnits(undefined,)
			setCurrencyValue(undefined,)
			setMetalTypeValue(undefined,)
		}
	}, [step,],)
	React.useEffect(() => {
		if (isEditing) {
			setInitialUnits(Number(values['units'],),)
			setInitialOperation(values['operation'],)
		}
	}, [],)
	React.useEffect(() => {
		if (step === 1) {
			Object.keys(form.getState().touched ?? {
			},).forEach((fieldName,) => {
				form.resetFieldState(fieldName,)
			},)
		}
	}, [step,],)
	const totaInitial: TAssetGetTotalUnits | undefined = shouldFetch && metalType?.value === MetalType.DIRECT_HOLD ?
		{
			accountId,
			currency:  currencyValue ?? values['currency']?.value,
			assetName: AssetNamesType.METALS,
			metalType: metalTypeValue ?? values['metalType']?.value,
		} :
		undefined

	const {
		data: unitsData,
	} = useGetAssetTotalUnits(shouldFetch ?
		totaInitial :
		undefined,)

	React.useEffect(() => {
		if (unitsData) {
			const {
				totalUnits,
			} = unitsData
			setTotalUnits(totalUnits,)
		}
	}, [unitsData,],)
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
		if (amountTransactionValue) {
			const text = calculateAmountTextMetals(values['units'], values['purchasePrice'], amountTransactionValue,)
			setAmountText(text,)

			const totalAmount = parseFloat(values['units'],) * parseFloat(values['purchasePrice'],)
			const cleanedAmount = parseFloat(amountTransactionValue.replace(/,/g, '',),)

			const result = Math.abs(totalAmount - cleanedAmount,)
			if (result > 2000) {
				setIsAmountValid(true,)
			} else {
				setIsAmountValid(false,)
			}
		}
	}, [values,],)

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

	const handleCryptoTypeChange = (option: IOptionType<MetalType> | undefined,): void => {
		setMetalType(option,)
		form.reset({
			assetName:   propValues?.assetName,
			productType: option,
		},)
	}

	return (
		<div className={styles.formBankWrapper}>
			<div>
				<p className={styles.fieldTitle}>Product Type</p>
				<SelectField<MetalType>
					validate={requiredSelect}
					name='productType'
					placeholder='Select product type'
					isMulti={false}
					options={metalProductTypeOptions}
					isSearchable
					tabIndex={0}
					isDisabled={isEditing}
					value={metalProductTypeOptions.find((option,) => {
						return option.value === metalType?.value
					},) ?? null}
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							handleCryptoTypeChange((select as IOptionType<MetalType>),)
						}
					}}
				/>
			</div>
			{metalType?.value === MetalType.ETF && (
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
						isMetalETF
						assetValues={assetValues}
					/>
				</>
			)}

			{metalType?.value === MetalType.DIRECT_HOLD && (<>
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
							}
						}}
					/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Metal type</p>
					<SelectField<MetalList>
						validate={requiredSelect}
						name='metalType'
						placeholder='Select metal type'
						isMulti={false}
						options={metalOptions}
						isSearchable
						tabIndex={0}
						isDisabled={isEditing}
						onChange={(select,) => {
							if (select && !Array.isArray(select,)) {
								setMetalTypeValue((select as IOptionType<MetalList>).value,)
							}
						}}
					/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Transaction date</p>
					<CustomDatePickerField name='transactionDate' validate={validateDate} disableFuture={false}/>
				</div>
				<div>
					<p className={styles.fieldTitle}>Purchase price</p>
					<FormField
						validate={composeValidators(
							requiredNumericWithDecimal,
							notZero,
						)}
						name='purchasePrice'
						placeholder='Enter purchase price'
						isNumber={true}
						tabIndex={0}
					/>
					{amountText && <p className={styles.errorText(isAmountValid,)}>{amountText}</p>}
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
					{totalUnits !== undefined && !Boolean(assetValues?.assetMainId,) && (
						<p className={styles.errorText(false,)}>
						Total units: {
								values['operation'] && values['units'] && !isNaN(parseFloat(values['units'],),) ?
									(
										isEditing && initialOperation?.value ?
											(
												initialOperation.value === AssetOperationType.BUY ?
													(
														values['operation'].value === AssetOperationType.BUY ?
															localeString(totalUnits + parseFloat(values['units'],) - initialUnits,) :
															localeString(totalUnits - parseFloat(values['units'],) - initialUnits,)
													) :
													(
														values['operation'].value === AssetOperationType.BUY ?
															localeString(totalUnits + initialUnits + parseFloat(values['units'],),) :
															localeString(totalUnits + initialUnits - parseFloat(values['units'],),)
													)
											) :
											(
												values['operation'].value === AssetOperationType.BUY ?
													localeString(totalUnits + parseFloat(values['units'],),) :
													localeString(totalUnits - parseFloat(values['units'],),)
											)
									) :
									(
										localeString(totalUnits, '', 0, false,)
									)
							}
						</p>
					)}
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
			</>)}
		</div>
	)
}