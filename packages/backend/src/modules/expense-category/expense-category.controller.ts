import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger'
import type { ExpenseCategory, } from '@prisma/client'

import { JWTAuthGuard, RolesGuard,} from '../../shared/guards'
import { ExpenseCategoryService, } from './expense-category.service'
import { ExpenseCategoriesRoutes, SwaggerDescriptions, } from './expense-category.constants'
import { RolesDecorator, } from '../../shared/decorators'
import { Roles, } from '../../shared/types'
import { CreateExpenseCategoryDto, CreateTransactionCategoryDependencyDto, GetCategoriesFilterDto, } from './dto'
import { IdDto, } from '../document/dto'
import type { IExpenseCategory, } from './expense-category.types'
import type { UpdateAllCategoryDto, } from './dto/update-all.dto'

@Controller(ExpenseCategoriesRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('ExpenseCategory',)
export class ExpenseCategoryController {
	constructor(
	private readonly expenseCategoryService: ExpenseCategoryService,
	) { }

	/**
	 * 4.2.2
	 * Retrieves expense category by unique id.
	 * @param id - The unique identifier of the expense category.
	 * @returns A promise that resolves to an expense categories.
	 */
	@Get(ExpenseCategoriesRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getExpenseCategoryById(
		@Param('id',) id: string,
		@Query() body: GetCategoriesFilterDto,
	): Promise<IExpenseCategory> {
		return this.expenseCategoryService.getExpenseCategoryById(id, body,)
	}

	/**
	 * 4.2.2
	 * Retrieves all expense categories associated with a specific budget plan.
	 * @param id - The unique identifier of the budget plan.
	 * @returns A promise that resolves to an array of expense categories.
	 */
	@Get(`${ExpenseCategoriesRoutes.GET_EXPENSE_CATEGORIES}/${ExpenseCategoriesRoutes.ID}`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getExpenseCategoriesByBudgetId(
		@Param('id',) id: string,
		@Query() body: GetCategoriesFilterDto,
	): Promise<Array<IExpenseCategory>> {
		return this.expenseCategoryService.getExpenseCategoriesByBudgetId(id, body,)
	}

	/**
	 * 4.2.2
	 * Creates a new expense category.
	 * @param body - The data required to create a new expense category.
	 * @returns A promise that resolves to the created expense category.
	 */
	@Post(ExpenseCategoriesRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_EXPENSE_CATEGORY,
		type:        CreateExpenseCategoryDto,
	},)
	public async createExpenseCategory(
		@Body() body: CreateExpenseCategoryDto,
	): Promise<ExpenseCategory> {
		return this.expenseCategoryService.createExpenseCategory(body,)
	}

	/**
 	* 4.2.3
 	* Links an expense category with specified transaction types.
 	* This endpoint is accessible only to users with BACK_OFFICE_MANAGER or FAMILY_OFFICE_MANAGER roles.
 	*
 	* The endpoint expects a payload of type LinkTransactionTypeToExpenseCategoryDto which includes:
 	* - expenseCategoryId: The unique identifier of the expense category.
 	* - transactionTypes: An array of transaction type names to be linked to the expense category.
 	*
 	* Upon invocation, the service:
 	* 1. Retrieves the transaction types matching the provided names.
 	* 2. Deletes any existing associations between the expense category and transaction types.
 	* 3. Creates new associations for the provided transaction types, skipping duplicates.
 	*
 	* @param body - An object of type LinkTransactionTypeToExpenseCategoryDto.
 	* @returns A promise that resolves when the linking operation is successfully completed.
 	*/
	@Post(ExpenseCategoriesRoutes.LINK_TRANSACTION,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.LINK_TRANSACTION_TO_CATEGORY,
		type:        CreateTransactionCategoryDependencyDto,
	},)
	public async createLinkTransactionWithExpenseCategory(
		@Body() body: CreateTransactionCategoryDependencyDto,
	): Promise<void> {
		return this.expenseCategoryService.linkTransactionWithExpenseCategory(body,)
	}

	/**
	 * 4.2.2
	 * Deletes an expense category by its unique identifier.
	 * @param params - The IdDto object containing the ID of the expense category.
	 * @returns A promise that resolves when the expense category is deleted.
	 */
	@Delete(ExpenseCategoriesRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.EXPENSE_CATEGORY_ID,
	},)
	public async deleteExpenseCategoryById(
			@Param() params: IdDto,
	): Promise<void> {
		return this.expenseCategoryService.deleteExpenseCategoryById(params.id,)
	}

	/**
 * 4.2.2
 * Updates all expense categories associated with a specific budget plan.
 * - Creates new categories if they do not exist.
 * - Updates existing categories.
 * - Deletes categories that are no longer in the provided list.
 *
 * @param id - The unique identifier of the budget plan.
 * @param body - The list of expense categories to be updated.
 * @returns A promise that resolves when the operation is complete.
 */
	@Post(`${ExpenseCategoriesRoutes.UPDATE_ALL}/${ExpenseCategoriesRoutes.ID}`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async updateAllByBudgetId(
		@Param('id',) id: string,
		@Body() body: Array<UpdateAllCategoryDto>,
	): Promise<void> {
		return this.expenseCategoryService.updateAllByBudgetId(body, id,)
	}
}
