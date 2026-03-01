import { Module, } from '@nestjs/common'
import {
	AssetService,
} from './asset.service'
import {
	AssetController,
} from './asset.controller'
import { JwtModule, } from '../jwt/jwt.module'
import { CBondsApiModule, } from '../apis/cbonds-api/cbonds-api.module'
import { DocumentModule, } from '../../modules/document/document.module'
import { AssetRepModule, } from '../../repositories/asset/asset.module'
import { CryptoModule, } from '../crypto/crypto.module'
import { ClientRepModule, } from '../../repositories/client/client.module'
import { PortfolioRepModule, } from '../../repositories/portfolio/portfolio.module'

@Module({
	controllers: [
		AssetController,
	],
	providers:   [
		AssetService,
	],
	imports:     [
		JwtModule,
		CBondsApiModule,
		DocumentModule,
		AssetRepModule,
		CryptoModule,
		ClientRepModule,
		PortfolioRepModule,
	],
	exports:     [AssetService,],
},)

export class AssetModule {}
