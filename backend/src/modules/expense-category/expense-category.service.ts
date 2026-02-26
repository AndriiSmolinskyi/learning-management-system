import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type { ExpenseCategory, } from '@prisma/client'
import {
	text,
} from '../../shared/text'

import type {
	CreateExpenseCategoryDto,
	CreateTransactionCategoryDependencyDto,
	GetCategoriesFilterDto,
} from './dto'
import type {
	IExpenseCategory,
} from './expense-category.types'
import type {
	UpdateAllCategoryDto,
} from './dto/update-all.dto'
import { RedisCacheService, } from '../../modules/redis-cache/redis-cache.service'
import { BudgetRoutes, } from '../budget/budget.constants'
import { EventEmitter2, } from '@nestjs/event-emitter'
import { CryptoService, } from '../crypto/crypto.service'

@Injectable()
export class ExpenseCategoryService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cacheService: RedisCacheService,
		private readonly eventEmitter: EventEmitter2,
		private readonly cryptoService: CryptoService,

	) {}

	/**
	 * 4.2.2
	 * Retrieves expense category by unique item ID.
	 * @param id - The unique identifier of the expense category.
	 * @returns A promise that resolves to an expense category.
	 */
	public async getExpenseCategoryById(
		id: string,
		body: GetCategoriesFilterDto,
	): Promise<IExpenseCategory> {
		const {isYearly,} = body
		const now = new Date()
		const startOfYear = new Date(now.getFullYear(), 0, 1,)
		const last30Days = new Date(now,)
		last30Days.setDate(now.getDate() - 30,)
		const category = await this.prismaService.expenseCategory.findUnique({
			where:   { id, },
			include: {
				transactions: {
					where: {
						transactionDate: {
							gte: isYearly ?
								startOfYear :
								last30Days,
							lte: now,
						},
					},
					include: {
						transactionType: true,
					},
					orderBy: {
						transactionDate: 'desc',
					},
				},
			},
		},)
		if (!category) {
			throw new HttpException(text.wrongId, HttpStatus.NOT_FOUND,)
		}
		return {
			...category,
			transactions: category.transactions.map((transaction,) => {
				const usdAmount = (Number(transaction.amount,) * (transaction.rate ?? 1))
				return { ...transaction, usdAmount, }
			},),
			available: category.transactions.reduce((sum, transaction,) => {
				const usdAmount = (Number(transaction.amount,) * (transaction.rate ?? 1))

				return sum + usdAmount
			}, 0,),
		}
	}

	/**
	 * 4.2.2
	 * Retrieves all expense categories associated with a specific budget plan.
	 * @param budgetPlanId - The unique identifier of the budget plan.
	 * @returns A promise that resolves to an array of expense categories.
	 */
	public async getExpenseCategoriesByBudgetId(
		budgetPlanId: string,
		body: GetCategoriesFilterDto,
	): Promise<Array<IExpenseCategory>> {
		const categories = await this.prismaService.expenseCategory.findMany({
			where:   { budgetPlanId, },
			orderBy: { createdAt: 'desc', },
			include: {
				transactions: {
					include: {
						transactionType: true,
					},
				},
			},
		},)
		const {isYearly,} = body
		const now = new Date()
		const startOfYear = new Date(now.getFullYear(), 0, 1,)
		const last30Days = new Date(now,)
		last30Days.setDate(now.getDate() - 30,)
		const enrichedCategories = await Promise.all(
			categories.map(async(category,) => {
				const transactions = await this.prismaService.transaction.findMany({
					where: {
						expenseCategoryId: category.id,
						transactionDate:   {
							gte: isYearly ?
								startOfYear :
								last30Days,
							lte: now,
						},
					},
				},)
				const transactionsWithUsdAmount = transactions.map((transaction,) => {
					const usdAmount = (Number(transaction.amount,) * (transaction.rate ?? 1))
					return { ...transaction, usdAmount, }
				},)
				const available = transactionsWithUsdAmount.reduce((sum, transaction,) => {
					return sum + transaction.usdAmount
				}, 0,)
				return {
					...category,
					available,
					transactions: transactionsWithUsdAmount,
				}
			},),
		)
		return enrichedCategories
	}

	/**
	 * 4.2.2
	 * Creates a new expense category.
	 * @param data - The data required to create a new expense category.
	 * @returns A promise that resolves to the created expense category.
	 */
	public async createExpenseCategory(data: CreateExpenseCategoryDto,): Promise<ExpenseCategory> {
		// todo: Remove after asset refactor approved
		// await this.cacheService.deleteByUrl([
		// 	`/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
		// 	`/${BudgetRoutes.MODULE}/${data.budgetPlanId}`,
		// ],)
		// const budget = await this.prismaService.budgetPlan.findUnique({
		// 	where: {
		// 		id: data.budgetPlanId,
		// 	},
		// },)
		// this.eventEmitter.emit(eventNames.BUDGET_LIST_UPDATED, {budgetId: data.budgetPlanId, budget:   budget ?
		// 	{ ...budget, name: this.cryptoService.decryptString(budget.name,), } :
		// 	null,},)
		return this.prismaService.expenseCategory.create({
			data,
		},)
	}

	/**
 * 4.2.2
 * Updates all expense categories for a given budget plan.
 * - New categories (without `id`) are created.
 * - Existing categories are updated.
 * - Categories in the database that are not present in the provided list are deleted.
 *
 * @param budgetPlanId - The unique identifier of the budget plan.
 * @param body - The list of updated expense categories.
 * @returns A promise that resolves when the update process is complete.
 */
	public async updateAllByBudgetId(body: Array<UpdateAllCategoryDto>, budgetPlanId: string,): Promise<void> {
		const existedCategories = await this.prismaService.expenseCategory.findMany({
			where: {
				budgetPlanId,
			},
		},)
		const bodyIds = new Set(body.map((cat,) => {
			return cat.id
		},).filter(Boolean,),)
		const existedIds = new Set(existedCategories.map((cat,) => {
			return cat.id
		},),)

		const createList = body.filter((cat,) => {
			return !cat.id
		},)
		const updateList = body.filter((cat,) => {
			return cat.id && existedIds.has(cat.id,)
		},)
		const deleteList = existedCategories.filter((cat,) => {
			return !bodyIds.has(cat.id,)
		},)
		if (createList.length > 0) {
			await this.prismaService.expenseCategory.createMany({
				data: createList.map((cat,) => {
					return {
						name:   cat.name,
						budget: cat.budget,
						budgetPlanId,
					}
				},),
			},)
		}
		await Promise.all(
			updateList.map(async(cat,) => {
				return this.prismaService.expenseCategory.update({
					where: { id: cat.id, },
					data:  { name: cat.name, budget: cat.budget, },
				},)
			},
			),
		)
		if (deleteList.length > 0) {
			await this.prismaService.expenseCategory.deleteMany({
				where: { id: { in: deleteList.map((cat,) => {
					return cat.id
				},), }, },
			},)
		}
		await this.cacheService.deleteByUrl([
			`/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
			`/${BudgetRoutes.MODULE}/${budgetPlanId}`,
		],)
	}

	/**
	 * 4.2.2
	 * Deletes a specific expense category by its unique identifier.
	 * @param id - The unique identifier of the expense category.
	 * @returns A promise that resolves when the expense category is deleted.
	 */
	public async deleteExpenseCategoryById(id: string,): Promise<void> {
		const deletedExpenseCategory = await this.prismaService.expenseCategory.delete({
			where: {
				id,
			},
		},)
		await this.cacheService.deleteByUrl([
			`/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
			`/${BudgetRoutes.MODULE}/${deletedExpenseCategory.budgetPlanId}`,
		],)
	}

	/**
 * CR -008
 * Links a transaction with a specific expense category.
 *
 * @remarks
 * This method associates a transaction with an expense category by updating the transaction's `expenseCategoryId` field.
 * It is useful for categorizing existing transactions under newly created or reassigned categories.
 *
 * @param body - An object containing the `transactionId` and the `expenseCategoryId` to link.
 * @returns A promise that resolves when the link operation is complete.
 */
	public async linkTransactionWithExpenseCategory(body: CreateTransactionCategoryDependencyDto,): Promise<void> {
		const expenseCategory = await this.prismaService.expenseCategory.findUnique({
			where: {
				id: body.expenseCategoryId,
			},
		},)
		await this.prismaService.transaction.update({
			where: {
				id: body.transactionId,
			},
			data: {
				expenseCategoryId: body.expenseCategoryId,
			},
		},)
		await this.cacheService.deleteByUrl([
			`/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
			`/${BudgetRoutes.MODULE}/${expenseCategory?.budgetPlanId}`,
		],)
	}
}