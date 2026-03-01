import { Module, } from '@nestjs/common'

import { EmailRepository, } from './email.repository'
import { CryptoModule, } from '../../modules/crypto/crypto.module'

@Module({
	providers:   [EmailRepository,],
	exports:     [EmailRepository,],
	imports:   	 [CryptoModule,],
},)
export class EmailRepModule {}
