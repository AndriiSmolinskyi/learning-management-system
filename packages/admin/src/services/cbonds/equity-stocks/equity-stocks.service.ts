import {
	HttpFactoryService,
} from '../../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../../shared/services/http.service'
import {
	CBondsRoutes,
} from '../cbonds.constants'

const {
	EquitySotcks,
} = CBondsRoutes

class CBondsEquityStocksService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = `${CBondsRoutes.MODULE}/${EquitySotcks.MODULE}`

	public async getEquityStocksIsins(currency?: string,): Promise<Array<string>> {
		return this.httpService.get(`${this.module}/${EquitySotcks.GET_ISINS}`, {
			params: {
				currency,
			},
		},)
	}

	public async getEquityStocksSecurities(): Promise<Array<string>> {
		return this.httpService.get(`${this.module}/${EquitySotcks.GET_SECURITIES}`,)
	}

	public async getEquityStocksByIsin(isin: string,): Promise<string | null | number> {
		return this.httpService.get(`${this.module}/${EquitySotcks.GET_SECURITY}`, {
			params: {
				isin,
			},
		},)
	}
}

export const cBondsEquityStocksService = new CBondsEquityStocksService(new HttpFactoryService().createHttpService(),)
