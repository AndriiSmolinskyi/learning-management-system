/* eslint-disable complexity */
import React from 'react'
import {
	BondContent,
} from './form-variables/bonds/bond-content.component'
import {
	CashContent,
} from './form-variables/cash/cash-content.component'
import {
	CashDepositContent,
} from './form-variables/cash-deposit/cash-deposit.component'
import {
	CryptoContent,
} from './form-variables/crypto/crypto-content.component'
import {
	CollateralContent,
} from './form-variables/collateral/collateral-content.component'
import {
	EquityContent,
} from './form-variables/equity/equity-content.component'
import {
	OtherInvestmentsContent,
} from './form-variables/other/other-content.component'
import {
	MetalsContent,
} from './form-variables/metals/metals-content.component'
import {
	OptionsContent,
} from './form-variables/options/options-content.component'
import {
	PrivateEquityContent,
} from './form-variables/private-equity/private-equity-content.component'
import {
	RealEstateContent,
} from './form-variables/real-estate/real-estate-content.component'
import {
	LoanContent,
} from './form-variables/loan/loan-content.component'
import {
	ReactComponent as BondIcon,
} from '../../../../../../../../assets/icons/bonds-icon.svg'
import {
	ReactComponent as CashIcon,
} from '../../../../../../../../assets/icons/cash-icon.svg'
import {
	ReactComponent as DepositIcon,
} from '../../../../../../../../assets/icons/deposit-icon.svg'
import {
	ReactComponent as OptionIcon,
} from '../../../../../../../../assets/icons/asset-option-icon.svg'
import {
	ReactComponent as EquitiesIcon,
} from '../../../../../../../../assets/icons/equities-icon.svg'
import {
	ReactComponent as MetalsIcon,
} from '../../../../../../../../assets/icons/metals-icon.svg'
import {
	ReactComponent as PrivateEquityIcon,
} from '../../../../../../../../assets/icons/private-equity-lock-icon.svg'
import {
	ReactComponent as CryptoIcon,
} from '../../../../../../../../assets/icons/crypto-icon.svg'
import {
	ReactComponent as OtherInvestmentsIcon,
} from '../../../../../../../../assets/icons/other-wallet-icon.svg'
import {
	ReactComponent as TransactionsIcon,
} from '../../../../../../../../assets/icons/transactions-send-icon.svg'
import {
	ReactComponent as RealEstateIcon,
} from '../../../../../../../../assets/icons/real-estate-icon.svg'
import {
	ReactComponent as AssetDollarIcon,
} from '../../../../../../../../assets/icons/asset-dollar-icon.svg'
import {
	ReactComponent as LoanIcon,
} from '../../../../../../../../assets/icons/loan-percentage-icon.svg'
import {
	getAssetBondsFormSteps,
	getAssetCashFormSteps,
	getAssetCryptoFormSteps,
	getAssetDepositFormSteps,
	getAssetEquityFormSteps,
	getAssetLoanFormSteps,
	getAssetPrivateEquityFormSteps,
	getAssetRealEstateFormSteps,
	getCollateralFormSteps,
	getMetalsFormSteps,
	getOptionsFormSteps,
	getOtherFormSteps,
} from '../../../../utils/get-asset-step-value.util.ts'
import type {
	IOptionType,
} from '../../../../../../../../shared/types'
import {
	MetalType,
} from '../../../../../../../../shared/types'
import {
	AssetNamesType, CryptoType, type IProgressBarStep,
} from '../../../../../../../../shared/types'
import type {
	IAssetValidateValues,
} from './form-asset.types'
import type {
	AssetFormValues, CustomField, StepType,
} from '../../../../../portfolio-details/components/asset'
import type {
	LinkedTransactionType,
} from '../../../../../../../operations/transactions'
import type {
	ICryptoFormStepDetailsValues, IMetalFormStepDetailsValues,
} from './form-variables'

type FormFieldsProp = {
	step?: StepType
	security?: string
	assetName: string | undefined
	transformedValues?: AssetFormValues
	accountId?: string
	transactionTypeId?: IOptionType<LinkedTransactionType>
	isinTranscationValue?: string
	bankFee?: string
	amountTransactionValue?: string
	values?: AssetFormValues
	onChange?: (values: Array<CustomField>) => void
	isEditing?: boolean
	handleSecurityState?: (isFetching: boolean)=>void
}

export const renderStepTwoFormFields = ({
	assetName,
	step,
	security,
	transformedValues,
	transactionTypeId,
	accountId,
	isinTranscationValue,
	bankFee,
	amountTransactionValue,
	values,
	isEditing,
	onChange,
	handleSecurityState,
}: FormFieldsProp,): React.ReactNode => {
	switch (assetName) {
	case AssetNamesType.BONDS:
		return accountId && <BondContent
			defaultSecurity={security}
			step={step}
			transactionTypeId={transactionTypeId}
			isinTranscationValue={isinTranscationValue}
			bankFee={bankFee}
			amountTransactionValue={amountTransactionValue}
			accountId={accountId}
			isEditing={isEditing}
			handleSecurityState={handleSecurityState}
			assetValues={values}
		/>
	case AssetNamesType.CASH:
		return <CashContent accountId={accountId}/>
	case AssetNamesType.CASH_DEPOSIT:
		return <CashDepositContent transactionTypeId={transactionTypeId} isEditing={isEditing} step={step}/>
	case AssetNamesType.COLLATERAL:
		return <CollateralContent transactionTypeId={transactionTypeId} step={step}/>
	case AssetNamesType.CRYPTO:
		return accountId && <CryptoContent
			security={security}
			step={step}
			transactionTypeId={transactionTypeId}
			isinTranscationValue={isinTranscationValue}
			bankFee={bankFee}
			amountTransactionValue={amountTransactionValue}
			accountId={accountId}
			isEditing={isEditing}
			values={values}
			handleSecurityState={handleSecurityState}
		/>
	case AssetNamesType.EQUITY_ASSET:
		return accountId && <EquityContent
			defaultSecurity={security}
			step={step}
			transactionTypeId={transactionTypeId}
			isinTranscationValue={isinTranscationValue}
			bankFee={bankFee}
			amountTransactionValue={amountTransactionValue}
			accountId={accountId}
			isEditing={isEditing}
			handleSecurityState={handleSecurityState}
			assetValues={values}
		/>
	case AssetNamesType.OTHER:
		return <OtherInvestmentsContent transformedValues={transformedValues} onChange={onChange} transactionTypeId={transactionTypeId} step={step}/>
	case AssetNamesType.METALS:
		return accountId && <MetalsContent
			transactionTypeId={transactionTypeId}
			amountTransactionValue={amountTransactionValue}
			accountId={accountId}
			step={step}
			isEditing={isEditing}
			propValues={values}
			isinTranscationValue={isinTranscationValue}
			bankFee={bankFee}
			security={security}
			handleSecurityState={handleSecurityState}
			assetValues={values}
		/>
	case AssetNamesType.OPTIONS:
		return <OptionsContent 	transactionTypeId={transactionTypeId} step={step}/>
	case AssetNamesType.PRIVATE_EQUITY:
		return <PrivateEquityContent 	transactionTypeId={transactionTypeId} step={step}/>
	case AssetNamesType.REAL_ESTATE:
		return <RealEstateContent 	transactionTypeId={transactionTypeId} step={step}/>
	case AssetNamesType.LOAN:
		return <LoanContent 	transactionTypeId={transactionTypeId} step={step}/>
	default:
		return null
	}
}

export const renderSelectIcon = (assetName: string | undefined,): React.JSX.Element => {
	switch (assetName) {
	case AssetNamesType.BONDS:
		return <BondIcon width={18} height={18} />
	case AssetNamesType.CASH:
		return <CashIcon width={18} height={18} />
	case AssetNamesType.CASH_DEPOSIT:
		return <DepositIcon width={18} height={18} />
	case AssetNamesType.COLLATERAL:
		return <TransactionsIcon width={18} height={18} />
	case AssetNamesType.CRYPTO:
		return <CryptoIcon width={18} height={18} />
	case AssetNamesType.EQUITY_ASSET:
		return <EquitiesIcon width={18} height={18} />
	case AssetNamesType.OTHER:
		return <OtherInvestmentsIcon width={18} height={18} />
	case AssetNamesType.METALS:
		return <MetalsIcon width={18} height={18}/>
	case AssetNamesType.OPTIONS:
		return <OptionIcon width={18} height={18} />
	case AssetNamesType.PRIVATE_EQUITY:
		return <PrivateEquityIcon width={18} height={18} />
	case AssetNamesType.REAL_ESTATE:
		return <RealEstateIcon width={18} height={18} />
	case AssetNamesType.LOAN:
		return <LoanIcon width={18} height={18} />
	default:
		return <AssetDollarIcon width={18} height={18} />
	}
}

export const getFormStepsBasedOnAssetType = (values: IAssetValidateValues, isEdit?: boolean,): Array<IProgressBarStep> => {
	const assetName = values.assetName?.value
	const productType = normalizeProductType(values.productType,)
	switch (assetName) {
	case AssetNamesType.CASH:
		return getAssetCashFormSteps(values,)
	case AssetNamesType.BONDS:
		return getAssetBondsFormSteps(values, isEdit,)
	case AssetNamesType.CASH_DEPOSIT:
		return getAssetDepositFormSteps(values, isEdit,)
	case AssetNamesType.COLLATERAL:
		return getCollateralFormSteps(values, isEdit,)
	case AssetNamesType.CRYPTO:
		if (productType && 'value' in productType && Object.values(CryptoType,).includes(productType.value as CryptoType,)) {
			return productType.value === CryptoType.ETF ?
				getAssetEquityFormSteps(values as ICryptoFormStepDetailsValues, isEdit,) :
				getAssetCryptoFormSteps(values as ICryptoFormStepDetailsValues, isEdit,)
		}
		return getAssetCryptoFormSteps(
		{
			...values, productType: undefined,
		} as ICryptoFormStepDetailsValues,
		isEdit,
		)
	case AssetNamesType.EQUITY_ASSET:
		return getAssetEquityFormSteps(values, isEdit,)
	case AssetNamesType.METALS:
		if (productType && 'value' in productType && Object.values(MetalType,).includes(productType.value as MetalType,)) {
			return productType.value === MetalType.ETF ?
				getAssetEquityFormSteps(values as IMetalFormStepDetailsValues, isEdit,) :
				getMetalsFormSteps(values as IMetalFormStepDetailsValues, isEdit,)
		}
		return getMetalsFormSteps({
			...values, productType: undefined,
		} as IMetalFormStepDetailsValues,
		isEdit,)
	case AssetNamesType.OPTIONS:
		return getOptionsFormSteps(values,)
	case AssetNamesType.OTHER:
		return getOtherFormSteps(values, isEdit,)
	case AssetNamesType.PRIVATE_EQUITY:
		return getAssetPrivateEquityFormSteps(values, isEdit,)
	case AssetNamesType.REAL_ESTATE:
		return getAssetRealEstateFormSteps(values, isEdit,)
	case AssetNamesType.LOAN:
		return getAssetLoanFormSteps(values, isEdit,)
	default:
		return [{
			labelTitle: 'Select asset',
			labelDesc:  'Choose the asset from the list to proceed.',
		},]
	}
}

type TProductType = { value: string; label?: string }

const normalizeProductType = (productType: IOptionType<CryptoType> | IOptionType<MetalType> | string | undefined,): TProductType | undefined => {
	if (!productType) {
		return undefined
	}

	if (typeof productType === 'string') {
		return {
			value: productType, label: productType,
		}
	}

	return productType
}