import { Module, } from '@nestjs/common'

import { ClientRepository, } from './client.repository'
import { CryptoModule, } from '../../modules/crypto/crypto.module'
import { EmailRepModule, } from '../email/email.module'
import { PhoneRepModule, } from '../phone/phone.module'
import { CBondsApiModule, } from '../../modules/apis/cbonds-api/cbonds-api.module'
import { PortfolioRepModule, } from '../portfolio/portfolio.module'

@Module({
	providers:   [ClientRepository,],
	exports:     [ClientRepository,],
	imports:   [
		CryptoModule,
		EmailRepModule,
		PhoneRepModule,
		CBondsApiModule,
		PortfolioRepModule,
	],

},)
export class ClientRepModule {}
