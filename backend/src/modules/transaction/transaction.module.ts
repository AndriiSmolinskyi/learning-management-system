import { Module, } from '@nestjs/common'

import { DocumentModule, } from '../document/document.module'
import { JwtModule, } from '../jwt/jwt.module'
import { TransactionDraftController, } from './constrollers/transaction-draft.controller'
import { TransactionController, } from './constrollers/transaction.controller'
import { TransactionDraftService, } from './services/transaction-draft.service'
import { TransactionService, } from './services/transaction.service'
import { CBondsApiModule, } from '../apis/cbonds-api/cbonds-api.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [
		TransactionController,
		TransactionDraftController,
	],
	providers: [
		TransactionService,
		TransactionDraftService,
	],
	imports: [
		JwtModule,
		DocumentModule,
		CBondsApiModule,
		CryptoModule,
	],
	exports: [
		TransactionService,
	],
},)
export class TransactionModule {}
