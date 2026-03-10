import type {
	MultiValue,
} from 'react-select'
import type {
	CurrencyList,
	IOptionType,
} from '../../../shared/types'

export type StepType = 1 | 2 | 3

export type BudgetClientListType = {
	id: string
	name: string
	bankId?: string
	bankName?: string
	amount?: string,
	currency?: CurrencyList,
	budget?: string
}

export type StoreBudgetClientList = {
	id: string
	name: string
}

type TBudgetMultiItem = Array<IOptionType<BudgetClientListType>> | undefined

export type TBudgetStoreFilterItem = MultiValue<IOptionType<StoreBudgetClientList>> | undefined

export type BudgetPlanFormValues = {
	budgetPlanName: string | undefined
	clientId: IOptionType<BudgetClientListType> | undefined
	bankIds: Array<IOptionType<string>> | undefined
	accountIds: TBudgetMultiItem
}

export type EditBudgetPlanFormValues = {
	budgetPlanName: string | undefined
	clientId: IOptionType<BudgetClientListType> | undefined
	bankIds: Array<IOptionType<string>> | undefined
	accountIds: TBudgetMultiItem
}

export type TBudgetSearch = {
	clientIds?: TBudgetStoreFilterItem
	isActivated?: boolean | undefined
	search?: string
}

export interface IAccountItem {
	id: string
	amount: string | undefined
	budget: string | undefined
	currency: CurrencyList | undefined
	bankName?: string
}