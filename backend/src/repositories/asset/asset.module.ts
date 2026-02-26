import { Module,} from '@nestjs/common'
import { AssetRepository, } from './asset.repository'
import { CBondsApiModule, } from '../../modules/apis/cbonds-api/cbonds-api.module'
import { DocumentModule, } from '../../modules/document/document.module'
import { CryptoModule, } from '../../modules/crypto/crypto.module'

@Module({
	providers:   [AssetRepository,],
	exports:     [AssetRepository,],
	imports:   [
		CBondsApiModule,
		DocumentModule,
		CryptoModule,
	],
},)

export class AssetRepModule {}
