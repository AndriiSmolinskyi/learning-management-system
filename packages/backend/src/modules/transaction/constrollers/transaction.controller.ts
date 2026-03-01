import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import type { Transaction, } from '@prisma/client'

import { RolesDecorator, } from '../../../shared/decorators'
import { JWTAuthGuard, RolesGuard, } from '../../../shared/guards'
import { TransactionService, } from '../services/transaction.service'
import { SwaggerDescriptions, TransactionRoutes, } from '../transaction.constants'

import { Roles, } from '../../../shared/types'
import { CreateTransactionDto, UpdateTransactionDto, TransactionFilterDto, BudgetTransactionDto, CurrencyAmountDto, } from '../dto'
import { TDeleteRefactoredTransactionPayload,} from '../transaction.types'
import type { TransactionExtended, TransactionListRes, } from '../transaction.types'

@Controller(TransactionRoutes.TRANSACTION,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.TRANSACTION_TAG,)
export class TransactionController {
	constructor(
		private readonly transactionService: TransactionService,
	) {}

	/**
 	* 4.2.3
 	* Retrieves all budget transactions for a specified client.
 	* This endpoint is accessible only to users with BACK_OFFICE_MANAGER or FAMILY_OFFICE_MANAGER roles.
 	*
 	* @param body - An object of type BudgetTransactionDto containing the client's unique identifier.
 	* @returns A promise that resolves to an array of Transaction objects associated with the given client.
 	*/
	@Get(TransactionRoutes.BUDGET,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({
		type:        BudgetTransactionDto,
		description: SwaggerDescriptions.ID,
	},)
	public async getBudgetTransactions(
		@Query() query: BudgetTransactionDto,
	): Promise<Array<Transaction>> {
		return this.transactionService.getBudgetTransactions(query,)
	}

	/**
 	* 4.2.3
 	* Retrieves all budget transactions for a specified client.
 	* This endpoint is accessible only to users with BACK_OFFICE_MANAGER or FAMILY_OFFICE_MANAGER roles.
 	*
 	* @param body - An object of type BudgetTransactionDto containing the client's unique identifier.
 	* @returns A promise that resolves to an array of Transaction objects associated with the given client.
 	*/
	@Get(TransactionRoutes.GET_TOTAL_CURRENCY_AMOUNT,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({
		type:        CurrencyAmountDto,
		description: SwaggerDescriptions.ID,
	},)
	public async getTotalAmountByCurrencyAndAccountId(
	@Query() query: CurrencyAmountDto,
	): Promise<number> {
		return this.transactionService.getTotalAmountByCurrencyAndAccountId(query,)
	}

	/**
	 * 3.4
	 * Creates a new transaction.
	 * @param body - Data for creating a new transaction.
	 * @returns The newly created transaction.
	 * @remarks Accessible by back office manager, family office manager, and investment analyst.
	 */
	@Post(TransactionRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_TRANSACTION,
		type:        CreateTransactionDto,
	},)
	public async createTransaction(
		@Body() body: CreateTransactionDto,
	): Promise<Transaction> {
		return this.transactionService.createTransaction(body,)
	}

	/**
	 * 3.4
	 * Retrieves a list of all transactions.
	 * @returns List of transactions with total count.
	 * @remarks Accessible by back office manager, family office manager, and investment analyst.
	*/
	@Get(TransactionRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getTransactions(): Promise<TransactionListRes> {
		return this.transactionService.getTransactions()
	}

	/**
	* 3.4
	* Retrieves a filtered list of transactions.
	* @remarks
	* - This route allows filtering of transactions based on the criteria defined in `TransactionFilterDto`.
	* - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	*
	* @param filter - The filter criteria for transactions.
	* @returns A promise that resolves to a list of filtered transactions.
	*/
	@Get(TransactionRoutes.FILTER,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({
		description: SwaggerDescriptions.FILTER,
		type:        TransactionFilterDto,
	},)
	public async getTransactionsFiltered(
		@Query() filter: TransactionFilterDto,
	): Promise<TransactionListRes> {
		return this.transactionService.getTransactionsFiltered(filter,)
	}

	/**
	 * 3.4
	 * Retrieves a specific transaction by its ID.
	 * @param params - Object containing the transaction ID.
	 * @returns Detailed transaction information.
	 * @remarks Accessible by back office manager, family office manager, and investment analyst.
	*/
	@Get(TransactionRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ID,
	},)
	public async getTransactionById(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<TransactionExtended> {
		return this.transactionService.getTransactionById(id,)
	}

	/**
	 * 3.4
	 * Updates an existing transaction.
	 * @param params - Object containing the transaction ID.
	 * @param body - Updated transaction data.
	 * @returns The updated transaction.
	 * @remarks Accessible by back office manager, family office manager, and investment analyst.
	 */
	@Patch(TransactionRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ID,
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_DRAFT,
		type:        UpdateTransactionDto,
	},)
	public async updateTransaction(
		@Param('id', ParseIntPipe,) id: number,
		@Body() body: UpdateTransactionDto,
	): Promise<TransactionExtended> {
		return this.transactionService.updateTransaction(id, body,)
	}

	/**
	 * 3.4
	 * Deletes a specific transaction.
	 * @param params - Object containing the transaction ID.
	 * @remarks Accessible by back office manager, family office manager, and investment analyst.
	*/
	@Delete(TransactionRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ID,
	},)
	@HttpCode(HttpStatus.NO_CONTENT,)
	public async deleteTransaction(
		@Param('id', ParseIntPipe,) id: number,
		@Query() query: TDeleteRefactoredTransactionPayload,
	): Promise<void> {
		await this.transactionService.deleteTransaction(id, query,)
	}
}
