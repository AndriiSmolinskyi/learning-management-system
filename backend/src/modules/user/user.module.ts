import { Module, } from '@nestjs/common'

import { UserRepModule, } from '../../repositories/user/user.module'
import { MailModule, } from '../mail/mail.module'
import { JwtModule, } from '../jwt/jwt.module'
import { UserService, } from './user.service'
import { UserController, } from './user.controller'
import { CryptoModule, } from '../crypto/crypto.module'
import { ClientRepModule, } from '../../repositories/client/client.module'

@Module({
	providers:   [
		UserService,
	],
	exports:     [UserService,],
	controllers: [UserController,],
	imports:     [
		MailModule,
		JwtModule,
		UserRepModule,
		CryptoModule,
		ClientRepModule,
	],
},)
export class UserModule {}
