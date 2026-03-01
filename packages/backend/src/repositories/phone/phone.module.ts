import { Module, } from '@nestjs/common'

import { PhoneRepository, } from './phone.repository'
import { CryptoModule, } from '../../modules/crypto/crypto.module'

@Module({
	providers:   [PhoneRepository,],
	exports:     [PhoneRepository,],
	imports:   	 [CryptoModule,],
},)
export class PhoneRepModule {}
