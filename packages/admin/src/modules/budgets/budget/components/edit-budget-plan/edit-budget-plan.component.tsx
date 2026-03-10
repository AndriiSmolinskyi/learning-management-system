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
	FormField,
	Color,
	FormCollapse,
} from '../../../../../shared/components'
import {
	AccountIcon,
	BankSelect,
	ClientsRoute,
	Refresh,
} from '../../../../../assets/icons'

import type {
	BudgetPlanFormValues,
	BudgetClientListType,
} from '../../budget.types'
import type {
	CurrencyList,
	IOptionType,
} from '../../../../../shared/types'

import {
	useBanksByClientId,
	useGetAccountsBySourceIds,
	useGetAllCurrencies,
	useGetBudgetPlanById,
	useUpdateBudgetPlan,
	useCreateBudgetAllocation,
	useDeleteAllBudgetPlanAllocations,
	getClientListWithoutBudgetPlan,
} from '../../../../../shared/hooks'

import {
	validateBudgetForm,
} from '../../budget.validator'
import {
	isDeepEqual,
	localeString,
} from '../../../../../shared/utils'
import {
	getBudgetDrafFormInitialValues,
} from '../../budget.utils'
import {
	useBudgetStore,
} from '../../budget.store'
import {
	BudgetAccountCollapse,
} from './components/allocation.component'
import {
	displayBudgetPlanInformation,
} from '../../budget.utils'

import * as styles from './edit-budget-plan.styles'

type Props = {
	onClose: () => void
	budgetPlanId: string | undefined
}

const initialFormValues = {
	budgetPlanName:     '',
	bankIds:        undefined,
	accountIds:     undefined,
	clientId:       undefined,
}

export const EditBudgetPlan: React.FC<Props> = ({
	onClose,
	budgetPlanId,
},) => {
	const [budgetPlanForm, setBudgetPlanForm,] = React.useState<BudgetPlanFormValues>(initialFormValues,)
	const [firstStepOpen, setFirstStepOpen,] = React.useState<boolean>(false,)
	const [secondStepOpen, setSecondStepOpen,] = React.useState<boolean>(false,)
	const [thirdStepStepOpen, setThirdStepOpen,] = React.useState<boolean>(false,)

	const {
		data: budgetPlan,
	} = useGetBudgetPlanById(budgetPlanId,)

	const {
		mutateAsync: updateBudgetPlan,
		isPending: updatePending,
	} = useUpdateBudgetPlan()
	const {
		mutateAsync: createBudgetAllocation,
	} = useCreateBudgetAllocation()
	const initialValues = React.useMemo(() => {
		return getBudgetDrafFormInitialValues(budgetPlan,)
	},[budgetPlan,],)

	const {
		data: clientsList,
	} = getClientListWithoutBudgetPlan()

	const clientOptionsArray = clientsList?.map((client,) => {
		return {
			label: `${client.firstName} ${client.lastName}`,
			value: {
				id:   client.id,
				name: `${client.firstName} ${client.lastName}`,
			},
		}
	},) ?? []
	React.useEffect(() => {
		if (budgetPlan) {
			setBudgetPlanForm(getBudgetDrafFormInitialValues(budgetPlan,),)
		}
	}, [budgetPlan,],)
	const {
		data: bankList,
	} = useBanksByClientId(budgetPlanForm.clientId?.value.id ?? '',)
	const bankIds = budgetPlanForm.bankIds?.map((bank,) => {
		return bank.value
	},) ?? []
	const uniqueBanksIds = [...new Set(bankIds,),]

	const {
		data: accountList,
	} = useGetAccountsBySourceIds({
		bankIds: uniqueBanksIds,
	},)

	React.useEffect(() => {
		if (
			accountList &&
		budgetPlan &&
		(!budgetPlanForm.accountIds || budgetPlanForm.accountIds.length === 0)
		) {
			const accounts = accountList
				.map((account,) => {
					const bank = budgetPlan.budgetPlanBankAccounts?.find((item,) => {
						return item.accountId === account.id
					},)
					const allocation = budgetPlan.allocations.find((item,) => {
						return item.accountId === account.id
					},)
					if (!allocation || !bank) {
						return null
					}

					return {
						label: account.accountName,
						value: {
							id:       account.id,
							name:     account.accountName,
							bankName: bank.bank.bankName,
							bankId:   bank.bank.id,
							amount:   String(allocation.amount,),
							budget:   String(allocation.budget,),
							currency: allocation.currency,
						},
					}
				},)
				.filter(Boolean,) as Array<IOptionType<BudgetClientListType>>

			setBudgetPlanForm((prev,) => {
				return {
					...prev,
					accountIds: accounts,
				}
			},)
		}
	}, [accountList,],)
	const {
		mutateAsync: deleteAllAllocations,
	} = useDeleteAllBudgetPlanAllocations()

	const bankListOptions = React.useMemo(() => {
		const existingBankIds = new Set(budgetPlanForm.bankIds?.map((item,) => {
			return item.value
		},),)
		return bankList?.map((bank,) => {
			return {
				label: `${bank.bankName} (${bank.branchName})`,
				value: bank.id,
			}
		},)
			.filter((bank,) => {
				return !existingBankIds.has(bank.value,)
			},) ?? []
	},
	[bankList, budgetPlanForm,],)

	const accountListOptions = React.useMemo(() => {
		const bankMap = new Map(bankList?.map((bank,) => {
			return [bank.id, bank.bankName,]
		},),)
		const existingAccountIds = new Set(budgetPlanForm.accountIds?.map((item,) => {
			return item.value.id
		},),)

		return accountList?.filter(
			(account, index, self,) => {
				return index === self.findIndex((a,) => {
					return a.id === account.id
				},)
			},
		)
			.map((account, index,) => {
				return {
					label: account.accountName,
					value: {
						id:       account.id,
						name:     account.accountName,
						bankId:   account.bankId,
						bankName: `${bankMap.get(account.bankId,)}`,
					},
				}
			},)
			.filter((account,) => {
				return !existingAccountIds.has(account.value.id,)
			},) ??
		[]
	},
	[accountList, budgetPlanForm,],)

	const handleSubmit = async(
		values: BudgetPlanFormValues,
		form: FormApi<BudgetPlanFormValues>,
	): Promise<void> => {
		const bankAccounts = values.bankIds?.map((bank,) => {
			return {
				bankId:     bank.value,
				accountIds: values.accountIds
					?.filter((account,) => {
						return account.value.bankId === bank.value
					},)
					.map((account,) => {
						return account.value.id
					},),
			}
		},)
		const budgetPlan = await updateBudgetPlan({
			clientId:     values.clientId?.value.id ?? '',
			bankAccounts: (bankAccounts ?? []).map((bankAccount,) => {
				return {
					bankId:     bankAccount.bankId,
					accountIds: bankAccount.accountIds ?? [],
				}
			},),
			isActivated: true,
			name:        values.budgetPlanName ?? '',
			id:          budgetPlanId ?? '',
		},)
		const idsToDelete = budgetPlan.allocations.map((allocation,) => {
			return allocation.id
		},)
		if (idsToDelete.length > 0) {
			await deleteAllAllocations({
				id: idsToDelete,
			},)
		}
		const createAllocations = values.accountIds?.map(async(account,) => {
			if (account.value.amount && account.value.currency && account.value.budget) {
				return createBudgetAllocation({
					amount:       parseFloat(account.value.amount,),
					budget: 		    parseFloat(account.value.budget,),
					currency:     account.value.currency,
					budgetPlanId: budgetPlan.id,
					accountId:    account.value.id,
				},)
			}
			return null
		},)
		if (createAllocations && createAllocations.length > 0) {
			await Promise.all(createAllocations,)
		}
		onClose()
		form.reset()
	}
	const {
		setIsThirdStepValid, setTotalAmount, resetBudgetStore, total,
	} = useBudgetStore()
	React.useEffect(() => {
		const valid = !budgetPlanForm.accountIds?.some((account,) => {
			return !account.value.amount || !account.value.currency || account.value.budget === '0'
		},)
		setIsThirdStepValid(valid,)
	}, [budgetPlanForm.accountIds,],)
	const {
		data: currencyList,
	} = useGetAllCurrencies()
	React.useEffect(() => {
		const total = budgetPlanForm.accountIds?.reduce((sum, account,) => {
			const currency = currencyList?.find((c,) => {
				return c.currency === account.value.currency
			},)
			if (!currency) {
				return sum
			}

			const amount = parseFloat(account.value.amount ?? '0',)
			const convertedAmount = isNaN(amount,) ?
				0 :
				parseFloat((amount * currency.rate).toFixed(2,),)
			return sum + convertedAmount
		}, 0,)
		setTotalAmount(total ?? 0,)
		return () => {
			resetBudgetStore()
		}
	}, [budgetPlanForm.accountIds, currencyList, setTotalAmount,],)

	const currencyOptionsArray = currencyList?.map((currency,) => {
		return {
			label: currency.currency,
			value: currency.currency,
		}
	},) ?? []
	const updateAccountData = (accountId: string, field: 'amount' | 'currency' | 'budget', value: string | IOptionType<CurrencyList>,): void => {
		setBudgetPlanForm((prev,) => {
			return {
				...prev,
				accountIds: prev.accountIds ?
					[...prev.accountIds,].map((account,) => {
						return (account.value.id === accountId ?
							{
								...account,
								value: {
									...account.value,
									[field]: field === 'currency' && typeof value !== 'string' ?
										value.value :
										value,
								},
							} :
							account)
					},
					) :
					[],
			}
		},)
	}
	const checkFormValidity = React.useCallback(() => {
		return budgetPlanForm.accountIds?.every((account,) => {
			const {
				amount, currency, budget,
			} = account.value
			return amount && currency && budget !== ''
		},)
	}, [budgetPlanForm,],)

	const sortFormValues = (values: BudgetPlanFormValues,): BudgetPlanFormValues => {
		return {
			...values,
			accountIds: values.accountIds?.slice().sort((a, b,) => {
				return a.label.localeCompare(b.label,)
			},),
			bankIds:    values.bankIds?.slice().sort((a, b,) => {
				return a.label.localeCompare(b.label,)
			},),
		}
	}
	const validateBankAccounts = (form: typeof budgetPlanForm,): Array<string> => {
		const selectedBankIds = form.bankIds?.map((b,) => {
			return b.value
		},) ?? []
		const accountBankIds = form.accountIds?.map((a,) => {
			return a.value.bankId
		},) ?? []

		const unmatchedBanks = selectedBankIds.filter(
			(bankId,) => {
				return !accountBankIds.includes(bankId,)
			},
		)
		return unmatchedBanks
	}
	const banksWithoutAccount = validateBankAccounts(budgetPlanForm,)

	return (
		<Form<BudgetPlanFormValues>
			onSubmit={handleSubmit}
			validate={validateBudgetForm}
			initialValues={budgetPlanForm}
			render={({
				handleSubmit,
				hasValidationErrors,
			},) => {
				return (
					<form className={styles.budgetPlanWrapper} onSubmit={handleSubmit}>
						<div className={styles.addBudgetHeader}>
							<p className={styles.addHeaderTitle}>Edit budget plan</p>
						</div>
						<div className={styles.editFormWrapper}>
							<FormCollapse
								title='Budget plan information'
								isOpen={firstStepOpen}
								onClose={setFirstStepOpen}
								info={[displayBudgetPlanInformation(budgetPlanForm, 1,),]}
							>
								<FormField
									name='budgetPlanName'
									placeholder='Budget plan name'
									value={budgetPlanForm.budgetPlanName}
									onChange={(e,) => {
										setBudgetPlanForm({
											...budgetPlanForm,
											budgetPlanName:    e.target.value,
										},)
									}}
								/>
								<SelectField<BudgetClientListType>
									name='clientId'
									isDisabled={!clientsList}
									placeholder='Select client'
									leftIcon={<ClientsRoute width={18} height={18} />}
									options={clientOptionsArray}
									onChange={(select,) => {
										if (select && !Array.isArray(select,)) {
											setBudgetPlanForm({
												...budgetPlanForm,
												bankIds:    [],
												accountIds: [],
												clientId:    select as IOptionType<BudgetClientListType>,
											},)
										}
									}}
									value={budgetPlanForm.clientId}
									isSearchable
								/>
							</FormCollapse>
							<FormCollapse
								title='Budget selection'
								isOpen={secondStepOpen}
								onClose={setSecondStepOpen}
								info={[displayBudgetPlanInformation(budgetPlanForm, 2,),]}
							>
								<p className={styles.collapseText}>Banks</p>
								<SelectField
									name='bankIds'
									isDisabled={!budgetPlanForm.clientId?.value.id}
									placeholder='Select banks'
									leftIcon={<BankSelect width={18} height={18} />}
									options={bankListOptions}
									onChange={(selectedBanks,) => {
										if (Array.isArray(selectedBanks,)) {
											const selectedBankIds = selectedBanks.map((bank,) => {
												return bank.value
											},)
											const filteredAccountIds = (budgetPlanForm.accountIds ?? []).filter((account,) => {
												return account.value.bankId && selectedBankIds.includes(account.value.bankId,)
											},)
											setBudgetPlanForm({
												...budgetPlanForm,
												bankIds:    selectedBanks,
												accountIds: filteredAccountIds.length > 0 ?
													filteredAccountIds :
													undefined,
											},)
										}
									}}
									value={budgetPlanForm.bankIds}
									isSearchable
									isMulti
								/>
								<p className={styles.collapseText}>Accounts</p>
								<SelectField<BudgetClientListType>
									name='accountIds'
									isDisabled={!accountList}
									placeholder='Select bank accounts'
									leftIcon={<AccountIcon width={18} height={18} />}
									options={accountListOptions}
									onChange={(select,) => {
										if (select && Array.isArray(select,)) {
											setBudgetPlanForm({
												...budgetPlanForm,
												accountIds:    select as Array<IOptionType<BudgetClientListType>>,
											},)
										}
									}}
									value={budgetPlanForm.accountIds}
									isMulti
									isSearchable
								/>
							</FormCollapse>
							<FormCollapse
								title='Bank allocations'
								isOpen={thirdStepStepOpen}
								onClose={setThirdStepOpen}
								info={[displayBudgetPlanInformation(budgetPlanForm, 3,),]}
							>
								{budgetPlanForm.accountIds?.map((account,) => {
									return <BudgetAccountCollapse
										key={account.value.id}
										account={account.value}
										updateAccountData={updateAccountData}
										currencyOptionsArray={currencyOptionsArray}
									/>
								},)}
							</FormCollapse>

						</div>
						<div className={styles.addFooterWrapper}>
							<div className={styles.footerTootalBlock}>
								<p className={styles.footerTotalText}>Total:</p>
								<p className={styles.footerTotalText}>${localeString(total, '', 2, false,)}</p>
							</div>
							<div className={styles.footerButtonsBlock}>
								<Button<ButtonType.TEXT>
									disabled={isDeepEqual(sortFormValues(budgetPlanForm,), sortFormValues(initialValues,),)}
									onClick={() => {
										setBudgetPlanForm(initialValues,)
									}}
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
									disabled={isDeepEqual(sortFormValues(budgetPlanForm,), sortFormValues(initialValues,),) || hasValidationErrors || updatePending || !checkFormValidity() || Boolean(banksWithoutAccount.length,)}
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