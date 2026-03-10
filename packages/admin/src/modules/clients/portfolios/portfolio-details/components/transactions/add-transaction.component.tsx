/* eslint-disable max-lines */
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
	BankSelect,
	Briefcase,
	ClientsRoute,
	DeleteBucketIcon,
	DocsIcon,
	EntitySelect,
	WarningIcon,
} from '../../../../../../assets/icons'
import {
	AddCustomField,
	Button,
	ButtonType,
	Color,
	CustomDatePickerField,
	CustomDialog,
	DocumentManager,
	Drawer,
	FormField,
	FormTextArea,
	LabeledProgressBar,
	NextButton,
	PrevButton,
	SelectField,
	Size,
} from '../../../../../../shared/components'
import {
	AddAsset,
} from '../../../portfolio-details/components/asset'
import {
	SaveDraftButton,
} from '../../../../../operations/transactions/components'
import type {
	LinkedTransactionOrderType,
	LinkedTransactionType,
	StepType,
	TransactionFormValues,
} from '../../../../../operations/transactions'
import * as styles from '../../../../../operations/transactions'
import {
	formatValues,
	getTransactionFormSteps,
	initialFormValues,
	validateTransactionForm,
} from '../../../../../operations/transactions'
import {
	useAccountsByBankId,
	useBanksByEntityId,
	useCashCurrencyAnalytics,
	useCreateDocument,
	useCreateIsin,
	useCreateServiceProvidersListItem,
	useCreateTransaction,
	useCreateTransactionCategoryDependency,
	useCreateTransactionDraft,
	useEntityListByPortfolioId,
	useGetEmissionsIsins,
	useGetEquityStocksIsins,
	useGetEquityStocksSecurityByIsin,
	useGetExpenseCategoriesByBudgetId,
	useGetSecurityByIsin,
	useGetServiceProvidersList,
	useGetTransactionTypeList,
	useOrdersListFiltered,
	usePortfolioListByClientId,
} from '../../../../../../shared/hooks'
import {
	useClientsList,
} from '../../../../../clients/client-profiles/clients/hooks'
import {
	formatAmountValidator, requiredSelect, validateDate,
} from '../../../../../../shared/utils/validators'
import {
	localeString,
} from '../../../../../../shared/utils'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	useDocumentStore,
} from '../../../../../../store/document.store'
import type {
	CurrencyList,
	IDocument,
} from '../../../../../../shared/types'
import {
	AssetNamesType, DocumentTypes, type IOptionType, Roles,
} from '../../../../../../shared/types'
import {
	CreatebleSelectEnum,
} from '../../../../../../shared/constants'
import {
	relatedTransactions,
} from '../../../../../operations/transactions/transaction.constants'
import {
	numbersRegex,
} from '../../../../../../shared/constants/regexes.constants'

type Props = {
	clientId: string
	portfolioId: string
	isExitDialogOpen: boolean
	setTransactionId: (id: number) => void
	toggleExitDialogVisible: () => void
	toggleSuccessDialogVisible: () => void
	onClose: (transactionId?: number) => void
}

export const AddTransaction: React.FC<Props> = ({
	clientId,
	portfolioId,
	isExitDialogOpen,
	setTransactionId,
	toggleExitDialogVisible,
	toggleSuccessDialogVisible,
	onClose,
},) => {
	const {
		userInfo,
	} = useUserStore()

	const [step, setStep,] = React.useState<StepType>(1,)
	const [hasPermission, setHasPermission,] = React.useState(false,)
	const [isAssetDrawerOpen, setIsAssetDrawerOpen,] = React.useState(false,)
	const [assetName, setAssetName,] = React.useState<AssetNamesType | undefined>()
	const [existedDocuments, setExistedDocuments,] = React.useState<Array<IDocument>>([],)
	const [currentBalance, setCurrentBalance,] = React.useState(0,)
	const [currentBudgetId, setCurrentBudgetId,] = React.useState<string | undefined>()
	const [isinBondsValue, setIsinBondsValue,] = React.useState<string | undefined>()
	const [isinStockValue, setIsinStockValue,] = React.useState<string | undefined>()
	const [transactionForm, setTransactionForm,] = React.useState<TransactionFormValues>(initialFormValues,)

	const {
		mutateAsync: createIsin,
		isPending: isinAddLoading,
	} = useCreateIsin()
	const {
		mutateAsync: createTransaction,
		isPending: isTransactionCreating,
	} = useCreateTransaction()
	const {
		mutateAsync: createTransactionDraft,
		isPending: isTransactionDraftCreating,
	} = useCreateTransactionDraft()
	const {
		documents, addDocument, removeDocument, clearDocuments,
	} = useDocumentStore()
	const {
		mutateAsync: createDocument,
		isPending: isCreateDocumentPending,
	} = useCreateDocument(DocumentTypes.TRANSACTION,)
	const {
		data: orderList,
	} = useOrdersListFiltered({
		clientIds: transactionForm.clientId?.value.id ?
			[transactionForm.clientId.value.id,] :
			undefined,
	},)
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
		refetch: refetchBalance,
	} = useCashCurrencyAnalytics({
		type:       AssetNamesType.CASH,
		accountIds: transactionForm.accountId ?
			[transactionForm.accountId.value.id,] :
			undefined,
		transactionCreation: true,
	},)
	const {
		data: emissionsIsinList,
	} = useGetEmissionsIsins()
	const {
		data: stockIsinList,
	} = useGetEquityStocksIsins()
	const {
		data: securityBonds,
	} = useGetSecurityByIsin(isinBondsValue ?? '',)
	const {
		data: securityStock,
	} = useGetEquityStocksSecurityByIsin(isinStockValue ?? '',)
	const {
		data: serviceProviderList,
	} = useGetServiceProvidersList()
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
				id:       account.id,
				name:     account.accountName,
				bankId:   account.bankId,
				entityId: account.entityId,
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
			value: option.name,
			label: option.name,
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

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		setHasPermission(hasPermission,)
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

	React.useEffect(() => {
		if (transactionForm.isin?.value) {
			if (emissionsIsinList?.includes(transactionForm.isin.value,)) {
				setIsinBondsValue(transactionForm.isin.value,)
				setIsinStockValue(undefined,)
			}
			if (stockIsinList?.includes(transactionForm.isin.value,)) {
				setIsinStockValue(transactionForm.isin.value,)
				setIsinBondsValue(undefined,)
			}
		} else {
			setIsinBondsValue(undefined,)
			setIsinStockValue(undefined,)
		}
	}, [transactionForm.isin?.value,],)

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
	}), [transactionForm.currency, currencyData,],)

	React.useEffect((() => {
		if (!transactionForm.clientId && clientId && clientOptions.length) {
			const clientValue = clientOptions.find((option,) => {
				return option.value.id === clientId
			},)

			setTransactionForm({
				...transactionForm,
				clientId: clientValue,
			},)
		}
	}), [clientOptions,],)

	React.useEffect((() => {
		if (!transactionForm.portfolioId && portfolioId && portfolioOptions.length) {
			const portfolioValue = portfolioOptions.find((option,) => {
				return option.value.id === portfolioId
			},)

			setTransactionForm({
				...transactionForm,
				portfolioId: portfolioValue,
			},)
		}
	}), [portfolioOptions,],)

	const handleFormSubmit = async(
		data: TransactionFormValues,
		form: FormApi<TransactionFormValues, Partial<TransactionFormValues>>,
	): Promise<void> => {
		const security = securityBonds ?? securityStock ?? undefined
		const newTransaction = await createTransaction({
			security: security ?
				String(security,) :
				undefined,
			...formatValues(data,),
		},)
		if (data.expenseCategory && data.transactionTypeId?.value.name) {
			await createTransactionCategoryDependency({
				expenseCategoryId: data.expenseCategory.value.id,
				transactionId:     newTransaction.id,
			},)
		}
		form.reset()
		form.resetFieldState('amount',)
		setTransactionId(newTransaction.id,)
		await refetchBalance()

		if (documents.length > 0) {
			await Promise.all(documents.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('transactionId', `${newTransaction.id}`,)
				await createDocument(formData,)
			},),)
		}
		clearDocuments()
		toggleSuccessDialogVisible()

		if (data.isSave) {
			setTransactionForm({
				...transactionForm,
				currency:          undefined,
				orderId:           undefined,
				transactionTypeId: undefined,
				category:          undefined,
				isin:              undefined,
				serviceProvider:   undefined,
				amount:            undefined,
				transactionDate:   undefined,
				comment:           undefined,
				customFields:      undefined,
				expenseCategory:   undefined,
			},)
			setStep(1,)
			return
		}

		const relatedTransaction = relatedTransactions.find((transaction,) => {
			return transaction.name === data.transactionTypeId?.value.name
		},)

		if (relatedTransaction?.nextTransaction) {
			const currentTransactionType = transactionTypeOptions.find((transaction,) => {
				return transaction.value.name === relatedTransaction.nextTransaction
			},)
			setTransactionForm({
				...transactionForm,
				transactionTypeId: currentTransactionType,
				orderId:           undefined,
				isin:              undefined,
				serviceProvider:   undefined,
				amount:            undefined,
				transactionDate:   undefined,
				comment:           undefined,
				customFields:      undefined,
				expenseCategory:   undefined,
			},)
			setStep(2,)
		} else if (relatedTransaction?.asset && hasPermission) {
			setTransactionForm({
				...transactionForm,
				orderId:           undefined,
				transactionTypeId: undefined,
				category:          undefined,
				isin:              undefined,
				serviceProvider:   undefined,
				amount:            undefined,
				transactionDate:   undefined,
				comment:           undefined,
				customFields:      undefined,
				expenseCategory:   undefined,
			},)
			setStep(2,)
			setAssetName(relatedTransaction.asset,)
			setIsAssetDrawerOpen(true,)
		} else {
			setTransactionForm({
				...transactionForm,
				orderId:           undefined,
				transactionTypeId: undefined,
				category:          undefined,
				isin:              undefined,
				serviceProvider:   undefined,
				amount:            undefined,
				transactionDate:   undefined,
				comment:           undefined,
				customFields:      undefined,
				expenseCategory:   undefined,
			},)
			setStep(2,)
		}
	}

	const handleCreateDraft = async(
		data: TransactionFormValues,
		form: FormApi<TransactionFormValues, Partial<TransactionFormValues>>,
	): Promise<void> => {
		const security = securityBonds ?? securityStock ?? undefined
		const newTransactionDraft = await createTransactionDraft({
			...formatValues(data,),
			security: security ?
				String(security,) :
				undefined,
		},)
		onClose()
		form.reset()
		setTransactionForm(initialFormValues,)

		if (documents.length > 0) {
			await Promise.all(documents.map(async(document,) => {
				const formData = new FormData()
				formData.append('file', document.file,)
				formData.append('type', document.documentType,)
				formData.append('transactionDraftId', `${newTransactionDraft.id}`,)
				await createDocument(formData,)
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

	const saveDraft = (data: TransactionFormValues, form: FormApi<TransactionFormValues, Partial<TransactionFormValues>>,): void => {
		handleCreateDraft(data, form,)
	}

	React.useEffect(() => {
		setTransactionForm({
			...transactionForm,
			serviceProvider: na as IOptionType,
		},)
	}, [],)

	const na = {
		value: 'N/A', label: 'N/A',
	}

	return (
		<Form<TransactionFormValues>
			onSubmit={handleFormSubmit}
			validate={validateTransactionForm}
			initialValues={transactionForm}
			render={({
				handleSubmit,
				submitting,
				values,
				form,
				hasValidationErrors,
			},) => {
				const isPending =
					submitting ||
					isTransactionCreating ||
					isTransactionDraftCreating ||
					isCreateDocumentPending

				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Add transaction</h3>
						<div className={cx(styles.addFormWrapper,)}>
							<LabeledProgressBar
								currentStep={step}
								steps={getTransactionFormSteps(values,)}
							/>
							<div className={cx(step !== 1 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<SelectField<LinkedTransactionType>
										name='clientId'
										isDisabled={true}
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
										isDisabled={true}
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
										isDisabled={!entityList || Boolean(transactionForm.orderId,)}
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
										isDisabled={!bankList || Boolean(transactionForm.orderId,)}
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
										isDisabled={!accountList || Boolean(transactionForm.orderId,)}
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
													styles.textColorRed}`,)}>{localeString(currentBalance, transactionForm.currency?.value, 2,)}
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
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										onSaveDraft={() => {
											saveDraft(values, form,)
										}}
										disabled={!transactionForm.clientId}
									/>
									<NextButton
										disabled={!transactionForm.currency}
										handleNext={() => {
											setStep(2,)
										}}
									/>
								</div>
							</div>
							<div className={cx(step !== 2 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<div>
										<div className={styles.fieldTitle}>Transaction date</div>
										<CustomDatePickerField
											name='transactionDate'
											validate={validateDate}
										/>
									</div>
									<div>
										<div className={styles.flexSpaceBetween}>
											<div className={styles.fieldTitle}>Amount</div>
											<div className={styles.amountBalance}>Balance: <span
												className={cx(styles.amountBalance, `${currentBalance >= 0 ?
													styles.textColorGreen :
													styles.textColorRed}`,)}>{localeString(currentBalance, transactionForm.currency?.value, 2,)}
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
											value={transactionForm.serviceProvider ?? na}
										/>
									</div>

									<FormTextArea
										key={`${step}`}
										label='Comment (optional)'
										name='comment'
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
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										onSaveDraft={() => {
											saveDraft(values, form,)
										}}
										disabled={Boolean(isPending,)}
									/>
									<PrevButton
										handlePrev={() => {
											setStep(1,)
										}}
									/>
									<NextButton
										disabled={!values.transactionDate || hasValidationErrors}
										handleNext={() => {
											setStep(3,)
										}}
									/>
								</div>
							</div>
							<div className={cx(step !== 3 && 'hidden-el',)}>
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
								<div className={styles.addInputBlock}>
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
												}
											}}
											value={transactionForm.orderId}
											isSearchable
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
												setTransactionForm({
													...values,
													isin: value as IOptionType,
												},)
											}}
											isCreateble
											createbleStatus={CreatebleSelectEnum.ISIN}
											createFn={handleCreateIsin}
											isLoading={isinAddLoading}
										/>
									</div>
									<div>
										<div className={styles.fieldTitle}>Security</div>
										<FormField
											name='security'
											placeholder='Security'
											value={securityBonds ?? securityStock ?? ''}
											disabled
										/>
									</div>
									<div>
										<div className={styles.fieldTitle}>Expense category (optional)</div>
										<SelectField<LinkedTransactionType>
											name='expenseCategory'
											placeholder='Select Expense category'
											isMulti={false}
											options={expenseCategoryOptions}
											isSearchable
											onChange={(value,) => {
												setTransactionForm({
													...values,
													expenseCategory: value as IOptionType<LinkedTransactionType>,
												},)
											}}
										/>
									</div>
								</div>
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										onSaveDraft={() => {
											saveDraft(values, form,)
										}}
										disabled={Boolean(isPending,)}
									/>
									<PrevButton
										handlePrev={() => {
											setStep(2,)
										}}
									/>
									<Button<ButtonType.TEXT>
										type='button'
										onClick={() => {
											handleFormSubmit({
												...values, isSave: true,
											}, form,)
										}}
										disabled={Boolean(isPending || hasValidationErrors,)}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    'Save',
											size:    Size.MEDIUM,
										}}
									/>
									<Button<ButtonType.TEXT>
										type='button'
										onClick={() => {
											handleFormSubmit(values, form,)
										}}
										disabled={Boolean(isPending || hasValidationErrors,)}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    'Add more transactions',
											size:    Size.MEDIUM,
										}}
									/>
								</div>
							</div>
						</div>
						<CustomDialog
							open={isExitDialogOpen}
							icon={<WarningIcon width={42} height={42} />}
							title='Exit transaction creation'
							description='Are you sure you want to leave without saving? All unsaved progress will be lost.'
							isCloseButtonShown
							cancelBtnText='Exit unsaved'
							submitBtnText='Save as draft'
							cancelBtnColor={Color.SECONDARY_RED}
							isSubmitBtnDisable={!values.clientId}
							onCancel={() => {
								onClose()
								toggleExitDialogVisible()
							}}
							onSubmit={async() => {
								toggleExitDialogVisible()
								await handleCreateDraft(values, form,)
							}}
						/>
						<Drawer
							isOpen={isAssetDrawerOpen}
							onClose={() => {
								setIsAssetDrawerOpen(false,)
							}}
							isCloseButtonShown
						>
							{transactionForm.clientId?.value.id && (
								<AddAsset
									onClose={() => {
										setIsAssetDrawerOpen(false,)
										setAssetName(undefined,)
									}}
									defaultAssetName={assetName}
									createAssetProps={{
										portfolioId: transactionForm.portfolioId?.value.id ?? '',
										entityId:    transactionForm.entityId?.value.id ?? '',
										bankId:      transactionForm.bankId?.value.id ?? '',
										accountId:   transactionForm.accountId?.value.id ?? '',
									}}
									clientId={transactionForm.clientId.value.id}
								/>
							)}
						</Drawer>
					</form>
				)
			}
			}
		/>
	)
}