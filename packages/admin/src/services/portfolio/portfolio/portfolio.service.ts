import type {
	IMessage,
} from '../../../shared/types'
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
	IPortfolioActivate,
	IPortfolioChartFilter,
	IPortfolioChartResponse,
} from '../portfolio.types'
import type {
	IPortfolio, IPortfolioDetailed,
} from '../../../shared/types'
import type {
	IFilterProps,
} from '../../../modules/clients/portfolios/portfolio/portfolio.types'
import type {
	IPortfoliosFiltered,
} from './portfolio.types'
import queryString from 'query-string'
import type {
	DocumentIds,
} from '../../../services/document/document.types'

class PortfolioService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = PORTFOLIO_ROUTES.MODULE

	public async getPortfolioListFiltered(filters: IFilterProps,): Promise<IPortfoliosFiltered> {
		return this.httpService.get(`${this.module}/${PORTFOLIO_ROUTES.GET_PORTFOLIO_LIST_FILTERED}`,{
			params: filters,
		},)
	}

	public async getPortfolioList(): Promise<Array<IPortfolio>> {
		return this.httpService.get(`${this.module}/${PORTFOLIO_ROUTES.LIST}`,)
	}

	public async getPortfolioListByClientId(clientId: string,): Promise<Array<IPortfolio>> {
		return this.httpService.get(`${this.module}/${PORTFOLIO_ROUTES.CLIENT}/${clientId}`,)
	}

	public async getPortfolioById(id: string,): Promise<IPortfolio> {
		return this.httpService.get(`${this.module}/${id}`,)
	}

	public async getPortfolioDetailsById(id: string,): Promise<IPortfolioDetailed> {
		return this.httpService.get(`${this.module}/${PORTFOLIO_ROUTES.PORTFOLIO_DETAILS}/${id}`,)
	}

	public async createPortfolio(body: IPortfolioCreateBody,): Promise<IPortfolio> {
		return this.httpService.post(`${this.module}/${PORTFOLIO_ROUTES.CREATE}`, body,)
	}

	public async portfolioActivate({
		id, ...data
	}:IPortfolioActivate,): Promise<IMessage> {
		return this.httpService.patch(`${this.module}/${PORTFOLIO_ROUTES.UPDATE_STATUS}/${id}`,data,)
	}

	public async portfolioChart(filter:IPortfolioChartFilter,): Promise<Array<IPortfolioChartResponse>> {
		return this.httpService.get(`${this.module}/${PORTFOLIO_ROUTES.PORTFOLIO_CHART}`, {
			params: filter,
		},)
	}

	public async deletePortfolioById(id: string,): Promise<void> {
		return this.httpService.delete(`${this.module}/${id}`,)
	}

	public async getPortfolioListMaxTotals(): Promise<{maxTotals: number}> {
		return this.httpService.get(`${this.module}/${PORTFOLIO_ROUTES.MAX_TOTALS}`,)
	}

	public async getPortfolioListByClientIds(ids: DocumentIds,): Promise<Array<IPortfolio>> {
		return this.httpService.get(`${this.module}/${PORTFOLIO_ROUTES.LIST_BY_CLIENTS_IDS}?${queryString.stringify(ids, {
			arrayFormat: 'bracket',
		},)}`,
		)
	}
}

export const portfolioService = new PortfolioService(new HttpFactoryService().createHttpService(),)
