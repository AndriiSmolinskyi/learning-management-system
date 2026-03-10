/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable max-depth */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import * as React from 'react'
import {
	useFormState,
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
	composeValidators, localeString,
} from '../../../../../../../../../../shared/utils'
import {
	required,
	requiredSelect,
	validateDate,
} from '../../../../../../../../../../shared/utils/validators'
import {
	notZero,
	requiredNumericWithDecimal,
} from '../../form-asset.validate'
import {
	operationsVariables, currencyOptions,
} from '../../form-asset.constants'
import {
	IsinType,
	AssetOperationType,
	AssetNamesType,
} from '../../../../../../../../../../shared/types'
import {
	useGetEmissionsIsins, useGetSecurityByIsin,
} from '../../../../../../../../../../shared/hooks/cbonds'
import {
	useCreateIsin, useGetAssetTotalUnits,
} from '../../../../../../../../../../shared/hooks'
import {
	CreatebleSelectEnum,
} from '../../../../../../../../../../shared/constants'

import type {
	CurrencyList, SelectValueType,

	IOptionType,
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
	calculateAmountTextBond,
} from '../../form-asset.validate'
import {
	useAddTransactionStore,
} from '../../../../../../../../../operations/transactions/add-transaction.store'

import * as styles from '../../form-asset.styles'

interface IBondContentProps{
	accountId: string
	step?: StepType
	defaultSecurity?: string
	transactionTypeId?: IOptionType<LinkedTransactionType>
	isinTranscationValue?: string
	bankFee?: string
	amountTransactionValue?: string
	isEditing?: boolean
	handleSecurityState?: (isFetching: boolean)=>void
	assetValues?: AssetFormValues
}

export const BondContent: React.FC<IBondContentProps> = ({
	step,
	defaultSecurity,
	transactionTypeId,
	isinTranscationValue,
	bankFee,
	amountTransactionValue,
	accountId,
	handleSecurityState,
	isEditing,
	assetValues,
},) => {
	const {
		currency,
	} = useAddTransactionStore()
	const {
		values,
	} = useFormState()
	const form = useForm()
	const [isinValue, setIsinValue,] = React.useState<string | null>(null,)
	const [currencyValue, setCurrencyValue,] = React.useState<CurrencyList | undefined>(undefined,)
	const [initialUnits, setInitialUnits,] = React.useState<number>(0,)
	const [initialOperation, setInitialOperation,] = React.useState<IOptionType<AssetOperationType> | undefined>(undefined,)
	const [isinInitialValue, setIsinInitialValue,] = React.useState<IOptionType<string> | null>(null,)
	const [operation, setOperation,] = React.useState<IOptionType<AssetOperationType> | undefined>(undefined,)
	const [amountText, setAmountText,] = React.useState<string | undefined>('',)
	const [isAmountValid, setIsAmountValid,] = React.useState<boolean>(false,)
	const [isUnitAmountValid, setIsUnitAmountValid,] = React.useState<boolean | undefined>(undefined,)
	const {
		mutateAsync: createIsin,
		isPending: isinAddLoading,
	} = useCreateIsin(IsinType.BOND,)
	const shouldFetch =
  Boolean(isinValue && currencyValue,) ||
  Boolean(values['currency']?.value && values['isin']?.value,)
	const totaInitial: TAssetGetTotalUnits | undefined = shouldFetch ?
		{
			accountId,
			isin:      isinValue ?? values['isin']?.value,
			currency:  currencyValue ?? values['currency']?.value,
			assetName: AssetNamesType.BONDS,

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
	} = useGetEmissionsIsins(currencyValue ?? values['currency']?.value,)
	const {
		data: security,
		isFetching: isSecurityFetching,
	} = useGetSecurityByIsin(isinValue ?? isinTranscationValue ?? values['isin']?.value ?? '',)

	React.useEffect(() => {
		if (handleSecurityState) {
			handleSecurityState(isSecurityFetching,)
		}
	}, [isSecurityFetching,],)
	const isinOptions = data?.map((isin,) => {
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
		if (isEditing) {
			setInitialUnits(Number(values['units'],),)
			setInitialOperation(values['operation'],)
		}
	}, [],)
	React.useEffect(() => {
		if (step === 1) {
			setIsinValue(null,)
			setCurrencyValue(undefined,)
			form.resetFieldState('units',)
			form.resetFieldState('unitPrice',)
			form.resetFieldState('bankFee',)
			form.resetFieldState('accrued',)
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
			const text = calculateAmountTextBond(values['units'], values['unitPrice'], amountTransactionValue,)
			setAmountText(text,)

			const totalAmount = parseFloat(values['units'],) * parseFloat(values['unitPrice'],)

			const cleanedAmount = parseFloat(amountTransactionValue.replace(/,/g, '',),) * 10

			if (Math.abs(totalAmount - cleanedAmount,) > 2000) {
				setIsAmountValid(true,)
			} else {
				setIsAmountValid(false,)
			}
		}
	}, [values,],)

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
	const isEditedSellBlockedInBuy = isEditing && initialOperation?.value === AssetOperationType.BUY && ((unitsData?.totalUnits ?? 0) - Number(values['units'],)) < Number(values['units'],)
	const isEditedSellBlockedInSell = isEditing && initialOperation?.value === AssetOperationType.SELL && ((unitsData?.totalUnits ?? 0) + initialUnits - Number(values['units'],)) < 0
	const isEditedBuyBlockedInBuy = isEditing && initialOperation?.value === AssetOperationType.BUY && ((unitsData?.totalUnits ?? 0) - initialUnits + Number(values['units'],)) < 0
	const isEditedBuyBlockedInSell = isEditing && initialOperation?.value === AssetOperationType.BUY && ((unitsData?.totalUnits ?? 0) - initialUnits - Number(values['units'],)) < 0

	const filteredOperations = operationsVariables.filter((option,) => {
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
					initialValue={((transactionTypeId && currency) ?? values['currency']) as IOptionType<CurrencyList>}
					isDisabled={Boolean(currency && transactionTypeId,) || isEditing}
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setCurrencyValue((select as IOptionType<CurrencyList>).value,)
							form.change('isin', undefined,)
						}
					}}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Value date</p>
				<CustomDatePickerField name='valueDate' validate={validateDate} tabIndex={0} disableFuture={false}/>
			</div>
			<div>
				<p className={styles.fieldTitle}>ISIN</p>
				<SelectField
					isDisabled={(!currencyValue && !values['currency']) || isEditing}
					validate={requiredSelect}
					name='isin'
					placeholder='Select ISIN'
					isMulti={false}
					options={isinOptions ?? []}
					onChange={handleIsinChange}
					isSearchable
					isCreateble
					createbleStatus={CreatebleSelectEnum.ISIN}
					createFn={handleCreateIsin}
					isLoading={isinAddLoading}
					tabIndex={0}
					initialValue={isinInitialValue ?? undefined}
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
						undefined) ?? defaultSecurity ?? ''}
					readOnly
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Units</p>
				<FormField
					validate={composeValidators(
						required,
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
				<p className={styles.fieldTitle}>Unit price</p>
				<FormField
					validate={composeValidators(
						required,
						requiredNumericWithDecimal,
					)}
					name='unitPrice'
					placeholder=' Enter unit price'
					isNumber={true}
					tabIndex={0}
				/>
				{amountText && <p className={styles.errorText(isAmountValid,)}>{amountText}</p>}
			</div>
			<div>
				<p className={styles.fieldTitle}>Bank Fee</p>
				<FormField
					validate={composeValidators(required, requiredNumericWithDecimal,)}
					name='bankFee'
					placeholder=' Enter bank fee'
					isNumber={true}
					tabIndex={0}
					initiaValue={bankFee?.replace(/,/g, '',)}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Accrued</p>
				<FormField
					validate={composeValidators(required, requiredNumericWithDecimal,)}
					name='accrued'
					placeholder='Enter accrued'
					isNumber={true}
					tabIndex={0}
				/>
			</div>
			<div>
				<p className={styles.fieldTitle}>Operation</p>
				<SelectField<AssetOperationType>
					isDisabled={(unitsData?.totalUnits === undefined)}
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
