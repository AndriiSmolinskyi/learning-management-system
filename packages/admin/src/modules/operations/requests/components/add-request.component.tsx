/* eslint-disable max-lines */
/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Form,
} from 'react-final-form'

import {
	ButtonType,
	Button,
	Size,
	LabeledProgressBar,
	PrevButton,
	NextButton,
	SelectField,
	DocumentManager,
	FormField,
	FormTextArea,
	FormRadio,
	Dialog,
} from '../../../../shared/components'
import {
	BankSelect,
	Briefcase,
	ClientsRoute, DeleteBucketIcon, DocsIcon, EntitySelect,
} from '../../../../assets/icons'
import {
	SaveDraftButton,
} from './save-draft-btn.component'

import type {
	StepType,
	RequestFormValues,
	LinkedAccountType,
} from '../request.types'
import {
	useDocumentStore,
} from '../../../../store/document.store'
import type {
	IDocument,
} from '../../../../shared/types'
import {
	type IOptionType,
	RequestType,
	// todo: before asset refactor
	// AssetNamesType,
} from '../../../../shared/types'

import {
	useCreateRequestDraft,
	useCreateRequest,
	useRequestDraftById,
	useUpdateRequestDraft,
} from '../../../../shared/hooks/requests'
import {
	// todo: before asset refactor
	// useAssetsListBySourceId,
	useCreateDocument,
	useDeleteDocumentsByIds,
	useGetDocumentsByRequestDraftId,
} from '../../../../shared/hooks'
import {
	validateRequestForm,
} from '../request.validator'
import {
	useClientsList,
} from '../../../clients/client-profiles/clients/hooks'
import {
	amountValidator,
} from '../../../../shared/utils/validators'
import {
	renderSelectIcon,
} from '../../../clients/portfolios/portfolio/components/drawer-content/components/form-asset'
import {
	getRequestFormInitialValues,
	getRequestFormSteps,
} from '../request.utils'
import {
	useAccountsByEntityId,
	usePortfolioListByClientId,
} from '../../../../shared/hooks'
import {
	useEntityListByPortfolioId,
} from '../../../../shared/hooks'
import {
	ExitRequestUnsavedDialog,
} from './exit-unsaved-dialog.component'
import {
	DocumentTypes,
} from '../../../../shared/types'
import {
	useGetBondAndEquityForSelect,
} from '../../../../shared/hooks'
import * as styles from '../requests.styles'

type Props = {
	onClose: (id?: number) => void
	draftId: number | undefined
	toggleSuccessDialogVisible: () => void
	isExitDialogOpen: boolean
	toggleExitDialogVisible: () => void
}

const resetValuesData: RequestFormValues = {
	type:        undefined,
	amount:      undefined,
	comment:     undefined,
	accountId:   undefined,
	bankId:      undefined,
	clientId:    undefined,
	portfolioId: undefined,
	entityId:    undefined,
	assetId:     undefined,
}

export const AddRequest: React.FC<Props> = ({
	onClose,
	draftId,
	toggleSuccessDialogVisible,
	toggleExitDialogVisible,
	isExitDialogOpen,
},) => {
	const {
		data: requestDraftExtended,
	} = useRequestDraftById(draftId,)

	const [step, setStep,] = React.useState<StepType>(1,)
	const [existedDocuments, setExistedDocuments,] = React.useState<Array<IDocument>>([],)
	const [requestForm, setRequestForm,] = React.useState<RequestFormValues>({
		type:        undefined,
		amount:      undefined,
		comment:     undefined,
		bankId:      undefined,
		accountId:   undefined,
		clientId:    undefined,
		portfolioId: undefined,
		entityId:    undefined,
		assetId:     undefined,
	},)

	const {
		documents, addDocument, removeDocument, clearDocuments,
	} = useDocumentStore()
	const {
		mutateAsync: createRequest,
		isPending: isRequestCreating,
	} = useCreateRequest()
	const {
		mutateAsync: createRequestDraft,
		isPending: isRequestDraftCreating,
	} = useCreateRequestDraft()
	const {
		mutateAsync: updateRequestDraft,
		isPending: isRequestDraftUpdating,
	} = useUpdateRequestDraft()
	const {
		mutateAsync: createRequestDocument,
		isPending: isCreateRequestDocumentPending,
	} = useCreateDocument(DocumentTypes.REQUEST,)
	const {
		mutateAsync: createRequestDraftDocument,
		isPending: isCreateDraftDocumentPending,
	} = useCreateDocument(DocumentTypes.REQUEST, draftId,)
	const {
		mutateAsync: deleteDocuments,
		isPending: isDeleteDocumentsPending,
	} = useDeleteDocumentsByIds(draftId,)
	const {
		data: clientsList,
	} = useClientsList()
	const {
		data: portfoliosList,
	} = usePortfolioListByClientId(requestForm.clientId?.value.id,)
	const {
		data: entityList,
	} = useEntityListByPortfolioId(requestForm.portfolioId?.value.id,)
	const {
		data: accountList,
	} = useAccountsByEntityId(requestForm.entityId?.value.id,)
	// todo: before asset refactor
	// const {
	// 	data: assetList,
	// } = useAssetsListBySourceId({
	// 	accountId: requestForm.accountId?.value.id,
	// },)
	// todo: after asset refactor
	const {
		data: assetsList,
	} = useGetBondAndEquityForSelect({
		accountId: requestForm.accountId?.value.id,
	},)
	const {
		data: draftDocs,
	} = useGetDocumentsByRequestDraftId(draftId,)

	const clientOptionsArray = clientsList?.list
		.filter((client,) => {
			return client.isActivated
		},)
		.map((client,) => {
			return {
				label: `${client.firstName} ${client.lastName}`,
				value: {
					id:   client.id,
					name: `${client.firstName} ${client.lastName}`,
				},
			}
		},) ?? []

	const portfolioOptionsArray = portfoliosList?.filter((portfolio,) => {
		return portfolio.isActivated
	},).map((portfolio,) => {
		return {
			label: portfolio.name,
			value: {
				id:   portfolio.id,
				name: portfolio.name,
			},
		}
	},) ?? []

	const entityOptionsArray = entityList?.map((entity,) => {
		return {
			label: entity.name,
			value: {
				id:   entity.id,
				name: entity.name,
			},
		}
	},) ?? []

	const accountOptionsArray = accountList?.map((account,) => {
		return {
			label: account.accountName,
			value: {
				id:     account.id,
				name:   account.accountName,
				bankId: account.bankId,
			},
		}
	},) ?? []

	// todo: before asset refactor
	// const assetOptionsArray = (assetList ?? [])
	// 	.filter((asset, index, self,) => {
	// 		return (
	// 			(asset.assetName === AssetNamesType.BONDS &&
	// 			self.findIndex((a,) => {
	// 				return a.assetName === AssetNamesType.BONDS
	// 			},) === index) ||
	// 		(asset.assetName === AssetNamesType.EQUITY_ASSET &&
	// 			self.findIndex((a,) => {
	// 				return a.assetName === AssetNamesType.EQUITY_ASSET
	// 			},) === index)
	// 		)
	// 	},)
	// 	.map((asset,) => {
	// 		return {
	// 			label: asset.assetName,
	// 			value: {
	// 				id:   asset.id,
	// 				name: asset.assetName,
	// 			},
	// 		}
	// 	},)

	const handleSubmit = async(data: RequestFormValues,): Promise<void> => {
		const newRequest = await createRequest({
			...data,
			type:           data.type!,
			amount:         data.amount?.replace(',', '.',),
			assetId:        data.assetId?.value.id ,
			portfolioId:    data.portfolioId!.value.id,
			entityId:       data.entityId!.value.id,
			clientId:       data.clientId!.value.id,
			bankId:         data.bankId!,
			accountId:      data.accountId!.value.id,
			requestDraftId: draftId,
			assetName:      data.assetId?.label,
		},)
		onClose(newRequest.id,)

		const existedDocumentIds = existedDocuments.map((doc,) => {
			return doc.id
		},)
		const documentsToDelete = draftDocs?.
			filter((doc,) => {
				return !existedDocumentIds.includes(doc.id,)
			},).
			map((doc,) => {
				return doc.id
			},)

		if (documentsToDelete?.length) {
			await deleteDocuments({
				id: documentsToDelete,
			},)
		}

		if (documents.length > 0) {
			await Promise.all(documents.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('requestId', `${newRequest.id}`,)
				await createRequestDocument(formData,)
			},),)
		}
		clearDocuments()
		toggleSuccessDialogVisible()
	}

	const handleCreateDraft = async(data: RequestFormValues,): Promise<void> => {
		const newRequestDraft = await createRequestDraft({
			type:        data.type!,
			comment:     data.comment ?? null,
			amount:      data.amount,
			assetId:     data.assetId?.value.id,
			portfolioId: data.portfolioId?.value.id,
			bankId:      data.bankId,
			entityId:    data.entityId?.value.id,
			clientId:    data.clientId?.value.id,
			accountId:   data.accountId?.value.id,
			// todo: after asset refactor
			assetName:   data.assetId?.label,
		},)
		onClose()
		if (documents.length > 0) {
			await Promise.all(documents.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('requestDraftId', `${newRequestDraft.id}`,)
				await createRequestDraftDocument(formData,)
			},),)
		}
		clearDocuments()
	}

	const handleUpdateDraft = async(data: RequestFormValues,): Promise<void> => {
		if (!requestDraftExtended?.id) {
			return
		}
		const requestDraft = await updateRequestDraft({
			id:          requestDraftExtended.id,
			type:        data.type!,
			comment:     data.comment ?? null,
			amount:      data.amount ,
			assetId:     data.assetId?.value.id,
			portfolioId: data.portfolioId?.value.id ,
			entityId:    data.entityId?.value.id ,
			clientId:    data.clientId?.value.id ,
			accountId:   data.accountId?.value.id ,
			bankId:      data.bankId,
			// todo: after asset refactor
			assetName:   data.assetId?.label,
		},)
		onClose()

		const existedDocumentIds = existedDocuments.map((doc,) => {
			return doc.id
		},)
		const documentsToDelete = draftDocs?.
			filter((doc,) => {
				return !existedDocumentIds.includes(doc.id,)
			},).
			map((doc,) => {
				return doc.id
			},)

		if (documentsToDelete?.length) {
			await deleteDocuments({
				id: documentsToDelete,
			},)
		}

		if (documents.length > 0) {
			await Promise.all(documents.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('requestDraftId', `${requestDraft.id}`,)
				await createRequestDraftDocument(formData,)
			},),)
		}
		clearDocuments()
	}

	const handleDeleteExistedDocument = (id: string,): void => {
		setExistedDocuments((docs,) => {
			return docs.filter((item,) => {
				return item.id !== id
			},)
		},
		)
	}

	React.useEffect(() => {
		if (draftDocs) {
			setExistedDocuments(draftDocs,)
		}
	}, [draftDocs,],)

	React.useEffect(() => {
		if (requestDraftExtended) {
			setRequestForm(getRequestFormInitialValues(requestDraftExtended,),)
		}
	}, [requestDraftExtended,],)

	return (
		<Form<RequestFormValues>
			onSubmit={handleSubmit}
			validate={validateRequestForm}
			initialValues={requestForm}
			render={({
				handleSubmit,
				submitting,
				errors,
				values,
				hasValidationErrors,
			},) => {
				const firstStepDisabled = Boolean(errors?.['type'],)
				const secondStepDisabled = Boolean(errors?.['clientId.label'] ||
					errors?.['portfolioId.label'] ||
					errors?.['accountId.label'] ||
					errors?.['entityId.label'],)

				const isPending = submitting ||
					isRequestCreating ||
					isRequestDraftCreating ||
					isRequestDraftUpdating ||
					isCreateRequestDocumentPending ||
					isCreateDraftDocumentPending ||
					isDeleteDocumentsPending

				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Add request</h3>
						<LabeledProgressBar
							currentStep={step}
							steps={getRequestFormSteps(values,)}
						/>
						<div className={cx(styles.addFormWrapper,)}>
							<div className={cx(step !== 1 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<FormRadio
										label='Sell'
										value={RequestType.SELL}
										name='type'
										checked={requestForm.type === RequestType.SELL}
										onChange={(e,) => {
											setRequestForm({
												...resetValuesData,
												type: e.target.value as RequestType,
											},)
										}}
									/>
									<FormRadio
										label='Buy'
										value={RequestType.BUY}
										name='type'
										checked={requestForm.type === RequestType.BUY}
										onChange={(e,) => {
											setRequestForm({
												...resetValuesData,
												type: e.target.value as RequestType,
											},)
										}}
									/>
									<FormRadio
										label='Deposit'
										value={RequestType.DEPOSIT}
										name='type'
										checked={requestForm.type === RequestType.DEPOSIT}
										onChange={(e,) => {
											setRequestForm({
												...resetValuesData,
												type: e.target.value as RequestType,
											},)
										}}
									/>
									<FormRadio
										label='Other'
										value={RequestType.OTHER}
										checked={requestForm.type === RequestType.OTHER}
										name='type'
										onChange={(e,) => {
											setRequestForm({
												...resetValuesData,
												type: e.target.value as RequestType,
											},)
										}}
									/>
								</div>
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										onSaveDraft={() => {
											if (requestDraftExtended?.id) {
												handleUpdateDraft(values,)
											} else {
												handleCreateDraft(values,)
											}
										}}
										disabled={Boolean(isPending || !values.type,)}
									/>
									<NextButton
										disabled={firstStepDisabled}
										handleNext={() => {
											setStep(2,)
										}}
									/>
								</div>
							</div>
							<div className={cx(step !== 2 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<SelectField<LinkedAccountType>
										name='clientId'
										isDisabled={!clientsList}
										placeholder='Select client'
										leftIcon={<ClientsRoute width={18} height={18} />}
										options={clientOptionsArray}
										onChange={(select,) => {
											if (select && !Array.isArray(select,)) {
												setRequestForm({
													...values,
													portfolioId: undefined,
													entityId:    undefined,
													accountId:   undefined,
													assetId:     undefined,
													clientId:    select as IOptionType<LinkedAccountType>,
												},)
											}
										}}
										value={requestForm.clientId}
										isSearchable
									/>
									<SelectField<LinkedAccountType>
										name='portfolioId'
										placeholder='Select portfolio or sub-portfolio'
										leftIcon={<Briefcase width={18} height={18} />}
										isDisabled={!portfoliosList}
										options={portfolioOptionsArray}
										isSearchable
										onChange={(select,) => {
											if (select && !Array.isArray(select,)) {
												setRequestForm({
													...values,
													assetId:     undefined,
													entityId:    undefined,
													accountId:   undefined,
													portfolioId: select as IOptionType<LinkedAccountType>,
												},)
											}
										}}
										value={requestForm.portfolioId}
									/>
									<SelectField<LinkedAccountType>
										name='entityId'
										placeholder='Select entity'
										leftIcon={<EntitySelect width={18} height={18} />}
										isDisabled={!entityList}
										options={entityOptionsArray}
										isSearchable
										onChange={(select,) => {
											if (select && !Array.isArray(select,)) {
												setRequestForm({
													...values,
													assetId:   undefined,
													accountId: undefined,
													entityId:  select as IOptionType<LinkedAccountType>,
												},)
											}
										}}
										value={requestForm.entityId}
									/>
									<SelectField<LinkedAccountType>
										name='accountId'
										placeholder='Select bank account'
										leftIcon={<BankSelect width={18} height={18} />}
										isDisabled={!accountList}
										options={accountOptionsArray}
										isSearchable
										onChange={(select,) => {
											if (select && !Array.isArray(select,)) {
												setRequestForm({
													...values,
													assetId:   undefined,
													accountId: select as IOptionType<LinkedAccountType>,
													bankId:    (select as IOptionType<LinkedAccountType>).value.bankId,
												},)
											}
										}}
										value={requestForm.accountId}
									/>
								</div>
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										onSaveDraft={() => {
											if (requestDraftExtended?.id) {
												handleUpdateDraft(values,)
											} else {
												handleCreateDraft(values,)
											}
										}}
										disabled={Boolean(isPending,)}
									/>
									<PrevButton
										handlePrev={() => {
											setStep(1,)
										}}
									/>
									<NextButton
										disabled={secondStepDisabled}
										handleNext={() => {
											setStep(3,)
										}}
									/>
								</div>
							</div>
							<div className={cx(step !== 3 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									{values.type === RequestType.DEPOSIT && (
										<div className={styles.depositBlock}>
											<p className={styles.fieldTitle}>Amount (USD)</p>
											<FormField
												name='amount'
												placeholder='Enter amount'
												validate={amountValidator}
												onChange={(e,) => {
													setRequestForm({
														...values,
														assetId:   undefined,
														comment:   undefined,
														amount:    e.target.value,
													},)
												}}
												value={requestForm.amount}
												isNumber={true}
											/>
										</div>
									)}
									{(values.type === RequestType.BUY || values.type === RequestType.SELL) && (
										<SelectField<LinkedAccountType>
											name='assetId'
											placeholder='Select asset'
											leftIcon={renderSelectIcon(values.assetId?.value.id,)}
											// todo: before asset refactor
											// options={assetOptionsArray}
											// todo: after asset refactor
											options={assetsList ?? []}
											isSearchable
											validate={() => {
												if (!values.assetId) {
													return 'error'
												}
												return undefined
											}}
											onChange={(select,) => {
												if (select && !Array.isArray(select,)) {
													setRequestForm({
														...values,
														amount:    undefined,
														comment:   undefined,
														assetId: select as IOptionType<LinkedAccountType>,
													},)
												}
											}}
											value={requestForm.assetId}
										/>
									)}
									<FormTextArea
										label={values.type === RequestType.OTHER ?
											'Transaction type' :
											'Comment'}
										name='comment'
										placeholder='Enter comment'
										validate={() => {
											if (requestForm.type === RequestType.OTHER && !requestForm.comment?.trim()) {
												return 'error'
											}
											return undefined
										}}
										onChange={(e,) => {
											setRequestForm({
												...values,
												comment:   e.target.value,
											},)
										}}
										value={requestForm.comment ?? undefined}
										className={styles.commentField}
									/>
								</div>
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										onSaveDraft={() => {
											if (requestDraftExtended?.id) {
												handleUpdateDraft(values,)
											} else {
												handleCreateDraft(values,)
											}
										}}
										disabled={Boolean(isPending,)}
									/>
									<PrevButton
										handlePrev={() => {
											setStep(2,)
										}}
									/>
									<NextButton
										disabled={hasValidationErrors}
										handleNext={() => {
											setStep(4,)
										}}
									/>
								</div>
							</div>
							<div className={cx(step !== 4 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									{existedDocuments.length > 0 && (
										<div className={styles.oldDocBlock}>
											{existedDocuments.map((doc, index,) => {
												return (
													<div key={index} className={styles.oldDoc}>
														<div className={styles.oldDocLeft}>
															<DocsIcon className={styles.docsIcon} />
															<div className={styles.oldDocTextBlock}>
																<span className={styles.oldDocTextType}>{doc.type}</span>
																<span className={styles.oldDocTextFormat}>
																	{doc.format.toLocaleUpperCase()}
																</span>
															</div>
														</div>
														<DeleteBucketIcon
															className={styles.oldDocDelete}
															onClick={() => {
																handleDeleteExistedDocument(doc.id,)
															}}
														/>
													</div>
												)
											},)}
										</div>
									)}
									<DocumentManager
										documents={documents}
										addDocument={addDocument}
										removeDocument={removeDocument}
									/>
								</div>
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										onSaveDraft={async() => {
											if (requestDraftExtended?.id) {
												await	handleUpdateDraft(values,)
											} else {
												await	handleCreateDraft(values,)
											}
										}}
										disabled={Boolean(isPending,)}
									/>
									<PrevButton
										handlePrev={() => {
											setStep(3,)
										}}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										disabled={Boolean(isPending || hasValidationErrors,)}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    'Add request',
											size:    Size.MEDIUM,
										}}
									/>
								</div>
							</div>
						</div>
						<Dialog
							onClose={toggleExitDialogVisible}
							open={isExitDialogOpen}
							isCloseButtonShown
							backdropClassName={styles.exitDialogBackdrop}
						>
							<ExitRequestUnsavedDialog
								onExit={() => {
									toggleExitDialogVisible()
									onClose()
								}}
								onSaveDraft={async() => {
									toggleExitDialogVisible()
									if (requestDraftExtended?.id) {
										await handleUpdateDraft(values,)
									} else {
										await	handleCreateDraft(values,)
									}
								}}
								disabled={Boolean(isPending || !values.type,)}
							/>
						</Dialog>
					</form>
				)
			}
			}
		/>
	)
}