import { Module, } from '@nestjs/common'

import { ClientController, } from './controllers/client.controller'
import { DraftController, } from './controllers/draft.controller'
import { ClientService, } from './services/client.service'
import { DraftService, } from './services/draft.service'
import { ClientRepModule, } from '../../repositories/client/client.module'
import { JwtModule, } from '../jwt/jwt.module'
import { EmailRepModule, } from '../../repositories/email/email.module'
import { PhoneRepModule, } from '../../repositories/phone/phone.module'
import { CryptoModule, } from '../crypto/crypto.module'
import { MailModule, } from '../mail/mail.module'
import { AssetModule, } from '../asset/asset.module'
import { CBondsApiModule, } from '../apis/cbonds-api/cbonds-api.module'
import { DocumentModule, } from '../document/document.module'
import { PortfolioRepModule, } from '../../repositories/portfolio/portfolio.module'
import { BudgetModule, } from '../budget/budget.module'
import { PortfolioModule, } from '../portfolio/portfolio.module'
@Module({
	controllers: [ClientController, DraftController,],
	providers:   [ClientService, DraftService,],
	imports:     [
		ClientRepModule,
		JwtModule,
		EmailRepModule,
		PhoneRepModule,
		CryptoModule,
		MailModule,
		AssetModule,
		CBondsApiModule,
		DocumentModule,
		PortfolioRepModule,
		BudgetModule,
		PortfolioModule,
	],
	exports:     [
		ClientService,
		ClientRepModule,
	],
},)
export class ClientModule {}
