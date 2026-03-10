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
	cx,
} from '@emotion/css'

import {
	AddCustomField,
	Button,
	ButtonType,
	Color,
	CustomDatePickerField,
	DocumentManager,
	FormCollapse,
	FormField,
	FormTextArea,
	SelectField,
	Size,
} from '../../../../shared/components'
import {
	BankSelect,
	Briefcase,
	ClientsRoute,
	DeleteBucketIcon,
	DocsIcon,
	EntitySelect,
	Refresh,
} from '../../../../assets/icons'
import {
	useTransactionById, useUpdateTransaction,
} from '../../../../shared/hooks/transaction'
import {
	useAccountsByBankId,
	useBanksByEntityId,
	useCashCurrencyAnalytics,
	useCreateDocument,
	useCreateIsin,
	useCreateServiceProvidersListItem,
	useCreateTransactionCategoryDependency,
	useDeleteDocumentsByIds,
	useEntityListByPortfolioId,
	useGetBudgetPlanById,
	useGetDocumentsByTransactionId,
	useGetDocumentTypes,
	useGetEmissionsIsins,
	useGetEncryptedServiceProvidersList,
	useGetEquityStocksIsins,
	useGetExpenseCategoriesByBudgetId,
	useGetSecurityByIsin,
	useGetTransactionTypeList,
	useOrdersList,
} from '../../../../shared/hooks'
import {
	useClientsList,
} from '../../../clients/client-profiles/clients/hooks'
import {
	usePortfolioListByClientId,
} from '../../../../shared/hooks/portfolio'
import {
	useDocumentStore,
} from '../../../../store/document.store'
import {
	validateTransactionForm,
} from '../transaction.validator'
import {
	formatAmountValidator, requiredSelect, validateDate,
} from '../../../../shared/utils/validators'
import type {
	CurrencyList,
	IDocument, IOptionType, ITransaction,
} from '../../../../shared/types'
import {
	AssetNamesType, DocumentTypes,
} from '../../../../shared/types'
import type {
	LinkedTransactionOrderType, LinkedTransactionType, TransactionFormValues,
} from '../transaction.types'
import {
	isDeepEqual, localeString,
} from '../../../../shared/utils'
import {
	formatValues,
	getAccountDetails,
	getTransactionDetails,
	getTransactionFormInitialValues,
	initialFormValues,
} from '../transaction.utils'
import {
	numbersRegex,
} from '../../../../shared/constants/regexes.constants'
import {
	CreatebleSelectEnum,
} from '../../../../shared/constants'
import type {
	TEditTransactionProps,
} from '../../../../shared/types'
import * as styles from '../transactions.styles'

type Props = {
	onClose: () => void
	transactionId?: number
	setTransactionList?: React.Dispatch<React.SetStateAction<Array<ITransaction>>>
}

export const EditTransaction: React.FC<Props> = ({
	onClose,
	transactionId,
	setTransactionList,
},) => {
	const [transactionForm, setTransactionForm,] = React.useState<TransactionFormValues>(initialFormValues,)
	const [currentBalance, setCurrentBalance,] = React.useState(0,)
	const [currentBudgetId, setCurrentBudgetId,] = React.useState<string | undefined>()
	const [firstStepOpen, setFirstStepOpen,] = React.useState(false,)
	const [secondStepOpen, setSecondStepOpen,] = React.useState(false,)
	const [thirdStepOpen, setThirdStepOpen,] = React.useState(false,)
	const [existedDocuments, setExistedDocuments,] = React.useState<Array<IDocument>>([],)
	const {
		mutateAsync: createIsin,
		isPending: isinAddLoading,
	} = useCreateIsin()
	const {
		data: transaction,
	} = useTransactionById(transactionId,)
	const {
		mutateAsync: updateTransaction,
		isPending: isTransactionUpdating,
	} = useUpdateTransaction()
	const {
		documents, addDocument, removeDocument, clearDocuments,
	} = useDocumentStore()
	const {
		mutateAsync: createDocument,
		isPending: isCreateDocumentsPending,
	} = useCreateDocument(DocumentTypes.TRANSACTION,)
	const {
		mutateAsync: deleteDocuments,
		isPending: isDeleteDocumentsPending,
	} = useDeleteDocumentsByIds(transactionId,)
	const {
		data: transactionDocs,
	} = useGetDocumentsByTransactionId(transactionId,)
	const {
		data: documentTypes,
	} = useGetDocumentTypes()
	const {
		data: orderList,
	} = useOrdersList()
	const {
		data: clientList,
	} = useClientsList()
	const {
		data: portfolioList,
	} = usePortfolioListByClientId(transactionForm.clientId?.value.id,)
	const {
		data: entityList,
	} = useEntityListByPortfolioId(transactionForm.portfolioId?.value.id ?? '',)
	const {
		data: bankList,
	} = useBanksByEntityId(transactionForm.entityId?.value.id ?? '',)
	const {
		data: accountList,
	} = useAccountsByBankId(transactionForm.bankId?.value.id ?? '',)
	const {
		data: currencyData,
	} = useCashCurrencyAnalytics({
		type:       AssetNamesType.CASH,
		accountIds: transactionForm.accountId ?
			[transactionForm.accountId.value.id,] :
			undefined,
		transactionCreation: true,
	},)
	const {
		data: budget,
	} = useGetBudgetPlanById(currentBudgetId ?? '',)
	const {
		data: emissionsIsinList,
	} = useGetEmissionsIsins()
	const {
		data: stockIsinList,
	} = useGetEquityStocksIsins()
	const {
		data: security, isFetching: isFetchingSecurity,
	} = useGetSecurityByIsin(transactionForm.isin?.value ?? '',)
	const {
		data: serviceProviderList,
	} = useGetEncryptedServiceProvidersList()
	const {
		data: transactionTypeList,
	} = useGetTransactionTypeList()
	const {
		data: expenseCategories,
	} = useGetExpenseCategoriesByBudgetId({
		id:       currentBudgetId ?? '',
		isYearly: true,
	},)
	const {
		mutateAsync: createTransactionCategoryDependency,
	} = useCreateTransactionCategoryDependency()
	const {
		mutateAsync: addServiceProviderItem,
		isPending: serviceAddLoading,
	} = useCreateServiceProvidersListItem()
	const handleCreateServiceProvider = async(name: string,): Promise<void> => {
		await addServiceProviderItem({
			name,
		},)
	}
	const handleCreateIsin = async(isin: string,): Promise<void> => {
		if (transactionForm.currency) {
			await createIsin({
				name:     isin,
				currency: transactionForm.currency.value as CurrencyList,
			},)
		}
	}
	React.useEffect(() => {
		if (transaction) {
			setTransactionForm(getTransactionFormInitialValues(transaction,),)
		}
	}, [transaction,],)

	React.useEffect(() => {
		if (transactionDocs) {
			setExistedDocuments(transactionDocs,)
		}
	}, [transactionDocs,],)

	React.useEffect(() => {
		return () => {
			clearDocuments()
		}
	}, [],)

	React.useEffect(() => {
		if (transactionForm.clientId) {
			const client = clientList?.list.find((el,) => {
				return el.id === transactionForm.clientId?.value.id
			},)

			if (client?.budgetPlan) {
				setCurrentBudgetId(client.budgetPlan.id,)
			}
		}
	}, [transactionForm.clientId,],)

	React.useEffect((() => {
		setCurrentBalance(0,)
		if (currencyData?.length) {
			const balance = currencyData.find((el,) => {
				return el.currency === transactionForm.currency?.value
			},)?.currencyValue
			if (balance) {
				setCurrentBalance(balance,)
			}
		}
	}), [transactionForm.currency,],)

	const initialValues = React.useMemo(() => {
		return getTransactionFormInitialValues(transaction,)
	}, [transaction,],)

	const orderOptions = orderList?.list.map((order,) => {
		const displayName = `${order.id} (${order.type})`
		return {
			label: displayName,
			value: {
				id:   order.id,
				name: displayName,
			},
		}
	},) ?? []

	const clientOptions = clientList?.list
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

	const portfolioOptions = portfolioList?.map((portfolio,) => {
		return {
			label: portfolio.name,
			value: {
				id:   portfolio.id,
				name: portfolio.name,
			},
		}
	},) ?? []

	const entityOptions = entityList?.map((entity,) => {
		return {
			label: entity.name,
			value: {
				id:   entity.id,
				name: entity.name,
			},
		}
	},) ?? []

	const bankOptions = bankList?.map((bank,) => {
		return {
			label: `${bank.bankName} (${bank.branchName})`,
			value: {
				id:       bank.id,
				name:     bank.bankName,
				entityId: bank.entityId,
			},
		}
	},) ?? []

	const accountOptions = accountList?.map((account,) => {
		return {
			label: account.accountName,
			value: {
				id:   account.id,
				name: account.accountName,
			},
		}
	},) ?? []

	const transactionTypeOptions = transactionTypeList?.map((type,) => {
		return {
			label: type.name,
			value: {
				id:       type.id,
				name:     type.name,
				category: type.category,
				cashFlow: type.cashFlow,
			},
		}
	},) ?? []

	const isinOptions = emissionsIsinList && stockIsinList ?
		[...emissionsIsinList, ...stockIsinList,].map((isin,) => {
			return {
				value: isin,
				label: isin,
			}
		},) :
		[]

	const serviceProviderOptions = serviceProviderList?.map((option,) => {
		return {
			value: option.value,
			label: option.label,
		}
	},) ?? []

	const expenseCategoryOptions = expenseCategories?.map((category,) => {
		return {
			label: category.name,
			value: {
				id:   category.id,
				name: category.name,
			},
		}
	},) ?? []

	const updatedDocumentTypes = documentTypes?.map((type,) => {
		return {
			label: type.name,
			value: type.name,
		}
	},)

	const handleSubmit = async(
		data: TransactionFormValues,
		form: FormApi<TransactionFormValues, Partial<TransactionFormValues>>,
	): Promise<void> => {
		if (!transaction) {
			return
		}

		const updatedTransaction = {
			id:       transaction.id,
			security: security ?
				String(security,) :
				undefined,
			...formatValues(data,),
		} as TEditTransactionProps

		// if (updatedTransaction.comment === '') {
		// 	delete updatedTransaction.comment
		// }

		if (updatedTransaction.comment === '') {
			updatedTransaction.comment = null
		}
		if (updatedTransaction.isin === undefined) {
			updatedTransaction.isin = null
		}
		if (updatedTransaction.security === undefined) {
			updatedTransaction.security = null
		}
		if (updatedTransaction.orderId === undefined) {
			updatedTransaction.orderId = null
		}
		if (updatedTransaction.expenseCategory === undefined) {
			updatedTransaction.expenseCategory = null
		}

		const newTransaction = await updateTransaction(updatedTransaction,)

		setTransactionList?.((prev,) => {
			return prev.map((item,) => {
				return item.id === newTransaction.id ?
					newTransaction :
					item
			},)
		},)

		const existedDocumentIds = existedDocuments.map((doc,) => {
			return doc.id
		},)

		const documentsToDelete = transactionDocs?.
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
				formData.append('transactionId', `${newTransaction.id}`,)
				await createDocument(formData,)
			},),)
		}
		if (data.expenseCategory) {
			await createTransactionCategoryDependency({
				expenseCategoryId: data.expenseCategory.value.id,
				transactionId:     transaction.id,
			},)
		}
		onClose()
		form.reset()
		clearDocuments()
		setTransactionForm(initialFormValues,)
	}

	const handleDeleteExistedDocument = (id: string,): void => {
		setExistedDocuments((docs,) => {
			return docs.filter((item,) => {
				return item.id !== id
			},)
		},
		)
	}

	const hasAdditionalErrors = React.useMemo(() => {
		return (!transactionForm.amount?.trim() && !transactionForm.comment?.trim())
	}, [transactionForm.amount, transactionForm.comment,],)

	const [resetKey, setResetKey,] = React.useState(0,)

	return (
		<Form<TransactionFormValues>
			onSubmit={handleSubmit}
			validate={validateTransactionForm}
			initialValues={transactionForm}
			render={({
				handleSubmit,
				submitting,
				values,
				hasValidationErrors,
				form,
			},) => {
				const isPending = submitting || isTransactionUpdating || isDeleteDocumentsPending || isCreateDocumentsPending
				let formChanged = documents.length !== 0 || transactionDocs?.length !== existedDocuments.length
				const objKeys = Object.keys(initialValues,)
				objKeys.forEach((el,) => {
					if (!isDeepEqual(initialValues[el as keyof TransactionFormValues], values[el as keyof TransactionFormValues],)) {
						formChanged = true
					}
				},)
				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Edit transaction</h3>
						<div className={styles.fieldsContainer(
							(firstStepOpen && (secondStepOpen || thirdStepOpen)) ||
							(secondStepOpen || thirdStepOpen),
						)}>
							<div className={styles.editFormWrapper}>
								<FormCollapse
									title='Client information'
									info={[getAccountDetails(values,),]}
									isOpen={firstStepOpen}
									onClose={setFirstStepOpen}
								>
									<div className={cx(styles.addInputBlock, styles.paddingNone,)}>
										<SelectField<LinkedTransactionType>
											name='clientId'
											isDisabled={!clientList}
											placeholder='Select client'
											leftIcon={<ClientsRoute width={18} height={18} />}
											options={clientOptions}
											onChange={(select,) => {
												if (select && !Array.isArray(select,)) {
													setTransactionForm({
														...values,
														portfolioId: undefined,
														entityId:    undefined,
														accountId:   undefined,
														bankId:      undefined,
														currency:    undefined,
														clientId:    select as IOptionType<LinkedTransactionType>,
													},)
												}
											}}
											value={transactionForm.clientId}
											isSearchable
										/>
										<SelectField<LinkedTransactionType>
											name='portfolioId'
											placeholder='Select portfolio or sub-portfolio'
											leftIcon={<Briefcase width={18} height={18} />}
											isDisabled={!portfolioList}
											options={portfolioOptions}
											isSearchable
											onChange={(select,) => {
												if (select && !Array.isArray(select,)) {
													setTransactionForm({
														...values,
														entityId:    undefined,
														bankId:      undefined,
														accountId:   undefined,
														currency:    undefined,
														portfolioId: select as IOptionType<LinkedTransactionType>,
													},)
												}
											}}
											value={transactionForm.portfolioId}
										/>
										<SelectField<LinkedTransactionType>
											name='entityId'
											placeholder='Select entity'
											leftIcon={<EntitySelect width={18} height={18} />}
											isDisabled={!entityList}
											options={entityOptions}
											isSearchable
											onChange={(select,) => {
												if (select && !Array.isArray(select,)) {
													setTransactionForm({
														...values,
														bankId:    undefined,
														accountId: undefined,
														currency:  undefined,
														entityId:  select as IOptionType<LinkedTransactionType>,
													},)
												}
											}}
											value={transactionForm.entityId}
										/>
										<SelectField<LinkedTransactionType>
											name='bankId'
											placeholder='Select bank'
											leftIcon={<BankSelect width={18} height={18} />}
											isDisabled={!bankList}
											options={bankOptions}
											isSearchable
											onChange={(select,) => {
												if (select && !Array.isArray(select,)) {
													setTransactionForm({
														...values,
														accountId: undefined,
														currency:  undefined,
														bankId:    select as IOptionType<LinkedTransactionType>,
													},)
												}
											}}
											value={transactionForm.bankId}
										/>
										<SelectField<LinkedTransactionType>
											name='accountId'
											placeholder='Select bank account'
											leftIcon={<BankSelect width={18} height={18} />}
											isDisabled={!accountList}
											options={accountOptions}
											isSearchable
											onChange={(select,) => {
												if (select && !Array.isArray(select,)) {
													setTransactionForm({
														...values,
														currency:  undefined,
														accountId: select as IOptionType<LinkedTransactionType>,
													},)
												}
											}}
											value={transactionForm.accountId}
										/>
										<div>
											<div className={styles.flexSpaceBetween}>
												<div className={styles.fieldTitle}>Currency</div>
												<div className={styles.amountBalance}>Balance: <span
													className={cx(styles.amountBalance, `${currentBalance >= 0 ?
														styles.textColorGreen :
														styles.textColorRed}`,)}>{localeString(currentBalance, '', 2, true,)}
												</span>
												</div>
											</div>
											<SelectField
												name='currency'
												placeholder='Select currency'
												isMulti={false}
												options={currencyData ?
													currencyData.map((el,) => {
														return {
															value: el.currency, label: el.currency,
														}
													},) :
													[]}
												validate={requiredSelect}
												isSearchable
												isDisabled={!transactionForm.accountId}
												onChange={(value,) => {
													setTransactionForm({
														...values,
														currency: value as IOptionType,
													},)
												}}
											/>
										</div>
									</div>
								</FormCollapse>
								<FormCollapse
									title='Transaction information'
									info={[getTransactionDetails(values,),]}
									isOpen={secondStepOpen}
									onClose={setSecondStepOpen}
								>
									<div className={cx(styles.addInputBlock, styles.paddingNone,)}>
										<div>
											<div className={styles.fieldTitle}>Transaction date</div>
											<CustomDatePickerField
												name='transactionDate'
												validate={validateDate}
												key={`date-${resetKey}`}
											/>
										</div>
										<div>
											<div className={styles.flexSpaceBetween}>
												<div className={styles.fieldTitle}>Amount</div>
												<div className={styles.amountBalance}>Balance: <span
													className={cx(styles.amountBalance, `${currentBalance >= 0 ?
														styles.textColorGreen :
														styles.textColorRed}`,)}>{localeString(currentBalance, '', 2, true,)}
												</span>
												</div>
											</div>
											<FormField
												name='amount'
												placeholder='Enter amount'
												validate={formatAmountValidator}
												onChange={(e,) => {
													let amount = e.target.value.replace(numbersRegex, '',)
													if (amount) {
														const numericValue = amount.replace(/,/g, '',)

														if (numericValue.includes('.',)) {
															const [whole, decimal,] = numericValue.split('.',)
															const limitedDecimal = decimal?.slice(0, 2,)
															amount = `${Number(whole,).toLocaleString('en-US',)}.${limitedDecimal}`
														} else {
															amount = Number(numericValue,).toLocaleString('en-US',)
														}
													}
													setTransactionForm({
														...values,
														amount,
													},)
												}}
												value={transactionForm.amount ?? ''}
											/>
										</div>
										<div>
											<div className={styles.fieldTitle}>Transaction Name</div>
											<SelectField<LinkedTransactionType>
												name='transactionTypeId'
												placeholder='Select name'
												options={transactionTypeOptions}
												value={transactionForm.transactionTypeId}
												isSearchable
												onChange={(select,) => {
													if (select && !Array.isArray(select,)) {
														setTransactionForm({
															...values,
															transactionTypeId: select as IOptionType<LinkedTransactionType>,
														},)
													}
												}}
											/>
										</div>
										<div>
											<div className={styles.fieldTitle}>Order (optional)</div>
											<SelectField<LinkedTransactionOrderType>
												name='orderId'
												isDisabled={!orderList}
												placeholder='Select order ID'
												options={orderOptions}
												onChange={(select,) => {
													if (select && !Array.isArray(select,)) {
														setTransactionForm({
															...values,
															orderId: select as IOptionType<LinkedTransactionOrderType>,
														},)
													} else {
														setTransactionForm({
															...values,
															orderId: undefined,
														},)
													}
												}}
												value={transactionForm.orderId}
												isSearchable
												isClearable
											/>
										</div>
										<div>
											<div className={styles.fieldTitle}>ISIN (optional)</div>
											<SelectField
												name='isin'
												placeholder='Select ISIN'
												isMulti={false}
												options={isinOptions}
												isSearchable
												onChange={(value,) => {
													if (value && !Array.isArray(value,)) {
														setTransactionForm({
															...values,
															isin: value as IOptionType,
														},)
													} else {
														setTransactionForm({
															...values,
															isin: undefined,
														},)
													}
												}}
												isCreateble
												createbleStatus={CreatebleSelectEnum.ISIN}
												createFn={handleCreateIsin}
												isLoading={isinAddLoading}
												isClearable
											/>
										</div>
										<div>
											<div className={styles.fieldTitle}>Security</div>
											<FormField
												name='security'
												placeholder='Security'
												value={isFetchingSecurity ?
													'Loading...' :
													(security ?? '')}
												disabled
											/>
										</div>
										<div>
											<div className={styles.fieldTitle}>Service provider</div>
											<SelectField
												name='serviceProvider'
												placeholder='Enter here'
												isMulti={false}
												options={serviceProviderOptions}
												validate={requiredSelect}
												isSearchable
												isCreateble
												createbleStatus={CreatebleSelectEnum.SERVICE_PROVIDERS}
												onChange={(value,) => {
													setTransactionForm({
														...values,
														serviceProvider: value as IOptionType,
													},)
												}}
												createFn={handleCreateServiceProvider}
												isLoading={serviceAddLoading}
											/>
										</div>
										<div>
											{budget ?
												<div className={styles.fieldTitle}>{budget.name} - Expense category (optional)</div> :
												<div className={styles.fieldTitle}>Expense category (optional)</div>
											}
											<SelectField<LinkedTransactionType>
												name='expenseCategory'
												placeholder='Select Expense category'
												// isDisabled={expenseCategoryOptions.length === 0}
												isMulti={false}
												options={expenseCategoryOptions}
												isSearchable
												isClearable
												tabIndex={0}
												onChange={(value,) => {
													if (value && !Array.isArray(value,)) {
														setTransactionForm({
															...values,
															expenseCategory: value as IOptionType<LinkedTransactionType>,
														},)
													} else {
														setTransactionForm({
															...values,
															expenseCategory: undefined,
														},)
													}
												}}
											/>
										</div>
										<div>
											<FormTextArea
												label='Comment (optional)'
												name='comment'
												key={`comment-${resetKey}`}
												placeholder='Enter comment'
												className={styles.textAreaStyle}
												onChange={(e,) => {
													setTransactionForm({
														...values,
														comment: e.target.value,
													},)
												}}
												value={transactionForm.comment}
											/>
										</div>
										<div>
											<AddCustomField
												initialValues={transactionForm.customFields ?? []}
												onChange={(newValues,) => {
													setTransactionForm({
														...values,
														customFields: newValues,
													},)
												}}
											/>
										</div>
									</div>
								</FormCollapse>
								<FormCollapse
									title='Documents'
									info={[`${existedDocuments.length + documents.length} files attached`,]}
									isOpen={thirdStepOpen}
									onClose={setThirdStepOpen}
								>
									<div>
										{existedDocuments.length > 0 && (
											<div className={styles.oldDocBlock}>
												{existedDocuments.map((doc, index,) => {
													const docTypeLabel = updatedDocumentTypes?.find((type,) => {
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
										{Boolean(documents.length > 0,) && <div className={styles.newDocumentsText}>New documents:</div>}
										<DocumentManager
											documents={documents}
											addDocument={addDocument}
											removeDocument={removeDocument}
										/>

										<div className={cx(styles.addInputBlock, styles.paddingNone, styles.marginTop16,)}>

										</div>
									</div>
								</FormCollapse>
								<div className={styles.editBtnWrapper}>
									<Button<ButtonType.TEXT>
										onClick={() => {
											setTransactionForm(initialValues,)
											if (transactionDocs) {
												setExistedDocuments(transactionDocs,)
											}
											clearDocuments()
											setResetKey((prev,) => {
												return prev + 1
											},)
										}}
										disabled={!formChanged || isPending}
										additionalProps={{
											btnType:  ButtonType.TEXT,
											text:     'Clear',
											size:     Size.MEDIUM,
											color:    Color.SECONDRAY_GRAY,
											leftIcon: <Refresh />,
										}}
									/>
									<Button<ButtonType.TEXT>
										type='submit'
										disabled={!formChanged || isPending || hasValidationErrors || hasAdditionalErrors || isFetchingSecurity}
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