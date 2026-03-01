import { Module, } from '@nestjs/common'

import { UploadService, } from './upload.service'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	providers:   [UploadService,],
	exports:     [UploadService,],
	imports:     [CryptoModule,],
},)

export class UploadModule {}
