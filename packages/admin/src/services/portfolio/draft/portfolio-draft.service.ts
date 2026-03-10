import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import {
	PORTFOLIO_ROUTES,
} from '../portfolio.constants'
import type {
	IPortfolioCreateBody,
} from '../portfolio.types'
import type {
	IPortfolio,
} from '../../../shared/types'

class PortfolioDraftService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = PORTFOLIO_ROUTES.DRAFT

	public async createPortfolioDraft(body: IPortfolioCreateBody,): Promise<IPortfolio> {
		return this.httpService.post(`${this.module}/${PORTFOLIO_ROUTES.CREATE_DRAFT}`, body,)
	}

	public async updateDraftToPortfolio(id: string,): Promise<IPortfolio> {
		return this.httpService.post(`${this.module}/${PORTFOLIO_ROUTES.DRAFT_TO_PORTFOLIO}/${id}`, null,)
	}

	public async deletePortfolioDraft(id: string,): Promise<void> {
		return this.httpService.delete(`${this.module}/${PORTFOLIO_ROUTES.DELETE_DRAFT}/${id}`,)
	}
}

export const portfolioDraftService = new PortfolioDraftService(new HttpFactoryService().createHttpService(),)
