/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'
import type {
	FormApi,
} from 'final-form'

import {
	DocumentManager,
	SelectField,
	ButtonType,
	Button,
	Size,
	FormCollapse,
	Color,
	// FormField,
} from '../../../../../../shared/components'
import {
	DeleteBucketIcon,
	DocsIcon,
	FolderOpenIcon,
	Refresh,
} from '../../../../../../assets/icons'

import {
	useEditAsset,
} from '../../../../../../shared/hooks'
import {
	useGetDocumentsByAssetId,
	useCreateDocument,
	useDeleteDocumentsByIds,
} from '../../../../../../shared/hooks'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import type {
	AssetFormValues,
	EditAssetFormValues,
	OtherFormValues,
} from './asset.types'
import {
	assetArray,
	getFormStepsBasedOnAssetType,
	renderSelectIcon,
	renderStepTwoFormFields,
} from '../../../portfolio/components/drawer-content/components/form-asset'
import type {
	IAsset,
	IDocument,
	IOptionType, SelectValueType,
} from '../../../../../../shared/types'
import {
	transformValuesForPayload,
	transformPayloadForValues,
} from '../../../portfolio/utils/transform-payload.util'
import {
	validateAddAssetForm,
} from './add-asset.validator'
import {
	isDeepEqual,
} from '../../../../../../shared/utils'
import {
	DocumentTypes,
	AssetNamesType,
} from '../../../../../../shared/types'
import {
	useDepositStore,
} from '../../../../../../modules/analytics/deposit'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
// required,
} from '../../../../../../shared/utils/validators'
import * as styles from './asset.styles'

type Props = {
	onClose: () => void
	assetModalData: IAsset
	portfolioName: string
	entityName: string
	bankName: string
	accountName: string
	handleEditedAssetIds?: (id: string) => void
}

export const EditAsset: React.FC<Props> = ({
	onClose,
	assetModalData,
	portfolioName,
	accountName,
	bankName,
	entityName,
	handleEditedAssetIds,
},) => {
	const {
		documents, addDocument, removeDocument, clearDocuments,
	} = useDocumentStore()
	const {
		mutateAsync: editAsset,
	} = useEditAsset()
	const {
		mutateAsync: createAssetDocument,
	} = useCreateDocument(DocumentTypes.ASSET, assetModalData.id,)
	const {
		setAssetId, filter,
	} = useDepositStore()
	const {
		data: assetDocs,
	} = useGetDocumentsByAssetId(assetModalData.id,)

	const {
		mutateAsync: deleteAssetDocuments,
	} = useDeleteDocumentsByIds(assetModalData.portfolioId ?? assetModalData.portfolioDraftId ?? '',)

	const parsedPayload = React.useMemo(() => {
		try {
			return JSON.parse(assetModalData.payload,)
		} catch {
			return {
			}
		}
	}, [assetModalData.payload,],)
	const isVersionFromPayload = Boolean(parsedPayload.assetMainId,)
	const [existedDocuments, setExistedDocuments,] = React.useState<Array<IDocument>>([],)
	const [firstStepOpen, setFirstStepOpen,] = React.useState<boolean>(false,)
	const [secondStepOpen, setSecondStepOpen,] = React.useState<boolean>(false,)
	const [thirdStepOpen, setThirdStepOpen,] = React.useState<boolean>(false,)
	const [isDocumentsChanged, setIsDocumentsChanged,] = React.useState<boolean>(false,)
	const [isSecurityFetching, setIsSecurityFetching,] = React.useState<boolean>(false,)
	const initialValues: AssetFormValues = {
		...transformPayloadForValues(assetModalData.payload,),
		assetName: {
			label: assetModalData.assetName,
			value: assetModalData.assetName,
		},
	}
	React.useEffect(() => {
		return () => {
			clearDocuments()
		}
	}, [],)
	const [formState, setFormState,] = React.useState<AssetFormValues | OtherFormValues>(initialValues,)

	const {
		userInfo,
	} = useUserStore()

	const handleSecurityState = (isFetching: boolean,): void => {
		setIsSecurityFetching(isFetching,)
	}

	const handleSubmit = async(values: EditAssetFormValues, form: FormApi<EditAssetFormValues, Partial<EditAssetFormValues>>,): Promise<void> => {
		const {
			assetName, ...assetValues
		} = values
		const payload = JSON.stringify(transformValuesForPayload(assetValues,),)
		handleEditedAssetIds?.(assetModalData.id,)
		if (!userInfo.name) {
			return
		}
		const newAsset = await editAsset({
			payload,
			assetName: assetModalData.assetName,
			id:        assetModalData.id,
			isVersion: isVersionFromPayload,
			userInfo:  {
				email:  userInfo.email,
				name:   userInfo.name,
				// reason: values.reason,
				reason: 'Edit with no reason',
			},
		},)
		const existedDocumentIds = existedDocuments.map((doc,) => {
			return doc.id
		},)
		const documentsToDelete = assetDocs?.
			filter((doc,) => {
				return !existedDocumentIds.includes(doc.id,)
			},).
			map((doc,) => {
				return doc.id
			},)

		if (documentsToDelete?.length) {
			await deleteAssetDocuments({
				id: documentsToDelete,
			},)
		}

		if (documents.length > 0) {
			await Promise.all(documents.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('assetId', newAsset.id,)
				await createAssetDocument(formData,)
			},),)
		}
		if (assetName?.value === AssetNamesType.CASH_DEPOSIT && assetValues.currencyValue === '0') {
			if (filter.assetId) {
				setAssetId(filter.assetId.filter((item,) => {
					return item !== assetModalData.id
				},),)
			} else {
				setAssetId(undefined,)
			}
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

	React.useEffect(() => {
		if (assetDocs) {
			setExistedDocuments(assetDocs,)
		}
	}, [assetDocs,],)

	React.useEffect(() => {
		setIsDocumentsChanged(existedDocuments.length !== assetDocs?.length,)
		if (documents.length > 0) {
			setIsDocumentsChanged(true,)
		}
	}, [existedDocuments,assetDocs,documents,],)
	const assetInfo = getFormStepsBasedOnAssetType({
		assetName: {
			value: assetModalData.assetName,
		}, ...JSON.parse(assetModalData.payload,),
	}, true,)
	return (
		<Form<EditAssetFormValues>
			onSubmit={handleSubmit}
			initialValues={formState}
			validate={validateAddAssetForm}
			render={({
				handleSubmit,
				values,
				hasValidationErrors,
				errors,
			},) => {
				const isFormChanged = !isDeepEqual<AssetFormValues>(values, initialValues,) || isDocumentsChanged
				const clearBtnDisabled = Object.values(values,).every((field,) => {
					return !Boolean(field,)
				},) && !documents.length
				const {
					security,
				} = values
				return (
					<form className={styles.container} onSubmit={handleSubmit}
						onClick={(e,) => {
							e.stopPropagation()
						}}>
						<h3 className={styles.header}>Edit asset</h3>
						<div className={styles.fieldsContainer(secondStepOpen || thirdStepOpen,)}>
							<div className={styles.editFormWrapper}>
								<div className={styles.title}>
									<FolderOpenIcon width={16} height={16}/>
									<p>{portfolioName}</p>
									<p>/</p>
									<p>{entityName}</p>
									<p>/</p>
									<p>{bankName}</p>
									<p>/</p>
									<p>{accountName}</p>
									{values.assetName?.value && (
										<>
											<p>/</p>
											<p>{values.assetName.value}</p>
										</>
									)}
								</div>
								<FormCollapse
									title='Select asset'
									info={[values.assetName?.value,]}
									isOpen={firstStepOpen}
									onClose={setFirstStepOpen}
								>
									<SelectField
										name='assetName'
										placeholder='Select asset'
										leftIcon={renderSelectIcon(values.assetName?.value,)}
										options={assetArray}
										isSearchable
										value={formState.assetName}
										onChange={(e: SelectValueType,) => {
											if (e && !Array.isArray(e,)) {
												setFormState({
													assetName: {
														value: (e as IOptionType<AssetNamesType>).value,
														label: (e as IOptionType<string>).label,
													} ,
												},)
											}
										}}
									/>
								</FormCollapse>
								<FormCollapse
									title='Asset details'
									info={[]}
									isOpen={secondStepOpen}
									onClose={setSecondStepOpen}
									details={assetInfo[1]?.labelDesc}
								>
									<div className={styles.editAssetBlock}>
										{renderStepTwoFormFields({
											values:    initialValues,
											handleSecurityState,
											isEditing: true,
											security,
											assetName:   values.assetName?.value,
											accountId:       assetModalData.accountId ?
												assetModalData.accountId :
												undefined,
											...(assetModalData.assetName === AssetNamesType.OTHER ?
												{
													transformedValues: formState,
												} :
												{
												}),
											onChange: (newValues,) => {
												setFormState({
													...values,
													customFields: newValues,
												},)
											},
										},)}
									</div>
									{/* <div>
										<p className={styles.fieldTitle}>Reason</p>
										<FormField
											validate={required}
											name='reason'
											placeholder='Reason'
											tabIndex={0}
										/>
									</div> */}

								</FormCollapse>
								<FormCollapse
									title='Documents'
									info={[`${existedDocuments.length + documents.length} files attached`,]}
									isOpen={thirdStepOpen}
									onClose={setThirdStepOpen}
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
							</div>
							<div className={styles.editBtnWrapper}>
								<div className={styles.editBtnInnerWrapper}>
									<Button<ButtonType.TEXT>
										onClick={() => {
											setFormState(initialValues,)
											if (assetDocs) {
												setExistedDocuments(assetDocs,)
											}
											clearDocuments()
										}}
										disabled={clearBtnDisabled || !isFormChanged}
										additionalProps={{
											btnType:  ButtonType.TEXT,
											text:     'Clear',
											size:     Size.MEDIUM,
											color:    Color.SECONDRAY_GRAY,
											leftIcon: <Refresh width={20} height={20} />,
										}}
									/>
									<Button<ButtonType.TEXT>
										disabled={Boolean(!isFormChanged,) || hasValidationErrors || (isSecurityFetching && !security)}
										type='submit'
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