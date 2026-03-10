import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import type {
	TCheckReturn,
	TSignInProps,
} from '../../shared/types'

class AuthService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = 'auth'

	private readonly clientModule = 'client-auth'

	public async signIn(body: TSignInProps,): Promise<TCheckReturn> {
		return this.httpService.post(`${this.module}/access`, body,)
	}

	public async logout(): Promise<void> {
		return this.httpService.delete(`${this.module}/logout`,)
	}

	public async clientLogout(): Promise<void> {
		return this.httpService.delete(`${this.clientModule}/logout`,)
	}

	public async check(): Promise<TCheckReturn> {
		return this.httpService.get(`${this.module}/check`,)
	}
}

export const authService = new AuthService(new HttpFactoryService().createHttpService(),)