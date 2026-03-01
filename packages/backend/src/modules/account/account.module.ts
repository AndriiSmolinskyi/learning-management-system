import { Module, } from '@nestjs/common'
import { AccountService, } from './account.service'
import { AccountController, } from './account.controller'
import { UploadModule, } from '../upload/upload.module'
import { JwtModule, } from '../jwt/jwt.module'
import { CBondsApiModule, } from '../apis/cbonds-api/cbonds-api.module'
import { AssetModule, } from '../asset/asset.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [AccountController,],
	providers:   [AccountService,],
	imports:     [
		UploadModule,
		JwtModule,
		CBondsApiModule,
		AssetModule,
		CryptoModule,
	],
	exports:     [AccountService,],
},)
export class AccountModule {}
