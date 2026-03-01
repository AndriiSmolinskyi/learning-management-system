import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
	Delete,
	Query,
	ParseIntPipe,
} from '@nestjs/common'
import { ApiBody, ApiTags, ApiQuery, ApiParam, } from '@nestjs/swagger'
import type { Order, } from '@prisma/client'
import { OrderService, } from '../services/order.service'
import { JWTAuthGuard, RolesGuard, } from '../../../shared/guards'
import { RolesDecorator, } from '../../../shared/decorators'
import { OrderRoutes, SwaggerDescriptions, } from '../order.constants'
import { CreateOrderDto, } from '../dto/create-order.dto'
import { Roles, } from '../../../shared/types'
import type { TOrderListRes, TOrderUnits, } from '../order.types'
import { UpdateOrderDto, } from '../dto/update-order.dto'
import { UpdateOrderStatusDto, } from '../dto/update-order-status.dto'
import { OrderFilterDto, } from '../dto/orders-filter.dto'
import { GetByIdDto, OrderPortfolioUnitsDto, } from '../dto'

@Controller(OrderRoutes.ORDER,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.ORDER_TAG,)
export class OrderController {
	constructor(private readonly orderService: OrderService,) {}

	/**
	 * CR-071
	 * Retrieves the total number of available units for a specific asset within a portfolio.
	 * @remarks
	 * - This endpoint calculates the remaining units for the provided asset based on all related BUY and SELL operations.
	 * - Only users with specific roles can access this endpoint: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 * @param filter - Query parameters containing portfolioId, assetName, and isin used to identify the target asset.
	 * @returns A promise that resolves to an object with the total number of available units.
	*/
	@Get(OrderRoutes.UNITS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getOrderPortfolioUnits(
		@Query() filter: OrderPortfolioUnitsDto,
	): Promise<TOrderUnits> {
		return this.orderService.getOrderPortfolioUnits(filter,)
	}

	/**
	 * 3.2.1, 3.2.2
	 * Creates a new order.
	 *
	 * @remarks
	 * - This method allows the creation of a new order based on the provided data in the request body.
	 * - Only users with specific roles can access this endpoint: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @param body - An object containing the details required to create an order.
	 * @returns A promise that resolves to the created order object.
	 */
	@Post(OrderRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_ORDER,
		type:        CreateOrderDto,
	},)
	public async createOrder(@Body() body: CreateOrderDto,): Promise<Order> {
		return this.orderService.createOrder(body,)
	}

	/**
	 * 3.2.3
	 * Retrieves a list of all orders.
	 *
	 * @remarks
	 * - This method fetches all orders in the system.
	 * - Accessible only to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @returns A promise that resolves to a list of all orders.
	 */
	@Get(OrderRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getOrders(): Promise<TOrderListRes> {
		return this.orderService.getOrders()
	}

	/**
	 * 3.2.6
	 * Updates the status of an order.
	 *
	 * @remarks
	 * - This endpoint allows updating the status of an existing order.
	 * - Requires the order ID and the new status to be provided in the request body.
	 * - Accessible only to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @param body - An object containing the order ID and the new status.
	 * @returns A promise that resolves to the updated order object.
	 */
	@Post(OrderRoutes.UPDATE_STATUS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		description: 'Update the status of an order',
		type:        UpdateOrderStatusDto,
	},)
	public async updateOrderStatus(
		@Body() body: UpdateOrderStatusDto,
	): Promise<Order> {
		return this.orderService.updateOrderStatus(body,)
	}

	/**
	 * 3.2.5
	 * Updates an order by its ID.
	 *
	 * @remarks
	 * - This endpoint updates the details of an existing order.
	 * - Requires the order ID as a parameter and the updated data in the request body.
	 * - Accessible only to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @param orderId - The ID of the order to be updated.
	 * @param body - An object containing the updated details of the order.
	 * @returns A promise that resolves to the updated order object.
	 */
	@Patch(OrderRoutes.UPDATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_ORDER,
		type:        UpdateOrderDto,
	},)
	public async editOrder(
		@Body() body: UpdateOrderDto,
		@Param('id', ParseIntPipe,) orderId: number,
	): Promise<Order> {
		return this.orderService.editOrder(orderId, body,)
	}

	/**
	 * 3.2.4
	 * Deletes multiple order details.
	 *
	 * @remarks
	 * - This endpoint allows deletion of multiple order details based on their IDs.
	 * - Requires an array of IDs to be provided in the request body.
	 * - Accessible only to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @param ids - An array of IDs of the order details to delete.
	 * @returns A promise that resolves when the operation is complete.
	 */
	@Delete(OrderRoutes.DELETE_DETAILS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiBody({
		description: 'Delete multiple order details by their IDs',
		type:        [String,],
	},)
	public async deleteOrderDetails(
		@Body() ids: Array<string>,
	): Promise<void> {
		await this.orderService.deleteOrderDetails(ids,)
	}

	/**
	 * 3.2.1, 3.2.8, 3.2.9
	 * Retrieves filtered orders based on specific criteria.
	 *
	 * @remarks
	 * - This endpoint allows filtering orders using criteria provided in the query parameters.
	 * - Accessible only to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @param filter - The filter criteria for retrieving orders.
	 * @returns A promise that resolves to a list of orders matching the filter criteria.
	 */
	@Get(OrderRoutes.FILTER,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@ApiQuery({
		description: SwaggerDescriptions.FILTER,
		type:        OrderFilterDto,
	},)
	public async getRequestsFiltered(
		@Query() filter: OrderFilterDto,
	): Promise<TOrderListRes> {
		return this.orderService.getOrdersFiltered(filter,)
	}

	/**
	 * 3.2.4
	 * Retrieves a single order by its ID.
	 *
	 * @remarks
	 * - This endpoint fetches the details of a specific order by its ID.
	 * - Accessible only to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @param orderId - The ID of the order to retrieve.
	 * @returns A promise that resolves to the order object.
	 */
	@Get(OrderRoutes.GET_ONE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getOrderById(@Param('id', ParseIntPipe,) orderId: number,): Promise<Order> {
		return this.orderService.getOrderById(orderId,)
	}

	/**
	* CR - 071
	* Deletes order by its ID.
	*
	* @remarks
	* - This route is used to delete the specific order by its `id`.
	* - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER.
	*
	* @param params - The ID of the order to delete.
	*/
	@Delete(OrderRoutes.GET_ONE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        SwaggerDescriptions.DELETE_ORDER,
		description: SwaggerDescriptions.DELETE_ORDER,
	},)
	public async deleteOrderById(
					@Param() params: GetByIdDto,
	): Promise<void> {
		return this.orderService.deleteOrderById(params.id,)
	}
}
