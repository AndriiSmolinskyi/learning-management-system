import { Module, } from '@nestjs/common'
import { BondsService, } from './services/bonds.service'
import { StatementController, } from './controllers/statement.controller'
import { EquityStatementService, } from './services/equity-statement.service'
import { CryptoStatementService, } from './services/crypto-statement.service'
import { MetalsStatementService, } from './services/metals-statement.service'
import { CBondsApiModule, } from '../apis/cbonds-api/cbonds-api.module'
import { PEStatementService, } from './services/pe-statement.service'
import { CashStatementService, } from './services/cash-statement.service'
import { DepositStatementService, } from './services/deposit-statement.service'
import { TotalStatementService, } from './services/total-statement.service'
import { JwtModule, } from '../jwt/jwt.module'

@Module({
	controllers: [StatementController,],
	providers:   [
		BondsService,
		EquityStatementService,
		CryptoStatementService,
		MetalsStatementService,
		PEStatementService,
		CashStatementService,
		DepositStatementService,
		TotalStatementService,
	],
	exports:     [
		BondsService,
		EquityStatementService,
		CryptoStatementService,
		MetalsStatementService,
		PEStatementService,
		CashStatementService,
		DepositStatementService,
		TotalStatementService,
	],
	imports:     [CBondsApiModule, JwtModule,],
},)
export class StatementModule {}
