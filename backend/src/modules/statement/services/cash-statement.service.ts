import { PrismaService, } from 'nestjs-prisma'
import { Injectable, } from '@nestjs/common'
import { CBondsCurrencyService, } from '../../../modules/apis/cbonds-api/services'
import type { IValue, ICashStatement,} from '../statement.types'

@Injectable()
export class CashStatementService {
	constructor(
    private readonly prismaService: PrismaService,
    private readonly cBondsCurrencyService: CBondsCurrencyService,
	) {}

	public async cashStatement(): Promise<ICashStatement> {
		const [transactions,] = await Promise.all([
			this.prismaService.transaction.findMany(),
		],)

		const cashStatement: Array<IValue> = []

		let totalMarketValueUSD = 0

		transactions.forEach((transaction,) => {
			const marketValueUsd = (Number(transaction.amount,) * (transaction.rate ?? 1))

			totalMarketValueUSD = totalMarketValueUSD + marketValueUsd
		},)

		cashStatement.push({ marketValue: totalMarketValueUSD, },)

		return { cash: cashStatement, }
	}
}
