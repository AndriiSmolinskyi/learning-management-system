/* eslint-disable complexity */
import React from 'react'
import {
	Form,
} from 'react-final-form'
import type {
	FormApi,
} from 'final-form'

import {
	FormField,
	DocumentManager,
	SelectField,
	ButtonType,
	Button,
	Size,
	FormCollapse,
	Color,
} from '../../../../../../shared/components'
import {
	DeleteBucketIcon,
	DocsIcon,
	Flag,
	FolderOpenIcon,
	Refresh,
} from '../../../../../../assets/icons'

import {
	useEditEntity,
} from '../../../../../../shared/hooks'
import {
	useGetDocumentsByEntityId,
	useDeleteDocumentsByIds,
	useCreateDocument,
} from '../../../../../../shared/hooks'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import type {
	EntityFormValues,
} from './add-entity.types'
import type {
	IOptionType,
	SelectValueType,
	IEntity,
	IDocument,
} from '../../../../../../shared/types'
import {
	validateAddEntityForm,
} from './add-entity.validator'
import {
	email,
} from '../../../../../../shared/utils/validators'
import {
	isDeepEqual,
} from '../../../../../../shared/utils'
import {
	DocumentTypes,
} from '../../../../../../shared/types'
import {
	filteredCountries,
} from '../../../../../../shared/constants'

import * as styles from './entity.styles'

const countriesOptions = filteredCountries.map((name,) => {
	return {
		value: name,
		label: name,
	}
},)

type Props = {
	onClose: () => void
	entityModalData: IEntity
	portfolioName: string
}

export const EditEntity: React.FC<Props> = ({
	onClose,
	entityModalData,
	portfolioName,
},) => {
	const {
		documents, addDocument, removeDocument, clearDocuments,
	} = useDocumentStore()
	const {
		mutateAsync: editEntity,
	} = useEditEntity()
	const {
		mutateAsync: createEntityDocument,
	} = useCreateDocument(DocumentTypes.ENTITY, entityModalData.id,)
	const {
		data: entityDocs,
	} = useGetDocumentsByEntityId(entityModalData.id,)

	const {
		mutateAsync: deleteEntityDocuments,
	} = useDeleteDocumentsByIds(entityModalData.portfolioId ?? entityModalData.portfolioDraftId ?? '',)

	const [existedDocuments, setExistedDocuments,] = React.useState<Array<IDocument>>([],)
	const [firstStepOpen, setFirstStepOpen,] = React.useState<boolean>(false,)
	const [secondStepOpen, setSecondStepOpen,] = React.useState<boolean>(false,)
	const [thirdStepOpen, setThirdStepOpen,] = React.useState<boolean>(false,)
	const [forthStepOpen, setForthStepOpen,] = React.useState<boolean>(false,)
	const [isDocumentsChanged, setIsDocumentsChanged,] = React.useState<boolean>(false,)

	const initialValues: EntityFormValues = {
		name:                    entityModalData.name,
		authorizedSignatoryName: entityModalData.authorizedSignatoryName,
		email:                   entityModalData.email ?? '',
		firstName:               entityModalData.firstName ?? '',
		lastName:                entityModalData.lastName ?? '',
		country:                 {
			label: entityModalData.country,
			value: entityModalData.country,
		},
	}

	const [formState, setFormState,] = React.useState<EntityFormValues>(initialValues,)

	const handleSubmit = async(values: EntityFormValues, form: FormApi<EntityFormValues, Partial<EntityFormValues>>,): Promise<void> => {
		const updatedEntityData = {
			...values,
			country: values.country?.value ?? undefined,
			id:      entityModalData.id,
		}

		if (updatedEntityData.firstName === '') {
			delete updatedEntityData.firstName
		}
		if (updatedEntityData.lastName === '') {
			delete updatedEntityData.lastName
		}
		if (updatedEntityData.email === '') {
			delete updatedEntityData.email
		}

		const newEntity = await editEntity(updatedEntityData,)

		const existedDocumentIds = existedDocuments.map((doc,) => {
			return doc.id
		},)
		const documentsToDelete = entityDocs?.
			filter((doc,) => {
				return !existedDocumentIds.includes(doc.id,)
			},).
			map((doc,) => {
				return doc.id
			},)
		if (documentsToDelete?.length) {
			await deleteEntityDocuments({
				id: documentsToDelete,
			},)
		}
		if (documents.length > 0) {
			await Promise.all(documents.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('entityId', newEntity.id,)
				await createEntityDocument(formData,)
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

	React.useEffect(() => {
		if (entityDocs) {
			setExistedDocuments(entityDocs,)
		}
	}, [entityDocs,],)
	React.useEffect(() => {
		setIsDocumentsChanged(existedDocuments.length !== entityDocs?.length,)
		if (documents.length > 0) {
			setIsDocumentsChanged(true,)
		}
	}, [existedDocuments,entityDocs,documents,],)
	const isFormChanged = !isDeepEqual<EntityFormValues>(formState, initialValues,) || isDocumentsChanged

	return (
		<Form<EntityFormValues>
			onSubmit={handleSubmit}
			validate={validateAddEntityForm}
			initialValues={formState}
			render={({
				handleSubmit,
				submitting,
				hasValidationErrors,
				values,
				form,
			},) => {
				const clearBtnDisabled = Object.values(values,).every((field,) => {
					return !Boolean(field,)
				},)

				return (
					<form className={styles.container} onSubmit={handleSubmit}>
						<h3 className={styles.header}>Edit entity</h3>
						<div className={styles.fieldsContainer}>
							<div className={styles.editFormEntityWrapper}>
								<div className={styles.title}>
									<FolderOpenIcon width={16} height={16}/>
									<p className={styles.entityName}>{portfolioName}</p>
									{values.name && (
										<>
											<p>/</p>
											<p className={styles.entityName}>{values.name}</p>
										</>
									)}
								</div>
								<FormCollapse
									title='Entity information'
									info={[values.name, values.country?.value,]}
									isOpen={firstStepOpen}
									onClose={setFirstStepOpen}
								>
									<FormField
										name='name'
										placeholder='Entity name'
										value={formState.name}
										onChange={(e,) => {
											setFormState({
												...values, name: e.target.value,
											},)
										}}
									/>
									<SelectField
										name='country'
										placeholder='Select country'
										isMulti={false}
										options={countriesOptions}
										leftIcon={<Flag width={18} height={18} />}
										isSearchable
										value={formState.country}
										onChange={(e: SelectValueType,) => {
											if (e && !Array.isArray(e,)) {
												setFormState({
													...values, country: {
														value: (e as IOptionType<string>).value,
														label: (e as IOptionType<string>).label,
													} ,
												},)
											}
										}}
									/>
								</FormCollapse>
								<FormCollapse
									title='Authorized signatory'
									info={[values.authorizedSignatoryName,]}
									isOpen={secondStepOpen}
									onClose={setSecondStepOpen}
								>
									<FormField
										name='authorizedSignatoryName'
										placeholder='Authorized signatory name'
										value={formState.authorizedSignatoryName}
										onChange={(e,) => {
											setFormState({
												...values, authorizedSignatoryName: e.target.value,
											},)
										}}
									/>
								</FormCollapse>
								<FormCollapse
									title='Client’s authorized person'
									info={[`${values.firstName ?? ''} ${values.lastName ?? ''}`, values.email ?? '',]}
									isOpen={thirdStepOpen}
									onClose={setThirdStepOpen}
								>
									<FormField
										name='firstName'
										placeholder='First name'
										value={formState.firstName ?? ''}
										onChange={(e,) => {
											setFormState({
												...values, firstName: e.target.value || null,
											},)
										}}
									/>
									<FormField
										name='lastName'
										placeholder='Last name'
										value={formState.lastName ?? ''}
										onChange={(e,) => {
											setFormState({
												...values, lastName: e.target.value || null,
											},)
										}}
									/>
									<FormField
										name='email'
										placeholder='Email'
										value={formState.email ?? ''}
										onChange={(e,) => {
											setFormState({
												...values,
												email: e.target.value || null,
											},)
										}}
										validate={values.email?.trim() ?
											email :
											undefined}
									/>
								</FormCollapse>
								<FormCollapse
									title='Documents'
									info={[`${existedDocuments.length + documents.length} files attached`,]}
									isOpen={forthStepOpen}
									onClose={setForthStepOpen}
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
								<Button<ButtonType.TEXT>
									onClick={() => {
										setFormState(initialValues,)
										Object.keys(values,).forEach((key,) => {
											form.resetFieldState(key as keyof EntityFormValues,)
										},)
										if (entityDocs) {
											setExistedDocuments(entityDocs,)
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
									disabled={Boolean(submitting || hasValidationErrors || !isFormChanged,)}
									type='submit'
									additionalProps={{
										btnType: ButtonType.TEXT,
										text:    'Save edits',
										size:    Size.MEDIUM,
									}}
								/>
							</div>
						</div>
					</form>
				)
			}
			}
		/>
	)
}