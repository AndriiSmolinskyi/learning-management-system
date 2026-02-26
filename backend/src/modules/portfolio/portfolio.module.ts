import { Module, } from '@nestjs/common'

import { PortfolioService,  PortfolioDraftService, SubportfolioService,} from './services'
import { PortfolioController,  PortfolioDraftController, SubportfolioController,} from './controllers'
import { UploadModule, } from '../upload/upload.module'
import { JwtModule, } from '../jwt/jwt.module'
import { AssetService, } from '../asset/asset.service'
import { DocumentModule, } from '../document/document.module'
import { PortfolioRepModule, } from '../../repositories/portfolio/portfolio.module'
import { CBondsApiModule, } from '../apis/cbonds-api/cbonds-api.module'
import { BudgetModule, } from '../budget/budget.module'
import { AssetRepModule, } from '../../repositories/asset/asset.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [
		PortfolioController,
		PortfolioDraftController,
		SubportfolioController,
	],
	providers:   [
		PortfolioService,
		PortfolioDraftService,
		SubportfolioService,
		AssetService,
	],
	imports:     [
		UploadModule,
		JwtModule,
		DocumentModule,
		PortfolioRepModule,
		CBondsApiModule,
		BudgetModule,
		AssetRepModule,
		CryptoModule,
	],
	exports:     [
		PortfolioService,
		PortfolioDraftService,
		SubportfolioService,
	],
},)

export class PortfolioModule {}
