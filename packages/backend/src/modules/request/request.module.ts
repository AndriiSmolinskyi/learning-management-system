import { Module, } from '@nestjs/common'

import { RequestController, } from './constrollers/request.controller'
import { RequestDraftController, } from './constrollers/request-draft.controller'
import { RequestService, } from './services/request.service'
import { RequestDraftService, } from './services/request-draft.service'
import { JwtModule, } from '../jwt/jwt.module'
import { DocumentModule, } from '../document/document.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [
		RequestController,
		RequestDraftController,
	],
	providers: [
		RequestService,
		RequestDraftService,
	],
	imports: [
		JwtModule,
		DocumentModule,
		CryptoModule,
	],
},)
export class RequestModule {}
