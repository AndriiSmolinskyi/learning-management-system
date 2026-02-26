import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import type { BudgetPlan, BudgetPlanAllocation, Client, } from '@prisma/client'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { BudgetService, } from './../services'
import { BudgetRoutes, SwaggerDescriptions, } from './../budget.constants'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'
import type { IBudgetBanksChartAnalytics, IBudgetListFiltered, } from './../budget.types'
import {
	UpdateBudgetPlanDto,
	GetBudgetsFilteredDto,
	CreateBudgetAllocationDto,
	CreateBudgetPlanDto,
	IdDto,
} from '../dto'
import { DeleteByIdsDto, } from '../../../modules/document/dto'
import { AuthRequest, } from '../../../modules/auth'
import { text, } from '../../../shared/text'
import { CacheTTL, } from '@nestjs/cache-manager'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'

@Controller(BudgetRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('Budget',)
export class BudgetController {
	constructor(
	private readonly budgetService: BudgetService,
	) { }

	/**
 	* 4.2.1
 	* Retrieves a list of clients who do not have any associated budget plans or budget plan drafts.
 	* @returns A promise that resolves to an array of clients without any budget plan or budget plan draft linked to them.
 	*/
	@Get(BudgetRoutes.CLIENT_LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getClientListWithoutBudgetPlan(): Promise<Array<Client>> {
		return this.budgetService.getClientListWithoutBudgetPlan()
	}

	/**
	 * 4.2.1
	 * Retrieves a list of budget plans based on the provided filters.
	 * @param filter - The filters to apply when retrieving budget plans.
	 * @returns A promise that resolves to an array of filtered budget plans.
	 */
	@Get(BudgetRoutes.GET_BUDGET_PLANS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	// @CacheTTL(THREE_DAYS_CACHE_TIME,)
	// @UseInterceptors(RedisCacheInterceptor,)
	@ApiQuery({
		description: SwaggerDescriptions.GET_FILTERED_BUDGET_LIST,
		type:        GetBudgetsFilteredDto,
	},)
	public async getBudgetPlans(
		@Query() filter: GetBudgetsFilteredDto,
	): Promise<Array<IBudgetListFiltered>> {
		return this.budgetService.getBudgetPlans(filter,)
	}

	/**
		 * 4.2.1
		 * Retrieves a budget plan by client ID.
	 *
	 * @remarks
	 * - This route is used to get the details of a specific request by its `id`.
	 * - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 * @returns A promise that resolves to the budget plan object with extended details.
	 */
	@Get(BudgetRoutes.CLIENT,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getClientBudgetPlanById(
		@Req() req: AuthRequest,
	): Promise<BudgetPlan> {
		if (!req.clientId) {
			throw new HttpException(text.forbidden, HttpStatus.FORBIDDEN,)
		}
		return this.budgetService.getClientBudgetPlanById(req.clientId,)
	}

		/**
	 * 4.2.1
	 * Deletes all budget plan allocations based on provided IDs.
	 * @param args - The DeleteByIdsDto object containing the IDs of the allocations to be deleted.
	 * @returns A promise that resolves when all allocations have been deleted.
	 */
		@Delete(BudgetRoutes.DELETE_ALL_DRAFT_ALLOCATIONS,)
		@RolesDecorator({
			roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
		},)
	public async deleteAllBudgetPlanAllocations(
		@Query() args: DeleteByIdsDto,
	): Promise<void> {
		return this.budgetService.deleteAllBudgetPlanAllocations(args,)
	}

		/**
	* 4.2.1
	* Retrieves a budget plan by its ID.
	 *
	 * @remarks
	 * - This route is used to get the details of a specific request by its `id`.
	 * - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, and INVESTMENT_ANALYST.
	 *
	 * @param params - The ID of the budget plan to retrieve.
	 * @returns A promise that resolves to the budget plan object with extended details.
	 */
	@Get(BudgetRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.ID,
	},)
		public async getBudgetPlanById(
			@Param() params: IdDto,
		): Promise<BudgetPlan> {
			return this.budgetService.getBudgetPlanById(params.id,)
		}

		/**
 	* 4.2.1
 	* Deletes a budget plan by its ID.
 	* @param params - The IdDto object containing the ID of the budget plan to be deleted.
 	* @returns A promise that resolves when the budget plan is deleted.
 	*/
		@Delete(BudgetRoutes.ID,)
		@RolesDecorator({
			roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
		},)
		@ApiParam({
			name:        'id',
			description: SwaggerDescriptions.DRAFT_ID,
		},)
	public async deleteBudgetDraftById(
		@Param() params: IdDto,
	): Promise<void> {
		return this.budgetService.deleteBudgetById(params.id,)
	}

	/**
	 * 4.2.1
	 * Creates a new budget plan.
	 * @param body - The data required to create a budget plan.
	 * @returns A promise that resolves to the created budget plan.
	 */
	@Post(BudgetRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_BUDGET_PLAN,
		type:        CreateBudgetPlanDto,
	},)
		public async createBudgetPlan(
		@Body() body: CreateBudgetPlanDto,
		): Promise<BudgetPlan> {
			return this.budgetService.createBudgetPlan(body,)
		}

	/**
	 * 4.2.1
	 * Updates an existing budget plan.
	 * @param body - The data required to update the budget plan.
	 * @param params - The parameters from the route, including the `id` of the budget plan to be updated.
	 * @returns A promise that resolves to the updated budget plan.
	 *
	 * This method updates the budget plan identified by the provided `id` using the new data
	 * provided in the request body. After the update, the updated budget plan is returned.
	 *
	 * The `@Patch` decorator indicates that this method handles requests for partial updates to the
	 * budget plan, allowing only specific fields to be updated. The method expects the `id` parameter
	 * to be passed in the URL and the update data to be provided in the request body.
	 *
	 * If the budget plan with the specified `id` does not exist, Prisma ORM will throw an error indicating
	 * that the record could not be found.
	 */
	@Patch(`${BudgetRoutes.UPDATE}/:id`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_BUDGET_PLAN,
		type:        UpdateBudgetPlanDto,
	},)
	public async updateBudgetPlan(
		@Body() body: UpdateBudgetPlanDto,
		@Param() params: IdDto,
	): Promise<BudgetPlan> {
		return this.budgetService.updateBudgetPlan(params.id, body,)
	}

	/**
	 * 4.2.1
	 * Creates a new budget allocation for a budget plan.
	 * @param body - The data required to allocate funds within a budget plan.
	 * @returns A promise that resolves to the created budget plan allocation.
	 */
	@Post(BudgetRoutes.CREATE_ALLOCATION,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_BUDGET_PLAN,
		type:        CreateBudgetAllocationDto,
	},)
	public async createBudgetAllocation(
		@Body() body: CreateBudgetAllocationDto,
	): Promise<BudgetPlanAllocation> {
		return this.budgetService.createBudgetAllocation(body,)
	}

	/**
	 * 4.2.1
	 * Retrieves bank chart analytics for a specific budget plan.
	 * @param id - The unique identifier of the budget plan.
	 * @returns A promise that resolves to an array of bank chart analytics data.
	 */
	@Get(`${BudgetRoutes.BANKS_CHART}/${BudgetRoutes.ID}`,)
	@CacheTTL(THREE_DAYS_CACHE_TIME,)
	@UseInterceptors(RedisCacheInterceptor,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
		clientAccess: true,
	},)
	public async getBanksChartInfoByBudgetId(
		@Param('id',) id: string,
	): Promise<Array<IBudgetBanksChartAnalytics>> {
		return this.budgetService.getBanksChartInfoByBudgetId(id,)
	}
}
