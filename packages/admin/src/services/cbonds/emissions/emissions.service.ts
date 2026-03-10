import type {
	CurrencyList,
} from '../../../shared/types'
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
	Emissions,
} = CBondsRoutes

class CBondsEmissionsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = `${CBondsRoutes.MODULE}/${Emissions.MODULE}`

	private readonly moduleIsin = `${CBondsRoutes.MODULE}/${Emissions.ISIN}`

	public async getEmissionsIsins(currency?: CurrencyList,): Promise<Array<string>> {
		return this.httpService.get(`${this.module}/${Emissions.GET_ISINS}`,{
			params: {
				currency,
			},
		},)
	}

	public async getEmissionsSecurities(): Promise<Array<string>> {
		return this.httpService.get(`${this.module}/${Emissions.GET_SECURITIES}`,)
	}

	public async getSecurityByIsin(isin: string,): Promise<string | number | null> {
		return this.httpService.get(`${this.module}/${Emissions.GET_SECURITY}`, {
			params: {
				isin,
			},
		},)
	}

	public async currencyByIsin(isin: string,): Promise<{ value: string; label: string }> {
		return this.httpService.get<{ value: string; label: string }>(
			`${this.moduleIsin}/${Emissions.CURRENCY_BY_ISIN}`,
			{
				params: {
					isin,
				},
			},
		)
	}

	public async marketByIsin(isin: string,): Promise<{ marketPrice: number}> {
		return this.httpService.get<{ marketPrice: number}>(
			`${this.moduleIsin}/${Emissions.MARKET_BY_ISIN}`,
			{
				params: {
					isin,
				},
			},
		)
	}
}

export const cBondsEmissionsService = new CBondsEmissionsService(new HttpFactoryService().createHttpService(),)
