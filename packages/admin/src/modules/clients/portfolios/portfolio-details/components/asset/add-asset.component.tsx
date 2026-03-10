/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Form,
} from 'react-final-form'
import type {
	FormApi,
} from 'final-form'

import {
	ButtonType,
	Button,
	Size,
	LabeledProgressBar,
	PrevButton,
	NextButton,
	SelectField,
	DocumentManager,
} from '../../../../../../shared/components'

import {
	useCreateAsset, useUpdateTransaction,
} from '../../../../../../shared/hooks'
import {
	useCreateDocument,
} from '../../../../../../shared/hooks'
import type {
	AssetName,
	StepType,
	AssetFormValues,
	CreateAssetProps,
	OtherFormValues,
} from './asset.types'
import {
	getFormStepsBasedOnAssetType,
	renderSelectIcon,
	renderStepTwoFormFields,
} from '../../../portfolio/components/drawer-content/components/form-asset'
import {
	assetArray,
} from '../../../portfolio/components/drawer-content/components/form-asset'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import {
	transformValuesForPayload,
	transformData,
} from '../../../portfolio/utils/transform-payload.util'
import {
	AssetNamesType,
} from '../../../../../../shared/types'
import {
	DocumentTypes,
} from '../../../../../../shared/types'
import type {
	IOptionType,
} from '../../../../../../shared/types'
import type {
	LinkedTransactionType,
} from '../../../../../operations/transactions'
import {
	useCreatedAssetStore,
} from './add-aset.store'
// todo: Create cr and adjust logic
import {
	useAddTransactionStore,
} from '../../../../../operations/transactions/add-transaction.store'

import * as styles from './asset.styles'

type Props = {
	defaultAssetName?: AssetNamesType
	createAssetProps: CreateAssetProps
	clientId: string
	transactionTypeId?: IOptionType<LinkedTransactionType>
	isinTranscationValue?: string
	bankFee?: string
	amountTransactionValue?: string
	transactionIds?: Array<number> | undefined
	toggleAssetDialogVisible?: () => void
	onClose: () => void
}

export const AddAsset: React.FC<Props> = ({
	defaultAssetName,
	createAssetProps,
	clientId,
	transactionTypeId,
	isinTranscationValue,
	bankFee,
	amountTransactionValue,
	transactionIds,
	toggleAssetDialogVisible,
	onClose,
},) => {
	const [step, setStep,] = React.useState<StepType>(1,)
	const [assetName, setAssetName,] = React.useState<AssetName | undefined>()
	const {
		mutateAsync: createAsset,
	} = useCreateAsset()
	const {
		documents, addDocument, removeDocument, clearDocuments,
	} = useDocumentStore()
	const {
		mutateAsync: createAssetDocument,
	} = useCreateDocument(DocumentTypes.ASSET,)
	const {
		setCreatedAsset,
	} = useCreatedAssetStore()
	// todo: Create cr and adjust logic
	const {
		mutateAsync: updateTransaction,
	} = useUpdateTransaction()
	const {
		clearTransactionIds,
	} = useAddTransactionStore()
	React.useEffect(() => {
		if (defaultAssetName) {
			setAssetName({
				value: defaultAssetName,
				label: defaultAssetName,
			},)
			setStep(2,)
		}
	}, [defaultAssetName,],)
	const handleSubmit = async(
		data: AssetFormValues,
		form: FormApi<AssetFormValues, Partial<AssetFormValues>>,
	): Promise<void> => {
		const {
			assetName, ...assetValues
		} = data
		let payload
		if (assetName?.value === AssetNamesType.OTHER) {
			const transformedData = transformData(assetValues,) as OtherFormValues
			payload = JSON.stringify(transformValuesForPayload(transformedData,),)
		} else {
			payload = JSON.stringify(transformValuesForPayload(assetValues,),)
		}
		const newAsset = await createAsset({
			assetName:        assetName!.value,
			payload,
			portfolioDraftId: createAssetProps.portfolioDraftId,
			portfolioId:      createAssetProps.portfolioId,
			entityId:         createAssetProps.entityId,
			bankId:           createAssetProps.bankId,
			accountId:        createAssetProps.accountId,
			clientId,
		},)
		// todo: Create cr and adjust logic
		if (Boolean(transactionIds?.length,)) {
			await Promise.all(
				(transactionIds ?? []).map(async(id,) => {
					return updateTransaction({
						id,
						assetId:   newAsset.id,
						assetName:        assetName!.value,
					},)
				},),
			)
			clearTransactionIds()
		}
		setCreatedAsset(newAsset,)
		if (documents.length > 0) {
			await Promise.all(documents.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('assetId', newAsset.id,)
				await createAssetDocument(formData,)
			},),)
		}
		onClose()
		form.reset()
		clearDocuments()
		if (toggleAssetDialogVisible) {
			toggleAssetDialogVisible()
		}
	}

	return (
		<Form<AssetFormValues>
			onSubmit={handleSubmit}
			initialValues={{
				assetName,
			}}
			render={({
				handleSubmit,
				submitting,
				errors,
				values,
				form,
			},) => {
				const firstStepDisabled = !Boolean(values['assetName'],)
				const secondStepDisabled = Object.values(errors ?? {
				},).length !== 0
				return (
					<form className={styles.container} onSubmit={handleSubmit}>
						<h3 className={styles.header}>Add asset</h3>
						<LabeledProgressBar currentStep={step} steps={getFormStepsBasedOnAssetType(values,)}/>
						<div className={cx(styles.addFormWrapper,)}>
							<div className={cx(step !== 1 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<SelectField<AssetNamesType>
										name='assetName'
										placeholder='Select asset'
										leftIcon={renderSelectIcon(values.assetName?.value,)}
										isMulti={false}
										options={assetArray}
										isSearchable
										value={assetName}
										onChange={(value,) => {
											setAssetName(value as AssetName,)
										}}
									/>
								</div>
								<div className={styles.addBtnWrapper}>
									<NextButton
										disabled={firstStepDisabled}
										handleNext={() => {
											setStep(2,)
										}}
									/>
								</div>
							</div>
							<div className={cx(step !== 2 && 'hidden-el',)}>
								<div>
									{renderStepTwoFormFields({
										step,
										assetName:         values.assetName?.value,
										transactionTypeId,
										accountId:       createAssetProps.accountId ?
											createAssetProps.accountId :
											undefined,
										isinTranscationValue,
										bankFee,
										amountTransactionValue,
										values,
									},)}
								</div>
								<div className={styles.addBtnWrapper}>
									<PrevButton
										handlePrev={() => {
											setStep(1,)
											form.reset()
										}}
									/>
									{assetName?.value === AssetNamesType.CASH ?
										<Button<ButtonType.TEXT>
											type='submit'
											disabled={Boolean(submitting,)}
											additionalProps={{
												btnType: ButtonType.TEXT,
												text:    'Add asset',
												size:    Size.MEDIUM,
											}}
										/>										 :
										<NextButton
											disabled={secondStepDisabled}
											handleNext={() => {
												setStep(3,)
											}}
										/>
									}
								</div>
							</div>
							<div className={cx(step !== 3 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<DocumentManager
										documents={documents}
										addDocument={addDocument}
										removeDocument={removeDocument}
									/>
								</div>
								<div className={styles.addBtnWrapper}>
									<PrevButton
										handlePrev={() => {
											setStep(2,)
										}}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										disabled={Boolean(submitting,)}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    'Add asset',
											size:    Size.MEDIUM,
										}}
									/>
								</div>
							</div>
						</div>
					</form>
				)
			}
			}
		/>
	)
}