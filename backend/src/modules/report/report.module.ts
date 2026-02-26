import { Module, } from '@nestjs/common'

import { ReportController, } from './constrollers/report.controller'
import { ReportDraftController, } from './constrollers/report-draft.controller'
import { ReportService, } from './services/report.service'
import { ReportDraftService, } from './services/report-draft.service'
import { JwtModule, } from '../jwt/jwt.module'
import { DocumentModule, } from '../document/document.module'
import { CryptoModule, } from '../crypto/crypto.module'

@Module({
	controllers: [
		ReportController,
		ReportDraftController,
	],
	providers: [
		ReportService,
		ReportDraftService,
	],
	imports: [
		JwtModule,
		DocumentModule,
		CryptoModule,
	],
},)
export class ReportModule {}
