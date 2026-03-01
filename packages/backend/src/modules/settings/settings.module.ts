import { Module, } from '@nestjs/common'
import { TransactionSettingsController, } from './controllers/transaction.controller'
import { TransactionSettingsDraftController, } from './controllers/transaction-draft.controller'
import { TransactionSettingsService, } from './services/transaction.service'
import { TransactionSettingsDraftService, } from './services/transaction-draft.service'
import { JwtModule, } from '../jwt/jwt.module'
import { DocumentModule, } from '../document/document.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [
		TransactionSettingsController,
		TransactionSettingsDraftController,
	],
	providers: [
		TransactionSettingsService,
		TransactionSettingsDraftService,
	],
	imports: [
		JwtModule,
		DocumentModule,
		CryptoModule,
	],
},)
export class SettingsModule {}
