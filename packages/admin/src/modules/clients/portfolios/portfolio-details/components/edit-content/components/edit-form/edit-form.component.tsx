/* eslint-disable complexity */
import React, {
	useEffect,
} from 'react'
import * as styles from './edit-form.styles'
import {
	Button,
	ButtonType,
	Color,
	DocumentManager,
	FormField,
	SelectField,
	Size,
} from '../../../../../../../../shared/components'
import {
	CollapseArrowIcon,
	DeleteBucketIcon,
	DocsIcon,
	Flag,
	PortfolioTypeIcon,
	Refresh,
} from '../../../../../../../../assets/icons'
import {
	maxLengthValidator, required, requiredSelect, alphanumericValidator,
} from '../../../../../../../../shared/utils/validators'
import {
	composeValidators,
} from '../../../../../../../../shared/utils'
import {
	portfolioTypesArray,
} from '../../../../../../../clients/portfolios/portfolio/components/drawer-content/components/form-portfolio'
import {
	useDocumentStore,
} from '../../../../../../../../store/document.store'
import {
	Form,
} from 'react-final-form'
import type {
	IPortfolioEditFormValues,
} from './edit-form.types'
import {
	validateEditPortfolio,
} from './edit-form.types'
import type {
	IPortfolio,
} from '../../../../../../../../shared/types'
import type {
	IDocument,
} from '../../../../../../../../shared/types'
import {
	cx,
} from '@emotion/css'
import {
	useGetDocumentTypes,
} from '../../../../../../../../shared/hooks/list-hub'
import {
	usePortfolioActivate,
} from '../../../../../../../../shared/hooks/portfolio'
import {
	ReactComponent as FolderIcon,
} from '../../../../../../../../assets/icons/folder-open-icon.svg'
import {
	useGetPortfolioDetails,
} from '../../../../../../../../shared/hooks'
import {
	useCreateDocument,
} from '../../../../../../../../shared/hooks'
import {
	DocumentTypes,
} from '../../../../../../../../shared/types'
import {
	filteredCountries,
} from '../../../../../../../../shared/constants'

interface IEditPortfolioFromProps {
	portfolio: IPortfolio
	onClose: () => void
}

export const EditPortfolioForm: React.FunctionComponent<IEditPortfolioFromProps> = ({
	portfolio,onClose,
},) => {
	const [isInformationOpened, setIsInformationOpened,] = React.useState<boolean>(false,)
	const [isResidentsOpened, setIsResidentsOpened,] = React.useState<boolean>(false,)
	const [isDocumentsOpened, setIsDocumentsOpened,] = React.useState<boolean>(false,)
	const [existedDocumentList, setExistedDocumentList,] = React.useState<Array<IDocument>>([],)
	const [isDocumentsChanged, setIsDocumentsChanged,] = React.useState<boolean>(false,)
	// todo: Remove after refactor asset logic approved
	// const {
	// 	setMutatedPortfolioIds,
	// } = usePortfolioStateStore()
	const {
		data: mainPortfolio,
	} = useGetPortfolioDetails(portfolio.mainPortfolioId ?? '',)
	const {
		documents, addDocument, removeDocument, clearDocuments,
	} = useDocumentStore()
	useEffect(() => {
		setExistedDocumentList(portfolio.documents,)
	}, [portfolio,],)
	React.useEffect(() => {
		return () => {
			clearDocuments()
		}
	}, [],)
	useEffect(() => {
		setIsDocumentsChanged(existedDocumentList.length !== portfolio.documents.length,)
		if (documents.length > 0) {
			setIsDocumentsChanged(true,)
		}
	}, [existedDocumentList,portfolio.documents,documents,],)
	const {
		data: documentTypes,
	} = useGetDocumentTypes()
	const {
		mutateAsync: updatePortfolio,
	} = usePortfolioActivate(portfolio.id,)

	const {
		mutateAsync: createDocument,
	} = useCreateDocument(DocumentTypes.PORTFOLIO, portfolio.id,)

	const handleInformaionCondition = (): void => {
		setIsInformationOpened(!isInformationOpened,)
	}
	const handleResidentCondition = (): void => {
		setIsResidentsOpened(!isResidentsOpened,)
	}
	const handleDocumentCondition = (): void => {
		setIsDocumentsOpened(!isDocumentsOpened,)
	}
	const countriesArray = filteredCountries.map((name,) => {
		return {
			value: name,
			label: name,
		}
	},)
	const handleSubmit = async(values: IPortfolioEditFormValues,): Promise<void> => {
		const oldDocumentsIds = existedDocumentList.map((document,) => {
			return document.id
		},)
		// setMutatedPortfolioIds(portfolio.id,)
		await updatePortfolio({
			...values,
			type:        values.type?.value,
			resident:    values.resident?.label ?? '',
			taxResident: values.taxResident?.label ?? '',
			id:          portfolio.id,
			oldDocumentsIds,
		},)
		const uploadDocuments = documents.map(async(document,) => {
			const formData = new FormData()
			formData.append('file', document.file,)
			formData.append('type', document.documentType,)
			formData.append('portfolioId', portfolio.id,)
			await createDocument(formData,)
		},)
		await Promise.all(uploadDocuments,)
		clearDocuments()
		onClose()
	}
	const updatedDocumentTypes = documentTypes?.map((type,) => {
		return {
			label: type.name,
			value: type.name,
		}
	},)

	const handleDeleteExistedDocument = (id: string,): void => {
		setExistedDocumentList((prev,) => {
			return prev.filter((item,) => {
				return item.id !== id
			},)
		},
		)
	}
	return (
		<div className={styles.mainWrapper}>
			{portfolio.mainPortfolioId ?
				<p className={styles.portfolioName}><FolderIcon width={16} height={16}/> <span className={styles.portfolioNameText}>{mainPortfolio?.name} / {portfolio.name}</span></p> :
				<p className={styles.portfolioName}><FolderIcon width={16} height={16}/> <span className={styles.portfolioNameText}>{portfolio.name}</span></p>}
			<Form<IPortfolioEditFormValues>
				onSubmit={handleSubmit}
				validate={validateEditPortfolio}
				render={({
					handleSubmit,
					form,
					pristine,
					hasValidationErrors,
				},) => {
					return (
						<form onSubmit={handleSubmit} className={styles.formWrapper}>
							<div className={styles.collapseBlock(isInformationOpened,)}>
								<div className={styles.collapseHeaderBlock}>
									<div>
										<p className={styles.topInfoText}>Portfolio information</p>
										<p className={styles.bottomInfoText}>{portfolio.name} ({portfolio.type})</p>
									</div>
									<button className={styles.collapseArrowButton(isInformationOpened,)} type='button' onClick={handleInformaionCondition}>
										<CollapseArrowIcon/>
									</button>
								</div>
								<div className={styles.fieldsBlock(isInformationOpened,)}>
									<FormField
										validate={composeValidators(required, maxLengthValidator(50,),alphanumericValidator,)}
										name='name'
										placeholder='Portfolio name'
										initiaValue={portfolio.name}
									/>
									<SelectField
										validate={requiredSelect}
										name='type'
										placeholder='Select portfolio type'
										isMulti={false}
										options={portfolioTypesArray}
										isBadges={true}
										leftIcon={<PortfolioTypeIcon width={18} height={18} />}
										initialValue={portfolioTypesArray.find((option,) => {
											return option.value === portfolio.type
										},)}
									/>
								</div>
							</div>

							<div className={styles.collapseBlock(isResidentsOpened,)}>
								<div className={styles.collapseHeaderBlock}>
									<div>
										<p className={styles.topInfoText}>Residency information</p>
										<p className={styles.bottomInfoText}>{portfolio.resident} {portfolio.taxResident && <span>({portfolio.taxResident})</span>}</p>
									</div>
									<button className={styles.collapseArrowButton(isResidentsOpened,)} type='button' onClick={handleResidentCondition}>
										<CollapseArrowIcon/>
									</button>
								</div>
								<div className={styles.fieldsBlock(isResidentsOpened,)}>
									<SelectField
										name='resident'
										placeholder='Select resident'
										isSearchable
										isMulti={false}
										options={countriesArray}
										leftIcon={<Flag width={18} height={18} />}
										initialValue={countriesArray.find((option,) => {
											return option.label === portfolio.resident
										},)}
									/>
									<SelectField
										name='taxResident'
										placeholder='Select tax resident'
										isSearchable
										isMulti={false}
										options={countriesArray}
										leftIcon={<Flag width={18} height={18} />}
										initialValue={countriesArray.find((option,) => {
											return option.label === portfolio.taxResident
										},)}
									/>
								</div>
							</div>
							<div className={cx(styles.collapseBlock(isDocumentsOpened,), styles.documentWrapper(isDocumentsOpened,),)}>
								<div className={styles.collapseHeaderBlock}>
									<div>
										<p className={styles.topInfoText}>Documents</p>
										<p className={styles.bottomInfoText}>{[...existedDocumentList, ...documents,].length} files attached</p>
									</div>
									<button className={styles.collapseArrowButton(isDocumentsOpened,)} type='button' onClick={handleDocumentCondition}>
										<CollapseArrowIcon/>
									</button>
								</div>
								<div className={styles.fieldsBlock(isDocumentsOpened,)}>
									{existedDocumentList.length > 0 && (
										<div className={styles.oldDocBlock}>
											{existedDocumentList.map((doc, index,) => {
												const docTypeLabel =
																	updatedDocumentTypes?.find((type,) => {
																		return type.value === doc.type
																	},)?.label ?? 'Unknown'
												return (
													<div key={index} className={styles.oldDoc}>
														<div className={styles.oldDocLeft}>
															<DocsIcon className={styles.docsIcon} />
															<div className={styles.oldDocTextBlock}>
																<span className={styles.oldDocTextType}>{docTypeLabel}</span>
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
								</div>
							</div>
							<div className={styles.editPortfolioFooter}>
								<Button<ButtonType.TEXT>
									type='button'
									disabled={!isDocumentsChanged && (pristine || hasValidationErrors)}
									onClick={() => {
										form.reset()
										clearDocuments()
										// todo: Remove after check
										// if (mainPortfolio) {
										// 	setExistedDocumentList(mainPortfolio.documents,)
										// }
										setExistedDocumentList(portfolio.documents,)

										setIsDocumentsChanged(false,)
									}}
									additionalProps={{
										btnType:     ButtonType.TEXT,
										text:        'Clear',
										size:        Size.MEDIUM,
										color:       Color.SECONDRAY_GRAY,
										leftIcon: <Refresh width={20} height={20} />,
									}}
								/>
								<Button<ButtonType.TEXT>
									type='submit'
									disabled={!isDocumentsChanged && (pristine || hasValidationErrors)}
									additionalProps={{
										btnType: ButtonType.TEXT,
										text:    'Save edits',
										size:    Size.MEDIUM,
									}}
								/>
							</div>
						</form>
					)
				}}
			/>

		</div>
	)
}
