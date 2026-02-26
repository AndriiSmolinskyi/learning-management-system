import { Module, } from '@nestjs/common'
import { MailService, } from './mail.service'
import { ClientRepModule, } from '../../repositories/client/client.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	providers:   [
		MailService,
	],
	exports:   [
		MailService,
	],
	imports:   [
		ClientRepModule,
		CryptoModule,
	],
},)
export class MailModule {}
