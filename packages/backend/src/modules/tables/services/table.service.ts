import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { UserTablePreference, } from '@prisma/client'

@Injectable()
export class TableService {
	constructor(private readonly prisma: PrismaService,) {}

	public async getByUserAndTable(
		userName: string,
		tableName: string,
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	): Promise<UserTablePreference | null> {
		return this.prisma.userTablePreference.findUnique({
			where: {
				userName_tableName: { userName, tableName, },
			},
		},)
	}

	public async upsertByUserAndTable(
		userName: string,
		tableName: string,
		payload: string,
	): Promise<UserTablePreference> {
		const parsedPayload = JSON.parse(payload,)

		return this.prisma.userTablePreference.upsert({
			where: {
				userName_tableName: { userName, tableName, },
			},
			create: { userName, tableName, payload: parsedPayload, },
			update: { payload: parsedPayload, },
		},)
	}
}
