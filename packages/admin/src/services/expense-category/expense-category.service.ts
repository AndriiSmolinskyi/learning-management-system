
import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	ExpenseCategoriesRoutes,
} from './expense-category.constants'
import type {
	ICreateExpenseCategoryBody, ICreateTransactionCategoryDependencyBody, IEditLinkTransactionTypesBody,
	IExpenseUpdateBody,
	IGetExpenseCategoriesFilter,
	ILinkTransactionTypesBody,
} from './expense-category.types'
import type {
	IExpenseCategory,
} from '../../shared/types'
class ExpenseCategoryService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = ExpenseCategoriesRoutes.MODULE

	public async getExpenseCategoriesByBudgetId(body: IGetExpenseCategoriesFilter,): Promise<Array<IExpenseCategory>> {
		return this.httpService.get(`${this.module}/${ExpenseCategoriesRoutes.GET_EXPENSE_CATEGORIES}/${body.id}`,{
			params: {
				isYearly: body.isYearly,
			},
		},)
	}

	public async getExpenseCategoryById(body: IGetExpenseCategoriesFilter,): Promise<IExpenseCategory> {
		return this.httpService.get(`${this.module}/${body.id}`, {
			params: {
				isYearly: body.isYearly,
			},
		},)
	}

	public async createExpenseCategory(body: ICreateExpenseCategoryBody,): Promise<IExpenseCategory> {
		return this.httpService.post(`${this.module}/${ExpenseCategoriesRoutes.CREATE}`, body,)
	}

	public async updateAllByBudgetId(body: IExpenseUpdateBody,): Promise<void> {
		return this.httpService.post(`${this.module}/${ExpenseCategoriesRoutes.UPDATE_ALL}/${body.id}`, body.categories,)
	}

	public async deleteExpenseCategoryById(id: string,): Promise<void> {
		return this.httpService.delete(`${this.module}/${id}`,)
	}

	public async linkExpenseCategoryWithTransactions(body: ILinkTransactionTypesBody,): Promise<void> {
		return this.httpService.post(`${this.module}/${ExpenseCategoriesRoutes.LINK_TRANSACTIONS}`,body,)
	}

	public async editLinkTransactionWithCategory(body: IEditLinkTransactionTypesBody,): Promise<void> {
		return this.httpService.patch(`${this.module}/${ExpenseCategoriesRoutes.EDIT_LINK_TRANSACTIONS}`,body,)
	}

	public async createLinkTransactionWithExpenseCategory(body: ICreateTransactionCategoryDependencyBody,): Promise<void> {
		return this.httpService.post(`${this.module}/${ExpenseCategoriesRoutes.LINK_TRANSACTION}`,body,)
	}
}

export const expenseCategoryService = new ExpenseCategoryService(new HttpFactoryService().createHttpService(),)
