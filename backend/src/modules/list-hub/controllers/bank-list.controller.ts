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
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import type { BankList, } from '@prisma/client'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { BankListService, } from '../services/bank-list.service'
import { BankListRoutes, BankListApiBodyDescriptions, SwaggerDescriptions, } from '../list-hub.constants'
import { RolesDecorator, } from '../../../shared/decorators'

import { Roles, } from '../../../shared/types'
import { ListItemCreateDto, } from '../dto/list-item-create.dto'
import { BankSourceIdsDto, } from '../dto'

@Controller(BankListRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('BankList',)
export class BankListController {
	constructor(
		private readonly bankListService: BankListService,
	) { }

	/**
	 * 1.3/1.4/1.5.1
	 * Retrieves all bank list items from the database.
	 * @returns A promise that resolves to an array of bank list items.
	 * Each item contains the properties defined in the IBankListItemBody interface.
	 */
	@Get(BankListRoutes.GET,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getBankList(): Promise<Array<BankList>> {
		return this.bankListService.getBankList()
	}

	/**
 * Retrieves a list of unique banks from the standardized `BankList` catalog,
 * associated with a given client, portfolio, or entity.
 *
 * This endpoint is typically used to populate dropdowns or suggestion lists
 * based on previously used banks within the specified context.
 *
 * The returned array contains unique {@link BankList} entries,
 * deduplicated by ID, and sorted by relevance based on their actual usage.
 *
 * Requires the user to have one of the allowed roles and client access.
 *
 * @param query - The {@link BankSourceIdsDto} object containing optional filters:
 * - `clientId`
 * - `portfolioId`
 * - `entityId`
 *
 * At least one of these IDs must be provided.
 *
 * @returns An array of unique {@link BankList} records used in the context of the provided source IDs.
 */
	@Get(BankListRoutes.SOURCE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiQuery({
		description: SwaggerDescriptions.SOURCE_ID,
		type:        BankSourceIdsDto,
	},)
	public async getBankListBySourceId(
		@Query() query: BankSourceIdsDto,
	): Promise<Array<BankList>> {
		return this.bankListService.getBankListBySourceId(query,)
	}

	/**
	 * 1.3/1.4/1.5.2
	 * Creates a new bank list item in the database.
	 * @param body - The body of the request containing the details of the new bank list item.
	 * The body should conform to the IBankListItemBody interface.
	 * @returns A promise that resolves to a Message object.
	 * The Message object contains a success message indicating that the bank list item was created.
	 * @throws Will throw an error if the creation of the bank list item fails.
	*/
	@Post(BankListRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: BankListApiBodyDescriptions.CREATE_BANK_LIST_ITEM,
		type:        ListItemCreateDto,
	},)
	public async createBankListItem(
		@Body() body: ListItemCreateDto,
	): Promise<BankList> {
		return this.bankListService.createBankListItem(body,)
	}
}
