import { Module, } from '@nestjs/common'
import { OrderController, } from './controllers/order.controller'
import { OrderDraftController, } from './controllers/order-draft.controller'
import { OrderService, } from './services/order.service'
import { OrderDraftService, } from './services/order-draft.service'
import { JwtModule, } from '../jwt/jwt.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [
		OrderController,
		OrderDraftController,
	],
	providers: [
		OrderService,
		OrderDraftService,
	],
	imports: [
		JwtModule,
		CryptoModule,
	],
},)
export class OrderModule {}
