/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {  PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import type { CurrencyData, } from '@prisma/client'

import {
	CBondsCurrencyService,
} from '../../modules/apis/cbonds-api/services'
import type {
	BudgetPlanExtened,
	IBudgetBanksChartAnalytics,
} from '../../modules/budget/budget.types'
import { CryptoService, } from '../../modules/crypto/crypto.service'

@Injectable()
export class BudgetRepository {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly cryptoService: CryptoService,
	) {}

	/**
	 * Retrieves a budget plan by its unique ID, including related allocations, client, bank, and account details.
	 *
	 * @param id - The unique identifier of the budget plan.
	 * @returns A Promise that resolves to the extended budget plan or null if not found.
	 */
	public async getBudgetPlanById(id: string,): Promise<BudgetPlanExtened | null> {
		const budgetPlan = await this.prismaService.budgetPlan.findUnique({
			where:   {
				id,
			},
			include: {
				allocations:            true,
				client:                 true,
				budgetPlanBankAccounts: {
					include: {
						bank: {
							include: {
								assets:   true,
								bankList: true,
							},
						},
						account: true,
					},
				},
			},
		},)
		if (!budgetPlan) {
			return null
		}
		return budgetPlan
	}

	/**
	 * Retrieves a budget plan associated with a specific client ID.
	 *
	 * @param clientId - The unique identifier of the client.
	 * @returns A Promise that resolves to the extended budget plan or null if not found.
	 */
	public async getBudgetPlanByClientId(clientId: string,): Promise<BudgetPlanExtened | null> {
		const budgetPlan = await this.prismaService.budgetPlan.findUnique({
			where:   {
				clientId,
			},
			include: {
				allocations:            true,
				client:                 true,
				budgetPlanBankAccounts: {
					include: {
						bank:    {
							include: {
								assets: true,
							},
						},
						account: true,
					},
				},
			},
		},)
		if (!budgetPlan) {
			return null
		}
		return budgetPlan
	}

	/**
	 * Deletes all budget plans associated with a given client ID.
	 *
	 * @remarks
	 * This method:
	 * - Deletes budget plans related to banks under portfolios owned by the client.
	 * - Deletes budget plans directly linked to the client.
	 *
	 * @param clientId - The unique identifier of the client.
	 * @returns A Promise that resolves once all related budget plans are deleted.
	 */
	public async deleteBudgetPlansByClientId(clientId: string,): Promise<void> {
		const portfolios = await this.prismaService.portfolio.findMany({
			where: {
				clientId,
			},
		},)
		const portfolioIds = portfolios.map((portfolio,) => {
			return portfolio.id
		},)
		await this.prismaService.budgetPlan.deleteMany({
			where: {
				budgetPlanBankAccounts: {
					some: {
						bank: {
							portfolioId: {
								in: portfolioIds,
							},
						},
					},
				},
			},
		},)
		await this.prismaService.budgetPlan.deleteMany({
			where: {
				clientId,
			},
		},)
	}

	/**
	 * Deletes all budget plans and related bank accounts for a given portfolio ID.
	 *
	 * @remarks
	 * - Deletes records from `budgetPlanBankAccount` for the specified portfolio's banks.
	 * - Deletes the associated budget plans.
	 *
	 * @param id - The unique identifier of the portfolio.
	 * @returns A Promise that resolves when deletion is complete.
	 */
	public async deleteBudgetPlansByPortfolioId(id: string,): Promise<void> {
		await this.prismaService.budgetPlanBankAccount.deleteMany({
			where: {
				bank: {
					portfolioId: id,
				},
			},
		},)
		await this.prismaService.budgetPlan.deleteMany({
			where: {
				budgetPlanBankAccounts: {
					some: {
						bank: {
							portfolioId: id,
						},
					},
				},
			},
		},)
	}

	/**
	 * Calculates the total managed budget and total bank allocation values in USD.
	 *
	 * @param budgetPlan - The extended budget plan containing allocations.
	 * @param currencyList - The list of currency exchange data.
	 * @returns An object with the total managed budget and total bank amounts in USD.
	 */
	public getAllocationsTotals(budgetPlan: BudgetPlanExtened, currencyList: Array<CurrencyData>,): {totalManage: number, totalBanks: number} {
		const { totalManage, totalBanks, } = budgetPlan.allocations.reduce(
			(acc, allocation,) => {
				const { currency, } = allocation
				const usdBudget = this.cBondsCurrencyService.getCurrencyValueExchangedToUSD(
					{
						currency,
						currencyValue: allocation.budget,
					},
					currencyList,
				)
				const usdAmount = this.cBondsCurrencyService.getCurrencyValueExchangedToUSD(
					{
						currency,
						currencyValue: allocation.amount,
					},
					currencyList,
				)
				return {
					totalManage: acc.totalManage + usdBudget,
					totalBanks:  acc.totalBanks + usdAmount,
				}
			},
			{ totalManage: 0, totalBanks: 0, },
		)
		return {
			totalManage,
			totalBanks,
		}
	}

	/**
	 * Generates analytical data representing allocation and asset totals for each bank in a budget plan.
	 *
	 * @param budgetPlan - The extended budget plan to analyze.
	 * @param currencyData - An object containing various financial datasets (currencies, metals, crypto, etc.).
	 * @returns An array of analytics data for visualizing each bank’s USD value and asset totals.
	 */
	public getBankTotals(budgetPlan: BudgetPlanExtened, {currencyList,}: {currencyList: Array<CurrencyData>},): Array<IBudgetBanksChartAnalytics> {
		const bankTotals = budgetPlan.budgetPlanBankAccounts.map((bankAccount,) => {
			const usdValue = budgetPlan.allocations
				.filter((alloc,) => {
					return alloc.accountId === bankAccount.accountId
				},)
				.reduce((sum, allocation,) => {
					const { currency, } = allocation
					const usdAmount = this.cBondsCurrencyService.getCurrencyValueExchangedToUSD(
						{
							currency,
							currencyValue: allocation.budget,
						},
						currencyList,
					)
					return sum + usdAmount
				}, 0,)
			return {
				id:        bankAccount.bank.id,
				bankName:  `${this.cryptoService.decryptString(bankAccount.bank.bankName,)} (${this.cryptoService.decryptString(bankAccount.bank.branchName,)})`,
				usdValue,
				accountId: bankAccount.accountId,
			}
		},)
		return bankTotals
	}
}

