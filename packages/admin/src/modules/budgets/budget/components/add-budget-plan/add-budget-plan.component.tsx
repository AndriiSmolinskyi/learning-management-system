/* eslint-disable complexity */
import * as React from 'react'
import {
	Form,
} from 'react-final-form'

import {
	AddBudgetPlanFooter,
	AddBudgetPlanHeader,
	ExitModal,
	AddBudgetFirstStep,
	AddBudgetSecondStep,
	AddBudgetThirdStep,
} from './components'
import {
	Dialog,
	LabeledProgressBar,
} from '../../../../../shared/components'

import type {
	BudgetPlanFormValues,
	StepType,
} from '../../../budget/budget.types'
import {
	getBudgetPlanFormSteps,
} from '../../budget.utils'
import {
	validateBudgetForm,
} from '../../budget.validator'
import {
	useBudgetStore,
} from '../../budget.store'
import {
	useCreateBudgetPlan,
	useCreateBudgetAllocation,
	useCreateBudgetDraft,
	useGetBudgetDraftById,
	useUpdateBudgetDraft,
	useCreateBudgetDraftAllocation,
	useDeleteAllBudgetDraftAllocations,
	useDeleteBudgetDraftById,
} from '../../../../../shared/hooks'
import type {
	CurrencyList,
	IOptionType,
} from '../../../../../shared/types'
import {
	getBudgetDrafFormInitialValues,
} from '../../budget.utils'
import type {
	IAccountItem,
} from '../../../budget/budget.types'

import * as styles from './add-budget-plan.styles'

interface IAddBudgetPlanProps {
	toggleExitDialogVisible: () => void
	onClose: () => void
	isExitDialogOpen: boolean
	budgetDraftId: string | undefined
	toggleDialogDialogVisible: () => void
	setBudgetPlanId: React.Dispatch<React.SetStateAction<string | undefined>>
	setIsExitDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const initialFormValues = {
	manageAmount:      '',
	budgetPlanName:     '',
	bankIds:        undefined,
	accountIds:     undefined,
	clientId:       undefined,
}
export const AddBudgetPlan: React.FC<IAddBudgetPlanProps> = ({
	toggleExitDialogVisible,
	isExitDialogOpen,
	onClose,
	budgetDraftId,
	toggleDialogDialogVisible,
	setBudgetPlanId,
	setIsExitDialogOpen,
},) => {
	const [step, setStep,] = React.useState<StepType>(1,)
	const [budgetPlanForm, setBudgetPlanForm,] = React.useState<BudgetPlanFormValues>(initialFormValues,)
	const [accountsData, setAccountsData,] = React.useState<Array<IAccountItem>>(
		budgetPlanForm.accountIds?.map((account,) => {
			return {
				id:       account.value.id,
				amount:   undefined,
				budget:   undefined,
				currency: undefined,
				bankName: account.value.bankName,
			}
		},) ?? [],
	)
	const {
		mutateAsync: createBudgetPlan,
	} = useCreateBudgetPlan()
	const {
		mutateAsync: createBudgetAllocation,
	} = useCreateBudgetAllocation()
	const {
		mutateAsync: createBudgetDraftAllocation,
	} = useCreateBudgetDraftAllocation()
	const {
		mutateAsync: createBudgetDraft,
		isPending,
	} = useCreateBudgetDraft()
	const {
		mutateAsync: deleteAllBudgetDraftAllocations,
	} = useDeleteAllBudgetDraftAllocations()
	const {
		data: budgetDraft,
	} = useGetBudgetDraftById(budgetDraftId,)
	const {
		mutateAsync: updateBudgetPlanDraft,
	} = useUpdateBudgetDraft()
	const {
		mutateAsync: deleteBudgetDraft,
	} = useDeleteBudgetDraftById()

	const handleCloseState = (): void => {
		onClose()
		setBudgetPlanForm(initialFormValues,)
		setAccountsData([],)
		resetBudgetStore()
	}
	React.useEffect(() => {
		if (budgetDraft) {
			setBudgetPlanForm(getBudgetDrafFormInitialValues(budgetDraft,),)
			setAccountsData(budgetDraft.allocations?.map((allocation,) => {
				const bank = budgetDraft.budgetPlanBankAccounts?.find((item,) => {
					return item.accountId === allocation.accountId
				},)
				return {
					id:       bank?.account.id ?? '',
					amount:   String(allocation.amount,),
					budget:   String(allocation.budget,),
					currency: allocation.currency,
					bankName: `${bank?.bank.bankName} (${bank?.bank.branchName})`,
				}
			},) ?? [],
			)
		}
	}, [budgetDraft,],)

	const handleSaveDraft = async(): Promise<void> => {
		const bankAccounts = budgetPlanForm.bankIds?.map((bank,) => {
			return {
				bankId:     bank.value,
				accountIds: budgetPlanForm.accountIds
					?.filter((account,) => {
						return account.value.bankId === bank.value
					},)
					.map((account,) => {
						return account.value.id
					},),
			}
		},)
		const budgetDraft = await createBudgetDraft({
			name:         budgetPlanForm.budgetPlanName ?? '',
			clientId:     budgetPlanForm.clientId?.value.id ?? '',
			bankAccounts: (bankAccounts ?? []).map((bankAccount,) => {
				return {
					bankId:     bankAccount.bankId,
					accountIds: bankAccount.accountIds ?? [],
				}
			},),
		},)
		const createAllocations = accountsData.map(async(account,) => {
			if (account.amount && account.currency && account.budget) {
				return createBudgetDraftAllocation({
					amount:            parseFloat(account.amount,),
					budget:            parseFloat(account.budget,),
					currency:          account.currency,
					budgetPlanDraftId: budgetDraft.id,
					accountId:         account.id,
				},)
			}
			return null
		},
		)
		await Promise.all(createAllocations,)
		handleCloseState()
	}

	const handleUpdateDraft = async(): Promise<void> => {
		if (!budgetDraftId) {
			return
		}

		const bankAccounts = budgetPlanForm.bankIds?.map((bank,) => {
			return {
				bankId:     bank.value,
				accountIds: budgetPlanForm.accountIds
					?.filter((account,) => {
						return account.value.bankId === bank.value
					},)
					.map((account,) => {
						return account.value.id
					},),
			}
		},)
		const updatedDraft = await updateBudgetPlanDraft({
			id:           budgetDraftId,
			name:         budgetPlanForm.budgetPlanName ?? '',
			clientId:     budgetPlanForm.clientId?.value.id ?? '',
			bankAccounts: bankAccounts ?
				bankAccounts.map((bankAccount,) => {
					return {
						bankId:     bankAccount.bankId,
						accountIds: bankAccount.accountIds ?? [],
					}
				},) :
				undefined,
		},)
		const idsToDelete = accountsData.map((account,) => {
			const item = budgetDraft?.allocations?.find((item,) => {
				return item.accountId === account.id
			},)
			if (!item) {
				return null
			}
			return item.id
		},)
			.filter((item,): item is string => {
				return item !== null
			},)

		if (idsToDelete.length > 0) {
			await deleteAllBudgetDraftAllocations({
				id: idsToDelete,
			},)
		}
		if (bankAccounts && bankAccounts.length > 0) {
			const createAllocations = accountsData.map(async(account,) => {
				const isAccountInBank = bankAccounts.some((bankAccount,) => {
					return bankAccount.accountIds?.includes(account.id,)
				},
				)
				if (isAccountInBank && account.amount && account.currency && account.budget) {
					return createBudgetDraftAllocation({
						amount:            parseFloat(account.amount,),
						currency:          account.currency,
						budget:            parseFloat(account.budget,),
						budgetPlanDraftId: updatedDraft.id,
						accountId:         account.id,
					},)
				}
				return null
			},
			)
			await Promise.all(createAllocations,)
		}
		handleCloseState()
	}
	const {
		isThirdStepValid,
		resetBudgetStore,
	} = useBudgetStore()
	const handlePrev = (): void => {
		setStep((prevState,) => {
			return (prevState > 1 ?
(prevState - 1) as StepType :
				prevState)
		},)
	}

	const handleNext = (): void => {
		setStep((prevState,) => {
			return (prevState < 4 ?
(prevState + 1) as StepType :
				prevState)
		},)
	}

	React.useEffect(() => {
		if (budgetPlanForm.accountIds && !budgetDraftId) {
			const currentIds = budgetPlanForm.accountIds.map((a,) => {
				return a.value.id
			},)
			setAccountsData((prev = [],) => {
				const newAccountsData = currentIds.map((id,) => {
					const formAccount = budgetPlanForm.accountIds?.find((a,) => {
						return a.value.id === id
					},)
					const existing = prev.find((acc,) => {
						return acc.id === id
					},)

					return {
						id,
						bankName: formAccount?.value.bankName,
						amount:   existing?.amount ?? undefined,
						currency: existing?.currency ?? undefined,
						budget:   existing?.budget ?? undefined,
					}
				},)

				return newAccountsData
			},)
		}
		const allocationsFromDB = budgetDraft?.allocations?.map((allocation,) => {
			const bank = budgetDraft.budgetPlanBankAccounts?.find((item,) => {
				return item.accountId === allocation.accountId
			},)

			return {
				id:       bank?.account.id ?? '',
				amount:   String(allocation.amount,),
				budget:   String(allocation.budget,),
				currency: allocation.currency,
				bankName: `${bank?.bank.bankName} (${bank?.bank.branchName})`,
			}
		},) ?? []
		const localAllocations = budgetPlanForm.accountIds?.map((account,) => {
			return {
				id:       account.value.id,
				amount:   undefined,
				currency: undefined,
				budget:   undefined,
				bankName: account.value.bankName,
			}
		},) ?? []
		if (budgetDraftId) {
			setAccountsData([...allocationsFromDB, ...localAllocations,],)
		}
	}, [budgetPlanForm.accountIds, budgetDraftId,],)
	const handleSubmit = async(values: BudgetPlanFormValues,): Promise<void> => {
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
		const budgetPlan = await createBudgetPlan({
			clientId:     values.clientId?.value.id ?? '',
			bankAccounts: (bankAccounts ?? []).map((bankAccount,) => {
				return {
					bankId:     bankAccount.bankId,
					accountIds: bankAccount.accountIds ?? [],
				}
			},),
			isActivated:  true,
			name:        values.budgetPlanName ?? '',
		},)
		const createAllocations = accountsData.map(async(account,) => {
			if (account.amount && account.currency && account.budget) {
				return createBudgetAllocation({
					amount:       parseFloat(account.amount,),
					currency:     account.currency,
					budget:       parseFloat(account.budget,),
					budgetPlanId: budgetPlan.id,
					accountId:    account.id,
				},)
			}
			return null
		},
		)
		await Promise.all(createAllocations,)
		if (budgetDraftId) {
			await deleteBudgetDraft(budgetDraftId,)
		}
		setBudgetPlanId(budgetPlan.id,)
		toggleDialogDialogVisible()
		handleCloseState()
	}

	const updateAccountData = (accountId: string, field: 'amount' | 'currency' | 'budget', value: string | IOptionType<CurrencyList>,): void => {
		setAccountsData((prev,) => {
			return prev.map((acc,) => {
				return acc.id === accountId ?
					{
						...acc,
						[field]: field === 'currency' && typeof value !== 'string' ?
							value.value :
							value,
					} :
					acc
			},)
		},)
	}

	const checkFormValidity = React.useCallback(() => {
		return accountsData.every((account,) => {
			const {
				amount, currency, budget,
			} = account
			return amount && currency && budget !== ''
		},)
	}, [accountsData,],)

	return (
		<Form<BudgetPlanFormValues>
			onSubmit={handleSubmit}
			validate={validateBudgetForm}
			initialValues={budgetPlanForm}
			render={({
				handleSubmit,
				errors,
				values,
			},) => {
				const firstStepDisabled = Boolean(errors?.['budgetPlanName'],) || Boolean(errors?.['clientId.label'],)
				const secondStepDisabled = (errors?.['bankIds']?.length > 0) || (errors?.['accountIds']?.length > 0)
				const thirdStepDisabled = (!isThirdStepValid && !budgetDraftId) || !checkFormValidity()
				const isDisabled = (step: StepType,): boolean => {
					if (step === 1) {
						return !firstStepDisabled
					}
					if (step === 2) {
						return !secondStepDisabled
					}
					return !thirdStepDisabled
				}
				return (
					<form className={styles.budgetPlanWrapper} onSubmit={handleSubmit}>
						<AddBudgetPlanHeader/>
						<LabeledProgressBar
							currentStep={step}
							steps={getBudgetPlanFormSteps(values, accountsData,)}
						/>
						<div className={styles.formWrapper}>
							<AddBudgetFirstStep
								step={step}
								values={budgetPlanForm}
								setBudgetPlanForm={setBudgetPlanForm}
							/>
							<AddBudgetSecondStep
								step={step}
								values={budgetPlanForm}
								setBudgetPlanForm={setBudgetPlanForm}
							/>
							<AddBudgetThirdStep
								step={step}
								values={budgetPlanForm}
								setBudgetPlanForm={setBudgetPlanForm}
								accountsData={accountsData}
								updateAccountData={updateAccountData}
								setAccountsData={setAccountsData}
							/>
						</div>
						<AddBudgetPlanFooter
							handlePrev={handlePrev}
							handleNext={handleNext}
							step={step}
							isValid={isDisabled(step,)}
							handleSaveDraft={budgetDraftId ?
								handleUpdateDraft :
								handleSaveDraft}
							values={budgetPlanForm}
						/>
						<Dialog
							onClose={() => {
								setIsExitDialogOpen(false,)
							}}
							open={isExitDialogOpen}
							isCloseButtonShown
							backdropClassName={styles.exitDialogBackdrop}
						>
							<ExitModal
								onExit={() => {
									setIsExitDialogOpen(false,)
									handleCloseState()
								}}
								onSaveDraft={async() => {
									setIsExitDialogOpen(false,)
									if (budgetDraftId) {
										await handleUpdateDraft()
									} else {
										await handleSaveDraft()
									}
								}}
								disabled={isPending || Boolean(!budgetPlanForm.clientId,)}
							/>
						</Dialog>
					</form>
				)
			}
			}
		/>
	)
}