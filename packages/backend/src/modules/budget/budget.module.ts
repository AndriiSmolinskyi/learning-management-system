import { Module, } from '@nestjs/common'
import {
	BudgetService,
	BudgetDraftService,
} from './services'
import {
	BudgetController,
	BudgetDraftController,
} from './controllers'
import { UploadModule, } from '../upload/upload.module'
import { JwtModule, } from '../jwt/jwt.module'
import { CBondsApiModule, } from '../apis/cbonds-api/cbonds-api.module'
import { BudgetRepModule, } from '../../repositories/budget/budget.module'
import { AnalyticsModule, } from '../analytics/analytics.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [
		BudgetController,
		BudgetDraftController,
	],
	providers:   [
		BudgetService,
		BudgetDraftService,
	],
	imports:     [
		UploadModule,
		JwtModule,
		CBondsApiModule,
		BudgetRepModule,
		AnalyticsModule,
		CryptoModule,
	],
	exports:     [
		BudgetService,
		BudgetDraftService,
	],
},)
export class BudgetModule {}
