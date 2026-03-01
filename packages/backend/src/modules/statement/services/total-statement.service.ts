import { Injectable, } from '@nestjs/common'
import { BondsService, } from '../services/bonds.service'
import { EquityStatementService, } from '../services/equity-statement.service'
import { CryptoStatementService, } from '../services/crypto-statement.service'
import { MetalsStatementService, } from '../services/metals-statement.service'
import { PEStatementService, } from '../services/pe-statement.service'
import { CashStatementService, } from '../services/cash-statement.service'
import { DepositStatementService, } from '../services/deposit-statement.service'
import type { IValue, ITotalStatement,} from '../statement.types'

@Injectable()
export class TotalStatementService {
	constructor(
    private readonly bondsService: BondsService,
    private readonly equityStatementService: EquityStatementService,
    private readonly cryptoStatementService: CryptoStatementService,
    private readonly metalsStatementService: MetalsStatementService,
    private readonly peStatementService: PEStatementService,
    private readonly cashStatementService: CashStatementService,
    private readonly depositStatementService: DepositStatementService,
	) {}

	public async getTotalStatement(): Promise<ITotalStatement> {
		const [
			bondsStatement,
			equityStatement,
			cryptoStatement,
			metalsStatement,
			peStatement,
			cashStatement,
			depositStatement,
		] = await Promise.all([
			this.bondsService.bondsStatement(),
			this.equityStatementService.equityStatement(),
			this.cryptoStatementService.cryptoStatement(),
			this.metalsStatementService.metalsStatement(),
			this.peStatementService.peStatement(),
			this.cashStatementService.cashStatement(),
			this.depositStatementService.depositStatement(),
		],)

		const totalStatement: Array<IValue> = []

		let totalMarketValue = 0

		const marketValueOnly = [
			...bondsStatement.bonds,
			...equityStatement.equity,
			...cryptoStatement.crypto,
			...metalsStatement.metals,
			...peStatement.pe,
			...cashStatement.cash,
			...depositStatement.deposit,
		]

		marketValueOnly.forEach((item,) => {
			if (item.marketValue) {
				totalMarketValue = totalMarketValue + item.marketValue
			}
		},)

		totalStatement.push({ marketValue: totalMarketValue, },)

		return { total: totalStatement, }
	}
}
