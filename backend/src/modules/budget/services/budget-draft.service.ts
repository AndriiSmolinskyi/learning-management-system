
import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type { BudgetPlanAllocation, BudgetPlanDraft, } from '@prisma/client'
import { text, } from '../../../shared/text'
import type {
	CreateBudgetDraftAllocationDto,
	CreateBudgetDraftDto,
} from '../dto'
import type { DeleteByIdsDto, } from '../../../modules/document/dto'
import { CryptoService, } from '../../crypto/crypto.service'
import type { BudgetDraftWithRelations, } from '../budget.types'
import { OverviewService, } from '../../../modules/analytics/services'
import { EventEmitter2, } from '@nestjs/event-emitter'

@Injectable()
export class BudgetDraftService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cryptoService: CryptoService,
		private readonly overviewService: OverviewService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	/**
	 * 4.2.1
	 * Retrieves all budget draft plans.
	 * @returns A promise that resolves to an array of budget draft plans.
	 */
	public async getBudgetDrafts(): Promise<Array<BudgetPlanDraft>> {
		const budgetDrafts = await this.prismaService.budgetPlanDraft.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		},)
		return budgetDrafts.map((budgetDraft,) => {
			return {
				...budgetDraft,
				name: budgetDraft.name ?
					this.cryptoService.decryptString(budgetDraft.name,) :
					null,
			}
		},)
	}

	/**
	 * 4.2.1
	 * Creates a new budget draft plan.
	 * @param data - The data required to create a budget draft plan.
	 * @returns A promise that resolves to the created budget draft plan.
	 */
	public async createBudgetDraft(data: CreateBudgetDraftDto,): Promise<BudgetPlanDraft> {
		const { clientId, bankAccounts, name, } = data
		const budgetPlan = await this.prismaService.budgetPlanDraft.create({
			data: {
				clientId,
				name: this.cryptoService.encryptString(name,),
			},
		},)

		const bankAccountRelations = bankAccounts?.flatMap((bankAccount,) => {
			return bankAccount.accountIds.map((accountId,) => {
				return {
					bankId:            bankAccount.bankId,
					accountId,
					budgetPlanDraftId: budgetPlan.id,
				}
			},)
		},)

		if (bankAccountRelations && bankAccountRelations.length > 0) {
			await this.prismaService.budgetPlanBankAccount.createMany({
				data: bankAccountRelations,
			},)
		}
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.BUDGET_LIST_UPDATED,)
		return budgetPlan
	}

	/**
	 * 4.2.1
	 * Updates an existing budget draft plan.
	 * @param id - The ID of the budget draft plan to update.
	 * @param data - The updated data for the budget draft plan.
	 * @returns A promise that resolves to the updated budget draft plan.
	 */
	public async updateBudgetDraftById(id: string, data: CreateBudgetDraftDto,): Promise<BudgetPlanDraft> {
		const { clientId, bankAccounts, name, } = data
		const updatedBudgetPlan = await this.prismaService.budgetPlanDraft.update({
			where: { id, },
			data:  {
				clientId,
				...(name ?
					{name: this.cryptoService.encryptString(name,),} :
					{}),
			},
		},)
		await this.prismaService.budgetPlanBankAccount.deleteMany({
			where: { budgetPlanDraftId: id, },
		},)
		const bankAccountRelations = bankAccounts?.flatMap((bankAccount,) => {
			return bankAccount.accountIds.map((accountId,) => {
				return {
					bankId:            bankAccount.bankId,
					accountId,
					budgetPlanDraftId: id,
				}
			},)
		},
		)
		if (bankAccountRelations && bankAccountRelations.length > 0) {
			await this.prismaService.budgetPlanBankAccount.createMany({
				data: bankAccountRelations,
			},)
		}
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.BUDGET_LIST_UPDATED,)
		return updatedBudgetPlan
	}

	/**
 * 4.2.1
 * Retrieves a budget draft plan by its ID.
 * @param id - The ID of the budget draft plan to retrieve.
 * @returns A promise that resolves to the retrieved budget draft plan, including client, bank account details, and allocations.
 * @throws HttpException if no budget draft plan with the given ID is found, returning a 404 Not Found error.
 */
	public async getBudgetDraftById(id: string,): Promise<BudgetDraftWithRelations> {
		const budgetDraft = await this.prismaService.budgetPlanDraft.findUnique({
			where: {
				id,
			},
			include: {
				client:                 true,
				budgetPlanBankAccounts: {
					include: {
						bank:    true,
						account: true,
					},
				},
				allocations: true,
			},
		},)
		if (!budgetDraft) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}
		const decryptedBankAccounts = budgetDraft.budgetPlanBankAccounts.map((item,) => {
			return {
				...item,
				account: {
					...item.account,
					accountName: this.cryptoService.decryptString(item.account.accountName,),
				},
				bank: {
					...item.bank,
					branchName: this.cryptoService.decryptString(item.bank.branchName,),
				},
			}
		},)
		const bankIds = budgetDraft.budgetPlanBankAccounts.map((bank,) => {
			return bank.bankId
		},)
		const banks = await this.overviewService.getBankAnalytics({bankIds,},)
		const totalBanks = banks.reduce((acc, bank,) => {
			return acc + bank.usdValue
		}, 0,)

		return {
			...budgetDraft,
			name: budgetDraft.name ?
				this.cryptoService.decryptString(budgetDraft.name,) :
				null,
			client: {
				...budgetDraft.client,
				lastName:  this.cryptoService.decryptString(budgetDraft.client.lastName,),
				firstName: this.cryptoService.decryptString(budgetDraft.client.firstName,),
			},
			budgetPlanBankAccounts: decryptedBankAccounts,
			totalBanks,
		}
	}

	/**
 * 4.2.1
 * Deletes a budget draft plan and its associated bank accounts and allocations by its ID.
 * @param id - The ID of the budget draft plan to delete.
 * @returns A promise that resolves when the deletion is complete.
 * @throws Any error that may occur during the deletion process, such as foreign key constraint violations or database issues.
 * This method performs the following:
 *  - Deletes any associated budget plan bank accounts.
 *  - Deletes any associated budget plan allocations.
 *  - Deletes the budget plan draft itself.
 */
	public async deleteBudgetDraftById(id: string,): Promise<void> {
		await this.prismaService.budgetPlanBankAccount.deleteMany({
			where: {
				budgetPlanDraftId: id,
			},
		},)
		await this.prismaService.budgetPlanAllocation.deleteMany({
			where: {
				budgetPlanDraftId: id,
			},
		},)
		await this.prismaService.budgetPlanDraft.delete({
			where: {
				id,
			},
		},)
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.BUDGET_LIST_UPDATED,{budgetId: id,},)
	}

	/**
	 * 4.2.1
	 * Creates a new budget draft allocation.
	 * @param body - The data required to create a budget draft allocation.
	 * @returns A promise that resolves to the created budget draft allocation.
	 */
	public async createBudgetDraftAllocation(body: CreateBudgetDraftAllocationDto,): Promise<BudgetPlanAllocation> {
		return this.prismaService.budgetPlanAllocation.create({
			data: body,
		},)
	}

	/**
 * 4.2.1
 * Deletes multiple budget plan allocations by their IDs.
 * @param {DeleteByIdsDto} args - Object containing an array of allocation IDs to delete.
 * @returns A promise that resolves when the deletions are complete.
 * @throws Any error that may occur during the deletion process, such as database issues.
 * This method deletes all budget plan allocations where the allocation ID is included in the provided array.
 */
	public async deleteAllBudgetDraftAllocations({id,}: DeleteByIdsDto,): Promise<void> {
		await this.prismaService.budgetPlanAllocation.deleteMany({
			where: {
				id: {
					in: id,
				},
			},
		},)
	}
}