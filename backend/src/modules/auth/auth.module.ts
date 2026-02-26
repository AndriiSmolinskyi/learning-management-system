import { Module, } from '@nestjs/common'

import { JwtModule, } from '../jwt/jwt.module'
import { AdminAuthController, } from './controllers/admin-auth.controller'
import { ClientAuthController, } from './controllers/client-auth.controller'
import { AdminAuthService, } from './services/admin-auth.service'
import { ClientAuthService, } from './services/client-auth.service'
import { MsalService, } from './services/msal.service'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	providers:   [
		AdminAuthService,
		ClientAuthService,
		MsalService,
	],
	controllers: [
		AdminAuthController,
		ClientAuthController,
	],
	imports:     [
		JwtModule,
		CryptoModule,
	],
},)
export class AuthModule {}
