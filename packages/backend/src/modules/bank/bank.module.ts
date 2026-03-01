import { Module, } from '@nestjs/common'
import { BankService, } from './bank.service'
import { BankController, } from './bank.controller'
import { UploadModule, } from '../upload/upload.module'
import { JwtModule, } from '../jwt/jwt.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [BankController,],
	providers:   [BankService,],
	imports:     [
		UploadModule,
		JwtModule,
		CryptoModule,
	],
	exports:     [BankService,],
},)
export class BankModule {}
