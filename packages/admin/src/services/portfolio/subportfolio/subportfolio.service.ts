
import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import type {
	IPortfolioDetailed,
} from '../../../shared/types'
import {
	PORTFOLIO_ROUTES,
} from '../portfolio.constants'

class SubportfolioService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = PORTFOLIO_ROUTES.SUB_PORTFOLIO

	public async getSubportfolioListByPortfolioId(id: string,): Promise<Array<IPortfolioDetailed>> {
		return this.httpService.get(`${this.module}/${PORTFOLIO_ROUTES.SUB_PORTFOLIO_LIST}/${id}`,)
	}
}

export const subportfolioService = new SubportfolioService(new HttpFactoryService().createHttpService(),)
