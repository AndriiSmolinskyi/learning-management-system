import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import type {
	LoginBody, LoginReturn, AuthCheckReturn,
} from '../../shared/types'

class AuthService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = 'auth'

	public async login(body: LoginBody,): Promise<LoginReturn> {
		return this.httpService.post(`${this.module}/login`, body,)
	}

	// public async check(): Promise<AuthCheckReturn> {
	// 	return this.httpService.get(`${this.module}/check`,)
	// }
	public async check(portal: 'ADMIN' | 'STUDENT',): Promise<AuthCheckReturn> {
		return this.httpService.get(`${this.module}/check?portal=${portal}`,)
	}
}

export const authService = new AuthService(new HttpFactoryService().createHttpService(),)