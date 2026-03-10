/* eslint-disable max-lines */
/* eslint-disable complexity */
import React from 'react'
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
	SelectField,
	DocumentManager,
	FormField,
	FormTextArea,
	Color,
	FormCollapse,
	Label,
} from '../../../../shared/components'
import {
	BankSelect,
	Briefcase,
	DeleteBucketIcon,
	DocsIcon,
	EntitySelect,
	Refresh,
} from '../../../../assets/icons'

import type {
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
} from '../../../../shared/types'
import {
	useRequestById,
	useUpdateRequest,
} from '../../../../shared/hooks/requests'
import {
	useCreateDocument, useDeleteDocumentsByIds, useGetBondAndEquityForSelect, useGetDocumentsByRequestId,
} from '../../../../shared/hooks'
import {
	validateRequestForm,
} from '../request.validator'
import {
	amountValidator,
} from '../../../../shared/utils/validators'
import {
	renderSelectIcon,
} from '../../../clients/portfolios/portfolio/components/drawer-content/components/form-asset'
import {
	useAccountsByEntityId,
	usePortfolioListByClientId,
} from '../../../../shared/hooks'
import {
	useEntityListByPortfolioId,
} from '../../../../shared/hooks'
import {
	isDeepEqual,
} from '../../../../shared/utils'
import {
	displayRequestInformation,
	getRequestStatus,
	getRequestFormInitialValues,
} from '../request.utils'
import {
	DocumentTypes,
} from '../../../../shared/types'

import * as styles from '../requests.styles'

type Props = {
	onClose: () => void
	requestId: number | undefined
}

export const EditRequest: React.FC<Props> = ({
	onClose,
	requestId,
},) => {
	const [requestForm, setRequestForm,] = React.useState<RequestFormValues>({
		type:        undefined,
		amount:      undefined,
		comment:     undefined,
		accountId:   undefined,
		bankId:      undefined,
		clientId:    undefined,
		portfolioId: undefined,
		entityId:    undefined,
		assetId:     undefined,
	},)
	const [firstStepOpen, setFirstStepOpen,] = React.useState<boolean>(false,)
	const [secondStepOpen, setSecondStepOpen,] = React.useState<boolean>(false,)
	const [existedDocuments, setExistedDocuments,] = React.useState<Array<IDocument>>([],)

	const {
		data: requestExtended,
	} = useRequestById(requestId,)
	const {
		documents, addDocument, removeDocument, clearDocuments,
	} = useDocumentStore()
	const {
		mutateAsync: updateRequest,
		isPending: isRequestUpdating,
	} = useUpdateRequest()
	const {
		mutateAsync: deleteDocuments,
		isPending: isDeleteDocumentsPending,
	} = useDeleteDocumentsByIds(requestId,)
	const {
		mutateAsync: createRequestDocument,
		isPending: isCreateDocumentsPending,
	} = useCreateDocument(DocumentTypes.REQUEST,)
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
	const {
		data: assetsList,
	} = useGetBondAndEquityForSelect({
		accountId: requestForm.accountId?.value.id,
	},)
	const {
		data: requestDocs,
	} = useGetDocumentsByRequestId(requestId,)

	const portfolioOptionsArray = portfoliosList?.map((portfolio,) => {
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
	// 	.filter((asset,) => {
	// 		return (
	// 			asset.assetName === AssetNamesType.BONDS ||
	// 		asset.assetName === AssetNamesType.EQUITY_ASSET
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

	// todo: before asset refactor
	// const handleSubmit = async(
	// 	data: RequestFormValues,
	// 	form: FormApi<RequestFormValues, Partial<RequestFormValues>>,
	// ): Promise<void> => {
	// 	const newRequest = await updateRequest({
	// 		...data,
	// 		id:          requestExtended?.id ?? 0,
	// 		type:        data.type!,
	// 		amount:      data.amount?.replace(',', '.',),
	// 		assetId:     data.assetId?.value.id,
	// 		portfolioId: data.portfolioId!.value.id,
	// 		entityId:    data.entityId!.value.id,
	// 		clientId:    data.clientId!.value.id,
	// 		bankId:      data.bankId,
	// 		accountId:   data.accountId!.value.id,
	// 		comment:     data.comment ?? null,
	// 	},)

	// 	const existedDocumentIds = existedDocuments.map((doc,) => {
	// 		return doc.id
	// 	},)
	// 	const documentsToDelete = requestDocs?.
	// 		filter((doc,) => {
	// 			return !existedDocumentIds.includes(doc.id,)
	// 		},).
	// 		map((doc,) => {
	// 			return doc.id
	// 		},)

	// 	if (documentsToDelete?.length) {
	// 		await deleteDocuments({
	// 			id: documentsToDelete,
	// 		},)
	// 	}

	// 	if (documents.length > 0) {
	// 		await Promise.all(documents.map(async(document,) => {
	// 			const formData = new FormData()
	// 			formData.append('file', document.file,)
	// 			formData.append('type', document.documentType,)
	// 			formData.append('requestId', `${newRequest.id}`,)
	// 			await createRequestDocument(formData,)
	// 		},),)
	// 	}
	// 	onClose()
	// 	form.reset()
	// 	clearDocuments()
	// }

	// todo: after asset refactor
	const handleSubmit = async(
		data: RequestFormValues,
		form: FormApi<RequestFormValues, Partial<RequestFormValues>>,
	): Promise<void> => {
		const newRequest = await updateRequest({
			...data,
			id:          requestExtended?.id ?? 0,
			type:        data.type!,
			amount:      data.amount?.replace(',', '.',),
			assetId:     data.assetId?.value.id,
			portfolioId: data.portfolioId!.value.id,
			entityId:    data.entityId!.value.id,
			clientId:    data.clientId!.value.id,
			bankId:      data.bankId,
			accountId:   data.accountId!.value.id,
			comment:     data.comment ?? null,
			assetName:   data.assetId?.label,
		},)

		const existedDocumentIds = existedDocuments.map((doc,) => {
			return doc.id
		},)
		const documentsToDelete = requestDocs?.
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
		onClose()
		form.reset()
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

	const initialValues = React.useMemo(() => {
		return getRequestFormInitialValues(requestExtended,)
	},[requestExtended,],)

	const hasAdditionalErrors = React.useMemo(() => {
		return (!requestForm.amount?.trim() && !requestForm.comment?.trim() && !requestForm.assetId?.value.id)
	}, [requestForm.amount, requestForm.assetId, requestForm.comment,],)

	React.useEffect(() => {
		if (requestDocs) {
			setExistedDocuments(requestDocs,)
		}
	}, [requestDocs,],)

	React.useEffect(() => {
		if (requestExtended) {
			setRequestForm(getRequestFormInitialValues(requestExtended,),)
		}
	}, [requestExtended,],)

	return (
		<Form<RequestFormValues>
			onSubmit={handleSubmit}
			validate={validateRequestForm}
			initialValues={requestForm}
			render={({
				handleSubmit,
				submitting,
				values,
				errors,
				hasValidationErrors,
			},) => {
				const isPending = submitting || isRequestUpdating || isDeleteDocumentsPending || isCreateDocumentsPending
				const documentsChanged = documents.length !== 0 || requestDocs?.length !== existedDocuments.length
				const formChanged = !isDeepEqual<RequestFormValues>(values, initialValues,) || documentsChanged

				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Edit request</h3>
						<div className={styles.fieldsContainer(firstStepOpen || secondStepOpen,)}>
							<div className={styles.editFormWrapper}>
								<div className={styles.infoBlock}>
									<div>
										<span>Request ID, type</span>
										<div>
											<p>{requestExtended?.id}</p>
											<span>, {requestExtended?.type}</span>
										</div>
									</div>
									<Label
										label={requestExtended?.status}
										color={getRequestStatus(requestExtended?.status,)}
									/>
								</div>
								<FormCollapse
									title='Request information'
									info={[displayRequestInformation(values,),]}
									isOpen={firstStepOpen}
									onClose={setFirstStepOpen}
								>
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
													amount:      undefined,
													assetId:     undefined,
													comment:     undefined,
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
													amount:    undefined,
													assetId:   undefined,
													comment:   undefined,
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
													amount:    undefined,
													assetId:   undefined,
													comment:   undefined,
													accountId: select as IOptionType<LinkedAccountType>,
													bankId:    (select as IOptionType<LinkedAccountType>).value.bankId,
												},)
											}
										}}
										value={requestForm.accountId}
									/>
									{values.type === RequestType.DEPOSIT && (
										<div>
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
														amount:    e.target.value || undefined,
													},)
												}}
												value={requestForm.amount ?? ''}
											/>
										</div>
									)}
									{(values.type === RequestType.BUY || values.type === RequestType.SELL) && (
										<SelectField<LinkedAccountType>
											name='assetName'
											placeholder='Select asset'
											leftIcon={renderSelectIcon(values.assetId?.value.name,)}
											// todo: before asset refactor
											// options={assetOptionsArray}
											// after asset refactor
											options={assetsList ?? []}
											isSearchable
											validate={() => {
												if (!values.assetId && !requestForm.assetId) {
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
											if (values.type === RequestType.OTHER && !values.comment?.trim) {
												return 'error'
											}
											return undefined
										}}
										onChange={(e,) => {
											setRequestForm({
												...values,
												comment:   e.target.value || undefined,
											},)
										}}
										value={requestForm.comment ?? ''}
										className={styles.commentField}
									/>
								</FormCollapse>
								<FormCollapse
									title='Documents'
									info={[`${existedDocuments.length + documents.length} files attached`,]}
									isOpen={secondStepOpen}
									onClose={setSecondStepOpen}
								>
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
									{Boolean(documents.length > 0,) && <p className={styles.newDocumentsText}>New documents:</p>}
									<DocumentManager
										documents={documents}
										addDocument={addDocument}
										removeDocument={removeDocument}
									/>
								</FormCollapse>
								<div className={styles.editBtnWrapper}>
									<Button<ButtonType.TEXT>
										onClick={() => {
											setRequestForm(initialValues,)
											if (requestDocs) {
												setExistedDocuments(requestDocs,)
											}
											clearDocuments()
										}}
										disabled={!formChanged || isPending}
										additionalProps={{
											btnType:  ButtonType.TEXT,
											text:     'Clear',
											size:     Size.MEDIUM,
											color:    Color.SECONDRAY_GRAY,
											leftIcon: <Refresh width={20} height={20} />,
										}}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										disabled={Boolean(!formChanged || isPending || hasValidationErrors || hasAdditionalErrors,)}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    'Save edits',
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