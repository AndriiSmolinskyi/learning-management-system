import { Body, Controller, Get, Put, Query, } from '@nestjs/common'
import type { UserTablePreference, } from '@prisma/client'
import { TableRoutes, } from '../table.constants'
import { TableService, } from '../services/table.service'

@Controller(TableRoutes.TABLE,)
export class TableController {
	constructor(
		private readonly tableService: TableService,
	) {}

	@Get(TableRoutes.GET,)
	public async get(
		@Query('tableName',) tableName: string,
		@Query('userName',) userName: string,
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	): Promise<UserTablePreference | null> {
		return this.tableService.getByUserAndTable(userName, tableName,)
	}

	@Put(TableRoutes.UPDATE,)
	public async update(
		@Body('tableName',) tableName: string,
		@Body('userName',) userName: string,
		@Body('payload',) payload: string,
	): Promise<UserTablePreference> {
		return this.tableService.upsertByUserAndTable(userName, tableName, payload,)
	}
}
