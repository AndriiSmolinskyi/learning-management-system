/* eslint-disable complexity */
import {
	limitedAmountValidator,
} from '../../../shared/utils/validators'
import type {
	IBudgetDraft,
	IBudgetPlan,
} from '../../../shared/types'
import type {
	IProgressBarStep,
} from '../../../shared/types'
import type {
	BudgetPlanFormValues,
	StepType,
} from './budget.types'
import type {
	IAccountItem,
} from './budget.types'
import {
	localeString,
} from '../../../shared/utils'

const getBudgetNameAndClient = (values: BudgetPlanFormValues,): string => {
	const client = values.clientId ?
		`, ${values.clientId.value.name} (client)` :
		undefined
	const budgetPlanName = values.budgetPlanName ?
		`${values.budgetPlanName}` :
		undefined
	return `${budgetPlanName ?? ''}${client ?? ''}` ||
		'Select the client and enter a name for the new budget management account.'
}

const getBudgetBanksAccount = (values: BudgetPlanFormValues,): string => {
	if (!values.bankIds?.length) {
		return 'Select one or more banks, then choose associated bank accounts to link with this plan.'
	}
	const banksWithAccounts = values.bankIds.map((bank,) => {
		const relatedAccounts = values.accountIds
			?.filter((account,) => {
				return account.value.bankId === bank.value
			},)
			.map((account,) => {
				return account.label
			},)
			.join(', ',)
		return relatedAccounts ?
			`${bank.label} (${relatedAccounts})` :
			bank.label
	},).join(', ',)
	return banksWithAccounts
}

export const getBudgetAccountsData = (values: Array<IAccountItem>,): string => {
	if (!values.length) {
		return 'Set amount and currency allocations for each selected bank.'
	}

	const formattedValues = values
		.filter(({
			amount, currency, bankName,
		},) => {
			return amount && currency && bankName
		},)
		.map(({
			amount, currency, bankName,
		},) => {
			return `${localeString(Number(amount,), '', 2, false,)} ${currency} (${bankName})`
		},)
	return formattedValues.length ?
		formattedValues.join(', ',) :
		'Set amount and currency allocations for each selected bank.'
}

export const getBudgetPlanFormSteps = (values: BudgetPlanFormValues, accountsData: Array<IAccountItem>,): Array<IProgressBarStep> => {
	return [
		{
			labelTitle: 'Budget plan information',
			labelDesc:  getBudgetNameAndClient(values,),
		},
		{
			labelTitle: 'Bank selection',
			labelDesc:  getBudgetBanksAccount(values,),
		},
		{
			labelTitle: 'Bank allocations',
			labelDesc:  getBudgetAccountsData(accountsData,),
		},
	]
}

export const getBudgetDrafFormInitialValues = (draft?: IBudgetDraft | IBudgetPlan,): BudgetPlanFormValues => {
	return {
		budgetPlanName:        draft?.name,
		clientId:       draft?.client ?
			{
				label: `${draft.client.firstName} ${draft.client.lastName}`,
				value: {
					id:   draft.client.id,
					name: `${draft.client.firstName} ${draft.client.lastName}`,
				},
			} :
			undefined,
		bankIds: draft?.budgetPlanBankAccounts ?
			draft.budgetPlanBankAccounts.filter(
				(account, index, self,) => {
					return index === self.findIndex((a,) => {
						return a.bankId === account.bankId
					},)
				},
			)
				.map((account,) => {
					return {
						label: `${account.bank.bankName} (${account.bank.branchName})`,
						value:  account.bankId,
					}
				},) :
			undefined,
		accountIds:     draft?.budgetPlanBankAccounts ?
			draft.budgetPlanBankAccounts.filter(
				(account, index, self,) => {
					return index === self.findIndex((a,) => {
						return a.accountId === account.accountId
					},)
				},
			).map((account,) => {
				const bank = draft.budgetPlanBankAccounts?.find((item,) => {
					return item.accountId === account.accountId
				},)
				const allocation = draft.allocations?.find((item,) => {
					return item.accountId === account.accountId
				},
				)
				return {
					label: account.account.accountName,
					value: {
						id:       account.account.id,
						name:     account.account.accountName,
						bankName: bank?.bank.bankName,
						bankId:   bank?.bank.id,
						amount:   String(allocation?.amount,),
						budget:   String(allocation?.budget,),
						currency: allocation?.currency,
					},
				}
			},) :
			undefined,
	}
}

export const amountValidator = (total: number,): (value: string) => string | undefined => {
	return (value: string,): string | undefined => {
		return limitedAmountValidator(value, total,)
	}
}

export const displayBudgetPlanInformation = (form: BudgetPlanFormValues, step: StepType,): string => {
	switch (step) {
	case 1: {
		return form.budgetPlanName && form.clientId ?
			`${form.budgetPlanName} (${form.clientId.value.name})` :
			''
	}
	case 2: {
		return form.bankIds ?
			form.bankIds.map((bank,) => {
				const relatedAccounts = form.accountIds
					?.filter((account,) => {
						return account.value.bankId === bank.value
					},)
					.map((account,) => {
						return account.label
					},)
					.join(', ',)
				return relatedAccounts ?
					`${bank.label} (${relatedAccounts})` :
					bank.label
			},).join(', ',) :
			''
	}
	case 3: {
		return form.accountIds ?
			form.accountIds
				.filter(({
					value,
				},) => {
					return value.amount && value.currency && value.bankName
				},)
				.map(({
					value,
				},) => {
					const {
						amount, currency, bankName,
					} = value
					return `${localeString(Number(amount,), '', 2, false,)} ${currency} (${bankName})`
				},)
				.join(', ',) :
			''
	}
	default:
		return ''
	}
}