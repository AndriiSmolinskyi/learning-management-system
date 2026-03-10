import queryString from 'query-string'
import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	BudgetRoutes,
} from './budget.constants'
import type {
	IBudgetBanksChartAnalytics,
	IBudgetDraftCreateBody,
	IBudgetDraftUpdateBody,
	IBudgetPlanCreateBody,
	IBudgetPlanUpdateBody,
	TBudgetFilter,
} from './budget.types'
import type {
	IBudgetPlan,
	IBudgetAllocation,
	IBudgetAllocationCreateBody,
	IBudgetDraft,
	IBudgetDraftAllocation,
	IBudgetDraftAllocationCreateBody,
} from '../../shared/types'
import type {
	DocumentIds,
} from '../document/document.types'
import type {
	Client,
} from '../../shared/types'

class BudgetService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = BudgetRoutes.MODULE

	private readonly draftModule = BudgetRoutes.MODULE_DRAFT

	public async getBudgetPlanById(id: string,): Promise<IBudgetDraft> {
		return this.httpService.get(`${this.module}/${id}`,)
	}

	public async getBudgetPlans(filter: TBudgetFilter,): Promise<Array<IBudgetPlan>> {
		return this.httpService.get(`${this.module}/${BudgetRoutes.GET_BUDGET_PLANS}?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async createBudgetPlan(body: IBudgetPlanCreateBody,): Promise<IBudgetPlan> {
		return this.httpService.post(`${this.module}/${BudgetRoutes.CREATE}`, body,)
	}

	public async updateBudgetPlan({
		id, ...body
	}: IBudgetPlanUpdateBody,): Promise<IBudgetPlan> {
		return this.httpService.patch(`${this.module}/${BudgetRoutes.UPDATE}/${id}`, body,)
	}

	public async createBudgetAllocation(body: IBudgetAllocationCreateBody,): Promise<IBudgetAllocation> {
		return this.httpService.post(`${this.module}/${BudgetRoutes.CREATE_ALLOCATION}`, body,)
	}

	public async getBudgetDrafts(): Promise<IBudgetPlan> {
		return this.httpService.get(`${this.draftModule}/${BudgetRoutes.GET_BUDGET_DRAFTS}`,)
	}

	public async createBudgetDraft(body: IBudgetDraftCreateBody,): Promise<IBudgetDraft> {
		return this.httpService.post(`${this.draftModule}/${BudgetRoutes.CREATE}`, body,)
	}

	public async updateBudgetDraft({
		id, ...body
	}: IBudgetDraftUpdateBody,): Promise<IBudgetDraft> {
		return this.httpService.patch(`${this.draftModule}/${BudgetRoutes.UPDATE}/${id}`, body,)
	}

	public async getBudgetDraftById(id: string,): Promise<IBudgetDraft> {
		return this.httpService.get(`${this.draftModule}/${id}`,)
	}

	public async updateBudgetPlanDraft({
		id, ...body
	}: IBudgetDraftUpdateBody,): Promise<IBudgetDraft> {
		return this.httpService.patch(`${this.draftModule}/${id}`, body,)
	}

	public async deleteBudgetById(id: string,): Promise<void> {
		return this.httpService.delete(`${this.module}/${id}`,)
	}

	public async deleteBudgetDraftById(id: string,): Promise<void> {
		return this.httpService.delete(`${this.draftModule}/${id}`,)
	}

	public async createBudgetDraftAllocation(body: IBudgetDraftAllocationCreateBody,): Promise<IBudgetDraftAllocation> {
		return this.httpService.post(`${this.draftModule}/${BudgetRoutes.CREATE_ALLOCATION}`, body,)
	}

	public async deleteAllBudgetDraftAllocations(ids: DocumentIds,): Promise<void> {
		return this.httpService.delete(`${this.draftModule}/${BudgetRoutes.DELETE_ALL_DRAFT_ALLOCATIONS}/?${queryString.stringify(ids, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async deleteAllBudgetPlanAllocations(ids: DocumentIds,): Promise<void> {
		return this.httpService.delete(`${this.module}/${BudgetRoutes.DELETE_ALL_DRAFT_ALLOCATIONS}/?${queryString.stringify(ids, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getBudgetBanksChartById(id: string,): Promise<Array<IBudgetBanksChartAnalytics>> {
		return this.httpService.get(`${this.module}/${BudgetRoutes.BANKS_CHART}/${id}`,)
	}

	public async getClientListWithoutBudgetPlan(): Promise<Array<Client>> {
		return this.httpService.get(`${this.module}/${BudgetRoutes.CLIENT_LIST}`,)
	}
}

export const budgetService = new BudgetService(new HttpFactoryService().createHttpService(),)
