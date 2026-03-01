import {
	Controller,
	UseGuards,
	Get,
} from '@nestjs/common'
import {
	ApiTags,
} from '@nestjs/swagger'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { TransactionTypeService,} from '../services'
import { TransactionTypeRoutes,} from '../list-hub.constants'
import { RolesDecorator, } from '../../../shared/decorators'

import { Roles, } from '../../../shared/types'
import type { ITransactionTypeList, } from '../list-hub.types'

@Controller(TransactionTypeRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('TransactionType',)
export class TransactionTypeController {
	constructor(
		private readonly transactionTypeService: TransactionTypeService,
	) { }

	@Get(TransactionTypeRoutes.GET,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getTransactionType(): Promise<Array<ITransactionTypeList>> {
		return this.transactionTypeService.getTransactionType()
	}

	// @Get(TransactionTypeRoutes.GET_CATEGORY_LIST,)
	// @RolesDecorator({
	// 	roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	// 	clientAccess: true,
	// },)
	// public async getTransactionCategoryList(): Promise<Array<string>> {
	// 	return this.transactionTypeService.getTransactionCategoryList()
	// }
}
