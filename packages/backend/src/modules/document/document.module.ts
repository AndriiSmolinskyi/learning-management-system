import { Module, } from '@nestjs/common'

import { UploadModule, } from '../upload/upload.module'
import { JwtModule, } from '../jwt/jwt.module'
import { DocumentController, } from './document.controller'
import { DocumentService, } from './document.service'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [
		DocumentController,
	],
	providers:   [DocumentService,],
	imports:     [
		UploadModule,
		JwtModule,
		CryptoModule,
	],
	exports:     [DocumentService,],
},)
export class DocumentModule {}
