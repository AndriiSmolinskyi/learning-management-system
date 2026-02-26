/* eslint-disable no-mixed-spaces-and-tabs */
import {
	Controller,
	Get,
	UseGuards,
} from '@nestjs/common'
import { ApiTags, } from '@nestjs/swagger'

import { BondsService, } from '../services/bonds.service'
import { StatementRoutes, } from '../statement.constants'
import { EquityStatementService, } from '../services/equity-statement.service'
import { CryptoStatementService, } from '../services/crypto-statement.service'
import { MetalsStatementService, } from '../services/metals-statement.service'
import { PEStatementService, } from '../services/pe-statement.service'
import { CashStatementService, } from '../services/cash-statement.service'
import { DepositStatementService, } from '../services/deposit-statement.service'
import { TotalStatementService, } from '../services/total-statement.service'
import type {
	IDepositStatement,
	ICashStatement,
	IPEStatement,
	IMetalsStatement,
	ICryptoStatement,
	IEquityStatement,
	IBondsStatement,
	ITotalStatement,
} from '../statement.types'
import { JWTAuthGuard, } from '../../../shared/guards'

@Controller(StatementRoutes.MODULE,)
@ApiTags('Client Auth',)
@UseGuards(JWTAuthGuard,)
export class StatementController {
	constructor(
		private readonly bondsService: BondsService,
		private readonly equityStatementService: EquityStatementService,
		private readonly cryptoStatementService: CryptoStatementService,
		private readonly metalsStatementService: MetalsStatementService,
		private readonly peStatementService: PEStatementService,
		private readonly cashStatementService: CashStatementService,
		private readonly depositStatementService: DepositStatementService,
		private readonly totalStatementService: TotalStatementService,
	) { }

  @Get(StatementRoutes.BONDS,)
	public async bondsStatementGet(): Promise<IBondsStatement> {
		const result = await this.bondsService.bondsStatement()
		return result
	}

	@Get(StatementRoutes.EQUITY,)
  public async equityStatementGet(): Promise<IEquityStatement> {
  	const result = await this.equityStatementService.equityStatement()
  	return result
  }

	@Get(StatementRoutes.CRYPTO,)
	public async cryptoStatementGet(): Promise<ICryptoStatement> {
		const result = await this.cryptoStatementService.cryptoStatement()
		return result
	}

	@Get(StatementRoutes.METALS,)
	public async metalsStatementGet(): Promise<IMetalsStatement> {
		const result = await this.metalsStatementService.metalsStatement()
		return result
	}

	@Get(StatementRoutes.PE,)
	public async peStatementGet(): Promise<IPEStatement> {
		const result = await this.peStatementService.peStatement()
		return result
	}

	@Get(StatementRoutes.CASH,)
	public async cashStatementGet(): Promise<ICashStatement> {
		const result = await this.cashStatementService.cashStatement()
		return result
	}

	@Get(StatementRoutes.DEPOSIT,)
	public async depositStatementGet(): Promise<IDepositStatement> {
		const result = await this.depositStatementService.depositStatement()
		return result
	}

	@Get(StatementRoutes.TOTAL,)
	public async totalStatementGet(): Promise<ITotalStatement> {
		const result = await this.totalStatementService.getTotalStatement()
		return result
	}
}
