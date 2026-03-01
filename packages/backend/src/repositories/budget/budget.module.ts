import { Module,} from '@nestjs/common'
import { BudgetRepository, } from './budget.repository'
import { CBondsApiModule, } from '../../modules/apis/cbonds-api/cbonds-api.module'
import { AssetModule, } from '../../modules/asset/asset.module'
import { CryptoModule, } from '../..//modules/crypto/crypto.module'

@Module({
	providers:   [BudgetRepository,],
	exports:     [BudgetRepository,],
	imports:   [
		CBondsApiModule,
		AssetModule,
		CryptoModule,
	],
},)

export class BudgetRepModule {}
