import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import type {
	LoginBody,
	LoginReturn,
	AuthCheckReturn,
	AuthPortal,
	ForgotPasswordBody,
	ForgotPasswordReturn,
	ResetPasswordBody,
	ResetPasswordReturn,
	LogoutReturn,
} from '../../shared/types'

class AuthService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = 'auth'

	public async login(body: LoginBody,): Promise<LoginReturn> {
		return this.httpService.post(`${this.module}/login`, body,)
	}

	public async check(portal: AuthPortal,): Promise<AuthCheckReturn> {
		return this.httpService.get(`${this.module}/check?portal=${portal}`,)
	}

	public async forgotPassword(body: ForgotPasswordBody,): Promise<ForgotPasswordReturn> {
		return this.httpService.post(`${this.module}/forgot-password`, body,)
	}

	public async resetPassword(body: ResetPasswordBody,): Promise<ResetPasswordReturn> {
		return this.httpService.post(`${this.module}/reset-password`, body,)
	}

	public async logout(): Promise<LogoutReturn> {
		return this.httpService.post(`${this.module}/logout`, {
		},)
	}
}

export const authService = new AuthService(new HttpFactoryService().createHttpService(),)