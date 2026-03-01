import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
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
import type { BudgetPlanAllocation, BudgetPlanDraft, } from '@prisma/client'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { BudgetDraftService, } from '../services'
import { BudgetRoutes, SwaggerDescriptions, } from './../budget.constants'
import { RolesDecorator, } from '../../../shared/decorators'
import { Roles, } from '../../../shared/types'
import {
	GetBudgetsFilteredDto,
	IdDto,
	CreateBudgetDraftDto,
	CreateBudgetDraftAllocationDto,
} from '../dto'
import { DeleteByIdsDto, } from '../../../modules/document/dto'

@Controller(BudgetRoutes.MODULE_DRAFT,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('Budget draft',)
export class BudgetDraftController {
	constructor(
	private readonly budgetDraftService: BudgetDraftService,
	) { }

	/**
 * 4.2.1
 * Deletes all budget draft allocations based on provided IDs.
 * @param args - The DeleteByIdsDto object containing the IDs of the allocations to be deleted.
 * @returns A promise that resolves when all allocations have been deleted.
 */
	@Delete(BudgetRoutes.DELETE_ALL_DRAFT_ALLOCATIONS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	public async deleteAllBudgetDraftAllocations(
	@Query() args: DeleteByIdsDto,
	): Promise<void> {
		return this.budgetDraftService.deleteAllBudgetDraftAllocations(args,)
	}

	/**
	 * 4.2.1
	 * Retrieves a list of budget draft plans.
	 * @returns A promise that resolves to an array of budget draft plans.
	 */
	@Get(BudgetRoutes.GET_BUDGET_DRAFTS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiQuery({
		description: SwaggerDescriptions.GET_FILTERED_BUDGET_LIST,
		type:        GetBudgetsFilteredDto,
	},)
	public async getBudgetDrafts(): Promise<Array<BudgetPlanDraft>> {
		return this.budgetDraftService.getBudgetDrafts()
	}

	/**
 * 4.2.1
 * Retrieves a budget draft plan by its ID.
 * @param params - The IdDto object containing the ID of the budget draft plan to be retrieved.
 * @returns A promise that resolves to the budget draft plan with the specified ID.
 */
	@Get(BudgetRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	public async getBudgetDraftById(
		@Param() params: IdDto,
	): Promise<BudgetPlanDraft> {
		return this.budgetDraftService.getBudgetDraftById(params.id,)
	}

	/**
 * 4.2.1
 * Deletes a budget draft plan by its ID.
 * @param params - The IdDto object containing the ID of the budget draft plan to be deleted.
 * @returns A promise that resolves when the budget draft plan is deleted.
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
		return this.budgetDraftService.deleteBudgetDraftById(params.id,)
	}

	/**
	 * 4.2.1
	 * Creates a new budget draft plan.
	 * @param body - The data required to create a budget draft plan.
	 * @returns A promise that resolves to the created budget draft plan.
	 */
	@Post(BudgetRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_BUDGET_PLAN,
		type:        CreateBudgetDraftDto,
	},)
	public async createBudgetDraft(
		@Body() body: CreateBudgetDraftDto,
	): Promise<BudgetPlanDraft> {
		return this.budgetDraftService.createBudgetDraft(body,)
	}

	/**
 * 4.2.1
 * Updates a budget draft plan by its ID.
 * @param params - The IdDto object containing the ID of the budget draft plan to be updated.
 * @param body - The CreateBudgetDraftDto object containing the updated data for the budget draft plan.
 * @returns A promise that resolves to the updated budget draft plan.
 */
	@Patch(BudgetRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: SwaggerDescriptions.DRAFT_ID,
	},)
	@ApiBody({
		description: SwaggerDescriptions.UPDATE_DRAFT,
		type:        CreateBudgetDraftDto,
	},)
	public async updateBudgetDraftById(
	@Param() params: IdDto,
	@Body() body: CreateBudgetDraftDto,
	): Promise<BudgetPlanDraft> {
		return this.budgetDraftService.updateBudgetDraftById(params.id, body,)
	}

	/**
	 * 4.2.1
	 * Updates an existing budget draft plan.
	 * @param body - The data required to update the budget draft plan.
	 * @param params - The parameters from the route, including the `id` of the budget draft plan to be updated.
	 * @returns A promise that resolves to the updated budget draft plan.
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
		type:        CreateBudgetDraftDto,
	},)
	public async updateBudgetDraft(
		@Body() body: CreateBudgetDraftDto,
		@Param() params: IdDto,
	): Promise<BudgetPlanDraft> {
		return this.budgetDraftService.updateBudgetDraftById(params.id, body,)
	}

	/**
		 * 4.2.1
		 * Creates a new budget allocation for a budget plan draft.
		 * @param body - The data required to allocate funds within a budget plan draft.
		 * @returns A promise that resolves to the created budget plan allocation.
		 */
	@Post(BudgetRoutes.CREATE_ALLOCATION,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: SwaggerDescriptions.CREATE_BUDGET_PLAN,
		type:        CreateBudgetDraftAllocationDto,
	},)
	public async createBudgetDraftAllocation(
			@Body() body: CreateBudgetDraftAllocationDto,
	): Promise<BudgetPlanAllocation> {
		return this.budgetDraftService.createBudgetDraftAllocation(body,)
	}
}
