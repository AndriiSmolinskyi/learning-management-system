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
	useNavigate,
} from 'react-router-dom'
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
} from '../../../../shared/components'
import {
	AddAsset,
} from '../../../clients/portfolios/portfolio-details/components/asset'
import {
	BankSelect,
	Briefcase,
	Check,
	ClientsRoute,
	DeleteBucketIcon,
	DocsIcon,
	EntitySelect,
	WarningIcon,
} from '../../../../assets/icons'
import {
	SaveDraftButton,
} from './save-draft-btn.component'
import {
	useAccountsByBankId,
	useBanksByEntityId,
	useCashCurrencyAnalyticsForTransaction,
	useCreateDocument,
	useCreateIsin,
	useCreateServiceProvidersListItem,
	useCreateTransaction,
	useCreateTransactionCategoryDependency,
	useCreateTransactionDraft,
	useDeleteDocumentsByIds,
	useEntityListByPortfolioId,
	useGetBudgetPlanById,
	useGetDocumentsByTransactionDraftId,
	useGetEmissionsIsins,
	useGetEncryptedServiceProvidersList,
	useGetEquityStocksIsins,
	useGetEquityStocksSecurityByIsin,
	useGetExpenseCategoriesByBudgetId,
	useGetSecurityByIsin,
	useGetTransactionTypeList,
	useOrdersListFiltered,
	useTransactionDraftById,
	useUpdateTransactionDraft,
} from '../../../../shared/hooks'
import {
	useClientsList,
} from '../../../clients/client-profiles/clients/hooks'
import {
	usePortfolioListByClientId,
} from '../../../../shared/hooks/portfolio'
import {
	validateTransactionForm,
} from '../transaction.validator'
import {
	formatAmountValidator, requiredSelect, validateDate,
} from '../../../../shared/utils/validators'
import {
	localeString, toggleState,
} from '../../../../shared/utils'
import {
	formatValues,
	getTransactionFormInitialValues,
	getTransactionFormSteps,
	initialFormValues,
} from '../transaction.utils'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	useDocumentStore,
} from '../../../../store/document.store'
import type {
	CurrencyList,
	IDocument,
} from '../../../../shared/types'
import {
	AssetNamesType, DocumentTypes, type IOptionType, Roles,
} from '../../../../shared/types'
import type {
	LinkedTransactionOrderType,
	LinkedTransactionType,
	StepType,
	TransactionFormValues,
} from '../transaction.types'
import {
	CreatebleSelectEnum,
} from '../../../../shared/constants'
// import {
// 	relatedTransactions,
// } from '../transaction.constants'
import {
	numbersRegex,
} from '../../../../shared/constants/regexes.constants'
import {
	useAddTransactionStore,
} from '../add-transaction.store'
import {
	useCreatedAssetStore,
} from '../../../clients/portfolios/portfolio-details/components/asset/add-aset.store'
import {
	getRouteByAssetName,
} from '../../../clients/portfolios/portfolio-details/components/sub-items-list/asset-types/asset-details.utils'
import * as styles from '../transactions.styles'

type Props = {
	draftId?: number
	isExitDialogOpen: boolean
	setTransactionId: (id: number) => void
	toggleExitDialogVisible: () => void
	toggleSuccessDialogVisible: () => void
	// toggleAssetDialogVisible: () => void
	onClose: (transactionId?: number) => void
	onCloseButtonClick: () => void
}

export const AddTransaction: React.FC<Props> = ({
	draftId,
	isExitDialogOpen,
	setTransactionId,
	toggleExitDialogVisible,
	toggleSuccessDialogVisible,
	// toggleAssetDialogVisible,
	onClose,
	onCloseButtonClick,
},) => {
	const {
		userInfo,
	} = useUserStore()
	const {
		setClientId,
		setPortfolioId,
		setBankId,
		setAccountId,
		setCurrency,
		setEntityId,
		setTransactionIds,
		clientId,
		portfolioId,
		bankId,
		entityId,
		accountId,
		currency,
		transactionIds,
	} = useAddTransactionStore()
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
	const [transactionTypeIdState, setTransactionTypeIdState,] = React.useState<IOptionType<LinkedTransactionType> | undefined>(transactionForm.transactionTypeId,)
	const [isinTranscationValue, setIsinTranscationValue,] = React.useState<string | undefined>()
	const [isPurchaseFee, setPurchaseFee,] = React.useState<boolean | undefined>()
	const [isPurchaseValue, setPurchaseValue,] = React.useState<boolean | undefined>()
	const [feeTransactionValue, setFeeTransactionValue,] = React.useState<string | undefined>()
	const [amountTransactionValue, setAmountTransactionValue,] = React.useState<string | undefined>()
	const [relatedTypeId, setRelatedTypeId,] = React.useState<string | undefined>()
	const [asset, setAsset,] = React.useState<string | undefined>()
	const {
		resetCreatedAsset, createdAsset,
	} = useCreatedAssetStore()
	const navigate = useNavigate()
	const {
		mutateAsync: createIsin,
		isPending: isinAddLoading,
	} = useCreateIsin()
	const {
		data: transactionDraft,
	} = useTransactionDraftById(draftId,)
	const {
		mutateAsync: createTransaction,
		isPending: isTransactionCreating,
	} = useCreateTransaction()

	const {
		mutateAsync: createTransactionDraft,
		isPending: isTransactionDraftCreating,
	} = useCreateTransactionDraft()
	const {
		mutateAsync: updateTransactionDraft,
		isPending: isTransactionDraftUpdating,
	} = useUpdateTransactionDraft()
	const {
		documents, addDocument, removeDocument, clearDocuments,
	} = useDocumentStore()
	const {
		mutateAsync: createDocument,
		isPending: isCreateDocumentPending,
	} = useCreateDocument(DocumentTypes.TRANSACTION,)
	const {
		mutateAsync: deleteDocuments,
		isPending: isDeleteDocumentsPending,
	} = useDeleteDocumentsByIds(draftId,)
	const {
		data: draftDocs,
	} = useGetDocumentsByTransactionDraftId(draftId,)
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
	} = useCashCurrencyAnalyticsForTransaction({
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
		data: securityBonds,
	} = useGetSecurityByIsin(isinBondsValue ?? '',)
	const {
		data: securityStock,
	} = useGetEquityStocksSecurityByIsin(isinStockValue ?? '',)
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

	const na = React.useMemo(() => {
		if (!serviceProviderList) {
			return {
				value: 'N/A', label: 'N/A',
			}
		}

		const found = serviceProviderList.find((x,) => {
			return x.label === 'N/A'
		},)

		return found ?? {
			value: 'N/A', label: 'N/A',
		}
	}, [serviceProviderList,],)

	const handleCreateIsin = async(isin: string,): Promise<void> => {
		if (transactionForm.currency) {
			await createIsin({
				name:     isin,
				currency: transactionForm.currency.value as CurrencyList,
			},)
		}
		if (transactionDraft?.currency) {
			await createIsin({
				name:     isin,
				currency: transactionDraft.currency as CurrencyList,
			},)
		}
	}

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		setHasPermission(hasPermission,)
	}, [],)

	React.useEffect(() => {
		if (transactionDraft) {
			setTransactionForm(getTransactionFormInitialValues(transactionDraft,),)
		}
	}, [transactionDraft,],)

	React.useEffect(() => {
		if (draftDocs) {
			setExistedDocuments(draftDocs,)
		}
	}, [draftDocs,],)

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
	const portfolioOptions = portfolioList?.filter((portfolio,) => {
		return portfolio.isActivated
	},)
		.map((portfolio,) => {
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
				id:                type.id,
				name:              type.name,
				category:          type.category,
				cashFlow:          type.cashFlow,
				relatedTypeId: type.relatedTypeId,
				asset:         type.asset,
			},
		}
	},) ?? []

	const isinOptions = React.useMemo(() => {
		const typeName = transactionForm.transactionTypeId?.value.name.toLowerCase() ?? ''

		const isBond = typeName.includes('bond',)
		const isEquity = typeName.includes('equity',)
		const isMetal = typeName.includes('metal',)
		const isCrypto = typeName.includes('crypto',)

		if (isBond) {
			return (emissionsIsinList ?? []).map((isin,) => {
				return {
					value: isin, label: isin,
				}
			},)
		}

		if (isEquity || isMetal || isCrypto) {
			return (stockIsinList ?? []).map((isin,) => {
				return {
					value: isin, label: isin,
				}
			},)
		}

		return []
	}, [
		transactionForm.transactionTypeId?.value.name,
		emissionsIsinList,
		stockIsinList,
	],)

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

	React.useEffect((() => {
		if (transactionForm.orderId && clientOptions.length) {
			const currentOrder = orderList?.list.find((order,) => {
				return order.id === Number(transactionForm.orderId?.value.id,)
			},)
			if (currentOrder) {
				const clientId = currentOrder.portfolio?.clientId
				const clientValue = clientOptions.find((option,) => {
					return option.value.id === clientId
				},)
				setTransactionForm({
					...transactionForm,
					clientId: clientValue,
				},)
			}
		}
	}), [transactionForm.orderId, clientList,],)

	React.useEffect((() => {
		if (transactionForm.orderId && portfolioOptions.length) {
			const currentOrder = orderList?.list.find((order,) => {
				return order.id === Number(transactionForm.orderId?.value.id,)
			},)
			if (currentOrder) {
				const {
					portfolioId,
				} = currentOrder
				const portfolioValue = portfolioOptions.find((option,) => {
					return option.value.id === portfolioId
				},)
				setTransactionForm({
					...transactionForm,
					portfolioId: portfolioValue,
				},)
			}
		}
	}), [transactionForm.clientId, portfolioList,],)

	React.useEffect((() => {
		if (transactionForm.orderId && accountOptions.length) {
			const currentOrder = orderList?.list.find((order,) => {
				return order.id === Number(transactionForm.orderId?.value.id,)
			},)
			if (currentOrder) {
				const bankId = currentOrder.request?.bankId
				const bankValue = accountOptions.find((option,) => {
					return option.value.bankId === bankId
				},)
				setTransactionForm({
					...transactionForm,
					accountId: bankValue,
				},)
			}
		}
	}), [transactionForm.portfolioId, accountList,],)

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

	const removeDocuments = async(): Promise<void> => {
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
	}

	const handleFormSubmit = async(
		data: TransactionFormValues,
		form: FormApi<TransactionFormValues, Partial<TransactionFormValues>>,
	): Promise<void> => {
		if (isPurchaseValue) {
			setAmountTransactionValue(transactionForm.amount,)
		}
		if (isPurchaseFee) {
			setFeeTransactionValue(transactionForm.amount,)
		}
		const security = securityBonds ?? securityStock ?? undefined
		const newTransaction = await createTransaction({
			transactionDraftId: draftId ?
				draftId :
				undefined,
			security: security ?
				String(security,) :
				undefined,
			...formatValues(data,),
		},)
		setTransactionIds(newTransaction.id,)
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
		await removeDocuments()

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
			setAsset(undefined,)
			setRelatedTypeId(undefined,)
			setIsSkipDisabled(true,)
			return
		}

		let effectiveRelatedId = relatedTypeId

		if (transactionForm.transactionTypeId?.value.id === relatedTypeId) {
			effectiveRelatedId = undefined
			setRelatedTypeId(undefined,)
		}

		// todo: clear if good
		// const isBondOrEquity = transactionForm.transactionTypeId?.value.name.includes('Bond',) ??
		// 	transactionForm.transactionTypeId?.value.name.includes('Equity',)
		const nextTypeOption = transactionTypeOptions.find(
			(opt,) => {
				return opt.value.id === relatedTypeId
			},
		)

		const nextName = (nextTypeOption?.value.name ?? '').toLowerCase()
		const isBondOrEquity = nextName.includes('equity',) || nextName.includes('bond',) || nextName.includes('metal',) || nextName.includes('crypto',)

		if (effectiveRelatedId) {
			const nextTypeOption = transactionTypeOptions.find(
				(opt,) => {
					return opt.value.id === relatedTypeId
				},
			)
			setTransactionForm({
				...transactionForm,
				transactionTypeId: nextTypeOption,
				orderId:           undefined,
				serviceProvider:   na,
				amount:            undefined,
				transactionDate:   undefined,
				comment:           undefined,
				customFields:      undefined,
				expenseCategory:   undefined,
				// todo: clear if good
				// isin:              isBondOrEquity ?
				// 	transactionForm.isin :
				// 	undefined,
				// security: isBondOrEquity ?
				// 	(securityBonds ?? securityStock ?? undefined) :
				// 	undefined,
				isin:              isBondOrEquity ?
					transactionForm.isin :
					undefined,
				security:          isBondOrEquity ?
					(securityBonds ?? securityStock ?? undefined) :
					undefined,
			},)
			setStep(2,)
		} else if (asset) {
			setTransactionForm({
				...transactionForm,
				orderId:           undefined,
				transactionTypeId: undefined,
				category:          undefined,
				serviceProvider:   na,
				amount:            undefined,
				transactionDate:   undefined,
				comment:           undefined,
				customFields:      undefined,
				expenseCategory:   undefined,
				isin:              undefined,
			},)
			setStep(2,)
			setAssetName(asset as AssetNamesType,)
			setIsAssetDrawerOpen(true,)
			setAsset(undefined,)
			setRelatedTypeId(undefined,)
		} else {
			setTransactionForm({
				...transactionForm,
				orderId:           undefined,
				transactionTypeId: undefined,
				category:          undefined,
				isin:              undefined,
				serviceProvider:   na,
				amount:            undefined,
				transactionDate:   undefined,
				comment:           undefined,
				customFields:      undefined,
				expenseCategory:   undefined,
			},)
			setStep(2,)
			setAsset(undefined,)
			setRelatedTypeId(undefined,)
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

		await removeDocuments()

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

	const handleUpdateDraft = async(data: TransactionFormValues, form: FormApi<TransactionFormValues, Partial<TransactionFormValues>>,): Promise<void> => {
		if (!transactionDraft?.id) {
			return
		}
		const security = securityBonds ?? securityStock ?? undefined
		const newTransactionDraft = await updateTransactionDraft({
			id:       transactionDraft.id,
			...formatValues(data,),
			security: security ?
				String(security,) :
				undefined,
		},)
		onClose()
		form.reset()
		setTransactionForm(initialFormValues,)

		await removeDocuments()

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
		if (transactionDraft?.id) {
			handleUpdateDraft(data, form,)
		} else {
			handleCreateDraft(data, form,)
		}
	}

	const handleSkipTransaction = (): void => {
		const currentTransaction = transactionForm.transactionTypeId?.value.id

		if (currentTransaction) {
			if (transactionTypeIdState && asset && hasPermission && currentTransaction === relatedTypeId) {
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
				setAssetName(asset as AssetNamesType,)
				setIsAssetDrawerOpen(true,)
				setAsset(undefined,)
				setRelatedTypeId(undefined,)
				setIsSkipDisabled(true,)
			}
		}
	}

	const handleClientChange = (selectedClient: IOptionType<LinkedTransactionType>,): void => {
		setClientId(selectedClient,)
		setPortfolioId(undefined,)
		setEntityId(undefined,)
		setBankId(undefined,)
		setAccountId(undefined,)
		setCurrency(undefined,)
	}

	const handlePortfolioChange = (selectedPortfolio: IOptionType<LinkedTransactionType>,): void => {
		setPortfolioId(selectedPortfolio,)
		setEntityId(undefined,)
		setBankId(undefined,)
		setAccountId(undefined,)
		setCurrency(undefined,)
	}

	const handleBankChange = (selectedBank: IOptionType<LinkedTransactionType>,): void => {
		setBankId(selectedBank,)
		setAccountId(undefined,)
		setAccountId(undefined,)
		setCurrency(undefined,)
	}

	const handleEntityChange = (selectedEntity: IOptionType<LinkedTransactionType>,): void => {
		setEntityId(selectedEntity,)
		setBankId(undefined,)
		setAccountId(undefined,)
		setCurrency(undefined,)
	}

	const handleAccountChange = (selectedAccount: IOptionType<LinkedTransactionType>,): void => {
		setAccountId(selectedAccount,)
		setCurrency(undefined,)
	}

	const handleCurrencyChange = (selectedCurrency: IOptionType,): void => {
		setCurrency(selectedCurrency,)
	}

	React.useEffect(() => {
		const isFeeTransaction = transactionForm.transactionTypeId?.value.name.toLowerCase().includes('fee',)

		setPurchaseFee(isFeeTransaction,)
		setPurchaseValue(!isFeeTransaction,)
	}, [transactionForm.transactionTypeId?.value.name,],)

	const [isSkipDisabled, setIsSkipDisabled,] = React.useState(true,)

	React.useEffect(() => {
		const currentTransaction = transactionForm.transactionTypeId?.value.id

		if (currentTransaction && currentTransaction === relatedTypeId) {
			const skipCheck = Boolean(asset,)

			setIsSkipDisabled(!(skipCheck),)
		}
	}, [transactionForm.transactionTypeId?.value.name,],)

	const [isAssetSuccessDialogOpen, setIsAssetSuccessDialogOpen,] = React.useState(false,)

	const toggleAssetDialogVisible = React.useCallback(() => {
		toggleState(setIsAssetSuccessDialogOpen,)()
	}, [],)

	const handleNavigate = (assetName: AssetNamesType,): void => {
		const route = getRouteByAssetName(assetName,)
		if (route) {
			navigate(route,)
		}
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
					isTransactionDraftUpdating ||
					isCreateDocumentPending ||
					isDeleteDocumentsPending
				React.useEffect(() => {
					setTransactionForm({
						...values,
						serviceProvider: na as IOptionType,
						clientId:        clientId ?? undefined,
						portfolioId:     portfolioId ?? undefined,
						bankId:          bankId ?? undefined,
						entityId:        entityId ?? undefined,
						accountId:       accountId ?? undefined,
						currency:        currency ?? undefined,
					},)
				}, [],)

				React.useEffect(() => {
					const value = securityBonds ?? securityStock
					if (value) {
						form.change('security', String(value,),)
					}
				}, [securityBonds, securityStock,],)
				return (
					<form className={styles.formContainer} onSubmit={handleSubmit}>
						<h3 className={styles.formHeader}>Add transaction</h3>
						<LabeledProgressBar
							currentStep={step}
							steps={getTransactionFormSteps(values,)}
						/>
						<div className={cx(styles.addFormWrapper,)}>
							<div className={cx(step !== 1 && 'hidden-el',)}>
								<div className={styles.addInputBlock}>
									<SelectField<LinkedTransactionType>
										name='clientId'
										tabIndex={0}
										isDisabled={!clientList || Boolean(transactionForm.orderId,)}
										placeholder='Select client'
										leftIcon={<ClientsRoute width={18} height={18} />}
										options={clientOptions} onChange={(select,) => {
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

												if (!draftId) {
													handleClientChange(select as IOptionType<LinkedTransactionType>,)
												}
											}
										}}
										value={transactionForm.clientId}
										isSearchable
									/>
									<SelectField<LinkedTransactionType>
										name='portfolioId'
										tabIndex={0}
										placeholder='Select portfolio or sub-portfolio'
										leftIcon={<Briefcase width={18} height={18} />}
										isDisabled={!portfolioList || Boolean(transactionForm.orderId,)}
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

												if (!draftId) {
													handlePortfolioChange(select as IOptionType<LinkedTransactionType>,)
												}
											}
										}}
										value={transactionForm.portfolioId}
									/>
									<SelectField<LinkedTransactionType>
										name='entityId'
										tabIndex={0}
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
												if (!draftId) {
													handleEntityChange(select as IOptionType<LinkedTransactionType>,)
												}
											}
										}}
										value={transactionForm.entityId}
									/>
									<SelectField<LinkedTransactionType>
										name='bankId'
										tabIndex={0}
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
												if (!draftId) {
													handleBankChange(select as IOptionType<LinkedTransactionType>,)
												}
											}
										}}
										value={transactionForm.bankId}
									/>
									<SelectField<LinkedTransactionType>
										name='accountId'
										tabIndex={0}
										placeholder='Select bank account'
										leftIcon={<BankSelect width={18} height={18} />}
										isDisabled={!accountList || Boolean(transactionForm.orderId,)}
										options={accountOptions}
										isSearchable
										onChange={(select,) => {
											if (select && !Array.isArray(select,)) {
												const selectedAccount = select as IOptionType<LinkedTransactionType>
												setTransactionForm({
													...values,
													currency:  undefined,
													accountId: selectedAccount,
												},)
												if (!draftId) {
													handleAccountChange(selectedAccount,)
												}
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
											tabIndex={0}
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
												if (!draftId) {
													handleCurrencyChange(value as IOptionType,)
												}
											}}
										/>
									</div>
								</div>
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										onSaveDraft={() => {
											saveDraft(values, form,)
										}}
										tabIndex={0}
										disabled={!transactionForm.clientId}
									/>
									<NextButton
										disabled={!transactionForm.currency}
										tabIndex={0}
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
											tabIndex={0}
											name='transactionDate'
											validate={validateDate}
											disableFuture={false}
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
											tabIndex={0}
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
											tabIndex={0}
											onChange={(select,) => {
												if (select && !Array.isArray(select,)) {
													const picked = select as IOptionType<LinkedTransactionType>
													setTransactionForm({
														...values,
														transactionTypeId: picked,
														isin:              undefined,
													},)
													setTransactionTypeIdState(picked,)
													setIsinTranscationValue(undefined,)
													setAsset(picked.value.asset ?? undefined,)
													setRelatedTypeId(picked.value.relatedTypeId ?? undefined,)
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
											tabIndex={0}
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
										tabIndex={0}
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
										tabIndex={0}
										onSaveDraft={() => {
											saveDraft(values, form,)
										}}
										disabled={Boolean(isPending,)}
									/>
									<PrevButton
										tabIndex={0}
										handlePrev={() => {
											setStep(1,)
										}}
									/>
									<Button<ButtonType.TEXT>
										onClick={handleSkipTransaction}
										disabled={isSkipDisabled}
										additionalProps={{
											btnType: ButtonType.TEXT,
											text:    'Skip',
											size:    Size.MEDIUM,
											color:   Color.BLUE,
										}}
									/>
									<NextButton
										disabled={!values.transactionDate || hasValidationErrors}
										tabIndex={0}
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
												} else {
													setTransactionForm({
														...values,
														orderId: undefined,
													},)
												}
											}}
											value={transactionForm.orderId}
											isMulti={false}
											tabIndex={0}
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
											tabIndex={0}
											onChange={(value,) => {
												if (value && !Array.isArray(value,)) {
													setTransactionForm({
														...values,
														isin: value as IOptionType,
													},)
													setIsinTranscationValue((value as IOptionType).value,)
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
											value={securityBonds ?? securityStock ?? ''}
											tabIndex={0}
											disabled
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
											isDisabled={expenseCategoryOptions.length === 0}
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
								</div>
								<div className={styles.addBtnWrapper}>
									<SaveDraftButton
										tabIndex={0}
										onSaveDraft={() => {
											saveDraft(values, form,)
										}}
										disabled={Boolean(isPending,)}
									/>
									<PrevButton
										tabIndex={0}
										handlePrev={() => {
											setStep(2,)
										}}
									/>
									<Button<ButtonType.TEXT>
										type='button'
										tabIndex={0}
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
							onCloseButtonClick={() => {
								onCloseButtonClick()
							}}
							onSubmit={async() => {
								toggleExitDialogVisible()
								if (transactionDraft?.id) {
									await handleUpdateDraft(values, form,)
								} else {
									await handleCreateDraft(values, form,)
								}
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
									transactionTypeId={transactionTypeIdState}
									isinTranscationValue={isinTranscationValue}
									bankFee={feeTransactionValue}
									amountTransactionValue={amountTransactionValue}
									toggleAssetDialogVisible={toggleAssetDialogVisible}
									transactionIds={transactionIds}
								/>
							)}
						</Drawer>
						<CustomDialog
							open={isAssetSuccessDialogOpen}
							icon={<Check width={42} height={42} />}
							title='New asset added!'
							isCloseButtonShown
							submitBtnColor={Color.SECONDRAY_GRAY}
							submitBtnText='View details'
							isCancelBtn={false}
							onCancel={toggleAssetDialogVisible}
							onSubmit={() => {
								handleNavigate(createdAsset?.assetName ?? AssetNamesType.BONDS,)
								resetCreatedAsset()
								toggleAssetDialogVisible()
							}}
						/>
					</form>
				)
			}
			}
		/>
	)
}