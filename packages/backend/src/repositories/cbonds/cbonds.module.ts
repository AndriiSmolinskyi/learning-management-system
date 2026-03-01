import { Module,} from '@nestjs/common'
import {
	CBondsEmissionsRepository,
	CBondsEquityStocksRepository,
} from './'
@Module({
	providers:   [
		CBondsEmissionsRepository,
		CBondsEquityStocksRepository,
	],
	exports:     [
		CBondsEmissionsRepository,
		CBondsEquityStocksRepository,
	],
},)
export class CBondsRepModule {}