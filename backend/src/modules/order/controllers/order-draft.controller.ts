import {
	Body,
	Controller,
	Get,
	Post,
	UseGuards,
	Param,
	Delete,
	Patch,
	ParseIntPipe,
} from '@nestjs/common'
import { ApiBody, ApiTags, } from '@nestjs/swagger'
import type { OrderDraft, } from '@prisma/client'
import { UpdateOrderDraftDto, } from '../dto/update-order-draft.dto'
import { OrderDraftService, } from '../services/order-draft.service'
import { JWTAuthGuard, RolesGuard, } from '../../../shared/guards'
import { RolesDecorator, } from '../../../shared/decorators'
import { OrderRoutes, SwaggerDescriptions, } from '../order.constants'

import { CreateOrderDraftDto, } from '../dto/create-order-draft.dto'
import { Roles, } from '../../../shared/types'

@Controller(OrderRoutes.DRAFT,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.DRAFT_TAG,)
// Controller for managing order drafts. Provides endpoints to create, retrieve, and delete drafts.
export class OrderDraftController {
	constructor(
		private readonly orderDraftService: OrderDraftService,
	) { }

	/**
		* 3.2.4
		* Updates an existing order draft.
		*
		* @param id - The unique identifier of the order draft to update.
		* @param body - An object containing the data required to update the draft.
		* @returns A promise that resolves to the updated order draft object.
		*/
	@Patch(`${OrderRoutes.UPDATE}`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		type: UpdateOrderDraftDto,
	},)
	public async updateDraft(
		@Param('id', ParseIntPipe,) id: number,
		@Body() body: UpdateOrderDraftDto,
	): Promise<OrderDraft> {
		return this.orderDraftService.updateOrderDraft(id, body,)
	}

	/**
	 * 3.2.1, 3.2.2
	 * Creates a new order draft.
	 *
	 * @remarks
	 * - This method allows creating a new draft for an order.
	 * - The draft is based on the data provided in the request body.
	 * - Accessible only to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @param body - An object containing the data required to create the draft.
	 * @returns A promise that resolves to the created order draft object.
	 */
	@Post(OrderRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		type: CreateOrderDraftDto,
	},)
	public async createDraft(
		@Body() body: CreateOrderDraftDto,
	): Promise<OrderDraft> {
		return this.orderDraftService.createOrderDraft(body,)
	}

	/**
	 * 3.2.3
	 * Retrieves a list of all order drafts.
	 *
	 * @remarks
	 * - This method fetches all drafts currently available in the system.
	 * - Accessible only to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @returns A promise that resolves to a list of order draft objects.
	 */
	@Get(OrderRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getDrafts(): Promise<Array<OrderDraft>> {
		return this.orderDraftService.getOrderDrafts()
	}

	/**
	 * 3.2.1,
	 * Deletes an order draft by its ID.
	 *
	 * @remarks
	 * - This method allows deleting a specific order draft by its unique ID.
	 * - The ID is provided as a route parameter.
	 * - Accessible only to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @param id - The unique identifier of the order draft to delete.
	 * @returns A promise that resolves when the deletion is complete.
	 */
	@Delete(`${OrderRoutes.DELETE}/:id`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async deleteDraft(
		@Param('id', ParseIntPipe,) id: number,
	): Promise<void> {
		return this.orderDraftService.deleteOrderDraft(id,)
	}
}
