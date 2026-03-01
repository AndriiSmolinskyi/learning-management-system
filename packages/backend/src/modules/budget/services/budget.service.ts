/* eslint-disable max-lines */

/* eslint-disable no-nested-ternary */
/* eslint-disable no-negated-condition */
import { PrismaService, } from 'nestjs-prisma'
import {
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common'
import type {
	BudgetPlan,
	BudgetPlanAllocation,
	Client,
	Prisma,
} from '@prisma/client'

import {
	text,
} from '../../../shared/text'

import type {
	BudgetPlanWithRelations,
	IBudgetBanksChartAnalytics,
	IBudgetListFiltered,
	TSyncGetBudgets,
} from '../budget.types'
import type {
	UpdateBudgetPlanDto,
	GetBudgetsFilteredDto,
	CreateBudgetAllocationDto,
	CreateBudgetPlanDto,
} from '../dto'
import type {
	DeleteByIdsDto,
} from '../../../modules/document/dto'

import { BudgetRepository, } from '../../../repositories/budget/budget.repository'
import { OverviewService, } from '../../../modules/analytics/services'
import { localeString, } from '../../../shared/utils/locale-string.util'
import { RedisCacheService, } from '../../../modules/redis-cache/redis-cache.service'
import { BudgetRoutes, } from '../budget.constants'
import { CryptoService, } from '../../crypto/crypto.service'
import type { UnionAssetType,} from '../../../shared/utils'
import { assetParser, } from '../../../shared/utils'
import type { TAssetExtended, } from '../../../modules/asset/asset.types'
import { EventEmitter2, } from '@nestjs/event-emitter'

@Injectable()
export class BudgetService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly budgetRepository: BudgetRepository,
		private readonly cacheService: RedisCacheService,
		private readonly overviewService: OverviewService,
		private readonly cryptoService: CryptoService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	/**
		* 4.2.1
		 * Retrieves the extended details of a specific budget plan identified by its ID.
	 *
	 * @remarks
	 * - The method returns a full set of related entities for the budget plan, including allocations, client, banks and accounts.
	 * - If the budget plan with the provided ID does not exist, an error is thrown.
	 *
	 * @param id - The ID of the budget plan to retrieve.
	 * @returns A promise that resolves to the extended details of the budget plan.
	 * @throws HttpException if the budget plan does not exist.
	 */
	public async getBudgetPlanById(id: string,): Promise<BudgetPlanWithRelations> {
		const budgetPlan = await this.budgetRepository.getBudgetPlanById(id,)
		if (!budgetPlan) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}
		const currencyList = await this.prismaService.currencyData.findMany()
		const { totalManage,} = this.budgetRepository.getAllocationsTotals(budgetPlan, currencyList,)
		const bankIds = budgetPlan.budgetPlanBankAccounts.map((bank,) => {
			return bank.bankId
		},)
		const banks = await this.overviewService.getBankAnalytics({bankIds,},)
		const totalBanks = banks.reduce((acc, bank,) => {
			return acc + bank.usdValue
		}, 0,)
		const newAllocations = await Promise.all(budgetPlan.allocations.map(async(allocation,) => {
			const accounts = await this.overviewService.getBankAnalytics({accountIds: [allocation.accountId,],},)
			const totalAccount = accounts.reduce((acc, account,) => {
				return acc + account.usdValue
			}, 0,)
			return {
				...allocation,
				amount: totalAccount,
			}
		},),)
		return {
			...budgetPlan,
			name:                   this.cryptoService.decryptString(budgetPlan.name,),
			allocations:            newAllocations,
			totalManage,
			totalBanks,
			client:      {
				...budgetPlan.client,
				firstName:  this.cryptoService.decryptString(budgetPlan.client.firstName,),
				lastName:  this.cryptoService.decryptString(budgetPlan.client.lastName,),
			},
			budgetPlanBankAccounts: budgetPlan.budgetPlanBankAccounts.map((item,) => {
				return {
					...item,
					bank: {
						...item.bank,
						branchName: this.cryptoService.decryptString(item.bank.branchName,),
					},
					account: {
						...item.account,
						accountName: this.cryptoService.decryptString(item.account.accountName,),
					},
				}
			},),
		}
	}

	/**
	 * 4.2.1
	 * Retrieves a list of budget plans based on the provided filters.
	 * @param filter - The filters to apply when retrieving budget plans, including activation status, search term, and client IDs.
	 * @returns A promise that resolves to an array of filtered budget plans.
	 */
	public async getBudgetPlans(filter: GetBudgetsFilteredDto,): Promise<Array<IBudgetListFiltered>> {
		const {isActivated, search, clientIds,} = filter
		const isActivatedFilter = isActivated === 'true' ?
			true :
			isActivated === 'false' ?
				false :
				undefined
		const budgetPlans = await this.prismaService.budgetPlan.findMany({
			where: {
				AND: [
					Array.isArray(clientIds,) && clientIds.length > 0 ?
						{ clientId: { in: clientIds, }, } :
						{},
					search ?
						{ name: { contains: search, mode: 'insensitive', }, } :
						{},
					isActivated !== undefined ?
						{ isActivated: isActivatedFilter, } :
						{},
				],
				client: {
					isActivated: true,
				},
			},
			include: {
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
				allocations: true,
				client:      true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		},)
		const currencyList = await this.prismaService.currencyData.findMany()

		return Promise.all(budgetPlans.map(async(budgetPlan,) => {
			const { totalManage, } = this.budgetRepository.getAllocationsTotals(budgetPlan, currencyList,)
			const bankIds = budgetPlan.budgetPlanBankAccounts.map((bank,) => {
				return bank.bankId
			},)
			const banks = await this.overviewService.getBankAnalytics({bankIds,},)
			const totalBanks = banks.reduce((acc, bank,) => {
				return acc + bank.usdValue
			}, 0,)
			return {
				id:          budgetPlan.id,
				clientId:    budgetPlan.clientId,
				name:        this.cryptoService.decryptString(budgetPlan.name,),
				isActivated: budgetPlan.isActivated,
				clientName:  `${this.cryptoService.decryptString(budgetPlan.client.firstName,)} ${this.cryptoService.decryptString(budgetPlan.client.lastName,)}`,
				totalManage,
				totalBanks,
			}
		},),)
	}

	/**
	 * CR - 114/138
 		* Synchronous duplicate of an existing asynchronous function.
 		* The logic remains unchanged, but all required external data (e.g., reference lists, transactions)
 		* is passed directly via function arguments to avoid additional asynchronous calls.
 		* Used specifically for cache warm-up or refresh operations, where synchronous execution is required.
 	*/
	public syncGetBudgetPlans(data: TSyncGetBudgets,): Array<IBudgetListFiltered> {
		const {budgetPlans, currencyList, assets, transactions,} = data
		return budgetPlans.map((budgetPlan,) => {
			const { totalManage, } = this.budgetRepository.getAllocationsTotals(budgetPlan, currencyList,)
			const bankIds = budgetPlan.budgetPlanBankAccounts.map((bank,) => {
				return bank.bankId
			},)
			const parsedAssets = this.parseAndFilterAssets(assets,)
			const filteredTransaction = transactions.filter((transaction,) => {
				return transaction.bankId && bankIds.includes(transaction.bankId,)
			},)
			const filteredAssets = parsedAssets.filter((asset,) => {
				return bankIds.includes(asset.bankId,)
			},)
			const banks = this.overviewService.syncGetBankAnalytics({...data, assets: filteredAssets, transactions: filteredTransaction,},{bankIds,},)
			const totalBanks = banks.reduce((acc, bank,) => {
				return acc + bank.usdValue
			}, 0,)
			return {
				id:          budgetPlan.id,
				clientId:    budgetPlan.clientId,
				name:        this.cryptoService.decryptString(budgetPlan.name,),
				isActivated: budgetPlan.isActivated,
				clientName:  `${this.cryptoService.decryptString(budgetPlan.client.firstName,)} ${this.cryptoService.decryptString(budgetPlan.client.lastName,)}`,
				totalManage,
				totalBanks,
			}
		},)
	}

	/**
	 * 4.2.1
	 * Creates a new budget plan in the database.
	 * @param body - The data required to create a budget plan.
	 * @param body.clientId - The ID of the client associated with the budget plan.
	 * @param body.bankAccounts - An array of bank accounts linked to the budget plan.
	 * @param body.isActivated - Indicates whether the budget plan is active.
	 * @param body.amount - The total allocated amount for the budget plan.
	 * @param body.name - The name of the budget plan.
	 * @returns A promise that resolves to the created budget plan.
	 *
	 * The method also establishes relationships between the budget plan and associated bank accounts.
	 * It maps each bank account to its corresponding account IDs and links them to the created budget plan.
	 * If there are associated bank accounts, they are stored in the database to maintain referential integrity.
	 */
	public async createBudgetPlan(body: CreateBudgetPlanDto,): Promise<BudgetPlan> {
		const { clientId, bankAccounts, isActivated, name, } = body
		const budgetPlan = await this.prismaService.budgetPlan.create({
			data: {
				clientId,
				isActivated,
				name: this.cryptoService.encryptString(name,),
			},
		},)

		const bankAccountRelations = bankAccounts.flatMap((bankAccount,) => {
			return bankAccount.accountIds.map((accountId,) => {
				return {
					bankId:       bankAccount.bankId,
					accountId,
					budgetPlanId: budgetPlan.id,
				}
			},)
		},)

		if (bankAccountRelations.length > 0) {
			await this.prismaService.budgetPlanBankAccount.createMany({
				data: bankAccountRelations,
			},)
		}
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.BUDGET_LIST_UPDATED,{budgetId: budgetPlan.id, budget: 	{...budgetPlan, name: this.cryptoService.decryptString(budgetPlan.name,),},},)
		// this.eventEmitter.emit(eventNames.BUDGET_LIST_UPDATED,)
		return budgetPlan
	}

	/**
	 * 4.2.1
	 * Updates an existing budget plan in the database.
	 * @param id - The ID of the budget plan to be updated.
	 * @param data - The data used to update the budget plan.
	 * @param data.isActivated - The new status of whether the budget plan is active or not.
	 * @param data.amount - The updated total allocated amount for the budget plan.
	 * @param data.name - The updated name of the budget plan.
	 * @returns A promise that resolves to the updated budget plan.
	 *
	 * This method updates the budget plan identified by the provided `id` with the new data.
	 * The `data` object can contain updated values for the budget plan's fields, including
	 * `isActivated`, `amount`, and `name`. After the update, the updated budget plan is
	 * returned as the result.
	 *
	 * If the budget plan with the specified `id` does not exist, the Prisma ORM will throw
	 * an error indicating that the record could not be found.
	 */
	public async updateBudgetPlan(id: string, body: UpdateBudgetPlanDto,): Promise<BudgetPlan> {
		const { bankAccounts, name, ...data} = body
		if (bankAccounts) {
			await this.prismaService.budgetPlanBankAccount.deleteMany({
				where: { budgetPlanId: id, },
			},)
			const bankAccountRelations = bankAccounts.flatMap((bankAccount,) => {
				return bankAccount.accountIds?.map((accountId,) => {
					if (accountId) {
						return {
							bankId:            bankAccount.bankId,
							accountId,
							budgetPlanId: id,
						}
					}
					return null
				},)
					.filter((relation,): relation is { bankId: string; accountId: string; budgetPlanId: string } => {
						return relation !== null
					},)
			},
			)
			if (bankAccountRelations.length > 0) {
				await this.prismaService.budgetPlanBankAccount.createMany({
					data: bankAccountRelations as Array<Prisma.BudgetPlanBankAccountCreateManyInput>,
				},)
			}
		}
		await this.cacheService.deleteByUrl([
			`/${BudgetRoutes.MODULE}/${id}`,
			`/${BudgetRoutes.MODULE}/${BudgetRoutes.BANKS_CHART}/${id}`,
		],)
		// this.eventEmitter.emit(eventNames.BUDGET_LIST_UPDATED,{budgetId: id,},)

		return this.prismaService.budgetPlan.update({
			data: {
				...data,
				...(name ?
					{name: this.cryptoService.encryptString(name,),} :
					{}),
			},
			where: {
				id,
			},
			include: {
				allocations: true,
			},
		},)
	}

	/**
	 * 4.2.1
	 * Creates a new budget allocation entry in the database.
	 * @param body - The data required to create a budget allocation.
	 * @returns A promise that resolves to the created budget allocation record.
	 */
	public async createBudgetAllocation(body: CreateBudgetAllocationDto,): Promise<BudgetPlanAllocation> {
		// todo: Remove after check
		// await this.cacheService.deleteByUrl([
		// 	`/${BudgetRoutes.MODULE}/${body.budgetPlanId}`,
		// 	`/${BudgetRoutes.MODULE}/${BudgetRoutes.BANKS_CHART}/${body.budgetPlanId}`,
		// ],)
		// this.eventEmitter.emit(eventNames.BUDGET_LIST_UPDATED,{budgetId: body.budgetPlanId,},)
		// const budget = await this.prismaService.budgetPlan.findUnique({
		// 	where: {id: body.budgetPlanId,},
		// },)
		// this.eventEmitter.emit(eventNames.BUDGET_LIST_UPDATED,{budgetId: body.budgetPlanId, budget:   budget ?
		// 	{...budget, name: this.cryptoService.decryptString(budget.name,),} :
		// 	null,},)

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
	public async deleteAllBudgetPlanAllocations({id,}: DeleteByIdsDto,): Promise<void> {
		await this.prismaService.budgetPlanAllocation.deleteMany({
			where: {
				id: {
					in: id,
				},
			},
		},)
	}

	/**
 * 4.2.1
 * Deletes a budget plan and its associated bank accounts and allocations by its ID.
 * @param id - The ID of the budget plan to delete.
 * @returns A promise that resolves when the deletion is complete.
 * @throws Any error that may occur during the deletion process, such as foreign key constraint violations or database issues.
 * This method performs the following:
 *  - Deletes any associated budget plan bank accounts.
 *  - Deletes any associated budget plan allocations.
 *  - Deletes the budget plan itself.
 */
	public async deleteBudgetById(id: string,): Promise<void> {
		await this.prismaService.budgetPlanBankAccount.deleteMany({
			where: {
				budgetPlanId: id,
			},
		},)
		await this.prismaService.budgetPlanAllocation.deleteMany({
			where: {
				budgetPlanId: id,
			},
		},)
		await this.prismaService.budgetPlan.delete({
			where: {
				id,
			},
		},)
		await this.cacheService.deleteByUrl([
			`/${BudgetRoutes.MODULE}/${id}`,
			`/${BudgetRoutes.MODULE}/${BudgetRoutes.BANKS_CHART}/${id}`,
		],)
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.BUDGET_LIST_UPDATED,{budgetId: id,},)
	}

	/**
	 * 4.2.1
	 * Retrieves bank chart analytics data for a given budget plan.
	 * @param id - The unique identifier of the budget plan.
	 * @returns A promise that resolves to an array of bank chart analytics data.
	 * @throws HttpException if the budget plan does not exist.
	 */
	public async getBanksChartInfoByBudgetId(id: string,): Promise<Array<IBudgetBanksChartAnalytics>> {
		const budgetPlan = await this.budgetRepository.getBudgetPlanById(id,)
		if (!budgetPlan) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}
		const bankIds = budgetPlan.budgetPlanBankAccounts.map((bank,) => {
			return bank.bankId
		},)
		const uniqueIds = [...new Set(bankIds,),]

		const [currencyList, metalList, cryptoList, bonds, equities, etfs, assets, transactions,] = await Promise.all([
			this.prismaService.currencyData.findMany(),
			this.prismaService.metalData.findMany(),
			this.prismaService.cryptoData.findMany(),
			this.prismaService.bond.findMany(),
			this.prismaService.equity.findMany(),
			this.prismaService.etf.findMany(),
			this.prismaService.asset.findMany({
				where: {
					isArchived: false,
					portfolio:  {
						is: {
							isActivated: true,
						},
					},
					bankId: {
						in: uniqueIds,
					},
				},
				include: {
					portfolio: true,
					entity:    true,
					bank:      { include: { bankList: true, }, },
					account:   true,
				},
			},),
			this.prismaService.transaction.findMany({
				where: {
					portfolio: {
						isActivated: true,
					},
				},
				select: {
					amount:    true,
					currency:  true,
					clientId:  true,
					accountId: true,
					bankId:    true,
				},
			},),
		],)

		// const overviewTotals2 = await this.overviewService.getBankAnalytics({bankIds: uniqueIds,},)
		const parsedAssets = this.parseAndFilterAssets(assets,)
		const overviewTotals = this.overviewService.syncGetBankAnalytics({currencyList,metalList,cryptoList,bonds,equities,etfs, assets: parsedAssets, transactions,},{bankIds: uniqueIds,},)
		const bankTotals = this.budgetRepository.getBankTotals(budgetPlan, {currencyList,},).map((item,) => {
			const bank = overviewTotals.find((bank,) => {
				return bank.accountId === item.accountId
			},)
			return {
				...item,
				bankName:     item.bankName,
				bankUsdValue: bank?.usdValue ?? 0,
			}
		},)
			.reduce<Array<IBudgetBanksChartAnalytics>>((acc, bank,) => {
				const {
					bankName,
					id,
					usdValue,
					bankUsdValue,
					accountId,
				} = bank
				const existing = acc.find((item,) => {
					return item.id === id
				},)
				if (existing) {
					existing.usdValue = existing.usdValue + usdValue
					existing.bankUsdValue = (existing.bankUsdValue ?? 0) + bankUsdValue
				} else {
					acc.push({
						id,
						bankName,
						usdValue,
						bankUsdValue: bankUsdValue ?
							bankUsdValue :
							0,
						accountId,
					},)
				}
				return acc
			}, [],)
			.map((bank,) => {
				return {
					...bank,
					bankName:     `${bank.bankName} ${localeString((bank.bankUsdValue ?? 0), 'USD', 2, false,)}`,
				}
			},)
		return bankTotals
	}

	/**
 * 4.2.1
 * Retrieves a list of clients who do not have any associated budget plans or budget plan drafts.
 * Filters clients by checking that both `budgetPlan` and `budgetPlanDraft` fields are null.
 * @returns A promise that resolves to an array of clients without any linked budget plans or budget plan drafts.
 */
	public async getClientListWithoutBudgetPlan(): Promise<Array<Client>> {
		const clientsWithoutBudgetPlan = await this.prismaService.client.findMany({
			where: {
				AND: [
					{
						budgetPlan: null,
					},
					{
						budgetPlanDraft: null,
					},
				],
				isActivated: true,
			},
		},)
		return clientsWithoutBudgetPlan.map((client,) => {
			return {
				...client,
				lastName:  this.cryptoService.decryptString(client.lastName,),
				firstName: this.cryptoService.decryptString(client.firstName,),
			}
		},)
	}

	/**
 * 4.6.1
 * Retrieves the detailed budget plan with related allocations, client information, and budget plan bank accounts.
 * Performs currency conversion for budget and amount values to USD and calculates total managed and bank totals.
 * @param id - The ID of the budget plan to retrieve.
 * @param clientId - The ID of the client associated with the budget plan.
 * @returns A promise that resolves to the budget plan with detailed information and calculated totals.
 * @throws HttpException if the budget plan is not found.
 */
	public async getClientBudgetPlanById(clientId: string,): Promise<BudgetPlanWithRelations> {
		const budgetPlan = await this.budgetRepository.getBudgetPlanByClientId(clientId,)
		if (!budgetPlan) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}
		const currencyList = await this.prismaService.currencyData.findMany()
		const { totalManage, } = this.budgetRepository.getAllocationsTotals(budgetPlan, currencyList,)
		const bankIds = budgetPlan.budgetPlanBankAccounts.map((bank,) => {
			return bank.bankId
		},)
		const banks = await this.overviewService.getBankAnalytics({bankIds,},)
		const totalBanks = banks.reduce((acc, bank,) => {
			return acc + bank.usdValue
		}, 0,)
		const newAllocations = await Promise.all(budgetPlan.allocations.map(async(allocation,) => {
			const accounts = await this.overviewService.getBankAnalytics({accountIds: [allocation.accountId,],},)
			const totalAccount = accounts.reduce((acc, account,) => {
				return acc + account.usdValue
			}, 0,)
			return {
				...allocation,
				amount: totalAccount,
			}
		},),)
		return {
			...budgetPlan,
			name:        this.cryptoService.decryptString(budgetPlan.name,),
			allocations: newAllocations,
			totalManage,
			totalBanks,
		}
	}

	/**
 * Deletes all budget plans associated with a given client.
 * @param clientId - The ID of the client whose budget plans should be deleted.
 * @returns A promise that resolves when the deletion is complete.
 * This includes deletion of associated bank accounts and allocations if present.
 */
	public async deleteBudgetPlansByClientId(clientId: string,): Promise<void> {
		await this.cacheService.deleteByUrl([
			`/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
		],)
		await this.budgetRepository.deleteBudgetPlansByClientId(clientId,)
	}

	/**
 * Deletes all budget plans associated with a specific portfolio.
 * @param id - The portfolio ID whose related budget plans will be deleted.
 * @returns A promise that resolves once all associated plans are removed.
 */
	public async deleteBudgetPlansByPortfolioId(id: string,): Promise<void> {
		await this.cacheService.deleteByUrl([
			`/${BudgetRoutes.MODULE}/${BudgetRoutes.GET_BUDGET_PLANS}`,
		],)
		await this.budgetRepository.deleteBudgetPlansByPortfolioId(id,)
	}

	/**
 		* Parses and filters a list of raw asset objects, returning only valid parsed assets.
 		*
 		* @template T - The expected asset type after parsing (must extend UnionAssetType).
 		* @param assets - An array of raw extended asset objects to be parsed.
 		* @returns An array of parsed and non-null assets of type T.
 		*
 		* This function uses a generic `assetParser<T>` to convert each raw asset into its typed form.
 		* Assets that fail to parse (return null) are filtered out from the result.
	*/
	private parseAndFilterAssets<T extends UnionAssetType = UnionAssetType>(assets: Array<TAssetExtended>,): Array<T> {
		const parsedAssets = assets
			.map((asset,) => {
				const parsedAsset = assetParser<T>(asset,)
				if (!parsedAsset) {
					return null
				}
				return parsedAsset
			},)
			.filter((item,): item is T => {
				return item !== null
			},)
		return parsedAssets
	}
}