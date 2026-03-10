import type {
	IExpenseCategory,
} from '../../shared/types'

export interface ICreateExpenseCategoryBody {
	budget: number
	name: string
	budgetPlanId: string
}

export interface ILinkTransactionTypesBody {
	expenseCategoryId: string
	transactionTypes: Array<string>
}

export interface ICreateTransactionCategoryDependencyBody {
	expenseCategoryId: string
	transactionId: number
}

export interface IEditLinkTransactionTypesBody {
	expenseCategoryId: string
	prevExpenseCategoryId: string
	transactionId: number
}

export interface IExpenseUpdateBody {
	id: string
	categories: Array<Partial<IExpenseCategory>>
}

export interface IGetExpenseCategoriesFilter {
	id: string
	isYearly: boolean
}