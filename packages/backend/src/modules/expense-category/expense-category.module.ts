import { Module, } from '@nestjs/common'
import {
	ExpenseCategoryService,
} from './expense-category.service'
import {
	ExpenseCategoryController,
} from './expense-category.controller'
import { JwtModule, } from '../jwt/jwt.module'
import { CBondsApiModule, } from '../apis/cbonds-api/cbonds-api.module'
import { CryptoModule, } from '../crypto/crypto.module'
@Module({
	controllers: [ExpenseCategoryController,],
	providers:   [ExpenseCategoryService,],
	imports:     [
		JwtModule,
		CBondsApiModule,
		CryptoModule,
	],
	exports:     [ExpenseCategoryService,],
},)
export class ExpenseCategoryModule {}
