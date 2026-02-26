import { Module, } from '@nestjs/common'
import {
	BankListService,
	DocumentTypeService,
	ServiceProvidersListService,
	TransactionTypeService,
	ExpenseCategoryListService,
} from './services'
import {
	BankListController,
	DocumentTypeController,
	ServiceProvidersListController,
	TransactionTypeController,
	ExpenseCategoryListController,
} from './controllers'
import { JwtModule, } from '../jwt/jwt.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [
		BankListController,
		DocumentTypeController,
		ServiceProvidersListController,
		TransactionTypeController,
		ExpenseCategoryListController,
	],
	providers:   [
		BankListService,
		DocumentTypeService,
		ServiceProvidersListService,
		TransactionTypeService,
		ExpenseCategoryListService,
	],
	imports:     [
		JwtModule,
		CryptoModule,
	],
	exports:     [
		BankListService,
		DocumentTypeService,
		ServiceProvidersListService,
		TransactionTypeService,
		ExpenseCategoryListService,
	],
},)
export class ListHubModule {}
