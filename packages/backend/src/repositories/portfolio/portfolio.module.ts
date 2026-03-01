import { Module,} from '@nestjs/common'
import { PortfolioRepository, } from './portfolio.repository'
import { AssetService, } from '../../modules/asset/asset.service'
import { CBondsApiModule, } from '../../modules/apis/cbonds-api/cbonds-api.module'
import { DocumentModule, } from '../../modules/document/document.module'
import { AssetRepModule, } from '../../repositories/asset/asset.module'
import { CryptoModule, } from '../../modules/crypto/crypto.module'

@Module({
	providers:   [
		PortfolioRepository,
		AssetService,
	],
	exports:     [PortfolioRepository,],
	imports: [
		CBondsApiModule,
		DocumentModule,
		AssetRepModule,
		CryptoModule,
	],
},)

export class PortfolioRepModule {}
