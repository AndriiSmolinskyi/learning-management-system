import type { ExpenseCategory, Transaction, } from '@prisma/client'

export interface IExpenseCategory extends ExpenseCategory {
	available: number
	transactions: Array<Transaction & {usdAmount: number}>
}