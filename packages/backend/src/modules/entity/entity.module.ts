import { Module, } from '@nestjs/common'

import { EntityService, } from './entity.service'
import { EntityController, } from './entity.controller'
import { JwtModule, } from '../jwt/jwt.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [EntityController,],
	providers:   [EntityService,],
	imports:     [JwtModule, CryptoModule,],
	exports:     [EntityService,],
},)
export class EntityModule {}
