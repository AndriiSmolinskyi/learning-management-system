/* eslint-disable no-unused-vars */
/* eslint-disable max-depth */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable complexity */
import { Inject, Injectable, } from '@nestjs/common'
import type { AddEntityDto, } from '../../../modules/entity'
import type { AddBankDto, } from '../../../modules/bank/dto'

import * as XLSX from 'xlsx'
import path from 'path'
import * as fs from 'fs'

import { ClientRepository, } from '../../../repositories/client/client.repository'
import { PortfolioService, } from '../../portfolio/services'
import { EntityService, } from '../../entity/entity.service'
import { BankService, } from '../../bank/bank.service'
import { AccountService, } from '../../account/account.service'
import { clientsToMigrate, portfoliosToMigrate, } from './db-migration.constants'

import { Prisma,} from '@prisma/client'
import type { CurrencyDataList, MetalDataList, } from '@prisma/client'
import { CustomPrismaService, PrismaService, } from 'nestjs-prisma'
import { CryptoService, } from '../../crypto/crypto.service'
import type { AddAccountDto, } from '../../account/dto'
import type { CreateTransactionDto, } from '../../../modules/transaction/dto'
import { TransactionTypeService, } from '../../../modules/list-hub/services'
import { TransactionService, } from '../../../modules/transaction/services/transaction.service'
import type { IBondsAssetPayload, IDepositPayloadAsset, IEquityPayloadAsset, IMetalsPayloadAsset, IOptionPayloadAsset, IPrivatePaylaodAsset,} from '../../asset/asset.types'
import { AssetNamesType, } from '../../asset/asset.types'
import { AssetService, } from '../../asset/asset.service'
import type { CreateAssetDto, } from '../../asset/dto'
import type { AssetOperationType,} from '../../../shared/types'
import { MetalType, } from '../../../shared/types'
import { CBondsIsinService, } from '../../../modules/apis/cbonds-api/services'
import type { PrismaClient as ThirdPartyPrismaClient,} from '@third-party-prisma/client'
import { SUCCESS_MESSAGES, THIRD_PARTY_PRISMA_SERVICE, } from '../../../shared/constants'

@Injectable()
export class DbMigrationService {
	constructor(
		@Inject(THIRD_PARTY_PRISMA_SERVICE,)
		private readonly thirdPartyPrismaService: CustomPrismaService<ThirdPartyPrismaClient>,
		private readonly prismaService: PrismaService,
		private readonly clientRepository: ClientRepository,
		private readonly portfolioService: PortfolioService,
		private readonly entityService: EntityService,
		private readonly bankService: BankService,
		private readonly accountService: AccountService,
		private readonly cryptoService: CryptoService,
		private readonly transactionTypeService: TransactionTypeService,
		private readonly transactionService: TransactionService,
		private readonly assetService: AssetService,
		private readonly cBondsIsinService: CBondsIsinService,
	) {}

	public async clientsMigration(): Promise<void> {
		await Promise.all(clientsToMigrate.map(async(client,) => {
			return this.clientRepository.createClient(client,)
		},),)
	}

	public async portfoliosMigration(): Promise<void> {
		const clients = await this.prismaService.client.findMany({
			select: {
				id:        true,
				firstName: true,
				lastName:  true,
			},
		},)
		const decryptedClients = clients.map((item,) => {
			return {
				id:        item.id,
				firstName: this.cryptoService.decryptString(item.firstName,),
				lastName:  this.cryptoService.decryptString(item.lastName,),
			}
		},)
		await Promise.all(portfoliosToMigrate.map(async(portfolio,) => {
			const client = decryptedClients.find((item,) => {
				return item.firstName === portfolio.clientFirstName && item.lastName === portfolio.clientLastName
			},)
			if (!client) {
				return null
			}
			return this.portfolioService.createPortfolio({
				clientId: client.id,
				name:            portfolio.name,
				type:            portfolio.type,
			},)
		},),)
	}

	public async entitiesMigration(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/common/db-migration/entity',)
		const files = fs.readdirSync(folderPath,)
		const allData: Array<Prisma.EntityCreateManyInput> = []
		const portfolios = await this.prismaService.portfolio.findMany()
		const decryptedPortfolios = portfolios.map((item,) => {
			return {
				id:   item.id,
				name: this.cryptoService.decryptString(item.name,),
			}
		},)
		function safeParseDate(value: unknown,): string {
			if (typeof value === 'number') {
				const d = XLSX.SSF.parse_date_code(value,)
				if (!d?.y || !d.m || !d.d) {
					return new Date().toISOString()
				}
				return new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
			}
			const cleaned = String(value,)
				.trim()
				.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '',)
			const parsed = new Date(cleaned,)
			if (!isNaN(parsed.getTime(),)) {
				return parsed.toISOString()
			}
			const onlyDate = cleaned.split('T',)[0]
			const parsed2 = new Date(onlyDate,)
			if (!isNaN(parsed2.getTime(),)) {
				return parsed2.toISOString()
			}
			return new Date().toISOString()
		}
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)

				const updatedData = data.slice(1,).map((row,) => {
					const rawCreatedDate = row[6]
					// let createdAt: string
					// if (typeof rawCreatedDate === 'number') {
					// 	const d = XLSX.SSF.parse_date_code(rawCreatedDate,)
					// 	createdAt = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					// } else {
					// 	const tempDate = new Date(String(rawCreatedDate,),)
					// 	createdAt = new Date(Date.UTC(
					// 		tempDate.getFullYear(),
					// 		tempDate.getMonth(),
					// 		tempDate.getDate(),
					// 	),).toISOString()
					// }
					const portfolioName = String(row[1] ?? '',).trim()
					const name = String(row[2] ?? '',).trim()
					const country = String(row[3] ?? '',).trim()
					const authorizedSignatoryName = String(row[4] ?? '',).trim()
					const portfolio = decryptedPortfolios.find((item,) => {
						return portfolioName === item.name
					},)
					const createdAt = safeParseDate(rawCreatedDate,)
					if (!portfolio) {
						return null
					}
					return {
						portfolioId: portfolio.id,
						name,
						authorizedSignatoryName,
						country,
						createdAt,
					}
				},)
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await Promise.all(allData.map(async(entity,) => {
			if (!entity.portfolioId || !entity.name || !entity.authorizedSignatoryName || !entity.country) {
				return null
			}
			return this.entityService.createEntity(entity as AddEntityDto,)
		},),)
	}

	public async banksMigration(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/common/db-migration/bank',)
		const files = fs.readdirSync(folderPath,)
		const allData: Array<Prisma.BankCreateManyInput> = []
		const bankList = await this.prismaService.bankList.findMany()
		const portfolios = await this.prismaService.portfolio.findMany()
		const decryptedPortfolios = portfolios.map((item,) => {
			return {
				id:       item.id,
				clientId: item.clientId,
				name:     this.cryptoService.decryptString(item.name,),
			}
		},)
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = (await Promise.all(data.slice(1,).map(async(row,) => {
					const portfolioName = String(row[1] ?? '',).trim()
					const entityName = String(row[2] ?? '',).trim()
					const bankName = String(row[3] ?? '',).trim()
					const country = String(row[6] ?? '',).trim()
					const branchName = String(row[4] ?? '',).trim()
					const bankListInstance = bankList.find((item,) => {
						return item.name === bankName
					},)
					const portfolio = decryptedPortfolios.find((item,) => {
						return portfolioName === item.name
					},)
					if (!portfolio) {
						return null
					}
					const entityList = await this.prismaService.entity.findMany({
						where: {
							portfolioId: portfolio.id,
						},
						select: {
							id:   true,
							name: true,
						},
					},)
					const decryptedEntityList = entityList.map((item,) => {
						return {
							id:   item.id,
							name: this.cryptoService.decryptString(item.name,),
						}
					},)
					const entityInstance = decryptedEntityList.find((item,) => {
						return item.name === entityName
					},)
					if (!bankListInstance || !entityInstance) {
						return null
					}
					return {
						clientId:    portfolio.clientId,
						portfolioId: portfolio.id,
						bankListId:  bankListInstance.id,
						entityId:    entityInstance.id,
						bankName,
						country,
						branchName,
					}
				},),))
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await Promise.all(allData.map(async(bank,) => {
			return this.bankService.createBank(bank as AddBankDto,)
		},),)
	}

	public async accountsMigration(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/common/db-migration/bank',)
		const files = fs.readdirSync(folderPath,)
		const allData: Array<Prisma.AccountCreateManyInput> = []
		const portfolios = await this.prismaService.portfolio.findMany()
		const decryptedPortfolios = portfolios.map((item,) => {
			return {
				id:       item.id,
				clientId: item.clientId,
				name:     this.cryptoService.decryptString(item.name,),
			}
		},)
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = (await Promise.all(data.slice(1,).map(async(row,) => {
					const portfolioName = String(row[1] ?? '',).trim()
					const entityName = String(row[2] ?? '',).trim()
					const bankName = String(row[3] ?? '',).trim()
					const branchName = String(row[4] ?? '',).trim()
					const accountName = String(row[5] ?? '',).trim()
					const managementFee = String(row[7] ?? 0,).trim()
					const holdFee = String(row[8] ?? 0,).trim()
					const sellFee = String(row[9] ?? 0,).trim()
					const buyFee = String(row[10] ?? 0,).trim()
					const portfolio = decryptedPortfolios.find((item,) => {
						return portfolioName === item.name
					},)
					if (!portfolio) {
						return null
					}
					const bankList = await this.prismaService.bank.findMany({
						where: {
							clientId:    portfolio.clientId,
							portfolioId: portfolio.id,
						},
						select: {
							id:         true,
							bankName:   true,
							branchName: true,
							entity:     {
								select: {
									id:   true,
									name: true,
								},
							},
						},
					},)
					const decryptedBankList = bankList.map((item,) => {
						return {
							id:         item.id,
							bankName:   item.bankName,
							branchName: this.cryptoService.decryptString(item.branchName,),
							entity:     {
								id:   item.entity?.id,
								name: item.entity?.name ?
									this.cryptoService.decryptString(item.entity.name,) :
									'',
							},
						}
					},)
					const entityList = await this.prismaService.entity.findMany({
						where: {
							portfolioId: portfolio.id,
						},
						select: {
							id:   true,
							name: true,
						},
					},)
					// const decryptedEntityList = entityList.map((item,) => {
					// 	return {
					// 		id:   item.id,
					// 		name: this.cryptoService.decryptString(item.name,),
					// 	}
					// },)

					const bankInstance = decryptedBankList.find((item,) => {
						return item.branchName === branchName && item.bankName === bankName && item.entity.name === entityName
					},)
					if (!bankInstance?.entity.id) {
						return null
					}
					// const entityInstance = decryptedEntityList.find((item,) => {
					// 	return item.name === entityName
					// },)
					// if (!bankInstance || !entityInstance) {
					// 	return null
					// }
					return {
						portfolioId: portfolio.id,
						entityId:    bankInstance.entity.id,
						bankId:      bankInstance.id,
						accountName,
						managementFee,
						holdFee,
						sellFee,
						buyFee,
					}
				},),))
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await Promise.all(allData.map(async(account,) => {
			return this.accountService.createAccount(account as AddAccountDto,)
		},),)
	}

	public async depositAssetMigration(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/common/db-migration/deposits',)
		const files = fs.readdirSync(folderPath,)
		const allData: Array<CreateAssetDto> = []
		const accounts = await this.prismaService.account.findMany({
			include: {
				bank:      {
					select: {
						bankName:   true,
						branchName: true,
						id:         true,
					},
				},
				entity:    {
					select: {
						name:   true,
						id:         true,
					},
				},
				portfolio: {
					include: {
						client: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
					},
				},
			},
		},)
		const decryptedAccounts = accounts.map((account,) => {
			if (!account.bank || !account.entity || !account.portfolio) {
				return null
			}
			return {
				...account,
				accountName: this.cryptoService.decryptString(account.accountName,),
				bank:        {
					...account.bank,
					bankName:   this.cryptoService.decryptString(account.bank.bankName,),
					branchName: this.cryptoService.decryptString(account.bank.branchName,),
				},
				entity:        {
					...account.entity,
					name:       this.cryptoService.decryptString(account.entity.name,),
				},
				portfolio:        {
					...account.portfolio,
					name:       this.cryptoService.decryptString(account.portfolio.name,),
				},
				client: {
					...account.portfolio.client,
					firstName:       this.cryptoService.decryptString(account.portfolio.client.firstName,),
					lastName:       this.cryptoService.decryptString(account.portfolio.client.lastName,),
				},
			}
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = (await Promise.all(data.slice(1,).map(async(row,) => {
					const clientName = String(row[0] ?? '',).trim()
					const entityName = String(row[1] ?? '',).trim()
					const bankName = String(row[2] ?? '',).trim()
					const accountName = String(row[3] ?? '',).trim()
					const currency = String(row[4] ?? '',).trim()
					const policy = String(row[8] ?? '',).trim()
					const currencyValue = Number(row[9] ?? 0,)
					const interest = Number(row[10] ?? 0,)
					const accountFound = decryptedAccounts.find((item,) => {
						const clientFullName = `${item.client.firstName} ${item.client.lastName}`
						return (
							this.normalize(item.accountName,) === this.normalize(accountName,) &&
							this.normalize(bankName,) === this.normalize(item.bank.bankName,) &&
							this.normalize(entityName,) === this.normalize(item.entity.name,) &&
							this.normalize(clientName,) === this.normalize(clientFullName,))
					},)
					if (!accountFound) {
						return null
					}
					const rawStartDate = row[6]
					const rawMaturityDate = row[7]
					let startDate: string
					if (typeof rawStartDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawStartDate,)
						startDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawStartDate,),)
						startDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					let maturityDate: string
					if (typeof rawMaturityDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawMaturityDate,)
						maturityDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawMaturityDate,),)
						maturityDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const data: IDepositPayloadAsset = {
						currency:      currency as CurrencyDataList,
						currencyValue,
						interest,
						policy,
						toBeMatured:   Boolean(policy !== 'Daily' && new Date(maturityDate,) > new Date(),),
						startDate:     new Date(startDate,),
						maturityDate: policy === 'Daily' ?
							undefined :
							new Date(maturityDate,),
					}
					const payload = JSON.stringify(data,)
					return {
						clientId:    accountFound.client.id,
						portfolioId: accountFound.portfolio.id,
						bankId:      accountFound.bank.id,
						entityId:    accountFound.entity.id,
						accountId:   accountFound.id,
						assetName:   AssetNamesType.CASH_DEPOSIT,
						payload,
					}
				},),))
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await Promise.all(allData.map(async(asset,) => {
			return this.assetService.createAsset(asset,)
		},),)
	}

	public async metalAssetMigration(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/common/db-migration/metals',)
		const files = fs.readdirSync(folderPath,)
		const allData: Array<CreateAssetDto> = []
		const accounts = await this.prismaService.account.findMany({
			include: {
				bank:      {
					select: {
						bankName:   true,
						branchName: true,
						id:         true,
					},
				},
				entity:    {
					select: {
						name:   true,
						id:         true,
					},
				},
				portfolio: {
					include: {
						client: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
					},
				},
			},
		},)
		const decryptedAccounts = accounts.map((account,) => {
			if (!account.bank || !account.entity || !account.portfolio) {
				return null
			}
			return {
				...account,
				accountName: this.cryptoService.decryptString(account.accountName,),
				bank:        {
					...account.bank,
					bankName:   this.cryptoService.decryptString(account.bank.bankName,),
					branchName: this.cryptoService.decryptString(account.bank.branchName,),
				},
				entity:        {
					...account.entity,
					name:       this.cryptoService.decryptString(account.entity.name,),
				},
				portfolio:        {
					...account.portfolio,
					name:       this.cryptoService.decryptString(account.portfolio.name,),
				},
				client: {
					...account.portfolio.client,
					firstName:       this.cryptoService.decryptString(account.portfolio.client.firstName,),
					lastName:       this.cryptoService.decryptString(account.portfolio.client.lastName,),
				},
			}
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = (await Promise.all(data.slice(1,).map(async(row,) => {
					const clientName = String(row[0] ?? '',).trim()
					const entityName = String(row[1] ?? '',).trim()
					const bankName = String(row[2] ?? '',).trim()
					const accountName = String(row[3] ?? '',).trim()
					const metalType = String(row[4] ?? '',).trim()
					const rawTransactionDate = String(row[7] ?? '',).trim()
					const units =  Math.abs(Number(row[8] ?? 0,),)
					const currency = 'USD'
					const purchasePrice = Number(row[9] ?? 0,)
					const operation = String(row[10] ?? '',).trim()
					const accountFound = decryptedAccounts.find((item,) => {
						const clientFullName = `${item.client.firstName} ${item.client.lastName}`
						return (
							this.normalize(item.accountName,) === this.normalize(accountName,) &&
							this.normalize(bankName,) === this.normalize(item.bank.bankName,) &&
							this.normalize(entityName,) === this.normalize(item.entity.name,) &&
							this.normalize(clientName,) === this.normalize(clientFullName,))
					},)
					if (!accountFound) {
						return null
					}
					let transactionDate: string
					if (typeof rawTransactionDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawTransactionDate,)
						transactionDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawTransactionDate,),)
						transactionDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const data: IMetalsPayloadAsset = {
						currency:        currency as CurrencyDataList,
						transactionDate: new Date(transactionDate,),
						metalType:       metalType as MetalDataList,
						operation,
						purchasePrice,
						units,
						productType:     MetalType.DIRECT_HOLD ,
					}
					const payload = JSON.stringify(data,)
					return {
						clientId:    accountFound.client.id,
						portfolioId: accountFound.portfolio.id,
						bankId:      accountFound.bank.id,
						entityId:    accountFound.entity.id,
						accountId:   accountFound.id,
						assetName:   AssetNamesType.METALS,
						payload,
					}
				},),))
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await Promise.all(allData.map(async(asset,) => {
			return this.assetService.createAsset(asset,)
		},),)
	}

	public async bondAssetMigration(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/common/db-migration/bonds',)
		const files = fs.readdirSync(folderPath,)
		const allData: Array<CreateAssetDto> = []
		const bondsData = await this.prismaService.bond.findMany()
		const accounts = await this.prismaService.account.findMany({
			include: {
				bank:      {
					select: {
						bankName:   true,
						branchName: true,
						id:         true,
					},
				},
				entity:    {
					select: {
						name:   true,
						id:         true,
					},
				},
				portfolio: {
					include: {
						client: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
					},
				},
			},
		},)
		const decryptedAccounts = accounts.map((account,) => {
			if (!account.bank || !account.entity || !account.portfolio) {
				return null
			}
			return {
				...account,
				accountName: this.cryptoService.decryptString(account.accountName,),
				bank:        {
					...account.bank,
					bankName:   this.cryptoService.decryptString(account.bank.bankName,),
					branchName: this.cryptoService.decryptString(account.bank.branchName,),
				},
				entity:        {
					...account.entity,
					name:       this.cryptoService.decryptString(account.entity.name,),
				},
				portfolio:        {
					...account.portfolio,
					name:       this.cryptoService.decryptString(account.portfolio.name,),
				},
				client: {
					...account.portfolio.client,
					firstName:       this.cryptoService.decryptString(account.portfolio.client.firstName,),
					lastName:       this.cryptoService.decryptString(account.portfolio.client.lastName,),
				},
			}
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		const missingIsins: Array<string> = []
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = (await Promise.all(data.slice(1,).map(async(row,) => {
					const clientName = String(row[0] ?? '',).trim()
					const entityName = String(row[1] ?? '',).trim()
					const bankName = String(row[2] ?? '',).trim()
					const accountName = String(row[3] ?? '',).trim()
					const currency = String(row[4] ?? '',).trim()
					const isin = String(row[6] ?? '',).trim()
					const security = String(row[7] ?? '',).trim()
					const units =  Math.abs(Number(row[8] ?? 0,),)
					const unitPrice = Number(row[9] ?? 0,)
					const accrued = Number(row[10] ?? 0,)
					const rawOperation = String(row[11] ?? '',).trim()
					const rawTransactionDate = String(row[12] ?? '',).trim()
					const bankFee = Number(row[13] ?? 0,)
					const accountFound = decryptedAccounts.find((item,) => {
						const clientFullName = `${item.client.firstName} ${item.client.lastName}`
						return (
							this.normalize(item.accountName,) === this.normalize(accountName,) &&
							this.normalize(bankName,) === this.normalize(item.bank.bankName,) &&
							this.normalize(entityName,) === this.normalize(item.entity.name,) &&
							this.normalize(clientName,) === this.normalize(clientFullName,))
					},)
					if (!accountFound) {
						return null
					}
					// const isinData = await this.thirdPartyPrismaService.client.isins.findFirst({
					// 	where: {
					// 		isin: isin.trim(),
					// 	},
					// },)
					// if (!isinData) {
					// 	missingIsins.push(isin,)
					// 	await this.cBondsIsinService.createIsin({currency: currency.trim() as CurrencyDataList, name: isin.trim(),},)
					// }
					const operation = (rawOperation.toLowerCase().trim() === 'buy') ?
						'Buy' :
						'Sell'
					let valueDate: string
					if (typeof rawTransactionDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawTransactionDate,)
						valueDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawTransactionDate,),)
						valueDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const bond = bondsData.find((item,) => {
						return item.isin === isin.trim()
					},)
					const data: IBondsAssetPayload = {
						currency:        currency as CurrencyDataList,
						valueDate: (!valueDate || isNaN(new Date(valueDate,).getTime(),)) ?
							new Date(Date.UTC(1999, 8, 9,),).toISOString() :
							valueDate,
						isin:      bond?.isin ?? isin ?? 'XXX9999999',
						operation:       operation as AssetOperationType,
						security:  bond?.security ?? security ?? 'XXXX',
						units,
						unitPrice,
						accrued,
						bankFee,
					}
					const payload = JSON.stringify(data,)
					return {
						clientId:    accountFound.client.id,
						portfolioId: accountFound.portfolio.id,
						bankId:      accountFound.bank.id,
						entityId:    accountFound.entity.id,
						accountId:   accountFound.id,
						assetName:   AssetNamesType.BONDS,
						payload,
					}
				},),))
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		for (const asset of allData) {
			await this.assetService.createAsset(asset,)
		}
	}

	public async equityAssetMigration(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/common/db-migration/equities',)
		const files = fs.readdirSync(folderPath,)
		const allData: Array<CreateAssetDto> = []
		const equities = await this.prismaService.equity.findMany()
		const etfs = await this.prismaService.etf.findMany()
		const accounts = await this.prismaService.account.findMany({
			include: {
				bank:      {
					select: {
						bankName:   true,
						branchName: true,
						id:         true,
					},
				},
				entity:    {
					select: {
						name:   true,
						id:         true,
					},
				},
				portfolio: {
					include: {
						client: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
					},
				},
			},
		},)
		const decryptedAccounts = accounts.map((account,) => {
			if (!account.bank || !account.entity || !account.portfolio) {
				return null
			}
			return {
				...account,
				accountName: this.cryptoService.decryptString(account.accountName,),
				bank:        {
					...account.bank,
					bankName:   this.cryptoService.decryptString(account.bank.bankName,),
					branchName: this.cryptoService.decryptString(account.bank.branchName,),
				},
				entity:        {
					...account.entity,
					name:       this.cryptoService.decryptString(account.entity.name,),
				},
				portfolio:        {
					...account.portfolio,
					name:       this.cryptoService.decryptString(account.portfolio.name,),
				},
				client: {
					...account.portfolio.client,
					firstName:       this.cryptoService.decryptString(account.portfolio.client.firstName,),
					lastName:       this.cryptoService.decryptString(account.portfolio.client.lastName,),
				},
			}
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		const missingIsins: Array<string> = []
		const delay = async(ms: number,): Promise<void> => {
			return new Promise((resolve,) => {
				setTimeout(resolve, ms,)
			},)
		}
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData: Array<{
            clientId: string;
            portfolioId: string;
            bankId: string;
            entityId: string;
            accountId: string;
            assetName: AssetNamesType;
            payload: string;
        }> = []
				for (const row of data.slice(1,)) {
					const clientName = String(row[0] ?? '',).trim()
					const entityName = String(row[1] ?? '',).trim()
					const bankName = String(row[2] ?? '',).trim()
					const accountName = String(row[3] ?? '',).trim()
					const currency = String(row[4] ?? '',).trim()
					const isin = String(row[6] ?? '',).trim()
					const equityType = String(row[7] ?? '',).trim()
					const security = String(row[8] ?? '',).trim()
					const units = Math.abs(Number(row[9] ?? 0,),)
					const transactionPrice = Number(row[10] ?? 0,)
					const rawOperation = String(row[13] ?? '',).trim()
					const rawTransactionDate = row[14]
					const bankFee = Number(row[15] ?? 0,)

					const accountFound = decryptedAccounts.find((item,) => {
						const clientFullName = `${item.client.firstName} ${item.client.lastName}`
						return (
							this.normalize(item.accountName,) === this.normalize(accountName,) &&
                    this.normalize(bankName,) === this.normalize(item.bank.bankName,) &&
                    this.normalize(entityName,) === this.normalize(item.entity.name,) &&
                    this.normalize(clientName,) === this.normalize(clientFullName,)
						)
					},)
					const operation = (rawOperation.toLowerCase().trim() === 'buy') ?
						'Buy' :
						'Sell'

					if (!accountFound) {
						continue
					}
					// const isinData = await this.thirdPartyPrismaService.client.isins.findFirst({
					// 	where: { isin: isin.trim(), },
					// },)

					// if (!isinData) {
					// 	const { message, } = await this.cBondsIsinService.createIsin({
					// 		currency: currency as CurrencyDataList,
					// 		name:     isin.trim(),
					// 	},)
					// 	if (message !== SUCCESS_MESSAGES.ISIN_CREATED) {
					// 		missingIsins.push(isin,)
					// 	}
					// 	await delay(1500,)
					// }
					let transactionDate: string

					if (typeof rawTransactionDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawTransactionDate,)
						transactionDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawTransactionDate,),)
						transactionDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const equityData = equities.find((i,) => {
						return i.isin === isin.trim()
					},)
					const etfData = etfs.find((i,) => {
						return i.isin === isin.trim()
					},)
					const payloadData: IEquityPayloadAsset = {
						currency:        currency as CurrencyDataList,
						transactionPrice,
						transactionDate: new Date(transactionDate,),
						isin:            isin.trim() ?? 'XXX9999999',
						operation:       operation as AssetOperationType,
						security:        equityData?.ticker ?? etfData?.ticker ?? security.trim() ?? 'XXXX',
						units,
						bankFee,
						equityType,
					}
					const payload = JSON.stringify(payloadData,)

					updatedData.push({
						clientId:    accountFound.client.id,
						portfolioId: accountFound.portfolio.id,
						bankId:      accountFound.bank.id,
						entityId:    accountFound.entity.id,
						accountId:   accountFound.id,
						assetName:   AssetNamesType.EQUITY_ASSET,
						payload,
					},)
				}

				allData.push(...updatedData,)
				// const updatedData = (await Promise.all(data.slice(1,).map(async(row,) => {
				// 	const clientName = String(row[0] ?? '',).trim()
				// 	const entityName = String(row[1] ?? '',).trim()
				// 	const bankName = String(row[2] ?? '',).trim()
				// 	const accountName = String(row[3] ?? '',).trim()
				// 	const currency = String(row[4] ?? '',).trim()
				// 	const isin = String(row[6] ?? '',).trim()
				// 	const equityType = String(row[7] ?? '',).trim()
				// 	const security = String(row[8] ?? '',).trim()
				// 	const units =  Math.abs(Number(row[9] ?? 0,),)
				// 	const transactionPrice = Number(row[10] ?? 0,)
				// 	const rawOperation = String(row[13] ?? '',).trim()
				// 	const rawTransactionDate = String(row[14] ?? '',).trim()
				// 	const bankFee = Number(row[15] ?? 0,)
				// 	const accountFound = decryptedAccounts.find((item,) => {
				// 		const clientFullName = `${item.client.firstName} ${item.client.lastName}`
				// 		return (
				// 			this.normalize(item.accountName,) === this.normalize(accountName,) &&
				// 			this.normalize(bankName,) === this.normalize(item.bank.bankName,) &&
				// 			this.normalize(entityName,) === this.normalize(item.entity.name,) &&
				// 			this.normalize(clientName,) === this.normalize(clientFullName,))
				// 	},)
				// 	const operation = (rawOperation.toLowerCase().trim() === 'buy') ?
				// 		'Buy' :
				// 		'Sell'
				// 	if (!accountFound) {
				// 		return null
				// 	}
				// 	const isinData = await this.thirdPartyPrismaService.client.isins.findFirst({
				// 		where: {
				// 			isin: isin.trim(),
				// 		},
				// 	},)
				// 	if (!isinData) {
				// 		const {message,} = await this.cBondsIsinService.createIsin({currency: currency.trim() as CurrencyDataList, name: isin.trim(),},)
				// 		if (message !== SUCCESS_MESSAGES.ISIN_CREATED) {
				// 			missingIsins.push(isin,)
				// 		}
				// 	}
				// 	let transactionDate: string
				// 	if (typeof rawTransactionDate === 'number') {
				// 		const d = XLSX.SSF.parse_date_code(rawTransactionDate,)
				// 		transactionDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
				// 	} else {
				// 		const tempDate = new Date(String(rawTransactionDate,),)
				// 		transactionDate = new Date(Date.UTC(
				// 			tempDate.getFullYear(),
				// 			tempDate.getMonth(),
				// 			tempDate.getDate(),
				// 		),).toISOString()
				// 	}
				// 	const equityData = equities.find((item,) => {
				// 		return item.isin === isin.trim()
				// 	},)
				// 	const etfData = etfs.find((item,) => {
				// 		return item.isin === isin.trim()
				// 	},)
				// 	const data: IEquityPayloadAsset = {
				// 		currency:        currency as CurrencyDataList,
				// 		transactionPrice,
				// 		transactionDate: new Date(transactionDate,),
				// 		isin:            isin.trim() ?? 'XXX9999999',
				// 		operation:       operation as AssetOperationType,
				// 		security:        equityData?.ticker ?? etfData?.ticker ?? security.trim() ?? 'XXXX',
				// 		units,
				// 		bankFee,
				// 		equityType,
				// 	}
				// 	const payload = JSON.stringify(data,)
				// 	return {
				// 		clientId:    accountFound.client.id,
				// 		portfolioId: accountFound.portfolio.id,
				// 		bankId:      accountFound.bank.id,
				// 		entityId:    accountFound.entity.id,
				// 		accountId:   accountFound.id,
				// 		assetName:   AssetNamesType.EQUITY_ASSET,
				// 		payload,
				// 	}
				// },),))
				// 	.filter((item,): item is NonNullable<typeof item> => {
				// 		return item !== null
				// 	},)
				// allData.push(...updatedData,)
			}
		}
		// for (const asset of allData) {
		// 	await this.assetService.createAsset(asset,)
		// }
	}

	public async optionsAssetMigration(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/common/db-migration/options',)
		const files = fs.readdirSync(folderPath,)
		const allData: Array<CreateAssetDto> = []
		const accounts = await this.prismaService.account.findMany({
			include: {
				bank:      {
					select: {
						bankName:   true,
						branchName: true,
						id:         true,
					},
				},
				entity:    {
					select: {
						name:   true,
						id:         true,
					},
				},
				portfolio: {
					include: {
						client: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
					},
				},
			},
		},)
		const decryptedAccounts = accounts.map((account,) => {
			if (!account.bank || !account.entity || !account.portfolio) {
				return null
			}
			return {
				...account,
				accountName: this.cryptoService.decryptString(account.accountName,),
				bank:        {
					...account.bank,
					bankName:   this.cryptoService.decryptString(account.bank.bankName,),
					branchName: this.cryptoService.decryptString(account.bank.branchName,),
				},
				entity:        {
					...account.entity,
					name:       this.cryptoService.decryptString(account.entity.name,),
				},
				portfolio:        {
					...account.portfolio,
					name:       this.cryptoService.decryptString(account.portfolio.name,),
				},
				client: {
					...account.portfolio.client,
					firstName:       this.cryptoService.decryptString(account.portfolio.client.firstName,),
					lastName:       this.cryptoService.decryptString(account.portfolio.client.lastName,),
				},
			}
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = (await Promise.all(data.slice(1,).map(async(row,) => {
					const clientName = String(row[0] ?? '',).trim()
					const entityName = String(row[1] ?? '',).trim()
					const bankName = String(row[2] ?? '',).trim()
					const accountName = String(row[3] ?? '',).trim()
					const currency = String(row[4] ?? '',).trim()
					const pairAssetCurrency = String(row[6] ?? '',).trim()
					const strike = Number(row[7] ?? 0,)
					const rawStartDate = String(row[9] ?? '',).trim()
					const rawMaturityDate = String(row[10] ?? '',).trim()
					const premium = Number(row[11] ?? 0,)
					const currentMarketValue = Number(row[12] ?? 0,)
					const principalValue = Number(row[13] ?? 0,)
					const marketOpenValue = Number(row[14] ?? 0,)
					const contracts = Number(row[15] ?? 0,)
					const accountFound = decryptedAccounts.find((item,) => {
						const clientFullName = `${item.client.firstName} ${item.client.lastName}`
						return (
							this.normalize(item.accountName,) === this.normalize(accountName,) &&
							this.normalize(bankName,) === this.normalize(item.bank.bankName,) &&
							this.normalize(entityName,) === this.normalize(item.entity.name,) &&
							this.normalize(clientName,) === this.normalize(clientFullName,))
					},)
					if (!accountFound) {
						return null
					}
					let startDate: string
					if (typeof rawStartDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawStartDate,)
						startDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawStartDate,),)
						startDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					let maturityDate: string
					if (typeof rawMaturityDate === 'number') {
						const d = XLSX.SSF.parse_date_code(rawMaturityDate,)
						maturityDate = new Date(Date.UTC(d.y, d.m - 1, d.d,),).toISOString()
					} else {
						const tempDate = new Date(String(rawMaturityDate,),)
						maturityDate = new Date(Date.UTC(
							tempDate.getFullYear(),
							tempDate.getMonth(),
							tempDate.getDate(),
						),).toISOString()
					}
					const data: IOptionPayloadAsset = {
						currency:        currency as CurrencyDataList,
						maturityDate: new Date(maturityDate,),
						startDate:    new Date(startDate,),
						contracts,
						marketOpenValue,
						principalValue,
						currentMarketValue,
						premium,
						strike,
						pairAssetCurrency,
					}
					const payload = JSON.stringify(data,)
					return {
						clientId:    accountFound.client.id,
						portfolioId: accountFound.portfolio.id,
						bankId:      accountFound.bank.id,
						entityId:    accountFound.entity.id,
						accountId:   accountFound.id,
						assetName:   AssetNamesType.OPTIONS,
						payload,
					}
				},),))
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		for (const asset of allData) {
			await this.assetService.createAsset(asset,)
		}
	}

	public async peAssetMigration(): Promise<void> {
		const folderPath = path.resolve(process.cwd(), 'src/modules/common/db-migration/pe',)
		const files = fs.readdirSync(folderPath,)
		const allData: Array<CreateAssetDto> = []
		const accounts = await this.prismaService.account.findMany({
			include: {
				bank:      {
					select: {
						bankName:   true,
						branchName: true,
						id:         true,
					},
				},
				entity:    {
					select: {
						name:   true,
						id:         true,
					},
				},
				portfolio: {
					include: {
						client: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
					},
				},
			},
		},)
		const decryptedAccounts = accounts.map((account,) => {
			if (!account.bank || !account.entity || !account.portfolio) {
				return null
			}
			return {
				...account,
				accountName: this.cryptoService.decryptString(account.accountName,),
				bank:        {
					...account.bank,
					bankName:   this.cryptoService.decryptString(account.bank.bankName,),
					branchName: this.cryptoService.decryptString(account.bank.branchName,),
				},
				entity:        {
					...account.entity,
					name:       this.cryptoService.decryptString(account.entity.name,),
				},
				portfolio:        {
					...account.portfolio,
					name:       this.cryptoService.decryptString(account.portfolio.name,),
				},
				client: {
					...account.portfolio.client,
					firstName:       this.cryptoService.decryptString(account.portfolio.client.firstName,),
					lastName:       this.cryptoService.decryptString(account.portfolio.client.lastName,),
				},
			}
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)

		for (const file of files) {
			const filePath = path.join(folderPath, file,)
			if (file.endsWith('.xlsx',) || file.endsWith('.xls',)) {
				const workbook = XLSX.readFile(filePath,)
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const data: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
				const updatedData = (await Promise.all(data.slice(1,).map(async(row,) => {
					const clientName = String(row[0] ?? '',).trim()
					const entityName = String(row[1] ?? '',).trim()
					const bankName = String(row[2] ?? '',).trim()
					const accountName = String(row[3] ?? '',).trim()
					const fundType = String(row[4] ?? '',).trim()
					const status = String(row[5] ?? '',).trim()
					const currency = String(row[6] ?? '',).trim()
					const rawEntryDate = String(row[7] ?? '',).trim()
					const currencyValue = Number(row[8] ?? 0,)
					const serviceProvider = String(row[9] ?? '',).trim()
					const geography = String(row[10] ?? '',).trim()
					const fundName = String(row[11] ?? '',).trim()
					const fundID = String(row[12] ?? '',).trim()
					const fundSize = String(row[13] ?? '',).trim()
					const aboutFund = String(row[14] ?? '',).trim()
					const rawFundTermDate = String(row[16] ?? '',).trim()
					const capitalCalled = Number(row[17] ?? 0,)
					const rawLastValuationDate = String(row[18] ?? '',).trim()
					const moic = Number(row[19] ?? 0,)
					const totalCommitment = Number(row[22] ?? 0,)
					const tvpi = Number(row[23] ?? 0,)

					const accountFound = decryptedAccounts.find((item,) => {
						const clientFullName = `${item.client.firstName} ${item.client.lastName}`
						return (
							this.normalize(item.accountName,) === this.normalize(accountName,) &&
							this.normalize(bankName,) === this.normalize(item.bank.bankName,) &&
							this.normalize(entityName,) === this.normalize(item.entity.name,) &&
							this.normalize(clientName,) === this.normalize(clientFullName,))
					},)

					if (!accountFound) {
						return null
					}
					const  entryDate = this.parseExcelDate(rawEntryDate,)
					const  fundTermDate = this.parseExcelDate(rawFundTermDate,)
					const  lastValuationDate = this.parseExcelDate(rawLastValuationDate,)
					const data: IPrivatePaylaodAsset = {
						currency:          currency as CurrencyDataList,
						currencyValue,
						fundType,
						status,
						entryDate: (!entryDate || isNaN(new Date(entryDate,).getTime(),)) ?
							new Date(Date.UTC(1999, 8, 9,),) :
							new Date(entryDate,),
						fundTermDate: (!fundTermDate || isNaN(new Date(fundTermDate,).getTime(),)) ?
							new Date(Date.UTC(1999, 8, 9,),) :
							new Date(fundTermDate,),
						serviceProvider,
						geography,
						fundName,
						fundID,
						aboutFund,
						fundSize,
						capitalCalled,
						lastValuationDate: (!lastValuationDate || isNaN(new Date(lastValuationDate,).getTime(),)) ?
							new Date(Date.UTC(1999, 8, 9,),) :
							new Date(lastValuationDate,),
						moic,
						totalCommitment,
						tvpi,
					}
					const payload = JSON.stringify(data,)
					return {
						clientId:    accountFound.client.id,
						portfolioId: accountFound.portfolio.id,
						bankId:      accountFound.bank.id,
						entityId:    accountFound.entity.id,
						accountId:   accountFound.id,
						assetName:   AssetNamesType.PRIVATE_EQUITY,
						payload,
					}
				},),))
					.filter((item,): item is NonNullable<typeof item> => {
						return item !== null
					},)
				allData.push(...updatedData,)
			}
		}
		await Promise.all(allData.map(async(asset,) => {
			return this.assetService.createAsset(asset,)
		},),)
	}

	private buildAccountKey(
		accountName: string,
		bankName: string,
		entityName: string,
	): string {
		return [
			this.normalize(accountName,),
			this.normalize(bankName,),
			this.normalize(entityName,),
		].join('|',)
	}

	// todo: for many with stats
	// public async transactionMigration(): Promise<void> {
	// 	const excelDir = path.resolve(process.cwd(), "src/modules/common/db-migration/transaction")
	// 	const files = fs.readdirSync(excelDir).filter((f) => f.endsWith(".xlsx") || f.endsWith(".xls"))
	// 	if (!files.length) return

	// 	let sheet: XLSX.WorkSheet | undefined
	// 	for (const f of files) {
	// 		const wb = XLSX.readFile(path.join(excelDir, f))
	// 		const sheetName = wb.SheetNames.find((n) => /bi[\s\-_]*v[\s\-_]*cash/i.test(n)) ?? wb.SheetNames[0]
	// 		const sh = wb.Sheets[sheetName]
	// 		const probe: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sh, { header: 1 })
	// 		if (probe.length > 1) { sheet = sh; break }
	// 	}
	// 	if (!sheet) return

	// 	const rows: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1 })
	// 	const header = rows[0] ?? []

	// 	const normalize = (v: unknown) => String(v ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")
	// 	const col = (alts: ReadonlyArray<string>) => {
	// 		for (let i = 0; i < header.length; i += 1) {
	// 			const h = normalize(header[i])
	// 			for (const a of alts) if (h === a) return i
	// 		}
	// 		return -1
	// 	}

	// 	const accountCol  = col(["accountname"])
	// 	const currencyCol = col(["currencyname", "currency"])
	// 	const dateCol     = col(["date"])
	// 	const amountCol   = col(["valueoncurrency"])
	// 	const typeCol     = col(["transactionname"])
	// 	const providerCol = col(["serviceprovidername"])
	// 	const commentCol  = col(["comment"])
	// 	if ([accountCol, currencyCol, dateCol, amountCol, typeCol, providerCol, commentCol].some((i) => i < 0)) return

	// 	const accounts = await this.prismaService.account.findMany({
	// 		select: {
	// 			id: true,
	// 			bankId: true,
	// 			entityId: true,
	// 			portfolioId: true,
	// 			accountName: true,
	// 			bank: { select: { clientId: true } },
	// 		},
	// 	})

	// 	const accountIndex = new Map<string, { id: string; bankId: string; entityId: string; portfolioId: string | null; clientId: string | null }>()
	// 	for (const a of accounts) {
	// 		const decrypted = this.cryptoService.decryptString(a.accountName)
	// 		accountIndex.set(normalize(decrypted), {
	// 			id: a.id,
	// 			bankId: a.bankId,
	// 			entityId: a.entityId,
	// 			portfolioId: a.portfolioId,
	// 			clientId: a.bank?.clientId ?? null,
	// 		})
	// 	}

	// 	const typeRows = await this.transactionTypeService.getTransactionType()
	// 	const typeIndexExact = new Map<string, string>()
	// 	for (const t of typeRows) typeIndexExact.set(normalize(t.name), t.id)

	// 	const parseExcelDate = (raw: unknown): string | null => {
	// 		if (typeof raw === "number") {
	// 			const d = XLSX.SSF.parse_date_code(raw)
	// 			return new Date(Date.UTC(d.y, d.m - 1, d.d, d.H || 0, d.M || 0, d.S || 0)).toISOString()
	// 		}
	// 		const dt = new Date(String(raw))
	// 		return isNaN(dt.getTime()) ? null : dt.toISOString()
	// 	}

	// 	const stats = {
	// 		total: Math.max(rows.length - 1, 0),
	// 		queued: 0,
	// 		created: 0,
	// 		skipped: 0,
	// 		reasons: {
	// 			emptyAccountName: 0,
	// 			accountNotFound: 0,
	// 			badFields: 0,
	// 			missingClientOrPortfolio: 0,
	// 			typeNotFound: 0,
	// 			createFailed: 0,
	// 		},
	// 	}

	// 	for (let i = 1; i < rows.length; i += 1) {
	// 		const r = rows[i]
	// 		if (!r) { stats.skipped++; stats.reasons.badFields++; continue }

	// 		const accNameRaw = String(r[accountCol] ?? "").trim()
	// 		if (!accNameRaw) { stats.skipped++; stats.reasons.emptyAccountName++; continue }
	// 		const acc = accountIndex.get(normalize(accNameRaw))
	// 		if (!acc) { stats.skipped++; stats.reasons.accountNotFound++; continue }

	// 		const currencyName = String(r[currencyCol] ?? "").trim()
	// 		const dateISO = parseExcelDate(r[dateCol])
	// 		const amount = Number(String(r[amountCol] ?? "").replace(/[^0-9.\-]/g, ""))
	// 		const transactionName = String(r[typeCol] ?? "").trim()
	// 		const serviceProvider = String(r[providerCol] ?? "").trim()
	// 		const comment = String(r[commentCol] ?? "").trim()

	// 		if (!currencyName || !dateISO || !isFinite(amount) || !transactionName) { stats.skipped++; stats.reasons.badFields++; continue }
	// 		if (!acc.clientId || !acc.portfolioId) { stats.skipped++; stats.reasons.missingClientOrPortfolio++; continue }

	// 		let transactionTypeId = typeIndexExact.get(normalize(transactionName)) ?? null
	// 		if (!transactionTypeId) {
	// 			const partial = typeRows.find((t) => normalize(t.name).includes(normalize(transactionName)))
	// 			transactionTypeId = partial?.id ?? typeRows[0]?.id ?? null
	// 		}
	// 		if (!transactionTypeId) { stats.skipped++; stats.reasons.typeNotFound++; continue }

	// 		const dto: CreateTransactionDto = {
	// 			transactionTypeId,
	// 			clientId: acc.clientId,
	// 			portfolioId: acc.portfolioId,
	// 			entityId: acc.entityId,
	// 			bankId: acc.bankId,
	// 			accountId: acc.id,
	// 			currency: currencyName,
	// 			amount,
	// 			transactionDate: new Date(dateISO),
	// 			...(serviceProvider ? { serviceProvider } : {}),
	// 			...(comment ? { comment } : {}),
	// 		}

	// 		stats.queued++
	// 		try {
	// 			await this.transactionService.createTransaction(dto)
	// 			stats.created++
	// 		} catch {
	// 			stats.skipped++
	// 			stats.reasons.createFailed++
	// 		}
	// 	}

	// 	console.log("[transactionMigration:summary]", stats)
	// }

	// todo: promise all with stats
	public async transactionMigration(): Promise<void> {
		const excelDir = path.resolve(process.cwd(), 'src/modules/common/db-migration/transaction',)
		const files = fs.readdirSync(excelDir,).filter((f,) => {
			return f.endsWith('.xlsx',) || f.endsWith('.xls',)
		},)
		if (!files.length) {
			return
		}

		let sheet: XLSX.WorkSheet | undefined
		for (const f of files) {
			const wb = XLSX.readFile(path.join(excelDir, f,),)
			const sheetName = wb.SheetNames.find((n,) => {
				return (/bi[\s\-_]*v[\s\-_]*cash/i).test(n,)
			},) ?? wb.SheetNames[0]
			const sh = wb.Sheets[sheetName]
			const probe: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sh, { header: 1, },)
			if (probe.length > 1) {
				sheet = sh; break
			}
		}
		if (!sheet) {
			return
		}

		const rows: Array<Array<string | number>> = XLSX.utils.sheet_to_json(sheet, { header: 1, },)
		const header = rows[0] ?? []

		const normalize = (v: unknown,): string => {
			return String(v ?? '',).toLowerCase()
				.replace(/[^a-z0-9]/g, '',)
		}
		const col = (alts: ReadonlyArray<string>,): number => {
			for (let i = 0; i < header.length; i = i + 1) {
				const h = normalize(header[i],)
				for (const a of alts) {
					if (h === a) {
						return i
					}
				}
			}
			return -1
		}

		const accountCol  = col(['accountname',],)
		const bankCol = col(['bankname',],)
		const entityCol = col(['companyname',],)
		const currencyCol = col(['currencyname', 'currency',],)
		const dateCol     = col(['date',],)
		const amountCol   = col(['valueoncurrency',],)
		const typeCol     = col(['transactionname',],)
		const providerCol = col(['serviceprovidername',],)
		const commentCol  = col(['comment',],)
		if ([accountCol, currencyCol, dateCol, amountCol, typeCol, providerCol, commentCol,].some((i,) => {
			return i < 0
		},)) {
			return
		}

		const accounts = await this.prismaService.account.findMany({
			select: {
				id:          true,
				bankId:      true,
				entityId:    true,
				portfolioId: true,
				accountName: true,
				bank:        {
					select: {
						clientId:   true,
						bankName:   true,
						branchName: true,
						id:         true,
					},
				},
				entity:    {
					select: {
						name:   true,
						id:         true,
					},
				},
				portfolio: {
					include: {
						client: {
							select: {
								id:        true,
								firstName: true,
								lastName:  true,
							},
						},
					},
				},
			},
		},)
		const decryptedAccounts = accounts.map((account,) => {
			if (!account.bank || !account.entity || !account.portfolio) {
				return null
			}
			return {
				...account,
				accountName: this.cryptoService.decryptString(account.accountName,),
				bank:        {
					...account.bank,
					bankName:   this.cryptoService.decryptString(account.bank.bankName,),
					branchName: this.cryptoService.decryptString(account.bank.branchName,),
				},
				entity:        {
					...account.entity,
					name:       this.cryptoService.decryptString(account.entity.name,),
				},
				portfolio:        {
					...account.portfolio,
					name:       this.cryptoService.decryptString(account.portfolio.name,),
				},
				client: {
					...account.portfolio.client,
					firstName:       this.cryptoService.decryptString(account.portfolio.client.firstName,),
					lastName:       this.cryptoService.decryptString(account.portfolio.client.lastName,),
				},
			}
		},)
			.filter((item,): item is NonNullable<typeof item> => {
				return item !== null
			},)
		const accountIndex = new Map<string, { id: string; bankId: string; entityId: string; portfolioId: string | null; clientId: string | null }>()
		for (const a of decryptedAccounts) {
			const decryptedAccount = a.accountName
			const decryptedBank =  a.bank.bankName
			const decryptedEntity = a.entity.name
			const key =  this.buildAccountKey(
				decryptedAccount,
				decryptedBank,
				decryptedEntity,
			)
			accountIndex.set(normalize(key,), {
				id:          a.id,
				bankId:      a.bankId,
				entityId:    a.entityId,
				portfolioId: a.portfolioId,
				clientId:    a.bank?.clientId ?? null,
			},)
		}

		const typeRows = await this.transactionTypeService.getTransactionType()
		const typeIndexExact = new Map<string, string>()
		for (const t of typeRows) {
			typeIndexExact.set(normalize(t.name,), t.id,)
		}

		const parseExcelDate = (raw: unknown,): string | null => {
			if (typeof raw === 'number') {
				const d = XLSX.SSF.parse_date_code(raw,)
				// return new Date(Date.UTC(d.y, d.m - 1, d.d, d.H || 0, d.M || 0, d.S || 0)).toISOString()
				return new Date(
					Date.UTC(d.y, d.m - 1, d.d, d.H ?? 0, d.M ?? 0, d.S ?? 0,),
				).toISOString()
			}
			const dt = new Date(String(raw,),)
			return isNaN(dt.getTime(),) ?
				null :
				dt.toISOString()
		}

		let rowsProcessed = 0
		let skippedNoAccount = 0
		let skippedInvalidFields = 0
		let skippedNoClientOrPortfolio = 0
		let skippedNoType = 0

		const notFoundAccounts = new Set<string>()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const catchErros: Array<any> = []
		const dtos: Array<CreateTransactionDto> = []

		for (let i = 1; i < rows.length; i = i + 1) {
			const r = rows[i]
			if (!r) {
				continue
			}
			rowsProcessed = rowsProcessed + 1

			const accNameRaw = String(r[accountCol] ?? '',).trim()
			const bankNameRaw = String(r[bankCol] ?? '',).trim()
			const entityNameRaw = String(r[entityCol] ?? '',).trim()
			if (!accNameRaw) {
				skippedInvalidFields = skippedInvalidFields + 1; continue
			}

			const key = this.buildAccountKey(
				accNameRaw,
				bankNameRaw,
				entityNameRaw,
			)

			const acc = accountIndex.get(normalize(key,),)
			if (!acc) {
				skippedNoAccount = skippedNoAccount + 1; notFoundAccounts.add(accNameRaw,); continue
			}

			const currencyName = String(r[currencyCol] ?? '',).trim()
			const dateISO = parseExcelDate(r[dateCol],)
			// eslint-disable-next-line no-useless-escape
			const amount = Number(String(r[amountCol] ?? '',).replace(/[^0-9.\-]/g, '',),)
			const transactionName = String(r[typeCol] ?? '',).trim()
			const serviceProvider = String(r[providerCol] ?? 'N/A',).trim()
			const comment = String(r[commentCol] ?? '',).trim()

			if (!currencyName || !dateISO || !isFinite(amount,) || !transactionName) {
				skippedInvalidFields = skippedInvalidFields + 1; continue
			}
			if (!acc.clientId || !acc.portfolioId) {
				skippedNoClientOrPortfolio = skippedNoClientOrPortfolio + 1; continue
			}

			let transactionTypeId: string | null = typeIndexExact.get(normalize(transactionName,),) ?? null
			if (!transactionTypeId) {
				const partial = typeRows.find((t,) => {
					return normalize(t.name,).includes(normalize(transactionName,),)
				},)
				transactionTypeId = partial?.id ?? typeRows[0]?.id ?? null
			}
			if (!transactionTypeId) {
				skippedNoType = skippedNoType + 1; continue
			}

			// const extractSecIsin = (raw: string,): { isin?: string; security?: string } => {
			// 	const txt = String(raw ?? '',).replace(/\s+/g, ' ',)
			// 		.trim()
			// 	const m = (/\b([A-Za-z]{2}[A-Za-z0-9]{10})\b/).exec(txt,)
			// 	if (!m?.[1]) {
			// 		return {}
			// 	}
			// 	const isin = m[1].toUpperCase()
			// 	const left = txt.slice(0, m.index ?? 0,).trim()
			// 		.replace(/[-:|;,]+$/,'',)
			// 		.trim()
			// 	const security = left || undefined
			// 	return { isin, security, }
			// }
			const extractSecIsin = (raw: string,): { isin?: string; security?: string } => {
				const txt = String(raw ?? '',).replace(/\s+/g, ' ',)
					.trim()
				// eslint-disable-next-line prefer-named-capture-group
				const m = (/\b([A-Za-z]{2}[A-Za-z0-9]{9}[0-9])\b/).exec(txt,)
				if (!m?.[1]) {
					return {}
				}

				const isin = m[1].toUpperCase()

				const luhnIsin = (code: string,): boolean => {
					const num = code
						.toUpperCase()
						.replace(/[A-Z]/g, (c,) => {
							return String(c.charCodeAt(0,) - 55,)
						},)
					let sum = 0
					let dbl = false
					for (let i = num.length - 1; i >= 0; i = i - 1) {
						let d = num.charCodeAt(i,) - 48
						if (dbl) {
							d = d * 2; if (d > 9) {
								d = d - 9
							}
						}
						sum = sum + d
						dbl = !dbl
					}
					return sum % 10 === 0
				}

				if (!luhnIsin(isin,)) {
					return {}
				}

				const left = txt.slice(0, m.index ?? 0,).trim()
					.replace(/[-:|;,]+$/, '',)
					.trim()
				const security = left || undefined

				if (!security) {
					return {}
				}
				return { isin, security, }
			}

			const { isin, security, } = extractSecIsin(comment,)

			dtos.push({
				transactionTypeId,
				clientId:        acc.clientId,
				portfolioId:     acc.portfolioId,
				entityId:        acc.entityId,
				bankId:          acc.bankId,
				accountId:       acc.id,
				currency:        currencyName,
				amount,
				transactionDate: new Date(dateISO,),
				...(serviceProvider ?
					{ serviceProvider: this.cryptoService.encryptString(serviceProvider,), } :
					{}),
				...(comment ?
					{ comment, } :
					{}),
				...(isin && security ?
					{ isin, security, } :
					{}),
			},)
		}

		const BATCH = 10
		let createdOk = 0
		let failedCreate = 0

		for (let i = 0; i < dtos.length; i = i + BATCH) {
			const chunk = dtos.slice(i, i + BATCH,)
			await Promise.all(
				chunk.map(async(dto,) => {
					return this.transactionService.createTransaction(dto,)
						.then(() => {
							createdOk = createdOk + 1
						},)
						.catch((error,) => {
							catchErros.push(error,)
							catchErros.push(error.message,)
							catchErros.push(dto,)
							failedCreate = failedCreate + 1
						},)
				},
				),
			)
		}

		// eslint-disable-next-line no-console
		console.log('[transactionMigration:stats]', {
			rowsTotal:             Math.max(rows.length - 1, 0,),
			rowsProcessed,
			dtPrepared:            dtos.length,
			createdOk,
			failedCreate,
			skippedNoAccount,
			skippedInvalidFields,
			skippedNoClientOrPortfolio,
			skippedNoType,
			notFoundAccountsCount: notFoundAccounts.size,
			notFoundAccounts:      Array.from(notFoundAccounts,).sort(),
			catchErros,
		},)
	}

	private parseExcelDate = (raw: unknown,): string | null => {
		if (!raw) {
			return null
		}
		if (typeof raw === 'number') {
			const d = XLSX.SSF.parse_date_code(raw,)
			return new Date(Date.UTC(d.y, d.m - 1, d.d, d.H ?? 0, d.M ?? 0, d.S ?? 0,),).toISOString()
		}

		const str = String(raw,).trim()
		const match = (/^(?<day>\d{1,2})[.\-/](?<month>\d{1,2})[.\-/](?<year>\d{2,4})$/).exec(str,)

		if (match?.groups) {
			const { day, month, year, } = match.groups
			const y = parseInt(year.length === 2 ?
				`20${year}` :
				year,)
			const m = parseInt(month,) - 1
			const d = parseInt(day,)
			return new Date(Date.UTC(y, m, d, 0, 0, 0,),).toISOString()
		}
		const dt = new Date(str,)
		return isNaN(dt.getTime(),) ?
			null :
			new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(),),).toISOString()
	}

	private normalize = (str: string,): string => {
		return str
			.toString()
			.trim()
			.replace(/\s+/g, ' ',)
			.replace(/\u00A0/g, ' ',)
			.toLowerCase()
	}

	// bonds migration from transaction
	public async migrateMissingBondsFromTransaction(): Promise<void> {
		const clientId = '1dc20b8a-dc72-4f1e-8f35-03d16fa810c0'
		const bondTypeNames = ['Bond purchase', 'Bond sell', 'Bond Purchase', 'Bond Sell',]

		const bondTransactions = await this.prismaService.transaction.findMany({
			where: {
				clientId,
				typeVersion: { is: { name: { in: bondTypeNames, }, }, },
			},
			include: {
				typeVersion:     true,
			},
			orderBy: { transactionDate: 'asc', },
		},)
		const bondAssets = await this.prismaService.asset.findMany({
			where:   { clientId, assetName: AssetNamesType.BONDS, },
		},)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const parsePayload = (payload: unknown,): any => {
			if (payload === null || payload === undefined) {
				return null
			}
			if (typeof payload === 'string') {
				try {
					return JSON.parse(payload,) as Record<string, unknown>
				} catch {
					return null
				}
			}
			if (typeof payload === 'object') {
				return payload as Record<string, unknown>
			}
			return null
		}
		const parsedBondAssets = bondAssets.map((a,) => {
			return {
				...a,
				payload: parsePayload(a.payload,),
			}
		},)

		// todo: clear if good
		// const extractTransactionUnits = (
		// 	comment: string | null | undefined,
		// ): { transactionUnits: number | null; transactionUnitPrice: number | null } => {
		// 	if (!comment) {
		// 		return { transactionUnits: null, transactionUnitPrice: null, }
		// 	}
		// 	const text = this.cryptoService.decryptString(String(comment,),)
		// 	if (!text) {
		// 		return { transactionUnits: null, transactionUnitPrice: null, }
		// 	}

		// 	const idx = text.toLowerCase().lastIndexOf(' at ',)
		// 	if (idx === -1) {
		// 		return { transactionUnits: null, transactionUnitPrice: null, }
		// 	}

		// 	const left = text.slice(0, idx,).trim()
		// 	const right = text.slice(idx + 4,).trim()

		// 	// eslint-disable-next-line prefer-named-capture-group
		// 	const mUnits = (/(\d{1,3}(?:[,\s]\d{3})*|\d+)\s*$/).exec(left,)
		// 	// eslint-disable-next-line prefer-named-capture-group
		// 	const mPrice = (/(\d+(?:[.,]\d+)?)/).exec(right,)

		// 	const units = mUnits ?
		// 		Number(mUnits[1].replace(/[,\s]/g, '',),) :
		// 		NaN
		// 	const price = mPrice ?
		// 		Number(mPrice[1].replace(',', '.',),) :
		// 		NaN

		// 	return {
		// 		transactionUnits:     Number.isFinite(units,) ?
		// 			units :
		// 			null,
		// 		transactionUnitPrice: Number.isFinite(price,) ?
		// 			price :
		// 			null,
		// 	}
		// }
		const extractTransactionUnits = (
			comment: string | null | undefined,
		): { transactionUnits: number | null; transactionUnitPrice: number | null } => {
			if (!comment) {
				return { transactionUnits: null, transactionUnitPrice: null, }
			}
			const text = this.cryptoService.decryptString(String(comment,),)
			if (!text) {
				return { transactionUnits: null, transactionUnitPrice: null, }
			}

			const idx = text.toLowerCase().lastIndexOf(' at ',)
			if (idx === -1) {
				return { transactionUnits: null, transactionUnitPrice: null, }
			}

			const left = text.slice(0, idx,).trim()
			const right = text.slice(idx + 4,).trim()

			let units: number | null = null
			const parts = left.split(/\s+/,)
			for (let i = parts.length - 1; i >= 0; i = i - 1) {
				const t = parts[i]
				if ((/^(?:\d{1,3}(?:,\d{3})*|\d+)$/).test(t,)) {
					const v = Number(t.replace(/,/g, '',),)
					if (Number.isFinite(v,)) {
						units = v
					}
					break
				}
			}

			// eslint-disable-next-line prefer-named-capture-group
			const mPrice = (/(\d+(?:[.,]\d+)?)/).exec(right,)
			const price = mPrice ?
				Number(mPrice[1].replace(',', '.',),) :
				NaN

			return {
				transactionUnits:     Number.isFinite(Number(units,),) ?
					Number(units,) :
					null,
				transactionUnitPrice: Number.isFinite(price,) ?
					price :
					null,
			}
		}

		type BondPayload = {
			valueDate: string
			isin: string
			units: number
		}
		const ymd = (d: Date | string,): string => {
			return new Date(Date.UTC(new Date(d,).getUTCFullYear(), new Date(d,).getUTCMonth(), new Date(d,).getUTCDate(),),)
				.toISOString()
				.slice(0, 10,)
		}
		const key = (date: Date | string, isin: string, units: number,): string => {
			return `${ymd(date,)}|${String(isin,).toUpperCase()}|${Math.abs(Number(units,),)}`
		}
		const assetKeys: Set<string> = new Set(
			parsedBondAssets
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.map((a: any,) => {
					return a?.payload as BondPayload | undefined
				},)
				.filter((p: BondPayload | undefined,): p is BondPayload => {
					return Boolean(p?.valueDate && p?.isin && typeof p?.units === 'number',)
				},)
				.map((p: BondPayload,): string => {
					return key(p.valueDate, p.isin, p.units,)
				},),
		)
		const stats: {
			txTotal: number
			txWithParsed: number
			matched: number
			isNotRelatedBondToTransaction: number
			createdAssets: number
		} = {
			txTotal:                       0,
			txWithParsed:                  0,
			matched:                       0,
			isNotRelatedBondToTransaction: 0,
			createdAssets:                 0,
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		for (const tx of bondTransactions as Array<any>) {
			stats.txTotal++
			const { transactionUnits, transactionUnitPrice, } = extractTransactionUnits(tx.comment,)
			if (transactionUnits === null || transactionUnitPrice === null || tx.isin === null) {
				continue
			}
			stats.txWithParsed++
			const k: string = key(tx.transactionDate, tx.isin, transactionUnits,)
			// todo: clear if good
			// if (assetKeys.has(k,)) {
			// 	stats.matched++
			// } else {
			// 	stats.isNotRelatedBondToTransaction++
			// }
			if (assetKeys.has(k,)) {
				stats.matched++
			} else {
				stats.isNotRelatedBondToTransaction++
				const op = (/sell/i).test(String(tx?.typeVersion?.name ?? '',),) ?
					'Sell' :
					'Buy'
				const payload: IBondsAssetPayload = {
					currency:  tx.currency as CurrencyDataList,
					valueDate: new Date(Date.UTC(new Date(tx.transactionDate,).getUTCFullYear(), new Date(tx.transactionDate,).getUTCMonth(), new Date(tx.transactionDate,).getUTCDate(),),).toISOString(),
					isin:      String(tx.isin,),
					operation: op as AssetOperationType,
					security:  String(tx.security ?? '',),
					units:     Math.abs(Number(transactionUnits,),),
					unitPrice: Number(transactionUnitPrice,),
					accrued:   0,
					bankFee:   0,
				}
				try {
					await this.assetService.createAsset({
						clientId:    tx.clientId,
						portfolioId: tx.portfolioId,
						bankId:      tx.bankId,
						entityId:    tx.entityId,
						accountId:   tx.accountId,
						assetName:   AssetNamesType.BONDS,
						payload:     JSON.stringify(payload,),
					},)
					stats.createdAssets++
					assetKeys.add(k,)
				// eslint-disable-next-line no-empty
				} catch {}
			}
		}

		// eslint-disable-next-line no-console
		console.log('[bonds match summary]', stats,)
	}

	// equity migration from transaction
	public async migrateMissingEquityFromTransaction(): Promise<void> {
		const clientId = '3a7137fe-5ea9-486a-a16a-f64b9819a741'
		const stockTypeNames = ['Stock purchase', 'Stock sell', 'Stock Purchase', 'Stock Sell',]

		const stockTransactions = await this.prismaService.transaction.findMany({
			where: {
				clientId,
				typeVersion: { is: { name: { in: stockTypeNames, }, }, },
			},
			include: {
				typeVersion:     true,
			},
			orderBy: { transactionDate: 'asc', },
		},)
		const equityAssets = await this.prismaService.asset.findMany({
			where:   { clientId, assetName: AssetNamesType.EQUITY_ASSET, },
		},)

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const parsePayload = (payload: unknown,): any => {
			if (payload === null || payload === undefined) {
				return null
			}
			if (typeof payload === 'string') {
				try {
					return JSON.parse(payload,) as Record<string, unknown>
				} catch {
					return null
				}
			}
			if (typeof payload === 'object') {
				return payload as Record<string, unknown>
			}
			return null
		}

		const parsedEquityAssets = equityAssets.map((a,) => {
			return {
				...a,
				payload: parsePayload(a.payload,),
			}
		},)

		const extractTransactionUnits = (
			comment: string | null | undefined,
		): { transactionUnits: number | null; transactionUnitPrice: number | null } => {
			if (!comment) {
				return { transactionUnits: null, transactionUnitPrice: null, }
			}
			const text = this.cryptoService.decryptString(String(comment,),)
			if (!text) {
				return { transactionUnits: null, transactionUnitPrice: null, }
			}

			// eslint-disable-next-line prefer-named-capture-group
			const re = /(?<!\d)(\d{1,3}(?:[,\s]\d{3})*|\d+)\s*(?:rights|shares)?\s+at\s+(\d+(?:[.,]\d+)?)/gi
			let m: RegExpExecArray | null = null
			let last: RegExpExecArray | null = null
			// eslint-disable-next-line no-cond-assign
			while ((m = re.exec(text,)) !== null) {
				last = m
			}
			if (!last) {
				return { transactionUnits: null, transactionUnitPrice: null, }
			}

			const units = Number(last[1].replace(/[,\s]/g, '',),)
			const price = Number(last[2].replace(',', '.',),)

			return {
				transactionUnits:     Number.isFinite(units,) ?
					units :
					null,
				transactionUnitPrice: Number.isFinite(price,) ?
					price :
					null,
			}
		}

		type EquityPayload = {
			transactionDate: string
			isin: string
			units: number
		}
		const ymd = (d: Date | string,): string => {
			return new Date(Date.UTC(new Date(d,).getUTCFullYear(), new Date(d,).getUTCMonth(), new Date(d,).getUTCDate(),),)
				.toISOString()
				.slice(0, 10,)
		}
		const key = (date: Date | string, isin: string, units: number,): string => {
			return `${ymd(date,)}|${String(isin,).toUpperCase()}|${Math.abs(Number(units,),)}`
		}
		const assetKeys: Set<string> = new Set(
			parsedEquityAssets
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.map((a: any,) => {
					return a?.payload as EquityPayload | undefined
				},)
				.filter((p: EquityPayload | undefined,): p is EquityPayload => {
					return Boolean(p?.transactionDate && p?.isin && typeof p?.units === 'number',)
				},)
				.map((p: EquityPayload,): string => {
					return key(p.transactionDate, p.isin, p.units,)
				},),
		)
		const stats: {
			txTotal: number
			txWithParsed: number
			matched: number
			isNotRelatedEquityToTransaction: number
			createdAssets: number
		} = {
			txTotal:                         0,
			txWithParsed:                    0,
			matched:                         0,
			isNotRelatedEquityToTransaction: 0,
			createdAssets:                   0,
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		for (const tx of stockTransactions as Array<any>) {
			stats.txTotal++
			const { transactionUnits, transactionUnitPrice, } = extractTransactionUnits(tx.comment,)
			if (transactionUnits === null || transactionUnitPrice === null || tx.isin === null) {
				continue
			}
			stats.txWithParsed++
			const k: string = key(tx.transactionDate, tx.isin, transactionUnits,)
			if (assetKeys.has(k,)) {
				stats.matched++
			} else {
				stats.isNotRelatedEquityToTransaction++
				const op = (/sell/i).test(String(tx?.typeVersion?.name ?? '',),) ?
					'Sell' :
					'Buy'
				const payload: IEquityPayloadAsset = {
					currency:         tx.currency as CurrencyDataList,
					transactionDate:  new Date(Date.UTC(new Date(tx.transactionDate,).getUTCFullYear(), new Date(tx.transactionDate,).getUTCMonth(), new Date(tx.transactionDate,).getUTCDate(),),).toISOString(),
					isin:             String(tx.isin,),
					operation:        op as AssetOperationType,
					security:         String(tx.security ?? '',),
					units:            Math.abs(Number(transactionUnits,),),
					transactionPrice: Number(transactionUnitPrice,),
					equityType:       'General',
					bankFee:          0,
				}
				try {
					await this.assetService.createAsset({
						clientId:    tx.clientId,
						portfolioId: tx.portfolioId,
						bankId:      tx.bankId,
						entityId:    tx.entityId,
						accountId:   tx.accountId,
						assetName:   AssetNamesType.EQUITY_ASSET,
						payload:     JSON.stringify(payload,),
					},)
					stats.createdAssets++
					assetKeys.add(k,)
				// eslint-disable-next-line no-empty
				} catch {}
			}
		}

		// eslint-disable-next-line no-console
		console.log('[equity match summary]', stats,)
	}

	public async migrateCashAssetFromTransaction(): Promise<void> {
		const clientId = '93936e3b-7598-48c8-ab5c-67863bcfd03d'

		const txs = await this.prismaService.transaction.findMany({
			where:  { clientId, },
			select: { accountId: true, currency: true, },
		},)
		if (!txs.length) {
			return
		}

		const need = new Set<string>()
		const accIds = new Set<string>()
		for (const t of txs) {
			if (!t?.accountId || !t?.currency) {
				continue
			}
			const cur = String(t.currency,).toUpperCase()
			need.add(`${t.accountId}|${cur}`,)
			accIds.add(t.accountId,)
		}

		if (!need.size) {
			return
		}

		const accounts = await this.prismaService.account.findMany({
			where:  { id: { in: Array.from(accIds,), }, },
			select: { id: true, bankId: true, entityId: true, portfolioId: true, },
		},)
		const meta = new Map<string, { portfolioId?: string; entityId?: string; bankId?: string }>()
		for (const a of accounts) {
			meta.set(a.id, {
				bankId:      a.bankId ?? undefined,
				entityId:    a.entityId ?? undefined,
				portfolioId: a.portfolioId ?? undefined,
			},)
		}

		const existing = await this.prismaService.asset.findMany({
			where:  { clientId, assetName: AssetNamesType.CASH, accountId: { in: Array.from(accIds,), }, },
			select: { accountId: true, payload: true, },
		},)
		const have = new Set<string>()
		for (const a of existing) {
			if (!a.accountId) {
				continue
			}
			// eslint-disable-next-line no-nested-ternary
			const p = typeof a.payload === 'string' ?
				(a.payload ?
					JSON.parse(a.payload,) :
					{}) :
				(a.payload ?? {})
			const cur = p?.currency ?
				String(p.currency,).toUpperCase() :
				null
			if (cur) {
				have.add(`${a.accountId}|${cur}`,)
			}
		}

		const stats = new Map<string, number>()
		for (const key of need) {
			if (have.has(key,)) {
				continue
			}
			const [accountId, currency,] = key.split('|',)
			const m = meta.get(accountId,)
			if (!m?.bankId || !m?.entityId) {
				continue
			}
			const dto: CreateAssetDto = {
				clientId,
				portfolioId: m.portfolioId,
				bankId:      m.bankId,
				entityId:    m.entityId,
				accountId,
				assetName:   AssetNamesType.CASH,
				payload:     JSON.stringify({ currency, },),
			}
			try {
				await this.assetService.createAsset(dto,)
				stats.set(accountId, (stats.get(accountId,) ?? 0) + 1,)
			// eslint-disable-next-line no-empty
			} catch {}
		}

		// eslint-disable-next-line no-console
		console.log('[migrateCashAssetFromTransaction]', {
			clientId,
			checkedPairs: need.size,
			createdTotal: Array.from(stats.values(),).reduce((s, v,) => {
				return s + v
			}, 0,),
			stats:        Object.fromEntries(stats,),
		},)
	}

	public async setNAProviderForEmptyTransactions(): Promise<void> {
		const providers = await this.prismaService.serviceProvidersList.findMany()

		const naProvider = providers.find((p,) => {
			const dec = this.cryptoService.decryptString(p.name,)
			return dec.toLowerCase() === 'n/a'
		},)
		if (!naProvider) {
			throw new Error('Provider N/A not found in serviceProvidersList',)
		}

		const transactions = await this.prismaService.transaction.findMany({
			where: { serviceProvider: null, },
		},)

		const BATCH = 20
		let updated = 0
		let failed = 0

		for (let i = 0; i < transactions.length; i = i + BATCH) {
			const chunk = transactions.slice(i, i + BATCH,)

			await Promise.all(chunk.map(async(tx,) => {
				try {
					await this.prismaService.transaction.update({
						where: { id: tx.id, },
						data:  {
							serviceProvider: naProvider.name,
							customFields:    tx.customFields ?? Prisma.JsonNull,
						},
					},)
					updated++
				} catch (err) {
					failed++
				}
			},),)
		}

		// eslint-disable-next-line no-console
		console.log(`[setNAProviderForEmptyTransactions] updated: ${updated}, failed: ${failed}`,)
	}

	public async transactionsFromStockToEquity(): Promise<void> {
		const stockTransactions = await this.prismaService.transaction.findMany({
			where: {
				typeVersion: {
					is: {
						name: {
							contains: 'stock',
							mode:     'insensitive',
						},
					},
				},
			},
			include: {
				typeVersion: true,
			},
		},)

		const equityTypes = await this.prismaService.transactionType.findMany({
			where: {
				versions: {
					some: {
						isCurrent: true,
						name:      {
							contains: 'equity',
							mode:     'insensitive',
						},
						NOT: {
							name: {
								contains: 'private',
								mode:     'insensitive',
							},
						},
					},
				},
			},
			include: {
				versions: {
					where: {
						isCurrent: true,
					},
				},
			},
		},)

		const normalizeName = (value: string,): string => {
			return value
				.toLowerCase()
				.replace(/stock/gi, '',)
				.replace(/equity/gi, '',)
				.trim()
				.replace(/\s+/g, ' ',)
		}

		let updated = 0
		let notMatched = 0

		for (const transaction of stockTransactions) {
			if (!transaction.typeVersion) {
				notMatched = notMatched + 1
				continue
			}

			const stockKey = normalizeName(transaction.typeVersion.name,)
			let matched = false

			for (const equityType of equityTypes) {
				const equityVersion = equityType.versions[0]

				if (!equityVersion) {
					continue
				}

				const equityKey = normalizeName(equityVersion.name,)

				if (stockKey === equityKey) {
					await this.prismaService.transaction.update({
						where: {
							id: transaction.id,
						},
						data: {
							transactionTypeId:        equityType.id,
							transactionTypeVersionId: equityVersion.id,
						},
					},)

					updated = updated + 1
					matched = true
					break
				}
			}

			if (!matched) {
				notMatched = notMatched + 1
			}
		}

		// eslint-disable-next-line no-console
		console.log('Updated transactions:', updated,)
		// eslint-disable-next-line no-console
		console.log('Transactions without match:', notMatched,)
	}
}
