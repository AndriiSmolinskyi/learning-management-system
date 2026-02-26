import { Module, } from '@nestjs/common'
import {
	CBondsApiService,
	CBondsEmissionsService,
	CBondsCurrencyService,
	CBondsEquityStocksService,
} from './services'
import {
	CBondsEmissionsController,
	CBondsCurrencyController,
	CBondsEquityStocksController,
	CBondsIsinController,
} from './controllers'
import { JwtModule, } from '../../jwt/jwt.module'
import { CBondsRepModule, } from '../../../repositories/cbonds/cbonds.module'
import { CBondsIsinService, } from './services'

@Module({
	controllers: [
		CBondsEmissionsController,
		CBondsCurrencyController,
		CBondsEquityStocksController,
		CBondsIsinController,
	],
	providers:   [
		CBondsApiService,
		CBondsEmissionsService,
		CBondsCurrencyService,
		CBondsEquityStocksService,
		CBondsIsinService,
	],
	exports:     [
		CBondsApiService,
		CBondsEmissionsService,
		CBondsCurrencyService,
		CBondsEquityStocksService,
		CBondsIsinService,
	],
	imports:     [
		JwtModule,
		CBondsRepModule,
	],
},)
export class CBondsApiModule {}
