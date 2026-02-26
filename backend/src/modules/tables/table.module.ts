import { Module, } from '@nestjs/common'
import { TableController, } from './controllers/table.controller'
import { TableService, } from './services/table.service'

@Module({
	controllers: [
		TableController,
	],
	providers: [
		TableService,
	],
},)
export class TableModule {}
