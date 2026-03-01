import {
	Body,
	Controller,
	Post,
	UseGuards,
	Get,
	Query,
} from '@nestjs/common'
import {
	ApiBody,
	ApiTags,
} from '@nestjs/swagger'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { ExpenseCategoryListService, } from '../services'
import { ExpenseCategoryListRoutes, ExpenseCategoryApiBodyDescriptions, } from '../list-hub.constants'
import { RolesDecorator, } from '../../../shared/decorators'

import { Roles, type Message, } from '../../../shared/types'
import type {IListItemBody, } from '../list-hub.types'
import { ExpenseCategoryCreateDto, GetExpenseCategoriesDto, } from '../dto'

@Controller(ExpenseCategoryListRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('ExpenseCategoryList',)
export class ExpenseCategoryListController {
	constructor(
		private readonly expenseCategoryListService: ExpenseCategoryListService,
	) { }

	/**
	 * 4.2.2
	 * Retrieves all expense category list items from the database.
	 * @returns A promise that resolves to an array of expense category list items.
	 * Each item contains the properties defined in the IListItemBody interface.
	 */
	@Get(ExpenseCategoryListRoutes.GET,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getExpenseCategoryList(
		@Query() params: GetExpenseCategoriesDto,
	): Promise<Array<IListItemBody>> {
		return this.expenseCategoryListService.getExpenseCategoryList(params.clientId,)
	}

	/**
	 * 4.2.2
	 * Creates a new expense category list item in the database.
	 * @param body - The body of the request containing the details of the new expense category list item.
	 * The body should conform to the ListItemCreateDto interface.
	 * @returns A promise that resolves to a Message object.
	 * The Message object contains a success message indicating that the expense category list item was created.
	 * @throws Will throw an error if the creation of the expense category list item fails.
	*/
	@Post(ExpenseCategoryListRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: ExpenseCategoryApiBodyDescriptions.CREATE_EXPENSE_CATEGORY_ITEM,
		type:        ExpenseCategoryCreateDto,
	},)
	public async createExpenseCategoryListItem(
		@Body() body: ExpenseCategoryCreateDto,
	): Promise<Message> {
		return this.expenseCategoryListService.createExpenseCategoryListItem(body,)
	}
}
