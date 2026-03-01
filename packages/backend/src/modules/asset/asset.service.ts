/* eslint-disable prefer-destructuring */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable max-depth */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import { PrismaService,} from 'nestjs-prisma'
import {HttpException, HttpStatus,  Injectable, Logger,} from '@nestjs/common'
import type {Asset, AssetDeposit, Transaction,} from '@prisma/client'
import { LogInstanceType, EquityType, MetalDataList, LogActionType,} from '@prisma/client'
import { Prisma,} from '@prisma/client'
import {CBondsCurrencyService,} from '../../modules/apis/cbonds-api/services'
import {ERROR_MESSAGES, } from '../../shared/constants'

import type {CreateAssetDto, GetAssetUnitsDto, TransferAssetDto,} from './dto'
import type {
	AssetWithRelationsDecrypted,
	IBondsAssetPayload,
	ICashAsset,
	ICryptoPayloadAsset,
	IDepositPayloadAsset,
	IEquityPayloadAsset,
	IGetTotalByAssetListsCBondsParted,
	ILoanPayloadAsset,
	IMetalsPayloadAsset,
	IOptionPayloadAsset,
	TDeleteRefactoredAssetPayload,
} from './asset.types'
import {AssetNamesType,} from './asset.types'
import {DocumentService,} from '../document/document.service'
import {AssetRepository,} from '../../repositories/asset/asset.repository'
import {assetParser,} from '../../shared/utils'
import {AssetOperationType, CryptoType, MetalType,} from '../../shared/types'
import {RedisCacheService,} from '../redis-cache/redis-cache.service'
import {cacheKeysToDeleteAsset,} from './asset.constants'
import {PortfolioRoutes,} from '../portfolio/portfolio.constants'
import {EventEmitter2,} from '@nestjs/event-emitter'
import { ClientRoutes, } from '../client/client.constants'
import { BudgetRoutes, } from '../budget/budget.constants'
import { CryptoService, } from '../crypto/crypto.service'
import { formatDateDDMMYYYY, } from '../../shared/utils/date-formatter.util'
import { relations, } from '../settings/settings.constants'
import { incomeUsdFilter, } from '../analytics/analytics.constants'
import type { TCurrencyDataWithHistory, } from '../apis/cbonds-api/cbonds-api.types'
import { ComputationsService, } from '../common/computations/computations.service'
import type { TAssetSelectItem, } from './asset.types'
import type { GetBondsEquityDto, } from './dto/get-bonds-equity.dto'
import type { UpdateAssetDto, } from './dto'
import { HttpStatusCode, } from 'axios'

@Injectable()
export class AssetService {
	private readonly logger: Logger = new Logger(AssetService.name,)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly cBondsCurrencyService: CBondsCurrencyService,
		private readonly documentService: DocumentService,
		private readonly assetRepository: AssetRepository,
		private readonly cacheService: RedisCacheService,
		private readonly eventEmitter: EventEmitter2,
		private readonly cryptoService: CryptoService,
		private readonly computationsService: ComputationsService,
	) { }

	/**
	 * CR - 040
 * Retrieves a single asset by its ID.
 * @remarks
 * This method fetches the asset from the database using its unique identifier.
 * If the asset is not found, it throws an HTTP 404 Not Found error.
 *
 * @param id - The ID of the asset to retrieve.
 * @returns A Promise resolving to the found asset.
 *
 * @throws {HttpException} 404 if the asset does not exist.
 */
	public async getAssetById(id: string,): Promise<AssetWithRelationsDecrypted> {
		const asset = await this.prismaService.asset.findUnique({
			where: {
				id,
			},
			include: {
				portfolio: {
					select: { name: true, },
				},
				entity: {
					select: { name: true, },
				},
				bank: {
					select: { bankName: true, },
				},
				account: {
					select: { accountName: true, },
				},
			},
		},)
		if (!asset) {
			throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
		}
		return {
			...asset,
			portfolio:       {name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',),},
			entity:       {name: this.cryptoService.decryptString(asset.entity?.name ?? '',),},
			bank:       {bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',),},
			account:       {accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',),},
		}
	}

	/**
	 * CR - 167
	 * Retrieves a specific asset by its ID based on the provided asset type.
	 * @remarks
	 * Depending on the `assetName`, fetches the corresponding asset from the database with all related entities,
	 * decrypts sensitive fields, and returns the refactored asset structure.
	 * Throws `HttpException` if the asset is not found or unsupported.
	 * @param data - Contains the asset ID and its type (`assetName`).
	 * @returns A Promise resolving to the refactored and decrypted asset.
	 */
	public async getRefactoredAssetById(data: {id: string ,assetName: AssetNamesType, isVersion?: boolean},): Promise<AssetWithRelationsDecrypted> {
		const {id, assetName, isVersion,} = data
		if (assetName === AssetNamesType.CASH_DEPOSIT) {
			if (isVersion) {
				const asset = await this.prismaService.assetDepositVersion.findUnique({
					where: {
						id,
					},
					include: {
						portfolio: {
							select: { name: true, },
						},
						entity: {
							select: { name: true, },
						},
						bank: {
							select: { bankName: true, },
						},
						account: {
							select: { accountName: true, },
						},
					},
				},)
				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}
				const payload = JSON.stringify({
					assetMainId:   asset.depositId,
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					interest:      asset.interest,
					policy:        asset.policy,
					toBeMatured:   asset.toBeMatured,
					startDate:     asset.startDate,
					comment:       asset.comment,
					maturityDate:  asset.maturityDate ?
						asset.maturityDate :
						undefined,
				},)
				return {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
					portfolio:        {name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',),},
					entity:           {name: this.cryptoService.decryptString(asset.entity?.name ?? '',),},
					bank:             {bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',),},
					account:          {accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',),},
				}
			}

			const asset = await this.prismaService.assetDeposit.findUnique({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				currency:      asset.currency,
				currencyValue: asset.currencyValue,
				interest:      asset.interest,
				policy:        asset.policy,
				toBeMatured:   asset.toBeMatured,
				startDate:     asset.startDate,
				comment:       asset.comment,
				maturityDate:  asset.maturityDate ?
					asset.maturityDate :
					undefined,
			},)
			return {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
				portfolio:        {name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',),},
				entity:           {name: this.cryptoService.decryptString(asset.entity?.name ?? '',),},
				bank:             {bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',),},
				account:          {accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',),},
			}
		}
		if (assetName === AssetNamesType.BONDS) {
			if (isVersion) {
				const asset = await this.prismaService.assetBondVersion.findUnique({
					where: {
						id,
					},
					include: {
						assetBond: {
							include: {
								group: {
									select: {
										portfolio: {
											select: { name: true, },
										},
										entity: {
											select: { name: true, },
										},
										bank: {
											select: { bankName: true, },
										},
										account: {
											select: { accountName: true, },
										},
										isArchived: true,
										id:         true,
									},
								},
							},
						},
					},
				},)
				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}
				const payload = JSON.stringify({
					assetMainId: asset.bondId,
					comment:     asset.comment,
					currency:    asset.currency,
					security:	   asset.security,
					operation:   asset.operation,
					valueDate:   asset.valueDate,
					isin:        asset.isin,
					units:       asset.units,
					unitPrice:   asset.unitPrice,
					bankFee:     asset.bankFee,
					accrued:     asset.accrued,
				},)
				return {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.assetBond.group.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
					portfolio:        {name: this.cryptoService.decryptString(asset.assetBond.group.portfolio?.name ?? '',),},
					entity:           {name: this.cryptoService.decryptString(asset.assetBond.group.entity?.name ?? '',),},
					bank:             {bankName: this.cryptoService.decryptString(asset.assetBond.group.bank?.bankName ?? '',),},
					account:          {accountName: this.cryptoService.decryptString(asset.assetBond.group.account?.accountName ?? '',),},
					groupId:          asset.assetBond.group.id,
				}
			}

			const asset = await this.prismaService.assetBond.findUnique({
				where: {
					id,
				},
				include: {
					group: {
						select: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
							account: {
								select: { accountName: true, },
							},
							isArchived: true,
							id:         true,
							totalUnits: true,
						},
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				comment:    asset.comment,
				currency:   asset.currency,
				security:	 asset.security,
				operation:  asset.operation,
				valueDate:  asset.valueDate,
				isin:       asset.isin,
				units:      asset.units,
				unitPrice:  asset.unitPrice,
				bankFee:    asset.bankFee,
				accrued:    asset.accrued,
			},)
			return {
				id,
				clientId:             asset.clientId,
				portfolioId:          asset.portfolioId,
				entityId:             asset.entityId,
				bankId:               asset.bankId,
				accountId:            asset.accountId,
				assetName,
				createdAt:            asset.createdAt,
				updatedAt:            asset.updatedAt,
				payload,
				isArchived:           asset.group.isArchived,
				isFutureDated:        asset.isFutureDated,
				rate:                 asset.rate,
				portfolioDraftId:     null,
				portfolio:            {name: this.cryptoService.decryptString(asset.group.portfolio?.name ?? '',),},
				entity:               {name: this.cryptoService.decryptString(asset.group.entity?.name ?? '',),},
				bank:                 {bankName: this.cryptoService.decryptString(asset.group.bank?.bankName ?? '',),},
				account:              {accountName: this.cryptoService.decryptString(asset.group.account?.accountName ?? '',),},
				groupId:              asset.group.id,
				totalUnitsToTransfer:       asset.group.totalUnits,
			}
		}
		// if (assetName === AssetNamesType.EQUITY_ASSET) {
		// 	const asset = await this.prismaService.assetEquity.findUnique({
		// 		where: {
		// 			id,
		// 		},
		// 		include: {
		// 			group: {
		// 				select: {
		// 					portfolio: {
		// 						select: { name: true, },
		// 					},
		// 					entity: {
		// 						select: { name: true, },
		// 					},
		// 					bank: {
		// 						select: { bankName: true, },
		// 					},
		// 					account: {
		// 						select: { accountName: true, },
		// 					},
		// 					isArchived: true,
		// 				},
		// 			},
		// 		},
		// 	},)
		// 	if (!asset) {
		// 		throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
		// 	}
		// 	const payload = JSON.stringify({
		// 		comment:          asset.comment,
		// 		currency:         asset.currency,
		// 		transactionDate:	 	  asset.transactionDate,
		// 		isin:             asset.isin,
		// 		operation:        asset.operation,
		// 		security:            asset.security,
		// 		units:            asset.units,
		// 		transactionPrice:       asset.transactionPrice,
		// 		equityType:          asset.equityType,
		// 		bankFee:          asset.bankFee,
		// 	},)
		// 	return {
		// 		id,
		// 		clientId:         asset.clientId,
		// 		portfolioId:      asset.portfolioId,
		// 		entityId:         asset.entityId,
		// 		bankId:           asset.bankId,
		// 		accountId:        asset.accountId,
		// 		assetName,
		// 		createdAt:        asset.createdAt,
		// 		updatedAt:        asset.updatedAt,
		// 		payload,
		// 		isArchived:       asset.group.isArchived,
		// 		isFutureDated:    asset.isFutureDated,
		// 		rate:             asset.rate,
		// 		portfolioDraftId: null,
		// 		portfolio:        {name: this.cryptoService.decryptString(asset.group.portfolio?.name ?? '',),},
		// 		entity:           {name: this.cryptoService.decryptString(asset.group.entity?.name ?? '',),},
		// 		bank:             {bankName: this.cryptoService.decryptString(asset.group.bank?.bankName ?? '',),},
		// 		account:          {accountName: this.cryptoService.decryptString(asset.group.account?.accountName ?? '',),},
		// 	}
		// }
		if (assetName === AssetNamesType.EQUITY_ASSET) {
			if (isVersion) {
				const asset = await this.prismaService.assetEquityVersion.findUnique({
					where: {
						id,
					},
					include: {
						assetEquity: {
							include: {
								group: {
									select: {
										portfolio: {
											select: { name: true, },
										},
										entity: {
											select: { name: true, },
										},
										bank: {
											select: { bankName: true, },
										},
										account: {
											select: { accountName: true, },
										},
										isArchived: true,
										id:         true,
									},
								},
							},
						},
					},
				},)

				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}

				const payload = JSON.stringify({
					assetMainId:       asset.assetEquityId ?? undefined,
					comment:           asset.comment,
					currency:          asset.currency,
					transactionDate:   asset.transactionDate,
					isin:              asset.isin,
					operation:         asset.operation,
					security:          asset.security,
					units:             asset.units,
					transactionPrice:  asset.transactionPrice,
					equityType:        asset.equityType,
					bankFee:           asset.bankFee,
				},)

				const group = asset.assetEquity?.group

				return {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       group?.isArchived ?? false,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
					portfolio:        {
						name: this.cryptoService.decryptString(group?.portfolio?.name ?? '',),
					},
					entity: {
						name: this.cryptoService.decryptString(group?.entity?.name ?? '',),
					},
					bank: {
						bankName: this.cryptoService.decryptString(group?.bank?.bankName ?? '',),
					},
					account: {
						accountName: this.cryptoService.decryptString(group?.account?.accountName ?? '',),
					},
					groupId:          group?.id,
				}
			}

			const asset = await this.prismaService.assetEquity.findUnique({
				where: {
					id,
				},
				include: {
					group: {
						select: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
							account: {
								select: { accountName: true, },
							},
							isArchived: true,
							id:         true,
							totalUnits: true,
						},
					},
				},
			},)

			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}

			const payload = JSON.stringify({
				comment:          asset.comment,
				currency:         asset.currency,
				transactionDate:  asset.transactionDate,
				isin:             asset.isin,
				operation:        asset.operation,
				security:         asset.security,
				units:            asset.units,
				transactionPrice: asset.transactionPrice,
				equityType:       asset.equityType,
				bankFee:          asset.bankFee,
			},)

			return {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.group.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
				portfolio:        {
					name: this.cryptoService.decryptString(asset.group.portfolio?.name ?? '',),
				},
				entity: {
					name: this.cryptoService.decryptString(asset.group.entity?.name ?? '',),
				},
				bank: {
					bankName: this.cryptoService.decryptString(asset.group.bank?.bankName ?? '',),
				},
				account: {
					accountName: this.cryptoService.decryptString(asset.group.account?.accountName ?? '',),
				},
				groupId:              asset.group.id,
				totalUnitsToTransfer:       asset.group.totalUnits,
			}
		}
		if (assetName === AssetNamesType.CRYPTO) {
			if (isVersion) {
				const asset = await this.prismaService.assetCryptoVersion.findUnique({
					where: {
						id,
					},
					include: {
						assetCrypto: {
							include: {
								group: {
									select: {
										portfolio: {
											select: { name: true, },
										},
										entity: {
											select: { name: true, },
										},
										bank: {
											select: { bankName: true, },
										},
										account: {
											select: { accountName: true, },
										},
										isArchived: true,
										id:         true,
									},
								},
							},
						},
					},
				},)
				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}
				const payload = asset.productType === CryptoType.ETF  ?
					JSON.stringify({
						assetMainId:      asset.cryptoId,
						comment:          asset.comment,
						productType:      asset.productType,
						currency:         asset.currency,
						transactionDate:	 	  asset.transactionDate,
						isin:             asset.isin,
						operation:        asset.operation,
						security:            asset.security,
						units:            asset.units,
						transactionPrice:       asset.transactionPrice,
						equityType:          CryptoType.ETF,
						bankFee:          asset.bankFee,
					},) :
					JSON.stringify({
						assetMainId:        asset.cryptoId,
						comment:            asset.comment,
						productType:         asset.productType,
						cryptoCurrencyType:	 	  asset.cryptoCurrencyType,
						cryptoAmount:               asset.cryptoAmount,
						exchangeWallet:          asset.exchangeWallet,
						purchaseDate:            asset.purchaseDate,
						purchasePrice:              asset.purchasePrice,
					},)
				return {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.assetCrypto.group.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
					portfolio:        {name: this.cryptoService.decryptString(asset.assetCrypto.group.portfolio?.name ?? '',),},
					entity:           {name: this.cryptoService.decryptString(asset.assetCrypto.group.entity?.name ?? '',),},
					bank:             {bankName: this.cryptoService.decryptString(asset.assetCrypto.group.bank?.bankName ?? '',),},
					account:          {accountName: this.cryptoService.decryptString(asset.assetCrypto.group.account?.accountName ?? '',),},
					groupId:          asset.assetCrypto.group.id,
				}
			}
			const asset = await this.prismaService.assetCrypto.findUnique({
				where: {
					id,
				},
				include: {
					group: {
						select: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
							account: {
								select: { accountName: true, },
							},
							isArchived: true,
							id:         true,
							totalUnits: true,
						},
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = asset.productType === CryptoType.ETF  ?
				JSON.stringify({
					comment:          asset.comment,
					productType:      asset.productType,
					currency:         asset.currency,
					transactionDate:	 	  asset.transactionDate,
					isin:             asset.isin,
					operation:        asset.operation,
					security:            asset.security,
					units:            asset.units,
					transactionPrice:       asset.transactionPrice,
					equityType:          CryptoType.ETF,
					bankFee:          asset.bankFee,
				},) :
				JSON.stringify({
					comment:            asset.comment,
					productType:         asset.productType,
					cryptoCurrencyType:	 	  asset.cryptoCurrencyType,
					cryptoAmount:               asset.cryptoAmount,
					exchangeWallet:          asset.exchangeWallet,
					purchaseDate:            asset.purchaseDate,
					purchasePrice:              asset.purchasePrice,
				},)
			return {
				id,
				clientId:             asset.clientId,
				portfolioId:          asset.portfolioId,
				entityId:             asset.entityId,
				bankId:               asset.bankId,
				accountId:            asset.accountId,
				assetName,
				createdAt:            asset.createdAt,
				updatedAt:            asset.updatedAt,
				payload,
				isArchived:           asset.group.isArchived,
				isFutureDated:        asset.isFutureDated,
				rate:                 asset.rate,
				portfolioDraftId:     null,
				portfolio:            {name: this.cryptoService.decryptString(asset.group.portfolio?.name ?? '',),},
				entity:               {name: this.cryptoService.decryptString(asset.group.entity?.name ?? '',),},
				bank:                 {bankName: this.cryptoService.decryptString(asset.group.bank?.bankName ?? '',),},
				account:              {accountName: this.cryptoService.decryptString(asset.group.account?.accountName ?? '',),},
				groupId:              asset.group.id,
				totalUnitsToTransfer:       asset.group.totalUnits ?? 0,
			}
		}
		if (assetName === AssetNamesType.METALS) {
			if (isVersion) {
				const asset = await this.prismaService.assetMetalVersion.findUnique({
					where: {
						id,
					},
					include: {
						assetMetal: {
							include: {
								group: {
									select: {
										portfolio: {
											select: { name: true, },
										},
										entity: {
											select: { name: true, },
										},
										bank: {
											select: { bankName: true, },
										},
										account: {
											select: { accountName: true, },
										},
										isArchived: true,
										id:         true,
									},
								},
							},
						},
					},
				},)
				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}
				const payload = asset.productType === MetalType.ETF  ?
					JSON.stringify({
						assetMainId:      asset.metalId,
						comment:          asset.comment,
						productType:      asset.productType,
						currency:         asset.currency,
						transactionDate:	 	  asset.transactionDate,
						isin:             asset.isin,
						operation:        asset.operation,
						security:            asset.security,
						units:            asset.units,
						transactionPrice:       asset.transactionPrice,
						equityType:          MetalType.ETF,
						bankFee:          asset.bankFee,
					},) :
					JSON.stringify({
						assetMainId:        asset.metalId,
						comment:         asset.comment,
						productType:         asset.productType,
						metalType:	 	    asset.metalType,
						currency:         asset.currency,
						transactionDate:               asset.transactionDate,
						purchasePrice:          asset.transactionPrice,
						units:            asset.units,
						operation:              asset.operation,
					},)
				return {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.assetMetal.group.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
					portfolio:        {name: this.cryptoService.decryptString(asset.assetMetal.group.portfolio?.name ?? '',),},
					entity:           {name: this.cryptoService.decryptString(asset.assetMetal.group.entity?.name ?? '',),},
					bank:             {bankName: this.cryptoService.decryptString(asset.assetMetal.group.bank?.bankName ?? '',),},
					account:          {accountName: this.cryptoService.decryptString(asset.assetMetal.group.account?.accountName ?? '',),},
					groupId:          asset.assetMetal.group.id,
				}
			}
			const asset = await this.prismaService.assetMetal.findUnique({
				where: {
					id,
				},
				include: {
					group: {
						select: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
							account: {
								select: { accountName: true, },
							},
							isArchived: true,
							id:         true,
							totalUnits: true,
						},
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = asset.productType === MetalType.ETF  ?
				JSON.stringify({
					comment:          asset.comment,
					productType:      asset.productType,
					currency:         asset.currency,
					transactionDate:	 	  asset.transactionDate,
					isin:             asset.isin,
					operation:        asset.operation,
					security:            asset.security,
					units:            asset.units,
					transactionPrice:       asset.transactionPrice,
					equityType:          MetalType.ETF,
					bankFee:          asset.bankFee,
				},) :
				JSON.stringify({
					comment:         asset.comment,
					productType:         asset.productType,
					metalType:	 	    asset.metalType,
					transactionDate:               asset.transactionDate,
					purchasePrice:          asset.transactionPrice,
					units:            asset.units,
					currency:         asset.currency,
					operation:              asset.operation,
				},)
			return {
				id,
				clientId:             asset.clientId,
				portfolioId:          asset.portfolioId,
				entityId:             asset.entityId,
				bankId:               asset.bankId,
				accountId:            asset.accountId,
				assetName,
				createdAt:            asset.createdAt,
				updatedAt:            asset.updatedAt,
				payload,
				isArchived:           asset.group.isArchived,
				isFutureDated:        asset.isFutureDated,
				rate:                 asset.rate,
				portfolioDraftId:     null,
				portfolio:            {name: this.cryptoService.decryptString(asset.group.portfolio?.name ?? '',),},
				entity:               {name: this.cryptoService.decryptString(asset.group.entity?.name ?? '',),},
				bank:                 {bankName: this.cryptoService.decryptString(asset.group.bank?.bankName ?? '',),},
				account:              {accountName: this.cryptoService.decryptString(asset.group.account?.accountName ?? '',),},
				groupId:              asset.group.id,
				totalUnitsToTransfer:       asset.group.totalUnits,
			}
		}
		if (assetName === AssetNamesType.LOAN) {
			if (isVersion) {
				const asset = await this.prismaService.assetLoanVersion.findUnique({
					where: {
						id,
					},
					include: {
						portfolio: {
							select: { name: true, },
						},
						entity: {
							select: { name: true, },
						},
						bank: {
							select: { bankName: true, },
						},
						account: {
							select: { accountName: true, },
						},
					},
				},)
				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}
				const payload = JSON.stringify({
					assetMainId:      asset.assetLoanId,
					comment:          asset.comment,
					loanName:         asset.name,
					startDate:        asset.startDate,
					maturityDate:     asset.maturityDate,
					currency:         asset.currency,
					currencyValue:    asset.currencyValue,
					usdValue:         asset.usdValue,
					interest:         asset.interest,
					todayInterest:    asset.todayInterest,
					maturityInterest: asset.maturityInterest,
				},)
				return {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
					portfolio:        {name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',),},
					entity:           {name: this.cryptoService.decryptString(asset.entity?.name ?? '',),},
					bank:             {bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',),},
					account:          {accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',),},
				}
			}

			const asset = await this.prismaService.assetLoan.findUnique({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				comment:          asset.comment,
				loanName:         asset.name,
				startDate:        asset.startDate,
				maturityDate:     asset.maturityDate,
				currency:         asset.currency,
				currencyValue:    asset.currencyValue,
				usdValue:         asset.usdValue,
				interest:         asset.interest,
				todayInterest:    asset.todayInterest,
				maturityInterest: asset.maturityInterest,
			},)
			return {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
				portfolio:        {name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',),},
				entity:           {name: this.cryptoService.decryptString(asset.entity?.name ?? '',),},
				bank:             {bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',),},
				account:          {accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',),},
			}
		}
		if (assetName === AssetNamesType.PRIVATE_EQUITY) {
			if (isVersion) {
				const asset = await this.prismaService.assetPrivateEquityVersion.findUnique({
					where: {
						id,
					},
					include: {
						portfolio: {
							select: { name: true, },
						},
						entity: {
							select: { name: true, },
						},
						bank: {
							select: { bankName: true, },
						},
						account: {
							select: { accountName: true, },
						},
					},
				},)

				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}

				const payload = JSON.stringify({
					assetMainId:        asset.assetPrivateEquityId,
					fundType:           asset.fundType,
					status:             asset.status,
					currency:           asset.currency,
					entryDate:          asset.entryDate,
					currencyValue:      asset.currencyValue,
					serviceProvider:    asset.serviceProvider,
					geography:          asset.geography,
					fundName:           asset.fundName,
					fundID:             asset.fundID,
					fundSize:           asset.fundSize,
					aboutFund:          asset.aboutFund,
					investmentPeriod:   asset.investmentPeriod,
					fundTermDate:       asset.fundTermDate,
					capitalCalled:      asset.capitalCalled,
					lastValuationDate:  asset.lastValuationDate,
					moic:               asset.moic,
					irr:                asset.irr,
					liquidity:          asset.liquidity,
					totalCommitment:    asset.totalCommitment,
					tvpi:               asset.tvpi,
					managementExpenses: asset.managementExpenses,
					otherExpenses:      asset.otherExpenses,
					carriedInterest:    asset.carriedInterest,
					distributions:      asset.distributions,
					holdingEntity:      asset.holdingEntity,
					comment:            asset.comment,
				},)

				return {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
					portfolio:        { name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',), },
					entity:           { name: this.cryptoService.decryptString(asset.entity?.name ?? '',), },
					bank:             { bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',), },
					account:          { accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',), },
				}
			}

			const asset = await this.prismaService.assetPrivateEquity.findUnique({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				fundType:           asset.fundType,
				status:             asset.status,
				currency:           asset.currency,
				entryDate:          asset.entryDate,
				currencyValue:      asset.currencyValue,
				serviceProvider:    asset.serviceProvider,
				geography:          asset.geography,
				fundName:           asset.fundName,
				fundID:             asset.fundID,
				fundSize:           asset.fundSize,
				aboutFund:          asset.aboutFund,
				investmentPeriod:   asset.investmentPeriod,
				fundTermDate:       asset.fundTermDate,
				capitalCalled:      asset.capitalCalled,
				lastValuationDate:  asset.lastValuationDate,
				moic:               asset.moic,
				irr:                asset.irr,
				liquidity:          asset.liquidity,
				totalCommitment:    asset.totalCommitment,
				tvpi:               asset.tvpi,
				managementExpenses: asset.managementExpenses,
				otherExpenses:      asset.otherExpenses,
				carriedInterest:    asset.carriedInterest,
				distributions:      asset.distributions,
				holdingEntity:      asset.holdingEntity,
				comment:            asset.comment,
			},)
			return {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
				portfolio:        { name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',), },
				entity:           { name: this.cryptoService.decryptString(asset.entity?.name ?? '',), },
				bank:             { bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',), },
				account:          { accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',), },
			}
		}
		if (assetName === AssetNamesType.OTHER) {
			if (isVersion) {
				const asset = await this.prismaService.assetOtherInvestmentVersion.findUnique({
					where: {
						id,
					},
					include: {
						portfolio: {
							select: { name: true, },
						},
						entity: {
							select: { name: true, },
						},
						bank: {
							select: { bankName: true, },
						},
						account: {
							select: { accountName: true, },
						},
					},
				},)

				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}

				const payload = JSON.stringify({
					assetMainId:         asset.assetOtherInvestmentId,
					comment:             asset.comment,
					investmentAssetName: asset.investmentAssetName,
					currency:            asset.currency,
					investmentDate:      asset.investmentDate,
					currencyValue:       asset.currencyValue,
					usdValue:            asset.usdValue,
					serviceProvider:     asset.serviceProvider,
					customFields:        asset.customFields,
					marketValueUSD:      asset.marketValueUSD,
					costValueUSD:        asset.costValueUSD,
					profitUSD:           asset.profitUSD,
					profitPercentage:    asset.profitPercentage,
				},)

				return {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
					portfolio:        { name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',), },
					entity:           { name: this.cryptoService.decryptString(asset.entity?.name ?? '',), },
					bank:             { bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',), },
					account:          { accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',), },
				}
			}

			const asset = await this.prismaService.assetOtherInvestment.findUnique({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)

			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}

			const payload = JSON.stringify({
				comment:             asset.comment,
				investmentAssetName: asset.investmentAssetName,
				currency:            asset.currency,
				investmentDate:      asset.investmentDate,
				currencyValue:       asset.currencyValue,
				usdValue:            asset.usdValue,
				serviceProvider:     asset.serviceProvider,
				customFields:        asset.customFields,
				marketValueUSD:      asset.marketValueUSD,
				costValueUSD:        asset.costValueUSD,
				profitUSD:           asset.profitUSD,
				profitPercentage:    asset.profitPercentage,
			},)

			return {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
				portfolio:        { name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',), },
				entity:           { name: this.cryptoService.decryptString(asset.entity?.name ?? '',), },
				bank:             { bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',), },
				account:          { accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',), },
			}
		}
		if (assetName === AssetNamesType.OPTIONS) {
			if (isVersion) {
				const asset = await this.prismaService.assetOptionVersion.findUnique({
					where: {
						id,
					},
					include: {
						portfolio: {
							select: { name: true, },
						},
						entity: {
							select: { name: true, },
						},
						bank: {
							select: { bankName: true, },
						},
						account: {
							select: { accountName: true, },
						},
					},
				},)

				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}

				const payload = JSON.stringify({
					assetMainId:        asset.assetOptionId,
					comment:            asset.comment,
					currency:           asset.currency,
					startDate:          asset.startDate,
					maturityDate:       asset.maturityDate,
					pairAssetCurrency:  asset.pairAssetCurrency,
					optionName:         asset.pairAssetCurrency,
					principalValue:     asset.principalValue,
					strike:             asset.strike,
					premium:            asset.premium,
					marketOpenValue:    asset.marketOpenValue,
					currentMarketValue: asset.currentMarketValue,
					contracts:          asset.contracts,
				},)

				return {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
					portfolio:        { name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',), },
					entity:           { name: this.cryptoService.decryptString(asset.entity?.name ?? '',), },
					bank:             { bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',), },
					account:          { accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',), },
				}
			}

			const asset = await this.prismaService.assetOption.findUnique({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)

			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}

			const payload = JSON.stringify({
				comment:            asset.comment,
				currency:           asset.currency,
				startDate:          asset.startDate,
				maturityDate:       asset.maturityDate,
				pairAssetCurrency:  asset.pairAssetCurrency,
				optionName:         asset.pairAssetCurrency,
				principalValue:     asset.principalValue,
				strike:             asset.strike,
				premium:            asset.premium,
				marketOpenValue:    asset.marketOpenValue,
				currentMarketValue: asset.currentMarketValue,
				contracts:          asset.contracts,
			},)

			return {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
				portfolio:        { name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',), },
				entity:           { name: this.cryptoService.decryptString(asset.entity?.name ?? '',), },
				bank:             { bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',), },
				account:          { accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',), },
			}
		}
		if (assetName === AssetNamesType.REAL_ESTATE) {
			if (isVersion) {
				const asset = await this.prismaService.assetRealEstateVersion.findUnique({
					where: {
						id,
					},
					include: {
						portfolio: {
							select: { name: true, },
						},
						entity: {
							select: { name: true, },
						},
						bank: {
							select: { bankName: true, },
						},
						account: {
							select: { accountName: true, },
						},
					},
				},)

				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}

				const payload = JSON.stringify({
					assetMainId:        asset.assetRealEstateId,
					comment:            asset.comment,
					currency:           asset.currency,
					investmentDate:     asset.investmentDate,
					currencyValue:      asset.currencyValue,
					usdValue:           asset.usdValue,
					marketValueFC:      asset.marketValueFC,
					projectTransaction: asset.projectTransaction,
					country:            asset.country,
					city:               asset.city,
					operation:          asset.operation,
				},)

				return {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
					portfolio:        { name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',), },
					entity:           { name: this.cryptoService.decryptString(asset.entity?.name ?? '',), },
					bank:             { bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',), },
					account:          { accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',), },
				}
			}

			const asset = await this.prismaService.assetRealEstate.findUnique({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)

			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}

			const payload = JSON.stringify({
				comment:            asset.comment,
				currency:           asset.currency,
				investmentDate:     asset.investmentDate,
				currencyValue:      asset.currencyValue,
				usdValue:           asset.usdValue,
				marketValueFC:      asset.marketValueFC,
				projectTransaction: asset.projectTransaction,
				country:            asset.country,
				city:               asset.city,
				operation:          asset.operation,
			},)

			return {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
				portfolio:        { name: this.cryptoService.decryptString(asset.portfolio?.name ?? '',), },
				entity:           { name: this.cryptoService.decryptString(asset.entity?.name ?? '',), },
				bank:             { bankName: this.cryptoService.decryptString(asset.bank?.bankName ?? '',), },
				account:          { accountName: this.cryptoService.decryptString(asset.account?.accountName ?? '',), },
			}
		}
		throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
	}

	/**
	 * CR - 001
	 * Retrieves a list of assets by an array of bank IDs.
 * @remarks
 * This method fetches assets where the `bankId` matches any of the provided IDs.
 * If no IDs are provided, it returns all assets.
 *
 * @param ids - An optional array of bank IDs to filter the assets by.
 * @returns A Promise that resolves to an array of assets associated with the specified bank IDs.
 */
	public async getAssetListByBanksIds(ids?: Array<string>,): Promise<Array<Asset>> {
		return this.prismaService.asset.findMany({
			where: {
				...(ids && ids.length > 0 ?
					{
						OR: ids.map((id,) => {
							return { bankId: id, }
						},),
					} :
					{}),
			},
		},)
	}

	/**
	 * Retrieves a list of assets from the database based on the provided portfolio ID.
	 * @param portfolioId - The unique identifier of the portfolio.
	 * @returns A Promise that resolves to an array of assets associated with the given portfolio.
	 */
	public async getAssetList(portfolioId: string,): Promise<Array<Asset>> {
		return this.prismaService.asset.findMany({
			where: {
				portfolioId,
			},
		},)
	}

	/**
	 * Creates a new asset entry in the database.
	 * @param data - The data required to create a new asset. This includes fields like `name`, `portfolioId`, and `value`.
	 * @returns A Promise that resolves to the newly created asset.
	 */
	public async createAsset(data: CreateAssetDto,): Promise<Asset> {
		const asset = await this.assetRepository.createAsset(data,)
		await this.computationsService.updateClientTotals(asset.clientId,)
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.ASSET_ACTION,{
		// 	assetName: 	data.assetName, portfolioId: data.portfolioId, asset, assetId: asset.id, clientId: data.clientId,
		// },)
		return asset
	}

	/**
 * Updates an asset by its ID.
 * @remarks
 * This method updates the specified asset in the database using the provided update data.
 * It is typically used to modify asset details such as value, status, or metadata.
 *
 * @param id - The unique identifier of the asset to be updated.
 * @param body - The update payload conforming to Prisma's `AssetUpdateInput` type.
 * @returns A Promise that resolves to the updated asset.
 */
	// public async updateAsset(id: string, body: Prisma.AssetUpdateInput,): Promise<Asset> {
	// 	let date: string | null = null
	// 	const { assetName, payload, } = body

	// 	const parsedPayload = JSON.parse(payload as string,)

	// 	if (assetName === AssetNamesType.BONDS) {
	// 		date = parsedPayload.valueDate
	// 	}
	// 	if (assetName === AssetNamesType.CRYPTO) {
	// 		if (parsedPayload.productType === CryptoType.ETF) {
	// 			date = parsedPayload.transactionDate
	// 		} else {
	// 			date = parsedPayload.purchaseDate
	// 		}
	// 	}
	// 	if (assetName === AssetNamesType.CASH_DEPOSIT || assetName === AssetNamesType.LOAN || assetName === AssetNamesType.OPTIONS || assetName === AssetNamesType.COLLATERAL) {
	// 		date = parsedPayload.startDate
	// 	}
	// 	if (assetName === AssetNamesType.EQUITY_ASSET || assetName === AssetNamesType.METALS) {
	// 		date = parsedPayload.transactionDate
	// 	}
	// 	if (assetName === AssetNamesType.OTHER || assetName === AssetNamesType.REAL_ESTATE) {
	// 		date = parsedPayload.investmentDate
	// 	}
	// 	if (assetName === AssetNamesType.PRIVATE_EQUITY) {
	// 		date = parsedPayload.entryDate
	// 	}
	// 	if (assetName === AssetNamesType.CASH) {
	// 		date = new Date().toISOString()
	// 	}
	// 	if (!date) {
	// 		throw new HttpException(ERROR_MESSAGES.ASSET_DATE_MISSING, HttpStatus.BAD_REQUEST,)
	// 	}
	// 	const isFutureDated = new Date(date,) > new Date()
	// 	const updatedAsset = await this.prismaService.asset.update({
	// 		where: {
	// 			id,
	// 		},
	// 		data: { ...body, isFutureDated, },
	// 	},)
	// 	const budget = await this.prismaService.budgetPlan.findUnique({
	// 		where: {
	// 			clientId: updatedAsset.clientId,
	// 		},
	// 	},)
	// 	await this.cacheService.deleteByUrl([
	// 		`/${ClientRoutes.MODULE}/${updatedAsset.clientId}`,
	// 		`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${updatedAsset.portfolioId}`,
	// 		`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_CHART}`,
	// 		`/${BudgetRoutes.MODULE}/${budget?.id}`,
	// 	],)
	// 	const keyPayload = {
	// 		method: 'get',
	// 		url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
	// 		query:  { clients: [updatedAsset.clientId,], },
	// 	}
	// 	await this.cacheService.deleteByCacheParams(keyPayload,)
	// 	// todo: Remove after asset refactor approved
	// 	// this.eventEmitter.emit(eventNames.ASSET_ACTION,{assetName: updatedAsset.assetName, assetId: id, portfolioId: updatedAsset.portfolioId, clientId: updatedAsset.clientId,},)
	// 	await this.computationsService.updateClientTotals(updatedAsset.clientId,)
	// 	return updatedAsset
	// }

	/**
	 * 3.2.7
	 * Retrieves a list of assets based on account ID and asset name.
	 * @remarks
	 * This method performs a case-insensitive search for assets with a name matching the specified criteria.
	 * If no assets are found, it returns an empty array.
	 * @param accountId - The identifier of the account.
	 * @param assetName - The name (or partial name) of the asset to search for.
	 * @returns A Promise that resolves to an array of assets matching the criteria or an empty array.
	 */
	public async getAssetsByAccountAndName(accountId: string, assetName: string,): Promise<Array<Asset>> {
		try {
			const assets = await this.prismaService.asset.findMany({
				where: {
					accountId,
					assetName: {
						contains: assetName,
						mode:     'insensitive',
					},
				},
			},)

			return assets
		} catch (error) {
			return []
		}
	}

	/**
	* 3.1.9
	 * Retrieves requests that match the provided `sourceId` criteria.
	*
	* @remarks
	* - The method filters the requests by the provided `query` (e.g., source ID).
	*
	* @param query - The filtering criteria for requests, typically based on the source ID.
	* @returns A promise that resolves to an array of requests matching the source ID criteria.
	*/
	public async getAssetsBySourceId(query: Prisma.AssetWhereInput,): Promise<Array<Asset>> {
		return this.prismaService.asset.findMany({
			where: query,
		},)
	}

	public async getBondAndEquityForSelect(
		filter: GetBondsEquityDto,
	): Promise<Array<TAssetSelectItem>> {
		const bondWhere: Prisma.AssetBondWhereInput = {
			...(filter.clientId ?
				{ clientId: filter.clientId, } :
				{}),
			...(filter.portfolioId ?
				{ portfolioId: filter.portfolioId, } :
				{}),
			...(filter.entityId ?
				{ entityId: filter.entityId, } :
				{}),
			...(filter.bankId ?
				{ bankId: filter.bankId, } :
				{}),
			...(filter.accountId ?
				{ accountId: filter.accountId, } :
				{}),
		}

		const equityWhere: Prisma.AssetEquityWhereInput = {
			...(filter.clientId ?
				{ clientId: filter.clientId, } :
				{}),
			...(filter.portfolioId ?
				{ portfolioId: filter.portfolioId, } :
				{}),
			...(filter.entityId ?
				{ entityId: filter.entityId, } :
				{}),
			...(filter.bankId ?
				{ bankId: filter.bankId, } :
				{}),
			...(filter.accountId ?
				{ accountId: filter.accountId, } :
				{}),
		}

		const [bond, equity,] = await this.prismaService.$transaction([
			this.prismaService.assetBond.findFirst({ where: bondWhere, },),
			this.prismaService.assetEquity.findFirst({ where: equityWhere, },),
		],)

		const result: Array<TAssetSelectItem> = []

		if (bond) {
			result.push({
				label: bond.assetName,
				value: {
					id:   bond.id,
					name: bond.assetName,
				},
			},)
		}

		if (equity) {
			result.push({
				label: equity.assetName,
				value: {
					id:   equity.id,
					name: equity.assetName,
				},
			},)
		}

		return result
	}

	/**
		* Calculates the total USD value of a single asset.
		* @remarks
		* This method determines the USD value of a given asset based on its type
		* (crypto, metal, bond, equity, options, or currency). It uses reference data
		* from the provided lists to perform currency conversions and market value lookups.
		* If the asset payload is not a valid JSON string, it returns 0.
		*
		* @param asset - The asset entity to evaluate.
		* @param lists - A collection of reference datasets used to calculate market values and conversions.
		* @returns An object containing the total USD value of the asset.
	*/
	public getTotalByAssetCBondsParted(
		asset: Asset,
		lists: IGetTotalByAssetListsCBondsParted,
	): { totalAssets: number } {
		const { currencyList, cryptoList, bonds, equities, etfs, metalList, } = lists
		let totalAssets = 0

		if (typeof asset.payload === 'string') {
			const parsedPayload = JSON.parse(asset.payload,)
			let usdValue: number = 0
			if (asset.assetName === AssetNamesType.CRYPTO) {
				const payload = parsedPayload as ICryptoPayloadAsset

				if (payload.productType === CryptoType.ETF) {
					const { isin, units, currency, } = parsedPayload as IEquityPayloadAsset
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === currency
					},)
					const equityAsset = equities.find((equity,) => {
						return equity.isin === isin
					},) ?? etfs.find((etf,) => {
						return etf.isin === isin
					},) ?? null
					if (!equityAsset) {
						return {
							totalAssets: 0,
						}
					}
					const rate = currencyData?.rate ?? asset.rate ?? 1
					const price = 'lastPrice' in equityAsset ?
						Number(equityAsset.lastPrice,) :
						Number(equityAsset.close,)
					usdValue = equityAsset.currencyName === 'GBX' ?
						parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
						parseFloat((units * price * rate).toFixed(2,),)
				} else {
					const { cryptoCurrencyType, cryptoAmount, } = payload
					usdValue = cryptoAmount && cryptoCurrencyType ?
						this.cBondsCurrencyService.getCryptoValueExchangedToUSD({
							token: cryptoCurrencyType,
							cryptoAmount,
						}, cryptoList,) :
						0
				}
			} else if (asset.assetName === AssetNamesType.METALS) {
				const parsedPayload = JSON.parse(asset.payload,)
				if (parsedPayload.productType === MetalType.DIRECT_HOLD) {
					const { units, metalType, } = parsedPayload as IMetalsPayloadAsset
					usdValue = metalType ?
						this.cBondsCurrencyService.getMetalValueExchangedToUSDWithHistory({
							metalList,
							metalType,
							units,
						},) :
						0
				}
				if (parsedPayload.productType === MetalType.ETF) {
					const { isin, units, currency, } = parsedPayload as IEquityPayloadAsset
					const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
						return item.currency === currency
					},)
					const equityAsset = equities.find((equity,) => {
						return equity.isin === isin
					},) ?? etfs.find((etf,) => {
						return etf.isin === isin
					},) ?? null
					if (!equityAsset) {
						return {
							totalAssets: 0,
						}
					}
					const rate = currencyData?.rate ?? asset.rate ?? 1
					const price = 'lastPrice' in equityAsset ?
						Number(equityAsset.lastPrice,) :
						Number(equityAsset.close,)
					usdValue = equityAsset.currencyName === 'GBX' ?
						parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
						parseFloat((units * price * rate).toFixed(2,),)
				}
			} else if (asset.assetName === AssetNamesType.BONDS) {
				const { isin, units, currency, } = parsedPayload as IBondsAssetPayload
				const bond = bonds.find((bond,) => {
					return bond.isin === isin
				},)
				if (!bond) {
					return {
						totalAssets: 0,
					}
				}
				if (bond.maturityDate && (new Date(bond.maturityDate,) < new Date())) {
					return {
						totalAssets: 0,
					}
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData?.rate ?? asset.rate ?? 1
				usdValue = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
					isin,
					units:              Number(units,),
					dirtyPriceCurrency: bond.dirtyPriceCurrency,
					nominalPrice:       bond.nominalPrice,
					rate,
					marketPrice:        bond.marketPrice,
				},)
			} else if (asset.assetName === AssetNamesType.EQUITY_ASSET) {
				const { isin, units, currency, } = parsedPayload as IEquityPayloadAsset
				const equityAsset = equities.find((equity,) => {
					return equity.isin === isin
				},) ?? etfs.find((etf,) => {
					return etf.isin === isin
				},) ?? null
				if (!equityAsset) {
					return {
						totalAssets: 0,
					}
				}
				const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
					return item.currency === currency
				},)
				const rate = currencyData?.rate ?? asset.rate ?? 1
				const price = 'lastPrice' in equityAsset ?
					Number(equityAsset.lastPrice,) :
					Number(equityAsset.close,)
				usdValue = equityAsset.currencyName === 'GBX' ?
					parseFloat((units * price * rate  / 100).toFixed(2,) ,) :
					parseFloat((units * price * rate).toFixed(2,),)
			} else if (asset.assetName === AssetNamesType.OPTIONS) {
				const { currentMarketValue, maturityDate, currency, } = parsedPayload as IOptionPayloadAsset
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return {
						totalAssets: 0,
					}
				}
				usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue: currentMarketValue,
					currencyList,
				},)
			} else if (asset.assetName === AssetNamesType.LOAN) {
				const { currency, currencyValue, maturityDate, } = parsedPayload as ILoanPayloadAsset
				const maturity = new Date(maturityDate,)
				if (maturity < new Date()) {
					return {
						totalAssets: 0,
					}
				}
				usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
			} else if (asset.assetName === AssetNamesType.CASH_DEPOSIT) {
				const { currency, currencyValue,maturityDate,} = parsedPayload as IDepositPayloadAsset
				if (maturityDate && new Date(maturityDate,) < new Date()) {
					return {
						totalAssets: 0,
					}
				}
				usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
			} else if (asset.assetName === AssetNamesType.CASH) {
				usdValue = 0
			} else {
				const { currency, currencyValue, } = parsedPayload
				usdValue = this.cBondsCurrencyService.getCurrencyValueExchangedToUSDWithHistory({
					currency,
					currencyValue,
					currencyList,
				},)
			}
			totalAssets = totalAssets + Number(usdValue,)
		}
		return {
			totalAssets,
		}
	}

	/**
	 * CR-013
	 * Deletes a asset by its ID along with all associated data.
	 *
	 * @remarks
	 * This method performs a cascading deletion process:
	 * - Retrieves and deletes all documents associated with the asset.
	 *
	 * This ensures proper cleanup of all dependent data and avoids orphaned records.
	 *
	 * @param id - The unique identifier of the asset to be deleted.
	 * @returns A Promise that resolves when the deletion process is complete.
	 * @throws Will throw an error if the deletion fails at any step.
	 */
	public async deleteAssetById(id: string,): Promise<Asset> {
		const asset = await this.prismaService.asset.findUnique({
			where: {
				id,
			},
			select: {
				assetName: true,
				accountId: true,
				payload:   true,
				clientId:  true,
			},
		},)
		if (asset?.assetName === AssetNamesType.BONDS || asset?.assetName === AssetNamesType.EQUITY_ASSET || asset?.assetName === AssetNamesType.METALS  || asset?.assetName === AssetNamesType.CRYPTO) {
			const parsedPayload = JSON.parse(asset.payload as string,)

			const { totalUnits, } = await this.getAssetUnits(
				{
					accountId: asset.accountId,
					assetName: asset.assetName,
					isin:      parsedPayload?.isin ?? undefined,
					currency:  parsedPayload?.currency,
					...(asset.assetName === AssetNamesType.METALS ?
						{metalType: parsedPayload.metalType,} :
						{}),
				},
			)

			if (parsedPayload?.operation === AssetOperationType.BUY) {
				const isNegative = (totalUnits - parsedPayload.units) < 0
				if (isNegative) {
					throw new HttpException(ERROR_MESSAGES.TOTAL_UNITS_IS_NEGATIVE, HttpStatus.BAD_REQUEST,)
				}
			}
		}
		const assetDocumentsIds = await this.prismaService.document.findMany({
			where: {
				assetId: id,
			},
			select: {
				id: true,
			},
		},)
		const documentIds = assetDocumentsIds.map((document,) => {
			return document.id
		},)
		await this.documentService.deleteDocumentsByIds({ id: documentIds, },)
		const deletedAsset = await this.prismaService.asset.delete({
			where: {
				id,
			},
		},)
		const budget = await this.prismaService.budgetPlan.findUnique({
			where: {
				clientId: deletedAsset.clientId,
			},
		},)
		await this.cacheService.deleteByUrl([
			`/${ClientRoutes.MODULE}/${deletedAsset.clientId}`,
			`/${BudgetRoutes.MODULE}/${budget?.id}`,
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${deletedAsset.portfolioId}`,
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_CHART}`,
			...cacheKeysToDeleteAsset.client,
			...cacheKeysToDeleteAsset.portfolio,
		],)
		const payload = {
			method: 'get',
			url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
			query:  { clients: [deletedAsset.clientId,], },
		}
		await this.cacheService.deleteByCacheParams(payload,)
		if (deletedAsset.assetName === AssetNamesType.BONDS) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.bond,)
		}
		if (deletedAsset.assetName === AssetNamesType.CASH) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.cash,)
		}
		if (deletedAsset.assetName === AssetNamesType.CASH_DEPOSIT) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.deposit,)
		}
		if (deletedAsset.assetName === AssetNamesType.CRYPTO) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.crypto,)
		}
		if (deletedAsset.assetName === AssetNamesType.EQUITY_ASSET) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.equity,)
		}
		if (deletedAsset.assetName === AssetNamesType.LOAN) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.loan,)
		}
		if (deletedAsset.assetName === AssetNamesType.METALS) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.metals,)
		}
		if (deletedAsset.assetName === AssetNamesType.OTHER) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.other,)
		}
		if (deletedAsset.assetName === AssetNamesType.PRIVATE_EQUITY) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.private,)
		}
		if (deletedAsset.assetName === AssetNamesType.REAL_ESTATE) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.real,)
		}
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.ASSET_ACTION,{assetName: deletedAsset.assetName, assetId: id, portfolioId: deletedAsset.portfolioId,  clientId: deletedAsset.clientId,},)
		await this.computationsService.updateClientTotals(deletedAsset.clientId,)
		return deletedAsset
	}

	public async deleteRefactoredAssetById(data: {id: string ,query: TDeleteRefactoredAssetPayload},): Promise<Asset> {
		const {id, } = data
		const { assetName, userInfo,} = data.query
		const assetDocumentsIds = await this.prismaService.document.findMany({
			where: {
				assetId: id,
			},
			select: {
				id: true,
			},
		},)
		const documentIds = assetDocumentsIds.map((document,) => {
			return document.id
		},)
		let deletedAsset: Asset | null = null
		if (assetName === AssetNamesType.CASH_DEPOSIT) {
			const asset = await this.prismaService.assetDeposit.delete({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				currency:      asset.currency,
				currencyValue: asset.currencyValue,
				interest:      asset.interest,
				policy:        asset.policy,
				toBeMatured:   asset.toBeMatured,
				startDate:     asset.startDate,
				comment:       asset.comment,
				maturityDate:  asset.maturityDate ?
					asset.maturityDate :
					undefined,
			},)
			deletedAsset = {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
			}
		}
		if (assetName === AssetNamesType.BONDS) {
			const bond = await this.prismaService.assetBond.findUnique({
				where:   { id, },
				include: { group: { include: { bonds: true, }, }, },
			},)
			if (!bond) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const group = bond.group
			const remainingBonds  = group.bonds.filter((b,) => {
				return b.id !== bond.id
			},)
			const totalBuySellUnits = remainingBonds.reduce(
				(sum, b,) => {
					return sum + (b.operation === AssetOperationType.BUY ?
						b.units :
						-b.units)
				},
				0,
			)
			if (bond.operation === AssetOperationType.BUY && totalBuySellUnits < 0) {
				throw new HttpException(
					'Total units cannot be negative for Buy operation',
					HttpStatus.BAD_REQUEST,
				)
			}
			const asset = await this.prismaService.assetBond.delete({
				where: {
					id,
				},
				include: {
					group: {
						select: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
							account: {
								select: { accountName: true, },
							},
							isArchived: true,
						},
					},
				},
			},)
			if (remainingBonds.length > 0) {
				const newCostValueFC = remainingBonds.reduce((sum, b,) => {
					return sum + b.costValueFC
				}, 0,)
				const newCostValueUSD = remainingBonds.reduce((sum, b,) => {
					return sum + b.costValueUSD
				}, 0,)
				const newMarketValueFC = remainingBonds.reduce((sum, b,) => {
					return sum + b.marketValueFC
				}, 0,)
				const newMarketValueUSD = remainingBonds.reduce((sum, b,) => {
					return sum + b.marketValueUSD
				}, 0,)
				const newProfitUSD = newMarketValueUSD - newCostValueUSD
				const newProfitPercentage = newCostValueUSD === 0 ?
					0 :
					(newProfitUSD / newCostValueUSD) * 100
				const newCostPrice = totalBuySellUnits === 0 ?
					0 :
					newCostValueFC / totalBuySellUnits
				await this.prismaService.assetBondGroup.update({
					where: { id: group.id, },
					data:  {
						totalUnits:       totalBuySellUnits,
						costPrice:        newCostPrice,
						costValueFC:      newCostValueFC,
						costValueUSD:     newCostValueUSD,
						marketValueFC:    newMarketValueFC,
						marketValueUSD:   newMarketValueUSD,
						profitUSD:        newProfitUSD,
						profitPercentage: newProfitPercentage,
					},
				},)
			} else {
				await this.prismaService.assetBondGroup.delete({ where: { id: group.id, }, },)
			}
			const payload = JSON.stringify({
				comment:       asset.comment,
				currency:      asset.currency,
				security:	 	  asset.security,
				operation:      asset.operation,
				valueDate:        asset.valueDate,
				isin:         asset.isin,
				units:        asset.units,
				unitPrice:  asset.unitPrice,
				bankFee:   asset.bankFee,
				accrued:   asset.accrued,
			},)
			deletedAsset = {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.group.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
			}
		}
		if (assetName === AssetNamesType.EQUITY_ASSET) {
			const equity = await this.prismaService.assetEquity.findUnique({
				where:   { id, },
				include: { group: { include: { equities: true, }, }, },
			},)
			if (!equity) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const group = equity.group
			const remainingEquities  = group.equities.filter((b,) => {
				return b.id !== equity.id
			},)
			const totalBuySellUnits = remainingEquities.reduce(
				(sum, b,) => {
					return sum + (b.operation === AssetOperationType.BUY ?
						b.units :
						-b.units)
				},
				0,
			)
			if (equity.operation === AssetOperationType.BUY && totalBuySellUnits < 0) {
				throw new HttpException(
					'Total units cannot be negative for Buy operation',
					HttpStatus.BAD_REQUEST,
				)
			}
			const asset = await this.prismaService.assetEquity.delete({
				where: {
					id,
				},
				include: {
					group: {
						select: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
							account: {
								select: { accountName: true, },
							},
							isArchived: true,
						},
					},
				},
			},)
			if (remainingEquities.length > 0) {
				const newCostValueFC = remainingEquities.reduce((sum, b,) => {
					return sum + b.costValueFC
				}, 0,)
				const newCostValueUSD = remainingEquities.reduce((sum, b,) => {
					return sum + b.costValueUSD
				}, 0,)
				const newMarketValueFC = remainingEquities.reduce((sum, b,) => {
					return sum + b.marketValueFC
				}, 0,)
				const newMarketValueUSD = remainingEquities.reduce((sum, b,) => {
					return sum + b.marketValueUSD
				}, 0,)
				const newProfitUSD = newMarketValueUSD - newCostValueUSD
				const newProfitPercentage = newCostValueUSD === 0 ?
					0 :
					(newProfitUSD / newCostValueUSD) * 100
				const newCostPrice = totalBuySellUnits === 0 ?
					0 :
					newCostValueFC / totalBuySellUnits
				await this.prismaService.assetEquityGroup.update({
					where: { id: group.id, },
					data:  {
						totalUnits:       totalBuySellUnits,
						costPrice:        newCostPrice,
						costValueFC:      newCostValueFC,
						costValueUSD:     newCostValueUSD,
						marketValueFC:    newMarketValueFC,
						marketValueUSD:   newMarketValueUSD,
						profitUSD:        newProfitUSD,
						profitPercentage: newProfitPercentage,
					},
				},)
			} else {
				await this.prismaService.assetEquityGroup.delete({ where: { id: group.id, }, },)
			}
			const payload = JSON.stringify({
				comment:          asset.comment,
				currency:         asset.currency,
				transactionDate:	 	  asset.transactionDate,
				isin:             asset.isin,
				operation:        asset.operation,
				security:            asset.security,
				units:            asset.units,
				transactionPrice:       asset.transactionPrice,
				equityType:          asset.equityType,
				bankFee:          asset.bankFee,
			},)
			deletedAsset = {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.group.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
			}
		}
		if (assetName === AssetNamesType.CRYPTO) {
			const crypto = await this.prismaService.assetCrypto.findUnique({
				where:   { id, },
				include: { group: { include: { cryptos: true, }, }, },
			},)
			if (!crypto) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			if (crypto?.productType === CryptoType.ETF) {
				const group = crypto.group
				const remainingEquities  = group.cryptos.filter((b,) => {
					return b.id !== crypto.id
				},)
				const totalBuySellUnits = remainingEquities.reduce(
					(sum, b,) => {
						if (!b.operation || !b.units) {
							return sum
						}
						return sum + (b.operation === AssetOperationType.BUY ?
							b.units :
							-b.units)
					},
					0,
				)
				if (crypto.operation === AssetOperationType.BUY && totalBuySellUnits < 0) {
					throw new HttpException(
						'Total units cannot be negative for Buy operation',
						HttpStatus.BAD_REQUEST,
					)
				}
				const asset = await this.prismaService.assetCrypto.delete({
					where: {
						id,
					},
					include: {
						group: {
							select: {
								portfolio: {
									select: { name: true, },
								},
								entity: {
									select: { name: true, },
								},
								bank: {
									select: { bankName: true, },
								},
								account: {
									select: { accountName: true, },
								},
								isArchived: true,
							},
						},
					},
				},)
				const payload = asset.productType === CryptoType.ETF  ?
					JSON.stringify({
						comment:          asset.comment,
						productType:      asset.productType,
						currency:         asset.currency,
						transactionDate:	 	  asset.transactionDate,
						isin:             asset.isin,
						operation:        asset.operation,
						security:            asset.security,
						units:            asset.units,
						transactionPrice:       asset.transactionPrice,
						equityType:          CryptoType.ETF,
						bankFee:          asset.bankFee,
					},) :
					JSON.stringify({
						comment:            asset.comment,
						productType:         asset.productType,
						cryptoCurrencyType:	 	  asset.cryptoCurrencyType,
						cryptoAmount:               asset.cryptoAmount,
						exchangeWallet:          asset.exchangeWallet,
						purchaseDate:            asset.purchaseDate,
						purchasePrice:              asset.purchasePrice,
					},)
				deletedAsset = {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.group.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
				}
				if (remainingEquities.length > 0) {
					const newCostValueFC = remainingEquities.reduce((sum, b,) => {
						return sum + b.costValueFC
					}, 0,)
					const newCostValueUSD = remainingEquities.reduce((sum, b,) => {
						return sum + b.costValueUSD
					}, 0,)
					const newMarketValueFC = remainingEquities.reduce((sum, b,) => {
						return sum + b.marketValueFC
					}, 0,)
					const newMarketValueUSD = remainingEquities.reduce((sum, b,) => {
						return sum + b.marketValueUSD
					}, 0,)
					const newProfitUSD = newMarketValueUSD - newCostValueUSD
					const newProfitPercentage = newCostValueUSD === 0 ?
						0 :
						(newProfitUSD / newCostValueUSD) * 100
					const newCostPrice = totalBuySellUnits === 0 ?
						0 :
						newCostValueFC / totalBuySellUnits
					await this.prismaService.assetCryptoGroup.update({
						where: { id: group.id, },
						data:  {
							totalUnits:       totalBuySellUnits,
							costPrice:        newCostPrice,
							costValueFC:      newCostValueFC,
							costValueUSD:     newCostValueUSD,
							marketValueFC:    newMarketValueFC,
							marketValueUSD:   newMarketValueUSD,
							profitUSD:        newProfitUSD,
							profitPercentage: newProfitPercentage,
						},
					},)
				} else {
					await this.prismaService.assetCryptoGroup.delete({ where: { id: group.id, }, },)
				}
			} else {
				const asset = await this.prismaService.assetCrypto.delete({
					where: {
						id,
					},
					include: {
						group: {
							select: {
								portfolio: {
									select: { name: true, },
								},
								entity: {
									select: { name: true, },
								},
								bank: {
									select: { bankName: true, },
								},
								account: {
									select: { accountName: true, },
								},
								isArchived: true,
							},
						},
					},
				},)
				await this.prismaService.assetCryptoGroup.delete({
					where: {
						id: asset.groupId,
					},
				},)
				const payload = asset.productType === CryptoType.ETF  ?
					JSON.stringify({
						comment:          asset.comment,
						productType:      asset.productType,
						currency:         asset.currency,
						transactionDate:	 	  asset.transactionDate,
						isin:             asset.isin,
						operation:        asset.operation,
						security:            asset.security,
						units:            asset.units,
						transactionPrice:       asset.transactionPrice,
						equityType:          CryptoType.ETF,
						bankFee:          asset.bankFee,
					},) :
					JSON.stringify({
						comment:            asset.comment,
						productType:         asset.productType,
						cryptoCurrencyType:	 	  asset.cryptoCurrencyType,
						cryptoAmount:               asset.cryptoAmount,
						exchangeWallet:          asset.exchangeWallet,
						purchaseDate:            asset.purchaseDate,
						purchasePrice:              asset.purchasePrice,
					},)
				deletedAsset = {
					id,
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.entityId,
					bankId:           asset.bankId,
					accountId:        asset.accountId,
					assetName,
					createdAt:        asset.createdAt,
					updatedAt:        asset.updatedAt,
					payload,
					isArchived:       asset.group.isArchived,
					isFutureDated:    asset.isFutureDated,
					rate:             asset.rate,
					portfolioDraftId: null,
				}
			}
		}
		if (assetName === AssetNamesType.METALS) {
			const metal = await this.prismaService.assetMetal.findUnique({
				where:   { id, },
				include: { group: { include: { metals: true, }, }, },
			},)
			if (!metal) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const group = metal.group
			const remainingEquities  = group.metals.filter((b,) => {
				return b.id !== metal.id
			},)
			const totalBuySellUnits = remainingEquities.reduce(
				(sum, b,) => {
					if (!b.operation || !b.units) {
						return sum
					}
					return sum + (b.operation === AssetOperationType.BUY ?
						b.units :
						-b.units)
				},
				0,
			)
			if (metal.operation === AssetOperationType.BUY && totalBuySellUnits < 0) {
				throw new HttpException(
					'Total units cannot be negative for Buy operation',
					HttpStatus.BAD_REQUEST,
				)
			}
			const asset = await this.prismaService.assetMetal.delete({
				where: {
					id,
				},
				include: {
					group: {
						select: {
							portfolio: {
								select: { name: true, },
							},
							entity: {
								select: { name: true, },
							},
							bank: {
								select: { bankName: true, },
							},
							account: {
								select: { accountName: true, },
							},
							isArchived: true,
						},
					},
				},
			},)
			if (remainingEquities.length > 0) {
				const newCostValueFC = remainingEquities.reduce((sum, b,) => {
					return sum + b.costValueFC
				}, 0,)
				const newCostValueUSD = remainingEquities.reduce((sum, b,) => {
					return sum + b.costValueUSD
				}, 0,)
				const newMarketValueFC = remainingEquities.reduce((sum, b,) => {
					return sum + b.marketValueFC
				}, 0,)
				const newMarketValueUSD = remainingEquities.reduce((sum, b,) => {
					return sum + b.marketValueUSD
				}, 0,)
				const newProfitUSD = newMarketValueUSD - newCostValueUSD
				const newProfitPercentage = newCostValueUSD === 0 ?
					0 :
					(newProfitUSD / newCostValueUSD) * 100
				const newCostPrice = totalBuySellUnits === 0 ?
					0 :
					newCostValueFC / totalBuySellUnits
				await this.prismaService.assetMetalGroup.update({
					where: { id: group.id, },
					data:  {
						totalUnits:       totalBuySellUnits,
						costPrice:        newCostPrice,
						costValueFC:      newCostValueFC,
						costValueUSD:     newCostValueUSD,
						marketValueFC:    newMarketValueFC,
						marketValueUSD:   newMarketValueUSD,
						profitUSD:        newProfitUSD,
						profitPercentage: newProfitPercentage,
					},
				},)
			} else {
				await this.prismaService.assetMetalGroup.delete({ where: { id: group.id, }, },)
			}

			const payload = asset.productType === MetalType.ETF  ?
				JSON.stringify({
					comment:          asset.comment,
					productType:      asset.productType,
					currency:         asset.currency,
					transactionDate:	 	  asset.transactionDate,
					isin:             asset.isin,
					operation:        asset.operation,
					security:            asset.security,
					units:            asset.units,
					transactionPrice:       asset.transactionPrice,
					equityType:          MetalType.ETF,
					bankFee:          asset.bankFee,
				},) :
				JSON.stringify({
					comment:         asset.comment,
					productType:         asset.productType,
					metalType:	 	    asset.metalType,
					transactionDate:               asset.transactionDate,
					purchasePrice:          asset.transactionPrice,
					units:            asset.units,
					operation:              asset.operation,
				},)
			deletedAsset = {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.group.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
			}
		}
		if (assetName === AssetNamesType.LOAN) {
			const asset = await this.prismaService.assetLoan.delete({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				comment:          asset.comment,
				loanName:         asset.name,
				startDate:        asset.startDate,
				maturityDate:      asset.maturityDate,
				currency:         asset.currency,
				currencyValue:    asset.currencyValue,
				usdValue:         asset.usdValue,
				interest:         asset.interest,
				todayInterest:      asset.todayInterest,
				maturityInterest:      asset.maturityInterest,
			},)
			deletedAsset =  {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
			}
		}
		if (assetName === AssetNamesType.PRIVATE_EQUITY) {
			const asset = await this.prismaService.assetPrivateEquity.delete({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				fundType:           asset.fundType,
				status:             asset.status,
				currency:           asset.currency,
				entryDate:          asset.entryDate,
				currencyValue:      asset.currencyValue,
				serviceProvider:         asset.serviceProvider,
				geography:          asset.geography,
				fundName:           asset.fundName,
				fundID:             asset.fundID,
				fundSize:           asset.fundSize,
				aboutFund:          asset.aboutFund,
				investmentPeriod:          asset.investmentPeriod,
				fundTermDate:           asset.fundTermDate,
				capitalCalled:           asset.capitalCalled,
				lastValuationDate:           asset.lastValuationDate,
				moic:               asset.moic,
				irr:                asset.irr,
				liquidity:            asset.liquidity,
				totalCommitment:            asset.totalCommitment,
				tvpi:               asset.tvpi,
				managementExpenses:            asset.managementExpenses,
				otherExpenses:            asset.otherExpenses,
				carriedInterest:            asset.carriedInterest,
				distributions:            asset.distributions,
				holdingEntity:            asset.holdingEntity,
				comment:            asset.comment,
			},)
			deletedAsset = {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
			}
		}
		if (assetName === AssetNamesType.OTHER) {
			const asset = await this.prismaService.assetOtherInvestment.delete({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				comment:             asset.comment,
				investmentAssetName:           asset.investmentAssetName,
				currency:              asset.currency,
				investmentDate:            asset.investmentDate,
				currencyValue:           asset.currencyValue,
				usdValue:            asset.usdValue,
				serviceProvider:         asset.serviceProvider,
			},)
			deletedAsset = {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
			}
		}
		if (assetName === AssetNamesType.OPTIONS) {
			const asset = await this.prismaService.assetOption.delete({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				comment:             asset.comment,
				currency:           asset.currency,
				startDate:              asset.startDate,
				maturityDate:            asset.maturityDate,
				pairAssetCurrency:           asset.pairAssetCurrency,
				principalValue:            asset.principalValue,
				strike:             asset.strike,
				premium:            asset.premium,
				marketOpenValue:            asset.marketOpenValue,
				currentMarketValue:            asset.currentMarketValue,
				contracts:             asset.contracts,
			},)
			deletedAsset = {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
			}
		}
		if (assetName === AssetNamesType.REAL_ESTATE) {
			const asset = await this.prismaService.assetRealEstate.delete({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				comment:             asset.comment,
				currency:           asset.currency,
				investmentDate:              asset.investmentDate,
				currencyValue:            asset.currencyValue,
				usdValue:           asset.usdValue,
				marketValueFC:            asset.marketValueFC,
				projectTransaction:             asset.projectTransaction,
				country:            asset.country,
				city:               asset.city,
				operation:            asset.operation,
			},)
			deletedAsset = {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    asset.isFutureDated,
				rate:             asset.rate,
				portfolioDraftId: null,
			}
		}
		if (assetName === AssetNamesType.CASH) {
			const asset = await this.prismaService.assetCash.delete({
				where: {
					id,
				},
				include: {
					portfolio: {
						select: { name: true, },
					},
					entity: {
						select: { name: true, },
					},
					bank: {
						select: { bankName: true, },
					},
					account: {
						select: { accountName: true, },
					},
				},
			},)
			if (!asset) {
				throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			}
			const payload = JSON.stringify({
				comment:             asset.comment,
				currency:           asset.currency,
			},)
			deletedAsset = {
				id,
				clientId:         asset.clientId,
				portfolioId:      asset.portfolioId,
				entityId:         asset.entityId,
				bankId:           asset.bankId,
				accountId:        asset.accountId,
				assetName,
				createdAt:        asset.createdAt,
				updatedAt:        asset.updatedAt,
				payload,
				isArchived:       asset.isArchived,
				isFutureDated:    false,
				rate:             1,
				portfolioDraftId: null,
			}
		}
		if (!deletedAsset) {
			throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
		}
		const meta = JSON.parse(deletedAsset.payload as string,)
		await this.prismaService.deletionLog.create({
			data: {
				clientId:     deletedAsset.clientId,
				portfolioId:  deletedAsset.portfolioId,
				entityId:     deletedAsset.entityId,
				bankId:       deletedAsset.bankId,
				accountId:    deletedAsset.accountId,
				meta,
				instanceType: LogInstanceType.Asset,
				userName:     userInfo.name,
				userEmail:    userInfo.email,
				reason:       userInfo.reason,
			},
		},)
		await this.documentService.deleteDocumentsByIds({ id: documentIds, },)
		const budget = await this.prismaService.budgetPlan.findUnique({
			where: {
				clientId: deletedAsset.clientId,
			},
		},)
		await this.cacheService.deleteByUrl([
			`/${ClientRoutes.MODULE}/${deletedAsset.clientId}`,
			`/${BudgetRoutes.MODULE}/${budget?.id}`,
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_DETAILS}/${deletedAsset.portfolioId}`,
			`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_CHART}`,
			...cacheKeysToDeleteAsset.client,
			...cacheKeysToDeleteAsset.portfolio,
		],)
		const payload = {
			method: 'get',
			url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
			query:  { clients: [deletedAsset.clientId,], },
		}
		if (deletedAsset.assetName === AssetNamesType.BONDS) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.bond,)
		}
		if (deletedAsset.assetName === AssetNamesType.CASH) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.cash,)
		}
		if (deletedAsset.assetName === AssetNamesType.CASH_DEPOSIT) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.deposit,)
		}
		if (deletedAsset.assetName === AssetNamesType.CRYPTO) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.crypto,)
		}
		if (deletedAsset.assetName === AssetNamesType.EQUITY_ASSET) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.equity,)
		}
		if (deletedAsset.assetName === AssetNamesType.LOAN) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.loan,)
		}
		if (deletedAsset.assetName === AssetNamesType.METALS) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.metals,)
		}
		if (deletedAsset.assetName === AssetNamesType.OTHER) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.other,)
		}
		if (deletedAsset.assetName === AssetNamesType.PRIVATE_EQUITY) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.private,)
		}
		if (deletedAsset.assetName === AssetNamesType.REAL_ESTATE) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.real,)
		}
		if (deletedAsset.assetName === AssetNamesType.OPTIONS) {
			await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.options,)
		}
		await this.cacheService.deleteByCacheParams(payload,)
		await this.computationsService.updateClientTotals(deletedAsset.clientId,)
		return deletedAsset
	}

	/**
	 * CR-085
	 * Retrieves the total units of a specific asset based on provided criteria.
		*
		* @remarks
		* This method:
		* - Fetches all assets for a given account and asset type.
		* - Filters them by ISIN and currency (or metal type for metals).
		* - Calculates the total units by summing BUY operations and subtracting SELL operations.
		*
		* This ensures an accurate total of currently held units for the specified asset.
		*
		* @param data - The criteria used to filter and calculate units (includes accountId, currency/metal, ISIN, and asset type).
		* @returns A Promise that resolves with an object containing the total calculated units.
		* @throws Will throw an error if the database query fails.
	 */
	public async getAssetUnits(data: GetAssetUnitsDto,): Promise<{ totalUnits: number }> {
		const {assetName, currency, metalType, accountId, isin,} = data
		if (assetName === AssetNamesType.BONDS) {
			const bondGroup = await this.prismaService.assetBondGroup.findFirst({
				where: {
					accountId,
					isin,
					currency,
					transferDate: null,
				},
			},)
			return {
				totalUnits: bondGroup?.totalUnits ?? 0,
			}
		}
		if (assetName === AssetNamesType.EQUITY_ASSET) {
			const equityGroup = await this.prismaService.assetEquityGroup.findFirst({
				where: {
					accountId,
					isin,
					currency,
					transferDate: null,
				},
			},)
			return {
				totalUnits: equityGroup?.totalUnits ?? 0,
			}
		}
		if (assetName === AssetNamesType.CRYPTO && isin) {
			const cryptoGroup = await this.prismaService.assetCryptoGroup.findFirst({
				where: {
					accountId,
					isin,
					currency,
					transferDate: null,
				},
			},)
			return {
				totalUnits: cryptoGroup?.totalUnits ?? 0,
			}
		}
		if (assetName === AssetNamesType.METALS && metalType) {
			const metalGroup = await this.prismaService.assetMetalGroup.findFirst({
				where: {
					accountId,
					metalType,
					currency,
					transferDate: null,
				},
			},)
			return {
				totalUnits: metalGroup?.totalUnits ?? 0,
			}
		}
		if (assetName === AssetNamesType.METALS && isin) {
			const metalGroup = await this.prismaService.assetMetalGroup.findFirst({
				where: {
					accountId,
					isin,
					currency,
					transferDate: null,
				},
			},)
			return {
				totalUnits: metalGroup?.totalUnits ?? 0,
			}
		}
		return {
			totalUnits: 0,
		}
	}

	/**
 * CR-082: Automated processing of assets after their maturity date.
 * 1. Retrieves all assets of type `CASH_DEPOSIT` from the database.
 * 2. Filters assets that have a maturity date earlier than the current date and selects unique assets by the combination of `accountId` and `currency`.
 * 3. For each unique matured asset, it checks if a corresponding `CASH` asset exists for the same account:
 *    - If such an asset does not exist, a new `CASH` asset is created.
 * 4. For each matured asset with a valid `portfolioId`, a transaction is created in the system, and the asset is deleted from the database.
 *
 * Function Details:
 * - For each matured asset, it first checks if a corresponding cash asset exists with the same currency. If not, a new `CASH` asset is created.
 * - Transactions are created only for assets with a valid `portfolioId`.
 * - The function utilizes `Promise.all` to handle multiple asset processes concurrently.
 *
 * Execution Flow:
 * 1. Initially, all assets of type `CASH_DEPOSIT` are fetched.
 * 2. The assets are filtered based on their maturity date.
 * 3. Missing `CASH` assets are checked and created if necessary.
 */
	// New version after refactor
	public async depositMaturityAutomation(): Promise<void> {
		try {
			const [assets, transactionType,] = await Promise.all([
				this.prismaService.assetDeposit.findMany(),
				this.prismaService.transactionType.findFirst({
					where: {
						versions: {
							some: {
								name:      'Deposit maturity',
								isCurrent: true,
							},
						},
					},
					include: {
						versions: {
							where: { isCurrent: true, },
						},
					},
				},),
			],)
			if (!transactionType) {
				return
			}
			const currencyData = await this.prismaService.currencyData.findMany()
			const today = new Date()
			// todo: Remove after testing
			// today.setDate(today.getDate() + 1,)
			today.setHours(0, 0, 0, 0,)
			const maturedAssets = assets
				.filter((item,):  item is NonNullable<typeof item> => {
					return item !== null
				},)
				.filter((assetPayload,) => {
					if (!assetPayload.maturityDate) {
						return false
					}
					const maturityDate = new Date(assetPayload.maturityDate,)
					maturityDate.setHours(0, 0, 0, 0,)
					if (assetPayload.toBeMatured) {
						return maturityDate.getTime() <= today.getTime()
					}
					if (assetPayload.toBeMatured === undefined) {
						return maturityDate.getTime() === today.getTime()
					}
					return false
				},)
			const uniqueMaturedAssets: Array<AssetDeposit> = []
			const seen = new Set<string>()
			for (const asset of maturedAssets) {
				const key = `${asset.accountId}_${asset.currency}`
				if (!seen.has(key,)) {
					seen.add(key,)
					uniqueMaturedAssets.push(asset,)
				}
			}
			await Promise.all(uniqueMaturedAssets.map(async(asset,) => {
				if (!asset.maturityDate) {
					return
				}
				const maturityDate = new Date(asset.maturityDate,)
				maturityDate.setHours(0, 0, 0, 0,)
				const shouldCreateCashAsset = (asset.toBeMatured && maturityDate.getTime() <= today.getTime()) || (asset.toBeMatured === undefined && maturityDate.getTime() === today.getTime())
				if (!shouldCreateCashAsset) {
					return
				}
				const cashAssets = await this.prismaService.asset.findMany({
					where: {
						assetName: AssetNamesType.CASH,
						accountId: asset.accountId,
					},
				},)
				const isCurrencyExists = cashAssets.find((cashAsset,) => {
					const cashAssetPayload = assetParser<ICashAsset>(cashAsset,)
					return (
						cashAssetPayload?.currency === asset.currency &&
                  cashAsset.clientId === asset.clientId &&
                  cashAsset.portfolioId === asset.portfolioId &&
                  cashAsset.entityId === asset.entityId &&
                  cashAsset.bankId === asset.bankId
					)
				},)
				if (!isCurrencyExists) {
					const payload = JSON.stringify({ currency: asset.currency, },)
					await this.prismaService.asset.create({
						data: {
							assetName:   AssetNamesType.CASH,
							payload,
							clientId:    asset.clientId,
							portfolioId: asset.portfolioId,
							entityId:    asset.entityId,
							bankId:      asset.bankId,
							accountId:   asset.accountId,
						},
					},)
				}
			}
				,),)
			await Promise.all(maturedAssets.map(async(asset,) => {
				const rateData = currencyData.find((item,) => {
					return item.currency === asset.currency
				},)
				if (!asset.maturityDate) {
					return null
				}
				const formattedStartDate = formatDateDDMMYYYY(asset.startDate,)
				const formattedMaturityDate = formatDateDDMMYYYY(asset.maturityDate,)
				const formattedCurrencyValue = new Intl.NumberFormat('en-US', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				},).format(asset.currencyValue,)
				return this.prismaService.$transaction(async(tx,) => {
					if (!asset.portfolioId) {
						return undefined
					}
					if (!asset.maturityDate) {
						return null
					}
					await tx.assetDeposit.update({
						where: { id: asset.id, },
						data:  {
							toBeMatured: false,
						},
					},)
					return tx.transaction.create({
						data: {
							clientId:                 asset.clientId,
							portfolioId:              asset.portfolioId,
							entityId:                 asset.entityId,
							bankId:                   asset.bankId,
							accountId:                asset.accountId,
							amount:                   asset.currencyValue,
							currency:                 asset.currency,
							transactionDate:          asset.maturityDate,
							rate:                     rateData?.rate ?? 1,
							serviceProvider:          'N/A',
							transactionTypeId:        transactionType.id,
							transactionTypeVersionId: transactionType.versions[0].id,
							comment:                  this.cryptoService.encryptString(`${formattedCurrencyValue} ${asset.currency} ${asset.interest}% ${formattedStartDate}-${formattedMaturityDate}`,),
						},
					},)
				},)
			},),)
		} catch (error) {
			this.logger.error(error,)
		}
	}

	// The old one
	// public async depositMaturityAutomation(): Promise<void> {
	// 	try {
	// 		const [assets, transactionType,] = await Promise.all([
	// 			this.prismaService.asset.findMany({
	// 				where: {
	// 					assetName: AssetNamesType.CASH_DEPOSIT,
	// 				},
	// 			},),
	// 			this.prismaService.transactionType.findFirst({
	// 				where: {
	// 					versions: {
	// 						some: {
	// 							name:      'Deposit maturity',
	// 							isCurrent: true,
	// 						},
	// 					},
	// 				},
	// 				include: {
	// 					versions: {
	// 						where: { isCurrent: true, },
	// 					},
	// 				},
	// 			},),
	// 		],)
	// 		if (!transactionType) {
	// 			return
	// 		}
	// 		const currencyData = await this.prismaService.currencyData.findMany()
	// 		const today = new Date()
	// 		today.setHours(0, 0, 0, 0,)
	// 		const maturedAssets = assets
	// 			.map((asset,) => {
	// 				return assetParser<IDepositAsset>(asset,)
	// 			},)
	// 			.filter((item,):  item is NonNullable<typeof item> => {
	// 				return item !== null
	// 			},)
	// 			.filter((assetPayload,) => {
	// 				if (!assetPayload.maturityDate) {
	// 					return false
	// 				}
	// 				const maturityDate = new Date(assetPayload.maturityDate,)
	// 				maturityDate.setHours(0, 0, 0, 0,)
	// 				if (assetPayload.toBeMatured === true) {
	// 					return maturityDate.getTime() <= today.getTime()
	// 				}
	// 				if (assetPayload.toBeMatured === undefined) {
	// 					return maturityDate.getTime() === today.getTime()
	// 				}
	// 				return false
	// 			},)
	// 		const uniqueMaturedAssets: Array<IDepositAsset> = []
	// 		const seen = new Set<string>()
	// 		for (const asset of maturedAssets) {
	// 			const key = `${asset.accountId}_${asset.currency}`
	// 			if (!seen.has(key,)) {
	// 				seen.add(key,)
	// 				uniqueMaturedAssets.push(asset,)
	// 			}
	// 		}
	// 		await Promise.all(uniqueMaturedAssets.map(async(asset,) => {
	// 			if (!asset.maturityDate) {
	// 				return
	// 			}
	// 			const maturityDate = new Date(asset.maturityDate,)
	// 			maturityDate.setHours(0, 0, 0, 0,)
	// 			const shouldCreateCashAsset = (asset.toBeMatured === true && maturityDate.getTime() <= today.getTime()) || (asset.toBeMatured === undefined && maturityDate.getTime() === today.getTime())
	// 			if (!shouldCreateCashAsset) {
	// 				return
	// 			}
	// 			const cashAssets = await this.prismaService.asset.findMany({
	// 				where: {
	// 					assetName: AssetNamesType.CASH,
	// 					accountId: asset.accountId,
	// 				},
	// 			},)
	// 			const isCurrencyExists = cashAssets.find((cashAsset,) => {
	// 				const cashAssetPayload = assetParser<ICashAsset>(cashAsset,)
	// 				return (
	// 					cashAssetPayload?.currency === asset.currency &&
	//                cashAsset.clientId === asset.clientId &&
	//                cashAsset.portfolioId === asset.portfolioId &&
	//                cashAsset.entityId === asset.entityId &&
	//                cashAsset.bankId === asset.bankId
	// 				)
	// 			},)
	// 			if (!isCurrencyExists) {
	// 				const payload = JSON.stringify({ currency: asset.currency, },)
	// 				await this.prismaService.asset.create({
	// 					data: {
	// 						assetName:   AssetNamesType.CASH,
	// 						payload,
	// 						clientId:    asset.clientId,
	// 						portfolioId: asset.portfolioId,
	// 						entityId:    asset.entityId,
	// 						bankId:      asset.bankId,
	// 						accountId:   asset.accountId,
	// 					},
	// 				},)
	// 			}
	// 		}
	// 			,),)
	// 		await Promise.all(maturedAssets.map(async(asset,) => {
	// 			const rateData = currencyData.find((item,) => {
	// 				return item.currency === asset.currency
	// 			},)
	// 			const formattedStartDate = formatDateDDMMYYYY(asset.startDate,)
	// 			const formattedMaturityDate = formatDateDDMMYYYY(asset.maturityDate,)
	// 			const formattedCurrencyValue = new Intl.NumberFormat('en-US', {
	// 				minimumFractionDigits: 2,
	// 				maximumFractionDigits: 2,
	// 			},).format(asset.currencyValue,)
	// 			const newPayload = JSON.stringify({
	// 				interest:      asset.interest,
	// 				currencyValue: asset.currencyValue,
	// 				startDate:     asset.startDate,
	// 				policy:        asset.policy,
	// 				maturityDate:        asset.maturityDate,
	// 				toBeMatured:   false,
	// 				currency:      asset.currency,
	// 			},)
	// 			return this.prismaService.$transaction(async(tx,) => {
	// 				if (!asset.portfolioId) {
	// 					return undefined
	// 				}
	// 				await tx.asset.update({
	// 					where: { id: asset.id, },
	// 					data:  {
	// 						payload: newPayload,
	// 					},
	// 				},)
	// 				return tx.transaction.create({
	// 					data: {
	// 						clientId:                 asset.clientId,
	// 						portfolioId:              asset.portfolioId,
	// 						entityId:                 asset.entityId,
	// 						bankId:                   asset.bankId,
	// 						accountId:                asset.accountId,
	// 						amount:                   asset.currencyValue,
	// 						currency:                 asset.currency,
	// 						transactionDate:          asset.maturityDate,
	// 						rate:                     rateData?.rate ?? 1,
	// 						serviceProvider:          'N/A',
	// 						transactionTypeId:        transactionType.id,
	// 						transactionTypeVersionId: transactionType.versions[0].id,
	// 						comment:                  this.cryptoService.encryptString(`${formattedCurrencyValue} ${asset.currency} ${asset.interest}% ${formattedStartDate}-${formattedMaturityDate}`,),
	// 					},
	// 				},)
	// 			},)
	// 		},),)
	// 	} catch (error) {
	// 		this.logger.error(error,)
	// 	}
	// }

	public async cashAssetsCreationFromTransactions(): Promise<void> {
		const [transactions,] = await Promise.all([
			this.prismaService.transaction.findMany({
				where: {
					clientId: '1dc20b8a-dc72-4f1e-8f35-03d16fa810c0',
				},
			},),
		],)
		const uniqueMaturedAssets: Array<Transaction> = []
		const seen = new Set<string>()
		for (const asset of transactions) {
			const key = `${asset.accountId}_${asset.currency}`
			if (!seen.has(key,)) {
				seen.add(key,)
				uniqueMaturedAssets.push(asset,)
			}
		}
		await Promise.all(uniqueMaturedAssets.map(async(asset,) => {
			const payload = JSON.stringify({ currency: asset.currency, },)

			return this.prismaService.asset.create({
				data: {
					assetName:   AssetNamesType.CASH,
					payload,
					clientId:    asset.clientId,
					portfolioId: asset.portfolioId,
					entityId:    asset.entityId!,
					bankId:      asset.bankId,
					accountId:   asset.accountId!,
				},
			},)
		},),
		)
	}

	/**
			* CR - 075
			* Transfers an asset to a different owner context by updating ownership-related fields.
			*
			* @remarks
			* This method updates an existing asset's `accountId`, `bankId`, `entityId`, `portfolioId`, and `clientId`
			* in the database using its unique `id`. If the asset is not found, it throws an HTTP 404 Not Found error.
			*
			* @param data - The DTO containing the asset `id` and new ownership details.
			* @returns A Promise resolving to the updated asset.
			*
			* @throws {HttpException} 404 if the asset with the provided `id` does not exist.
		*/
	public async transferAsset(data: TransferAssetDto,): Promise<Asset> {
		const { id, accountId, bankId, entityId, portfolioId, clientId, } = data
		return this.prismaService.$transaction(async(tx,) => {
			if (data.assetName === AssetNamesType.BONDS) {
				const assetGroup = await tx.assetBondGroup.update({
					where: { id, },
					data:  {
						transferDate: new Date(),
					},
					include: { bonds: true, },
				},)
				const { bonds,} = assetGroup
				const accrued = bonds.reduce<number>((sum, a,) => {
					return sum + a.accrued
				}, 0,)
				const bankFee = bonds.reduce<number>((sum, a,) => {
					return sum + a.bankFee
				}, 0,)
				const bondData = {
					clientId,
					portfolioId,
					entityId,
					bankId,
					accountId,
					assetName: AssetNamesType.BONDS,
					payload:   JSON.stringify({
						isin:      assetGroup.isin,
						currency:  assetGroup.currency,
						security:  assetGroup.security,
						operation: AssetOperationType.BUY,
						units:     assetGroup.totalUnits,
						unitPrice: assetGroup.costPrice,
						valueDate: new Date(),
						bankFee,
						accrued,
					},),
				}
				const newGroup = await this.assetRepository.createAssetBondForTransfer(tx, bondData,)
				if (!newGroup) {
					throw new HttpException('Group is missing', HttpStatusCode.BadRequest,)
				}
				await tx.editLog.create({
					data: {
						clientId:     data.clientId,
						portfolioId:  data.portfolioId,
						entityId:     data.clientId,
						bankId:       data.clientId,
						accountId:    data.accountId,
						instanceId:   newGroup.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Transfer,
						assetName:    AssetNamesType.BONDS,
						reason:       'Transfer',
						userName:     data.userInfo.name,
						userEmail:    data.userInfo.email,
						metaAfter:    {
							clientId:        newGroup.clientId,
							portfolioId:     newGroup.portfolioId,
							entityId:        newGroup.clientId,
							bankId:          newGroup.clientId,
							accountId:       newGroup.accountId,
							currency:        newGroup.currency,
							security:	       newGroup.security,
							valueDate:       newGroup.valueDate,
							isin:            newGroup.isin,
							units:           newGroup.totalUnits,
							transferDate:    assetGroup.transferDate,
							transferAssetId: assetGroup.id,
						},
						metaBefore:  {
							clientId:      assetGroup.clientId,
							portfolioId:   assetGroup.portfolioId,
							entityId:      assetGroup.clientId,
							bankId:        assetGroup.clientId,
							accountId:     assetGroup.accountId,
							currency:     assetGroup.currency,
							security:	    assetGroup.security,
							valueDate:    assetGroup.valueDate,
							isin:         assetGroup.isin,
							units:        assetGroup.totalUnits,
							transferDate: assetGroup.transferDate,
						},
					},
				},)
				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.bond,)
				const payload = JSON.stringify({
					currency:    newGroup.currency,
					security:	   newGroup.security,
					valueDate:   newGroup.valueDate,
					isin:        newGroup.isin,
					units:       newGroup.totalUnits,
					accrued:     newGroup.accrued,
				},)
				await Promise.all([
					this.computationsService.updateClientTotals(assetGroup.clientId,),
					this.computationsService.updateClientTotals(newGroup.clientId,),
				],)
				return {
					id:               newGroup.id,
					clientId:         newGroup.clientId,
					portfolioId:      newGroup.portfolioId,
					entityId:         newGroup.entityId,
					bankId:           newGroup.bankId,
					accountId:        newGroup.accountId,
					assetName:        newGroup.assetName,
					createdAt:        newGroup.createdAt,
					updatedAt:        newGroup.updatedAt,
					payload,
					isArchived:       newGroup.isArchived,
					isFutureDated:    false,
					rate:             newGroup.avgRate,
					portfolioDraftId: null,
				}
			}
			if (data.assetName === AssetNamesType.EQUITY_ASSET) {
				const assetGroup = await tx.assetEquityGroup.update({
					where: { id, },
					data:  {
						transferDate: new Date(),
					},
					include: { equities: true, },
				},)
				const {equities,} = assetGroup
				const bankFee = equities.reduce<number>((acc, item,) => {
					return acc + item.bankFee
				},0,)
				const equityData = {
					clientId,
					portfolioId,
					entityId,
					bankId,
					accountId,
					assetName: AssetNamesType.EQUITY_ASSET,
					payload:   JSON.stringify({
						isin:             assetGroup.isin,
						currency:         assetGroup.currency,
						security:         assetGroup.security,
						operation:        AssetOperationType.BUY,
						units:            assetGroup.totalUnits,
						transactionPrice: assetGroup.costPrice,
						transactionDate:  new Date(),
						bankFee,
						equityType:       assetGroup.type,
					},),
				}
				const newGroup = await this.assetRepository.createAssetEquityForTransfer(tx, equityData,)
				if (!newGroup) {
					throw new HttpException('Group is missing', HttpStatusCode.BadRequest,)
				}
				await tx.editLog.create({
					data: {
						clientId:     newGroup.clientId,
						portfolioId:  newGroup.portfolioId,
						entityId:     newGroup.clientId,
						bankId:       newGroup.clientId,
						accountId:    newGroup.accountId,
						instanceId:   newGroup.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Transfer,
						assetName:    AssetNamesType.EQUITY_ASSET,
						reason:       'Transfer',
						userName:     data.userInfo.name,
						userEmail:    data.userInfo.email,
						metaAfter:    {
							clientId:        newGroup.clientId,
							portfolioId:     newGroup.portfolioId,
							entityId:        newGroup.clientId,
							bankId:          newGroup.clientId,
							accountId:       newGroup.accountId,
							currency:         newGroup.currency,
							transactionDate:	 	  newGroup.transactionDate,
							isin:             newGroup.isin,
							security:            newGroup.security,
							units:            newGroup.totalUnits,
						},
						metaBefore:  {
							clientId:         assetGroup.clientId,
							portfolioId:      assetGroup.portfolioId,
							entityId:         assetGroup.clientId,
							bankId:           assetGroup.clientId,
							accountId:        assetGroup.accountId,
							currency:         assetGroup.currency,
							transactionDate:	 	  assetGroup.transactionDate,
							isin:             assetGroup.isin,
							security:            assetGroup.security,
							units:            assetGroup.totalUnits,
						},
					},
				},)
				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.equity,)
				const payload = JSON.stringify({
					currency:         newGroup.currency,
					transactionDate:	 	  newGroup.transactionDate,
					isin:             newGroup.isin,
					security:            newGroup.security,
					units:            newGroup.totalUnits,
				},)
				await Promise.all([
					this.computationsService.updateClientTotals(assetGroup.clientId,),
					this.computationsService.updateClientTotals(newGroup.clientId,),
				],)
				return {
					id:               newGroup.id,
					clientId:         newGroup.clientId,
					portfolioId:      newGroup.portfolioId,
					entityId:         newGroup.entityId,
					bankId:           newGroup.bankId,
					accountId:        newGroup.accountId,
					assetName:        newGroup.assetName,
					createdAt:        newGroup.createdAt,
					updatedAt:        newGroup.updatedAt,
					payload,
					isArchived:       newGroup.isArchived,
					isFutureDated:    false,
					rate:             newGroup.avgRate,
					portfolioDraftId: null,
				}
			}
			if (data.assetName === AssetNamesType.CASH) {
				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.cash,)
			}
			if (data.assetName === AssetNamesType.CASH_DEPOSIT) {
				const asset = await tx.assetDeposit.update({
					where: { id, },
					data:  {
						transferDate: new Date(),
					},
				},)
				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}
				const {
					// eslint-disable-next-line no-unused-vars
					id: updatedAssetId,createdAt,	updatedAt,transferAssetId,	transferDate, startDate,
					...cleanAsset
				} = asset
				const transfferedAsset = await tx.assetDeposit.create({
					data: {
						...cleanAsset,
						clientId,
						portfolioId,
						entityId,
						bankId,
						accountId,
						startDate:       new Date(),
						transferAssetId: asset.id,
					},
				},)

				const payload = JSON.stringify({
					currency:      transfferedAsset.currency,
					currencyValue: transfferedAsset.currencyValue,
					interest:      transfferedAsset.interest,
					policy:        transfferedAsset.policy,
					toBeMatured:   transfferedAsset.toBeMatured,
					startDate:     transfferedAsset.startDate,
					comment:       transfferedAsset.comment,
					maturityDate:  transfferedAsset.maturityDate ?
						asset.maturityDate :
						undefined,
				},)
				const prevPayload = {
					clientId:      asset.clientId,
					portfolioId:   asset.portfolioId,
					entityId:      asset.clientId,
					bankId:        asset.clientId,
					accountId:     asset.accountId,
					currency:      asset.currency,
					currencyValue: asset.currencyValue,
					interest:      asset.interest,
					policy:        asset.policy,
					toBeMatured:   asset.toBeMatured,
					startDate:     asset.startDate,
					comment:       asset.comment,
					maturityDate:  asset.maturityDate ?
						asset.maturityDate :
						undefined,
				}
				await tx.editLog.create({
					data: {
						clientId:     transfferedAsset.clientId,
						portfolioId:  transfferedAsset.portfolioId,
						entityId:     transfferedAsset.clientId,
						bankId:       transfferedAsset.clientId,
						accountId:    transfferedAsset.accountId,
						instanceId:   transfferedAsset.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Transfer,
						assetName:    AssetNamesType.CASH_DEPOSIT,
						reason:       'Transfer',
						userName:     data.userInfo.name,
						userEmail:    data.userInfo.email,
						metaAfter:    {
							clientId:      transfferedAsset.clientId,
							portfolioId:   transfferedAsset.portfolioId,
							entityId:      transfferedAsset.clientId,
							bankId:        transfferedAsset.clientId,
							accountId:     transfferedAsset.accountId,
							currency:      transfferedAsset.currency,
							currencyValue: transfferedAsset.currencyValue,
							interest:      transfferedAsset.interest,
							policy:        transfferedAsset.policy,
							toBeMatured:   transfferedAsset.toBeMatured,
							startDate:     transfferedAsset.startDate,
							comment:       transfferedAsset.comment,
							maturityDate:  transfferedAsset.maturityDate ?
								transfferedAsset.maturityDate :
								undefined,

						},
						metaBefore: prevPayload,
					},
				},)
				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.deposit,)
				await Promise.all([
					this.computationsService.updateClientTotals(asset.clientId,),
					this.computationsService.updateClientTotals(transfferedAsset.clientId,),
				],)
				return {
					id:               transfferedAsset.id,
					clientId:         transfferedAsset.clientId,
					portfolioId:      transfferedAsset.portfolioId,
					entityId:         transfferedAsset.entityId,
					bankId:           transfferedAsset.bankId,
					accountId:        transfferedAsset.accountId,
					assetName:        transfferedAsset.assetName,
					createdAt:        transfferedAsset.createdAt,
					updatedAt:        transfferedAsset.updatedAt,
					payload,
					isArchived:       transfferedAsset.isArchived,
					isFutureDated:    transfferedAsset.isFutureDated,
					rate:             transfferedAsset.rate,
					portfolioDraftId: null,
				}
			}
			if (data.assetName === AssetNamesType.METALS) {
				const assetGroup = await tx.assetMetalGroup.update({
					where: { id, },
					data:  {
						transferDate: new Date(),
					},
					include: { metals: true, },
				},)
				const { metals,} = assetGroup
				const bankFee = metals.reduce<number>((sum, a,) => {
					return sum + (a.bankFee ?? 0)
				}, 0,)
				const metalData = {
					clientId,
					portfolioId,
					entityId,
					bankId,
					accountId,
					assetName: AssetNamesType.METALS,
					payload:   assetGroup.productType === MetalType.ETF ?
						JSON.stringify({
							isin:             assetGroup.isin,
							currency:         assetGroup.currency,
							security:         assetGroup.security,
							operation:        AssetOperationType.BUY,
							units:            assetGroup.totalUnits,
							transactionPrice: assetGroup.costPrice,
							transactionDate:  new Date(),
							bankFee,
							equityType:       assetGroup.type,
						},) :
						JSON.stringify({
							currency:        assetGroup.currency,
							transactionDate: new Date(),
							metalType:       assetGroup.metalType,
							operation:       AssetOperationType.BUY,
							purchasePrice:   assetGroup.transactionPrice,
							units:           assetGroup.totalUnits,
						},),
				}
				const newGroup = await this.assetRepository.createAssetMetalForTransfer(tx, metalData,)
				if (!newGroup) {
					throw new HttpException('Group is missing', HttpStatusCode.BadRequest,)
				}
				await tx.editLog.create({
					data: {
						clientId:     newGroup.clientId,
						portfolioId:  newGroup.portfolioId,
						entityId:     newGroup.clientId,
						bankId:       newGroup.clientId,
						accountId:    newGroup.accountId,
						instanceId:   newGroup.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Transfer,
						assetName:    AssetNamesType.METALS,
						reason:       'Transfer',
						userName:     data.userInfo.name,
						userEmail:    data.userInfo.email,
						metaAfter:    {
							clientId:        newGroup.clientId,
							portfolioId:     newGroup.portfolioId,
							entityId:        newGroup.clientId,
							bankId:          newGroup.clientId,
							accountId:       newGroup.accountId,
							...(newGroup.productType === MetalType.ETF ?
								{
									productType:      newGroup.productType,
									currency:         newGroup.currency,
									transactionDate:	 	  newGroup.transactionDate,
									isin:             newGroup.isin,
									security:            newGroup.security,
									units:            newGroup.totalUnits,
									transactionPrice:       newGroup.transactionPrice,
									equityType:          MetalType.ETF,
								} :
								{
									productType:         newGroup.productType,
									metalType:	 	    newGroup.metalType,
									transactionDate:               newGroup.transactionDate,
									purchasePrice:          newGroup.transactionPrice,
									units:            newGroup.totalUnits,
								}),
						},
						metaBefore:  {
							clientId:      assetGroup.clientId,
							portfolioId:   assetGroup.portfolioId,
							entityId:      assetGroup.clientId,
							bankId:        assetGroup.clientId,
							accountId:     assetGroup.accountId,
							...(assetGroup.productType === MetalType.ETF ?
								{
									productType:      assetGroup.productType,
									currency:         assetGroup.currency,
									transactionDate:	 	  assetGroup.transactionDate,
									isin:             assetGroup.isin,
									security:            assetGroup.security,
									units:            assetGroup.totalUnits,
									transactionPrice:       assetGroup.transactionPrice,
									equityType:          MetalType.ETF,
								} :
								{productType:         assetGroup.productType,
									metalType:	 	    assetGroup.metalType,
									transactionDate:               assetGroup.transactionDate,
									purchasePrice:          assetGroup.transactionPrice,
									units:            assetGroup.totalUnits,}),
						},
					},
				},)
				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.metals,)
				const payload = newGroup.productType === MetalType.ETF  ?
					JSON.stringify({
						productType:      newGroup.productType,
						currency:         newGroup.currency,
						transactionDate:	 	  newGroup.transactionDate,
						isin:             newGroup.isin,
						security:            newGroup.security,
						units:            newGroup.totalUnits,
						transactionPrice:       newGroup.transactionPrice,
						equityType:          MetalType.ETF,
					},) :
					JSON.stringify({
						productType:         newGroup.productType,
						metalType:	 	    newGroup.metalType,
						transactionDate:               newGroup.transactionDate,
						purchasePrice:          newGroup.transactionPrice,
						units:            newGroup.totalUnits,
					},)
				await Promise.all([
					this.computationsService.updateClientTotals(newGroup.clientId,),
					this.computationsService.updateClientTotals(assetGroup.clientId,),
				],)
				return {
					id:               newGroup.id,
					clientId:         newGroup.clientId,
					portfolioId:      newGroup.portfolioId,
					entityId:         newGroup.entityId,
					bankId:           newGroup.bankId,
					accountId:        newGroup.accountId,
					assetName:        newGroup.assetName,
					createdAt:        newGroup.createdAt,
					updatedAt:        newGroup.updatedAt,
					payload,
					isArchived:       newGroup.isArchived,
					isFutureDated:    false,
					rate:             newGroup.avgRate,
					portfolioDraftId: null,
				}
			}
			if (data.assetName === AssetNamesType.CRYPTO) {
				const assetGroup = await tx.assetCryptoGroup.update({
					where: { id, },
					data:  {
						transferDate: new Date(),
					},
					include: { cryptos: true, },
				},)
				const { cryptos,} = assetGroup
				const bankFee = cryptos.reduce<number>((sum, a,) => {
					return sum + (a.bankFee ?? 0)
				}, 0,)
				const cryptoData = {
					clientId,
					portfolioId,
					entityId,
					bankId,
					accountId,
					assetName: AssetNamesType.CRYPTO,
					payload:   assetGroup.productType === CryptoType.ETF ?
						JSON.stringify({
							isin:             assetGroup.isin,
							currency:         assetGroup.currency,
							security:         assetGroup.security,
							operation:        AssetOperationType.BUY,
							units:            assetGroup.totalUnits,
							transactionPrice: assetGroup.costPrice,
							transactionDate:  new Date(),
							bankFee,
							equityType:       assetGroup.type,
						},) :
						JSON.stringify({
							cryptoCurrencyType: assetGroup.cryptoCurrencyType,
							purchasePrice:      assetGroup.purchasePrice,
							cryptoAmount:       assetGroup.cryptoAmount,
							exchangeWallet:     assetGroup.exchangeWallet,
							purchaseDate:       new Date(),
						},),
				}
				const newGroup = await this.assetRepository.createAssetCryptoForTransfer(tx, cryptoData,)
				if (!newGroup) {
					throw new HttpException('Group is missing', HttpStatusCode.BadRequest,)
				}
				await tx.editLog.create({
					data: {
						clientId:     newGroup.clientId,
						portfolioId:  newGroup.portfolioId,
						entityId:     newGroup.clientId,
						bankId:       newGroup.clientId,
						accountId:    newGroup.accountId,
						instanceId:   newGroup.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Transfer,
						assetName:    AssetNamesType.CRYPTO,
						reason:       'Transfer',
						userName:     data.userInfo.name,
						userEmail:    data.userInfo.email,
						metaAfter:    {
							clientId:        newGroup.clientId,
							portfolioId:     newGroup.portfolioId,
							entityId:        newGroup.clientId,
							bankId:          newGroup.clientId,
							accountId:       newGroup.accountId,
							...(newGroup.productType === CryptoType.ETF ?
								{
									productType:      newGroup.productType,
									currency:         newGroup.currency,
									transactionDate:	 	  newGroup.transactionDate,
									isin:             newGroup.isin,
									security:            newGroup.security,
									units:            newGroup.totalUnits,
									transactionPrice:       newGroup.transactionPrice,
									equityType:          CryptoType.ETF,
								} :
								{
									productType:         newGroup.productType,
									cryptoCurrencyType:	 	  newGroup.cryptoCurrencyType,
									cryptoAmount:               newGroup.cryptoAmount,
									exchangeWallet:          newGroup.exchangeWallet,
									purchaseDate:            newGroup.purchaseDate,
									purchasePrice:              newGroup.purchasePrice,
								}),
						},
						metaBefore:  {
							clientId:      assetGroup.clientId,
							portfolioId:   assetGroup.portfolioId,
							entityId:      assetGroup.clientId,
							bankId:        assetGroup.clientId,
							accountId:     assetGroup.accountId,
							...(assetGroup.productType === CryptoType.ETF ?
								{
									productType:      assetGroup.productType,
									currency:         assetGroup.currency,
									transactionDate:	 	  assetGroup.transactionDate,
									isin:             assetGroup.isin,
									security:            assetGroup.security,
									units:            assetGroup.totalUnits,
									transactionPrice:       assetGroup.transactionPrice,
									equityType:          CryptoType.ETF,
								} :
								{
									productType:         assetGroup.productType,
									cryptoCurrencyType:	 	  assetGroup.cryptoCurrencyType,
									cryptoAmount:               assetGroup.cryptoAmount,
									exchangeWallet:          assetGroup.exchangeWallet,
									purchaseDate:            assetGroup.purchaseDate,
									purchasePrice:              assetGroup.purchasePrice,
								}),
						},
					},
				},)
				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.crypto,)
				const payload = newGroup.productType === CryptoType.ETF  ?
					JSON.stringify({
						productType:      newGroup.productType,
						currency:         newGroup.currency,
						transactionDate:	 	  newGroup.transactionDate,
						isin:             newGroup.isin,
						security:            newGroup.security,
						units:            newGroup.totalUnits,
						transactionPrice:       newGroup.transactionPrice,
						equityType:          CryptoType.ETF,
					},) :
					JSON.stringify({
						productType:         assetGroup.productType,
						cryptoCurrencyType:	 	  assetGroup.cryptoCurrencyType,
						cryptoAmount:               assetGroup.cryptoAmount,
						exchangeWallet:          assetGroup.exchangeWallet,
						purchaseDate:            assetGroup.purchaseDate,
						purchasePrice:              assetGroup.purchasePrice,
					},)
				await Promise.all([
					this.computationsService.updateClientTotals(newGroup.clientId,),
					this.computationsService.updateClientTotals(assetGroup.clientId,),
				],)
				return {
					id:               newGroup.id,
					clientId:         newGroup.clientId,
					portfolioId:      newGroup.portfolioId,
					entityId:         newGroup.entityId,
					bankId:           newGroup.bankId,
					accountId:        newGroup.accountId,
					assetName:        newGroup.assetName,
					createdAt:        newGroup.createdAt,
					updatedAt:        newGroup.updatedAt,
					payload,
					isArchived:       newGroup.isArchived,
					isFutureDated:    false,
					rate:             newGroup.avgRate,
					portfolioDraftId: null,
				}
			}
			if (data.assetName === AssetNamesType.LOAN) {
				const asset = await tx.assetLoan.update({
					where: { id, },
					data:  {
						transferDate: new Date(),
					},
				},)

				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}

				const {
					// eslint-disable-next-line no-unused-vars
					id: updatedAssetId,createdAt,	updatedAt,transferAssetId,	transferDate, startDate,
					...cleanAsset
				} = asset

				const transferredAsset = await tx.assetLoan.create({
					data: {
						...cleanAsset,
						clientId,
						portfolioId,
						entityId,
						bankId,
						accountId,
						startDate:       new Date(),
						transferAssetId: asset.id,
					},
				},)

				const payload = JSON.stringify({
					currency:         transferredAsset.currency,
					currencyValue:    transferredAsset.currencyValue,
					usdValue:         transferredAsset.usdValue,
					marketValueUSD:   transferredAsset.marketValueUSD,
					name:             transferredAsset.name,
					startDate:        transferredAsset.startDate,
					maturityDate:     transferredAsset.maturityDate,
					interest:         transferredAsset.interest,
					todayInterest:    transferredAsset.todayInterest,
					maturityInterest: transferredAsset.maturityInterest,
					comment:          transferredAsset.comment,
				},)

				const prevPayload = {
					clientId:         asset.clientId,
					portfolioId:      asset.portfolioId,
					entityId:         asset.clientId,
					bankId:           asset.clientId,
					accountId:        asset.accountId,
					currency:         asset.currency,
					currencyValue:    asset.currencyValue,
					usdValue:         asset.usdValue,
					marketValueUSD:   asset.marketValueUSD,
					name:             asset.name,
					startDate:        asset.startDate,
					maturityDate:     asset.maturityDate,
					interest:         asset.interest,
					todayInterest:    asset.todayInterest,
					maturityInterest: asset.maturityInterest,
					comment:          asset.comment,
				}

				await tx.editLog.create({
					data: {
						clientId:     transferredAsset.clientId,
						portfolioId:  transferredAsset.portfolioId,
						entityId:     transferredAsset.clientId,
						bankId:       transferredAsset.clientId,
						accountId:    transferredAsset.accountId,
						instanceId:   transferredAsset.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Transfer,
						assetName:    AssetNamesType.LOAN,
						reason:       'Transfer',
						userName:     data.userInfo.name,
						userEmail:    data.userInfo.email,
						metaAfter:    {
							...prevPayload,
							clientId:        transferredAsset.clientId,
							portfolioId:     transferredAsset.portfolioId,
							accountId:       transferredAsset.accountId,
							bankId:          transferredAsset.clientId,
							entityId:        transferredAsset.clientId,
							startDate:       transferredAsset.startDate,
							transferDate:    asset.transferDate,
							transferAssetId: asset.id,
						},
						metaBefore: prevPayload,
					},
				},)

				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.loan,)

				return {
					id:               transferredAsset.id,
					clientId:         transferredAsset.clientId,
					portfolioId:      transferredAsset.portfolioId,
					entityId:         transferredAsset.entityId,
					bankId:           transferredAsset.bankId,
					accountId:        transferredAsset.accountId,
					assetName:        transferredAsset.assetName,
					createdAt:        transferredAsset.createdAt,
					updatedAt:        transferredAsset.updatedAt,
					payload,
					isArchived:       transferredAsset.isArchived,
					isFutureDated:    transferredAsset.isFutureDated,
					rate:             transferredAsset.rate,
					portfolioDraftId: null,
				}
			}
			if (data.assetName === AssetNamesType.OTHER) {
				const asset = await tx.assetOtherInvestment.update({
					where: { id, },
					data:  {
						transferDate: new Date(),
					},
				},)

				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}

				const {
					// eslint-disable-next-line no-unused-vars
					id: updatedAssetId, createdAt, updatedAt, transferAssetId, transferDate, investmentDate, customFields,
					...cleanAsset
				} = asset

				const transferredAsset = await tx.assetOtherInvestment.create({
					data: {
						...cleanAsset,
						customFields:    customFields as Prisma.InputJsonValue,
						clientId,
						portfolioId,
						entityId,
						bankId,
						accountId,
						investmentDate:  new Date(),
						transferAssetId: asset.id,
					},
				},)

				const payload = JSON.stringify({
					currency:            transferredAsset.currency,
					currencyValue:       transferredAsset.currencyValue,
					usdValue:            transferredAsset.usdValue,
					marketValueUSD:      transferredAsset.marketValueUSD,
					costValueUSD:        transferredAsset.costValueUSD,
					profitUSD:           transferredAsset.profitUSD,
					profitPercentage:    transferredAsset.profitPercentage,
					investmentAssetName: transferredAsset.investmentAssetName,
					investmentDate:      transferredAsset.investmentDate,
					serviceProvider:     transferredAsset.serviceProvider,
					comment:             transferredAsset.comment,
					customFields:        transferredAsset.customFields,
				},)

				const prevPayload = {
					clientId:            asset.clientId,
					portfolioId:         asset.portfolioId,
					entityId:            asset.clientId,
					bankId:              asset.clientId,
					accountId:           asset.accountId,
					currency:            asset.currency,
					currencyValue:       asset.currencyValue,
					usdValue:            asset.usdValue,
					marketValueUSD:      asset.marketValueUSD,
					costValueUSD:        asset.costValueUSD,
					profitUSD:           asset.profitUSD,
					profitPercentage:    asset.profitPercentage,
					investmentAssetName: asset.investmentAssetName,
					investmentDate:      asset.investmentDate,
					serviceProvider:     asset.serviceProvider,
					comment:             asset.comment,
					customFields:        asset.customFields,
				}

				await tx.editLog.create({
					data: {
						clientId:     transferredAsset.clientId,
						portfolioId:  transferredAsset.portfolioId,
						entityId:     transferredAsset.clientId,
						bankId:       transferredAsset.clientId,
						accountId:    transferredAsset.accountId,
						instanceId:   transferredAsset.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Transfer,
						assetName:    AssetNamesType.OTHER,
						reason:       'Transfer',
						userName:     data.userInfo.name,
						userEmail:    data.userInfo.email,
						metaAfter:    {
							...prevPayload,
							clientId:        transferredAsset.clientId,
							portfolioId:     transferredAsset.portfolioId,
							accountId:       transferredAsset.accountId,
							bankId:          transferredAsset.clientId,
							entityId:        transferredAsset.clientId,
							investmentDate:  transferredAsset.investmentDate,
							transferDate:    asset.transferDate,
							transferAssetId: asset.id,
						},
						metaBefore: prevPayload,
					},
				},)

				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.other,)

				return {
					id:               transferredAsset.id,
					clientId:         transferredAsset.clientId,
					portfolioId:      transferredAsset.portfolioId,
					entityId:         transferredAsset.entityId,
					bankId:           transferredAsset.bankId,
					accountId:        transferredAsset.accountId,
					assetName:        transferredAsset.assetName,
					createdAt:        transferredAsset.createdAt,
					updatedAt:        transferredAsset.updatedAt,
					payload,
					isArchived:       transferredAsset.isArchived,
					isFutureDated:    transferredAsset.isFutureDated,
					rate:             transferredAsset.rate,
					portfolioDraftId: null,
				}
			}
			if (data.assetName === AssetNamesType.PRIVATE_EQUITY) {
				const asset = await tx.assetPrivateEquity.update({
					where: { id, },
					data:  {
						transferDate: new Date(),
					},
				},)

				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}

				const {
					// eslint-disable-next-line no-unused-vars
					id: updatedAssetId,createdAt,	updatedAt,transferAssetId,	transferDate, entryDate,
					...cleanAsset
				} = asset

				const transferredAsset = await tx.assetPrivateEquity.create({
					data: {
						...cleanAsset,
						clientId,
						portfolioId,
						entityId,
						bankId,
						accountId,
						entryDate:       new Date(),
						transferAssetId: asset.id,
					},
				},)

				const payload = JSON.stringify({
					currency:           transferredAsset.currency,
					currencyValue:      transferredAsset.currencyValue,
					marketValueUSD:     transferredAsset.marketValueUSD,
					pl:                 transferredAsset.pl,
					fundType:           transferredAsset.fundType,
					status:             transferredAsset.status,
					entryDate:          transferredAsset.entryDate,
					fundTermDate:       transferredAsset.fundTermDate,
					lastValuationDate:  transferredAsset.lastValuationDate,
					serviceProvider:    transferredAsset.serviceProvider,
					geography:          transferredAsset.geography,
					fundName:           transferredAsset.fundName,
					fundID:             transferredAsset.fundID,
					fundSize:           transferredAsset.fundSize,
					aboutFund:          transferredAsset.aboutFund,
					investmentPeriod:   transferredAsset.investmentPeriod,
					capitalCalled:      transferredAsset.capitalCalled,
					moic:               transferredAsset.moic,
					irr:                transferredAsset.irr,
					liquidity:          transferredAsset.liquidity,
					totalCommitment:    transferredAsset.totalCommitment,
					tvpi:               transferredAsset.tvpi,
					managementExpenses: transferredAsset.managementExpenses,
					otherExpenses:      transferredAsset.otherExpenses,
					carriedInterest:    transferredAsset.carriedInterest,
					distributions:      transferredAsset.distributions,
					holdingEntity:      transferredAsset.holdingEntity,
					comment:            transferredAsset.comment,
				},)

				const prevPayload = {
					clientId:           asset.clientId,
					portfolioId:        asset.portfolioId,
					entityId:           asset.clientId,
					bankId:             asset.clientId,
					accountId:          asset.accountId,
					currency:           asset.currency,
					currencyValue:      asset.currencyValue,
					marketValueUSD:     asset.marketValueUSD,
					pl:                 asset.pl,
					fundType:           asset.fundType,
					status:             asset.status,
					entryDate:          asset.entryDate,
					fundTermDate:       asset.fundTermDate,
					lastValuationDate:  asset.lastValuationDate,
					serviceProvider:    asset.serviceProvider,
					geography:          asset.geography,
					fundName:           asset.fundName,
					fundID:             asset.fundID,
					fundSize:           asset.fundSize,
					aboutFund:          asset.aboutFund,
					investmentPeriod:   asset.investmentPeriod,
					capitalCalled:      asset.capitalCalled,
					moic:               asset.moic,
					irr:                asset.irr,
					liquidity:          asset.liquidity,
					totalCommitment:    asset.totalCommitment,
					tvpi:               asset.tvpi,
					managementExpenses: asset.managementExpenses,
					otherExpenses:      asset.otherExpenses,
					carriedInterest:    asset.carriedInterest,
					distributions:      asset.distributions,
					holdingEntity:      asset.holdingEntity,
					comment:            asset.comment,
				}

				await tx.editLog.create({
					data: {
						clientId:     transferredAsset.clientId,
						portfolioId:  transferredAsset.portfolioId,
						entityId:     transferredAsset.clientId,
						bankId:       transferredAsset.clientId,
						accountId:    transferredAsset.accountId,
						instanceId:   transferredAsset.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Transfer,
						assetName:    AssetNamesType.PRIVATE_EQUITY,
						reason:       'Transfer',
						userName:     data.userInfo.name,
						userEmail:    data.userInfo.email,
						metaAfter:    {
							...prevPayload,
							clientId:        transferredAsset.clientId,
							portfolioId:     transferredAsset.portfolioId,
							accountId:       transferredAsset.accountId,
							bankId:          transferredAsset.clientId,
							entityId:        transferredAsset.clientId,
							entryDate:       transferredAsset.entryDate,
							transferDate:    asset.transferDate,
							transferAssetId: asset.id,
						},
						metaBefore: prevPayload,
					},
				},)

				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.private,)

				return {
					id:               transferredAsset.id,
					clientId:         transferredAsset.clientId,
					portfolioId:      transferredAsset.portfolioId,
					entityId:         transferredAsset.entityId,
					bankId:           transferredAsset.bankId,
					accountId:        transferredAsset.accountId,
					assetName:        transferredAsset.assetName,
					createdAt:        transferredAsset.createdAt,
					updatedAt:        transferredAsset.updatedAt,
					payload,
					isArchived:       transferredAsset.isArchived,
					isFutureDated:    transferredAsset.isFutureDated,
					rate:             transferredAsset.rate,
					portfolioDraftId: null,
				}
			}
			if (data.assetName === AssetNamesType.REAL_ESTATE) {
				const asset = await tx.assetRealEstate.update({
					where: { id, },
					data:  {
						transferDate: new Date(),
					},
				},)

				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}

				const {
					// eslint-disable-next-line no-unused-vars
					id: updatedAssetId, createdAt, updatedAt, transferAssetId, transferDate, investmentDate,
					...cleanAsset
				} = asset

				const transferredAsset = await tx.assetRealEstate.create({
					data: {
						...cleanAsset,
						clientId,
						portfolioId,
						entityId,
						bankId,
						accountId,
						investmentDate:  new Date(),
						transferAssetId: asset.id,
					},
				},)

				const payload = JSON.stringify({
					assetName:          transferredAsset.assetName,
					currency:           transferredAsset.currency,
					currencyValue:      transferredAsset.currencyValue,
					investmentDate:     transferredAsset.investmentDate,
					marketValueFC:      transferredAsset.marketValueFC,
					marketValueUSD:     transferredAsset.marketValueUSD,
					profitUSD:          transferredAsset.profitUSD,
					profitPercentage:   transferredAsset.profitPercentage,
					projectTransaction: transferredAsset.projectTransaction,
					country:            transferredAsset.country,
					city:               transferredAsset.city,
					comment:            transferredAsset.comment,
					operation:          transferredAsset.operation,
					rate:               transferredAsset.rate,
				},)

				const prevPayload = {
					clientId:           asset.clientId,
					portfolioId:        asset.portfolioId,
					entityId:           asset.clientId,
					bankId:             asset.clientId,
					accountId:          asset.accountId,
					currency:           asset.currency,
					currencyValue:      asset.currencyValue,
					investmentDate:     asset.investmentDate,
					marketValueFC:      asset.marketValueFC,
					marketValueUSD:     asset.marketValueUSD,
					profitUSD:          asset.profitUSD,
					profitPercentage:   asset.profitPercentage,
					projectTransaction: asset.projectTransaction,
					country:            asset.country,
					city:               asset.city,
					operation:          asset.operation,
					comment:            asset.comment,
					rate:               asset.rate,
				}
				await tx.editLog.create({
					data: {
						clientId:     transferredAsset.clientId,
						portfolioId:  transferredAsset.portfolioId,
						entityId:     transferredAsset.clientId,
						bankId:       transferredAsset.clientId,
						accountId:    transferredAsset.accountId,
						instanceId:   transferredAsset.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Transfer,
						assetName:    AssetNamesType.REAL_ESTATE,
						reason:       'Transfer',
						userName:     data.userInfo.name,
						userEmail:    data.userInfo.email,
						metaAfter:    {
							...prevPayload,
							clientId:        transferredAsset.clientId,
							portfolioId:     transferredAsset.portfolioId,
							accountId:       transferredAsset.accountId,
							bankId:          transferredAsset.clientId,
							entityId:        transferredAsset.clientId,
							investmentDate:  transferredAsset.investmentDate,
							transferDate:    asset.transferDate,
							transferAssetId: asset.id,
						},
						metaBefore: prevPayload,
					},
				},)

				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.real,)

				return {
					id:               transferredAsset.id,
					clientId:         transferredAsset.clientId,
					portfolioId:      transferredAsset.portfolioId,
					entityId:         transferredAsset.entityId,
					bankId:           transferredAsset.bankId,
					accountId:        transferredAsset.accountId,
					assetName:        transferredAsset.assetName,
					createdAt:        transferredAsset.createdAt,
					updatedAt:        transferredAsset.updatedAt,
					payload,
					isArchived:       transferredAsset.isArchived,
					isFutureDated:    transferredAsset.isFutureDated,
					rate:             transferredAsset.rate,
					portfolioDraftId: null,
				}
			}
			if (data.assetName === AssetNamesType.OPTIONS) {
				const asset = await tx.assetOption.update({
					where: { id, },
					data:  {
						transferDate: new Date(),
					},
				},)

				if (!asset) {
					throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
				}

				const {
					// eslint-disable-next-line no-unused-vars
					id: updatedAssetId,createdAt,	updatedAt,transferAssetId,	transferDate, startDate,
					...cleanAsset
				} = asset

				const transferredAsset = await tx.assetOption.create({
					data: {
						...cleanAsset,
						clientId,
						portfolioId,
						entityId,
						bankId,
						accountId,
						startDate:       new Date(),
						transferAssetId: asset.id,
					},
				},)

				const payload = JSON.stringify({
					comment:            transferredAsset.comment,
					currency:           transferredAsset.currency,
					startDate:          transferredAsset.startDate,
					maturityDate:       transferredAsset.maturityDate,
					pairAssetCurrency:  transferredAsset.pairAssetCurrency,
					principalValue:     transferredAsset.principalValue,
					strike:             transferredAsset.strike,
					premium:            transferredAsset.premium,
					marketOpenValue:    transferredAsset.marketOpenValue,
					currentMarketValue: transferredAsset.currentMarketValue,
					contracts:          transferredAsset.contracts,
				},)

				const prevPayload = {
					clientId:           asset.clientId,
					portfolioId:        asset.portfolioId,
					entityId:           asset.clientId,
					bankId:             asset.clientId,
					accountId:          asset.accountId,
					currency:           asset.currency,
					pairAssetCurrency:  asset.pairAssetCurrency,
					principalValue:     asset.principalValue,
					marketValueUSD:     asset.marketValueUSD,
					startDate:          asset.startDate,
					maturityDate:       asset.maturityDate,
					strike:             asset.strike,
					premium:            asset.premium,
					contracts:          asset.contracts,
					marketOpenValue:    asset.marketOpenValue,
					currentMarketValue: asset.currentMarketValue,
					comment:            asset.comment,
				}

				await tx.editLog.create({
					data: {
						clientId:     transferredAsset.clientId,
						portfolioId:  transferredAsset.portfolioId,
						entityId:     transferredAsset.clientId,
						bankId:       transferredAsset.clientId,
						accountId:    transferredAsset.accountId,
						instanceId:   transferredAsset.id,
						editedAt:     new Date(),
						instanceType: LogInstanceType.Asset,
						actionType:   LogActionType.Transfer,
						assetName:    AssetNamesType.OPTIONS,
						reason:       'Transfer',
						userName:     data.userInfo.name,
						userEmail:    data.userInfo.email,
						metaAfter:    {
							clientId:           transferredAsset.clientId,
							portfolioId:        transferredAsset.portfolioId,
							entityId:           transferredAsset.clientId,
							bankId:             transferredAsset.clientId,
							accountId:          transferredAsset.accountId,
							currency:           transferredAsset.currency,
							pairAssetCurrency:  transferredAsset.pairAssetCurrency,
							principalValue:     transferredAsset.principalValue,
							marketValueUSD:     transferredAsset.marketValueUSD,
							startDate:          transferredAsset.startDate,
							maturityDate:       transferredAsset.maturityDate,
							strike:             transferredAsset.strike,
							premium:            transferredAsset.premium,
							contracts:          transferredAsset.contracts,
							marketOpenValue:    transferredAsset.marketOpenValue,
							currentMarketValue: transferredAsset.currentMarketValue,
							comment:            transferredAsset.comment,
							transferDate:       asset.transferDate,
							transferAssetId:    asset.id,
						},
						metaBefore: prevPayload,
					},
				},)

				await this.cacheService.deleteByUrl(cacheKeysToDeleteAsset.options,)

				return {
					id:               transferredAsset.id,
					clientId:         transferredAsset.clientId,
					portfolioId:      transferredAsset.portfolioId,
					entityId:         transferredAsset.entityId,
					bankId:           transferredAsset.bankId,
					accountId:        transferredAsset.accountId,
					assetName:        transferredAsset.assetName,
					createdAt:        transferredAsset.createdAt,
					updatedAt:        transferredAsset.updatedAt,
					payload,
					isArchived:       transferredAsset.isArchived,
					isFutureDated:    transferredAsset.isFutureDated,
					rate:             transferredAsset.rate,
					portfolioDraftId: null,
				}
			}

			throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
			// const updatedAsset = await tx.asset.update({
			// 	where: { id, },
			// 	data:  {
			// 		accountId,
			// 		bankId,
			// 		entityId,
			// 		portfolioId,
			// 		clientId,
			// 		updatedAt: new Date(),
			// 	},
			// },)
		},{ timeout: 60000,},)
	}

	/**
	 * CR - 121 / Future dates enabled
			*
			* Updates currency rates for assets marked as future-dated (`isFutureDated = true`)
			* if their associated date has already occurred (i.e., asset date ≤ today).
			*
			* Process:
			* 1. Fetches all assets where `isFutureDated = true` and `assetName !== CASH`.
			* 2. Parses the asset payload to determine the relevant date based on `assetName`.
			* 3. Skips if the date is still in the future or missing.
			* 4. Finds the currency entry matching the asset's currency:
			*    - Uses the current rate if `updatedAt` is today.
			*    - Otherwise, looks up the historical rate for today's date.
			* 5. If a valid rate is found, updates the asset:
			*    - Sets the `rate` field.
			*    - Sets `isFutureDated` to `false`.
			*
			* Note: Dates are normalized to the day (`setHours(0, 0, 0, 0)`) to ensure accurate comparison.
	 */
	public async assetFutureDateRateUpdate(): Promise<void> {
		const today = new Date()
		today.setHours(0, 0, 0, 0,)
		const futureDateAssets = await this.prismaService.asset.findMany({
			where: {
				isFutureDated: true,
				NOT:           {
					assetName: AssetNamesType.CASH,
				},
			},
		},)
		const currencyData = await this.prismaService.currencyData.findMany({
			include: {
				currencyHistory: true,
			},
		},
		)
		await Promise.all(
			futureDateAssets.map(async(asset,) => {
				let date: string | null = null
				const parsedPayload = JSON.parse(asset.payload as string,)

				if (asset.assetName === AssetNamesType.BONDS) {
					date = parsedPayload.valueDate
				}
				if (asset.assetName === AssetNamesType.CRYPTO) {
					if (parsedPayload.productType === CryptoType.ETF) {
						date = parsedPayload.transactionDate
					} else {
						date = parsedPayload.purchaseDate
					}
				}
				if (asset.assetName === AssetNamesType.CASH_DEPOSIT || asset.assetName === AssetNamesType.LOAN || asset.assetName === AssetNamesType.OPTIONS || asset.assetName === AssetNamesType.COLLATERAL) {
					date = parsedPayload.startDate
				}
				if (asset.assetName === AssetNamesType.EQUITY_ASSET || asset.assetName === AssetNamesType.METALS) {
					date = parsedPayload.transactionDate
				}
				if (asset.assetName === AssetNamesType.OTHER || asset.assetName === AssetNamesType.REAL_ESTATE) {
					date = parsedPayload.investmentDate
				}
				if (asset.assetName === AssetNamesType.PRIVATE_EQUITY) {
					date = parsedPayload.entryDate
				}
				if (!date) {
					throw new HttpException(ERROR_MESSAGES.ASSET_DATE_MISSING, HttpStatus.BAD_REQUEST,)
				}
				const assetDate = new Date(date,)
				assetDate.setHours(0, 0, 0, 0,)
				if (assetDate > today) {
					return
				}
				const currencyEntry = currencyData.find((entry,) => {
					return entry.currency === parsedPayload.currency
				},
				)
				if (!currencyEntry) {
					return
				}
				let rateValue: number | null = null
				if (currencyEntry.updatedAt.toDateString() === assetDate.toDateString()) {
					rateValue = currencyEntry.rate
				} else {
					const historyEntry = currencyEntry.currencyHistory.find((h,) => {
						return new Date(h.date,).toDateString() === assetDate.toDateString()
					},
					)
					if (historyEntry) {
						rateValue = historyEntry.rate
					}
				}
				if (rateValue === null) {
					return
				}
				await this.prismaService.asset.update({
					where: { id: asset.id, },
					data:  {
						rate:          rateValue,
						isFutureDated: false,
					},
				},)
			},),
		)
	}

	public async bondAssetRefactoredHandle(): Promise<void> {
		const [bonds, currencyList, historyCurrencyData,] = await Promise.all([
			this.cBondsCurrencyService.getAllBondsWithHistory(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.currencyHistoryData.findMany(),
		],)
		const oldBonds = await this.prismaService.asset.findMany({
			where: { assetName: AssetNamesType.BONDS, clientId: '93936e3b-7598-48c8-ab5c-67863bcfd03d',},
		},)

		for (const oldBond of oldBonds) {
			if (!oldBond.clientId || !oldBond.portfolioId || !oldBond.entityId || !oldBond.bankId || !oldBond.accountId) {
				continue
			}
			const payload = JSON.parse(oldBond.payload as string,)
			const bond = bonds.find((bond,) => {
				return bond.isin === payload.isin
			},)
			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find((item,) => {
				return item.currency === payload.currency
			},)

			let group = await this.prismaService.assetBondGroup.findFirst({
				where: {
					accountId: oldBond.accountId,
					currency:  payload.currency,
					isin:      payload.isin,
				},
				include: {
					bonds: true,
				},
			},)

			if (!currencyData) {
				continue
			}
			let unitsChange = 0
			if (payload.operation === AssetOperationType.BUY) {
				unitsChange = payload.units
			}
			if (payload.operation === AssetOperationType.SELL) {
				unitsChange = 0 - payload.units
			}
			const {rate,} = currencyData
			const marketPrice = bond?.marketPrice ?? 0
			const dirtyPriceCurrency = bond?.dirtyPriceCurrency ??	null
			const nominalPrice = bond?.nominalPrice ?
				String(bond.nominalPrice,) :
				null
			const bondYield = bond?.yield ?? 0
			const accrued = bond?.accrued ?? null
			const costPrice = payload.unitPrice
			const marketValueUSD = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
				isin:  payload.isin,
				units:              Number(payload.units,),
				dirtyPriceCurrency,
				nominalPrice,
				rate,
				marketPrice,
			},)
			const marketValueFC = this.cBondsCurrencyService.getBondsMarketValueUSDNew({
				isin:  payload.isin,
				units:              Number(payload.units,),
				dirtyPriceCurrency,
				nominalPrice,
				rate:               1,
				marketPrice,
			},)
			const costRateDate = new Date(payload.valueDate,)
			// const costCurrencyData = (historyCurrencyData
			// 	.filter((item,) => {
			// 		return new Date(item.date,).getTime() <= costRateDate.getTime() && currencyData?.id === item.currencyId
			// 	},)
			// 	.sort((a, b,) => {
			// 		return new Date(b.date,).getTime() - new Date(a.date,).getTime()
			// 	},)[0])
			const costCurrencyData = historyCurrencyData
				.filter((item,) => {
					return new Date(item.date,).getTime() >= costRateDate.getTime() && item.currencyId === currencyData?.id
				},)
				.sort((a, b,) => {
					return new Date(a.date,).getTime() - new Date(b.date,).getTime()
				},)[0]
			const costValueFC = (payload.units * Math.round(payload.unitPrice * 100,) / 100 * 10) + (payload.accrued)
			const costValueUSD = costValueFC * (costCurrencyData?.rate ?? rate)

			const profitUSD = Number(marketValueUSD,) - Number(costValueUSD,)
			const profitPercentage = costPrice > 0 ?
				((Number(marketPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
				0
			const currentYield = Number(bondYield,) * 100
			const currentAccrued = nominalPrice && accrued  ?
				Number(accrued,) / Number(nominalPrice,) * Number(payload.units,) * 1000 * rate :
				0
			const newPayload = {
				...payload,
				marketValueUSD,
				costValueUSD,
				marketValueFC,
				costValueFC,
				profitUSD,
				profitPercentage,
			}
			if (group) {
				const accountAssets = [...(group.bonds), newPayload,]

				const totalValue = accountAssets.reduce((sum, a,) => {
					if (a.operation === 'Sell') {
						return sum
					}
					return sum + (a.unitPrice * a.units)
				}, 0,)

				const totalUnits = accountAssets.reduce((sum, a,) => {
					if (a.operation === 'Sell') {
						return sum
					}
					return sum + a.units
				}, 0,)
				const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
					if (a.operation === 'Sell') {
						return sum - a.units
					}
					return sum + a.units
				}, 0,)

				const costPrice = totalUnits > 0 ?
					totalValue / totalUnits :
					0
				const costValueUSD = accountAssets.reduce((sum, a,) => {
					if (a.operation === 'Sell') {
						return sum - a.costValueUSD
					}
					return sum + a.costValueUSD
				}, 0,)
				const costValueFC = accountAssets.reduce((sum, a,) => {
					if (a.operation === 'Sell') {
						return sum - a.costValueFC
					}
					return sum + a.costValueFC
				}, 0,)

				const marketValueUSD = accountAssets.reduce((sum, a,) => {
					if (a.operation === 'Sell') {
						return sum - a.marketValueUSD
					}
					return sum + a.marketValueUSD
				}, 0,)
				const marketValueFC = accountAssets.reduce((sum, a,) => {
					if (a.operation === 'Sell') {
						return sum - a.marketValueFC
					}
					return sum + a.marketValueFC
				}, 0,)

				const profitUSD = accountAssets.reduce((sum, a,) => {
					return sum + a.profitUSD
				}, 0,)
				const profitPercentage =
		costPrice > 0 ?
			((Number(marketPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
			0
				const {valueDate,} = accountAssets.reduce((latest, current,) => {
					return new Date(current.valueDate,) > new Date(latest.valueDate,) ?
						current :
						latest
				},)
				await this.prismaService.assetBondGroup.update({
					where: { id: group.id, },
					data:  {
						totalUnits: totalBuySellUnits,
						costPrice,
						costValueFC,
						costValueUSD,
						marketValueFC,
						marketValueUSD,
						profitUSD,
						profitPercentage,
						valueDate,
					},
				},)
			} else {
				group = await this.prismaService.assetBondGroup.create({
					data: {
						client:         { connect: { id: oldBond.clientId, }, },
						account:        { connect: { id: oldBond.accountId, }, },
						entity:         { connect: { id: oldBond.entityId, }, },
						bank:           { connect: { id: oldBond.bankId, }, },
						portfolio:      { connect: { id: oldBond.portfolioId, }, },
						currency:         payload.currency,
						isin:             payload.isin,
						assetName:        oldBond.assetName,
						isArchived:       oldBond.isArchived,
						valueDate:       new Date(payload.valueDate,),
						totalUnits:       unitsChange,
						costPrice,
						costValueFC,
						costValueUSD,
						marketValueFC,
						marketValueUSD,
						profitUSD,
						profitPercentage,
						yield:          currentYield,
						security:       payload.security,
						accrued:        currentAccrued,
						nextCouponDate: bond?.nextCouponDate ?? undefined,
						issuer:         bond?.issuer ?? 'N/A',
						maturityDate:   bond?.maturityDate ?? undefined,
						sector:         bond?.sector ?? 'N/A',
						coupon:         bond?.coupon ?? 'N/A',
						country:        bond?.country ?? 'N/A',
						marketPrice,
					},
					include: {
						bonds: true,
					},
				},)
			}
			await this.prismaService.assetBond.create({
				data: {
					clientId:         oldBond.clientId,
					portfolioId:      oldBond.portfolioId,
					entityId:         oldBond.entityId,
					bankId:           oldBond.bankId,
					accountId:        oldBond.accountId,
					assetName:        oldBond.assetName,

					currency:  payload.currency,
					security:  payload.security,
					operation: payload.operation,
					valueDate: new Date(payload.valueDate,),
					isin:      payload.isin,
					units:     payload.units,
					unitPrice: payload.unitPrice,
					bankFee:   payload.bankFee,
					accrued:   payload.accrued,
					yield:      currentYield,

					costPrice:        payload.unitPrice,
					costValueFC,
					costValueUSD,
					marketValueFC,
					marketValueUSD,
					profitUSD,
					profitPercentage,
					nextCouponDate: bond?.nextCouponDate ?? undefined,
					issuer:         bond?.issuer ?? 'N/A',
					maturityDate:   bond?.maturityDate ?? undefined,
					sector:         bond?.sector ?? 'N/A',
					coupon:         bond?.coupon ?? 'N/A',
					country:        bond?.country ?? 'N/A',
					marketPrice,

					rate:          oldBond.rate!,
					isFutureDated: oldBond.isFutureDated,
					groupId:       group.id,
					comment:       payload.comment,
				},
			},)
		}
	}

	public async equityAssetRefactoredHandle(): Promise<void> {
		const [equities, etfs, currencyList,equityIsins,] = await Promise.all([
			this.cBondsCurrencyService.getAllEquitiesWithHistory(),
			this.cBondsCurrencyService.getAllEtfsWithHistory(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.isins.findMany({
				where: {
					typeId: { in: ['2', '3',], },
				},
			},),
		],)
		const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
			return [isin, typeId,]
		},),)
		const oldEquities = await this.prismaService.asset.findMany({
			where: { assetName: AssetNamesType.EQUITY_ASSET, clientId: '93936e3b-7598-48c8-ab5c-67863bcfd03d', },
		},)

		for (const oldEquity of oldEquities) {
			if (!oldEquity.clientId || !oldEquity.portfolioId || !oldEquity.entityId || !oldEquity.bankId || !oldEquity.accountId) {
				continue
			}
			const payload = JSON.parse(oldEquity.payload as string,)

			const equity = equities.find((e,) => {
				return e.isin === payload.isin
			},)
			const etf = etfs.find((e,) => {
				return e.isin === payload.isin
			},)
			const currencyData: TCurrencyDataWithHistory | undefined = currencyList.find(
				(c,) => {
					return c.currency === payload.currency
				},
			)
			if (!currencyData) {
				continue
			}
			const { rate, } = currencyData
			const lastPrice = equity ?
				equity.currencyName === 'GBX' ?
					equity.lastPrice / 100 :
					equity.lastPrice :
				etf ?
					etf.currencyName === 'GBX' ?
						etf.close / 100 :
						etf.close :
					0
			const emitentName = equity?.emitentName ?? etf?.fundsName ?? 'N/A'
			const branchName = equity?.branchName ?? etf?.sectorName ?? 'N/A'
			const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'
			let unitsChange = 0
			if (payload.operation === AssetOperationType.BUY) {
				unitsChange = payload.units
			}
			if (payload.operation === AssetOperationType.SELL) {
				unitsChange = 0 - payload.units
			}

			const costPrice = payload.transactionPrice
			const costValueUSD = Number(payload.units,) * Number(costPrice,) * rate
			const costValueFC = Number(payload.units,) * Number(costPrice,)
			const marketValueFC = Number(payload.units,) * Number(lastPrice,)
			const marketValueUSD = Number(marketValueFC,) * rate

			const profitUSD = Number(marketValueUSD,) - Number(costValueUSD,)
			const profitPercentage = costPrice > 0 ?
				((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100	:
				0

			let group = await this.prismaService.assetEquityGroup.findFirst({
				where: {
					accountId: oldEquity.accountId,
					currency:  payload.currency,
					isin:      payload.isin,
				},
				include: {
					equities: true,
				},
			},)

			const newPayload = {
				...payload,
				marketValueUSD,
				costValueUSD,
				marketValueFC,
				costValueFC,
				profitUSD,
				profitPercentage,
			}
			const typeId = isinTypeMap.get(payload.isin,)
			const type = typeId === '2' ?
				EquityType.Equity :
				EquityType.ETF
			if (group) {
				const accountAssets = [...group.equities, newPayload,]

				const totalValue = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum
					}
					return sum + ((a.transactionPrice ?? 0) * a.units)
				}, 0,)

				const totalUnits = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum
					}
					return sum + a.units
				}, 0,)

				const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum - a.units
					}
					return sum + a.units
				}, 0,)

				const costPrice = totalUnits > 0 ?
					totalValue / totalUnits :
					0
				const costValueUSD = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum - a.costValueUSD
					}
					return sum + a.costValueUSD
				}, 0,)

				const costValueFC = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum - a.costValueFC
					}
					return sum + a.costValueFC
				}, 0,)

				const marketValueUSD = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum - a.marketValueUSD
					}
					return sum + a.marketValueUSD
				}, 0,)

				const marketValueFC = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum - a.marketValueFC
					}
					return sum + a.marketValueFC
				}, 0,)

				const profitUSD = accountAssets.reduce((sum, a,) => {
					if (a.operation === AssetOperationType.SELL) {
						return sum - a.profitUSD
					}
					return sum + a.profitUSD
				}, 0,)
				const profitPercentage = costPrice > 0 ?
					((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
					0
				const {transactionDate,} = accountAssets.reduce((latest, current,) => {
					return new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
						current :
						latest
				},)

				await this.prismaService.assetEquityGroup.update({
					where: { id: group.id, },
					data:  {
						totalUnits:        totalBuySellUnits,
						costPrice,
						costValueFC,
						costValueUSD,
						marketValueFC,
						marketValueUSD,
						profitUSD,
						profitPercentage,
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						transactionDate,
					},
				},)
			} else {
				group = await this.prismaService.assetEquityGroup.create({
					data: {
						client:            { connect: { id: oldEquity.clientId, }, },
						account:           { connect: { id: oldEquity.accountId, }, },
						entity:            { connect: { id: oldEquity.entityId, }, },
						bank:              { connect: { id: oldEquity.bankId, }, },
						portfolio:         { connect: { id: oldEquity.portfolioId, }, },
						currency:          payload.currency,
						isin:              payload.isin,
						assetName:         oldEquity.assetName,
						isArchived:        oldEquity.isArchived,
						totalUnits:        unitsChange,
						costPrice,
						costValueFC,
						costValueUSD,
						marketValueFC,
						marketValueUSD,
						profitUSD,
						profitPercentage,
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						security:          payload.security,
						transactionDate:         new Date(payload.transactionDate,),
						type,
					},
					include: { equities: true, },
				},)
			}
			await this.prismaService.assetEquity.create({
				data: {
					clientId:         oldEquity.clientId,
					portfolioId:      oldEquity.portfolioId,
					entityId:         oldEquity.entityId,
					bankId:           oldEquity.bankId,
					accountId:        oldEquity.accountId,
					assetName:        oldEquity.assetName,

					currency:          payload.currency,
					security:          payload.security,
					operation:         payload.operation,
					transactionDate:         new Date(payload.transactionDate,),
					transactionPrice:        payload.transactionPrice,
					bankFee:           payload.bankFee,
					equityType:           payload.equityType,
					isin:              payload.isin,
					units:             payload.units,
					costPrice,
					costValueUSD,
					costValueFC,
					marketValueUSD,
					marketValueFC,
					profitUSD,
					profitPercentage,
					issuer:            emitentName,
					sector:            branchName,
					country:           stockCountryName,
					currentStockPrice: lastPrice,
					rate,
					isFutureDated:     oldEquity.isFutureDated,
					groupId:           group.id,
					comment:           payload.comment,
					type,
				},
			},)
		}
	}

	public async depositAssetRefactoredHandle(): Promise<void> {
		const [oldDeposits, currencyList,] = await Promise.all([
			this.prismaService.asset.findMany({
				where: { assetName: AssetNamesType.CASH_DEPOSIT, },
			},),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
		],)

		for (const asset of oldDeposits) {
			if (!asset.clientId || !asset.portfolioId || !asset.entityId || !asset.bankId || !asset.accountId) {
				continue
			}
			const payload = JSON.parse(asset.payload as string,)
			const currencyData = currencyList.find((item,) => {
				return item.currency === payload.currency
			},)
			if (!currencyData) {
				continue
			}
			const usdValue = currencyData.rate * payload.currencyValue
			await this.prismaService.assetDeposit.create({
				data: {
					client:       { connect: { id: asset.clientId, }, },
					portfolio:    { connect: { id: asset.portfolioId, }, },
					entity:       { connect: { id: asset.entityId, }, },
					bank:         { connect: { id: asset.bankId, }, },
					account:      { connect: { id: asset.accountId, }, },
					assetName:        asset.assetName,
					usdValue,
					currency:      payload.currency,
					interest:      payload.interest,
					startDate:     payload.startDate,
					maturityDate:  payload.maturityDate ?
						payload.maturityDate :
						undefined,
					policy:        payload.policy,
					currencyValue: payload.currencyValue,
					toBeMatured:   payload.toBeMatured ?
						payload.toBeMatured :
						false,
					comment:       payload.comment,
					rate:          asset.rate ?? 1,
					isFutureDated: payload.isFutureDated,
				},
			},)
		}
	}

	public async cryptoAssetRefactoredHandle(): Promise<void> {
		const [equities, etfs, currencyList, cryptoData, equityIsins,] = await Promise.all([
			this.cBondsCurrencyService.getAllEquitiesWithHistory(),
			this.cBondsCurrencyService.getAllEtfsWithHistory(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.cryptoData.findMany(),
			this.prismaService.isins.findMany({
				where: {
					typeId: { in: ['2', '3',], },
				},
			},),
		],)
		const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
			return [isin, typeId,]
		},),)
		const oldCryptos = await this.prismaService.asset.findMany({
			where: { assetName: AssetNamesType.CRYPTO, },
		},)

		for (const oldCrypto of oldCryptos) {
			if (!oldCrypto.clientId || !oldCrypto.portfolioId || !oldCrypto.entityId || !oldCrypto.bankId || !oldCrypto.accountId) {
				continue
			}

			const payload = JSON.parse(oldCrypto.payload as string,)

			const isCryptoDirect = payload.productType === CryptoType.DIRECT_HOLD
			const isCryptoETF = payload.productType === CryptoType.ETF
			if (isCryptoETF) {
				const equity = equities.find((e,) => {
					return e.isin === payload.isin
				},)
				const etf = etfs.find((e,) => {
					return e.isin === payload.isin
				},)

				const currencyData = currencyList.find((c,) => {
					return c.currency === (payload.currency)
				},)
				if (!currencyData) {
					continue
				}
				const { rate, } = currencyData
				const lastPrice = equity ?
					equity.currencyName === 'GBX' ?
						equity.lastPrice / 100 :
						equity.lastPrice :
					etf ?
						etf.currencyName === 'GBX' ?
							etf.close / 100 :
							etf.close :
						0

				const emitentName = equity?.emitentName ?? etf?.fundsName ?? 'N/A'
				const branchName = equity?.branchName ?? etf?.sectorName ?? 'N/A'
				const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

				const units = payload.cryptoAmount ?? payload.units ?? 0
				const costPrice = payload.purchasePrice ?? payload.transactionPrice ?? 0
				const costValueFC = Number(units,) * Number(costPrice,)
				const costValueUSD = costValueFC * rate
				const marketValueFC = Number(units,) * Number(lastPrice,)
				const marketValueUSD = marketValueFC * rate
				const profitUSD = marketValueUSD - costValueUSD
				const profitPercentage = costPrice > 0 ?
					((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
					0
				let group = await this.prismaService.assetCryptoGroup.findFirst({
					where: {
						accountId: oldCrypto.accountId,
						currency:  payload.currency,
						isin:      payload.isin,
					},
					include: { cryptos: true, },
				},)

				const newPayload = {
					...payload,
					marketValueUSD,
					costValueUSD,
					marketValueFC,
					costValueFC,
					profitUSD,
					profitPercentage,
				}
				const typeId = isinTypeMap.get(payload.isin,)
				const type = typeId === '2' ?
					EquityType.Equity :
					EquityType.ETF
				if (group) {
					const accountAssets = [...group.cryptos, newPayload,]

					const totalValue = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum
						}
						return sum + ((a.transactionPrice ?? 0) * a.units)
					}, 0,)

					const totalUnits = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum
						}
						return sum + a.units
					}, 0,)
					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.units
						}
						return sum + a.units
					}, 0,)

					const costPrice = totalUnits > 0 ?
						totalValue / totalUnits :
						0
					const costValueUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.costValueUSD
						}
						return sum + a.costValueUSD
					}, 0,)

					const costValueFC = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.costValueFC
						}
						return sum + a.costValueFC
					}, 0,)

					const marketValueUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.marketValueUSD
						}
						return sum + a.marketValueUSD
					}, 0,)

					const marketValueFC = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.marketValueFC
						}
						return sum + a.marketValueFC
					}, 0,)
					const profitUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.profitUSD
						}
						return sum + a.profitUSD
					}, 0,)
					const {transactionDate,} = accountAssets.reduce((latest, current,) => {
						return new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
							current :
							latest
					},)
					await this.prismaService.assetCryptoGroup.update({
						where: { id: group.id, },
						data:  {
							totalUnits:        totalBuySellUnits,
							costPrice,
							costValueFC,
							costValueUSD,
							marketValueFC,
							marketValueUSD,
							profitUSD,
							profitPercentage,
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							transactionDate,
						},
					},)
				} else {
					group = await this.prismaService.assetCryptoGroup.create({
						data: {
							client:            { connect: { id: oldCrypto.clientId, }, },
							account:           { connect: { id: oldCrypto.accountId, }, },
							entity:            { connect: { id: oldCrypto.entityId, }, },
							bank:              { connect: { id: oldCrypto.bankId, }, },
							portfolio:         { connect: { id: oldCrypto.portfolioId, }, },
							productType:       CryptoType.ETF,
							currency:          payload.currency,
							isin:              payload.isin,
							security:          payload.security,
							assetName:         oldCrypto.assetName,
							isArchived:        oldCrypto.isArchived,
							totalUnits:        units,
							costPrice,
							costValueFC,
							costValueUSD,
							marketValueFC,
							marketValueUSD,
							profitUSD,
							profitPercentage,
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							transactionPrice:  payload.transactionPrice,
							transactionDate:   new Date(payload.transactionDate,),
							type,
						},
						include: { cryptos: true, },
					},)
				}

				await this.prismaService.assetCrypto.create({
					data: {
						clientId:          oldCrypto.clientId,
						portfolioId:       oldCrypto.portfolioId,
						entityId:          oldCrypto.entityId,
						bankId:            oldCrypto.bankId,
						accountId:         oldCrypto.accountId,
						assetName:         oldCrypto.assetName,
						productType:       CryptoType.ETF,
						currency:          payload.currency,
						security:          payload.security,
						operation:         payload.operation,
						transactionDate:   new Date(payload.transactionDate,),
						transactionPrice:  payload.transactionPrice,
						bankFee:           payload.bankFee ?? 0,
						isin:              payload.isin,
						units,
						costPrice,
						costValueUSD,
						costValueFC,
						marketValueUSD,
						marketValueFC,
						profitUSD,
						profitPercentage,
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						rate,
						isFutureDated:     oldCrypto.isFutureDated,
						groupId:           group.id,
						comment:           payload.comment,
						type,
					},
				},)
			} else if (isCryptoDirect) {
				const cryptoCurrencyData = cryptoData.find((c,) => {
					return c.token === (payload.cryptoCurrencyType)
				},)
				if (!cryptoCurrencyData) {
					continue
				}
				const { rate, } = cryptoCurrencyData
				const costValueUsd = payload.purchasePrice * payload.cryptoAmount
				const marketValueUsd = parseFloat((payload.cryptoAmount * rate).toFixed(2,),)
				const profitUsd = marketValueUsd - costValueUsd
				const profitPercentage = profitUsd / costValueUsd * 100
				const group = await this.prismaService.assetCryptoGroup.create({
					data: {
						client:             { connect: { id: oldCrypto.clientId, }, },
						account:            { connect: { id: oldCrypto.accountId, }, },
						entity:             { connect: { id: oldCrypto.entityId, }, },
						bank:               { connect: { id: oldCrypto.bankId, }, },
						portfolio:          { connect: { id: oldCrypto.portfolioId, }, },
						productType:        CryptoType.DIRECT_HOLD,
						assetName:          oldCrypto.assetName,
						isArchived:         oldCrypto.isArchived,
						exchangeWallet:     payload.exchangeWallet,
						cryptoCurrencyType: payload.cryptoCurrencyType,
						cryptoAmount:       payload.cryptoAmount,
						purchaseDate:       new Date(payload.purchaseDate,),
						purchasePrice:      payload.purchasePrice,
						costValueUSD:       costValueUsd,
						costValueFC:        costValueUsd,
						marketValueUSD:     marketValueUsd,
						marketValueFC:      marketValueUsd,
						profitUSD:          profitUsd,
						profitPercentage,
						totalUnits:         payload.cryptoAmount,
					},
				},)

				await this.prismaService.assetCrypto.create({
					data: {
						assetName:          oldCrypto.assetName,
						clientId:           oldCrypto.clientId,
						portfolioId:        oldCrypto.portfolioId,
						entityId:           oldCrypto.entityId,
						bankId:             oldCrypto.bankId,
						accountId:          oldCrypto.accountId,
						productType:        CryptoType.DIRECT_HOLD,
						exchangeWallet:     payload.exchangeWallet,
						cryptoCurrencyType: payload.cryptoCurrencyType,
						cryptoAmount:       payload.cryptoAmount,
						purchaseDate:       new Date(payload.purchaseDate,),
						purchasePrice:      payload.purchasePrice,
						costValueUSD:       costValueUsd,
						costValueFC:        costValueUsd,
						marketValueUSD:     marketValueUsd,
						marketValueFC:      marketValueUsd,
						profitUSD:          profitUsd,
						profitPercentage,
						rate,
						isFutureDated:      oldCrypto.isFutureDated,
						groupId:            group.id,
						comment:            payload.comment,
					},
				},)
			}
		}
	}

	public async metalAssetRefactoredHandle(): Promise<void> {
		const [equities, etfs, currencyList, metalData, equityIsins,] = await Promise.all([
			this.cBondsCurrencyService.getAllEquitiesWithHistory(),
			this.cBondsCurrencyService.getAllEtfsWithHistory(),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.metalData.findMany(),
			this.prismaService.isins.findMany({
				where: {
					typeId: { in: ['2', '3',], },
				},
			},),
		],)
		const isinTypeMap = new Map(equityIsins.map(({ isin, typeId, },) => {
			return [isin, typeId,]
		},),)
		const oldMetals = await this.prismaService.asset.findMany({
			where: { assetName: AssetNamesType.METALS, },
		},)

		for (const oldMetal of oldMetals) {
			if (!oldMetal.clientId || !oldMetal.portfolioId || !oldMetal.entityId || !oldMetal.bankId || !oldMetal.accountId) {
				continue
			}

			const payload = JSON.parse(oldMetal.payload as string,)

			const isMetalDirect = payload.productType === MetalType.DIRECT_HOLD
			const isMetalETF = payload.productType === MetalType.ETF

			if (isMetalETF) {
				const equity = equities.find((e,) => {
					return e.isin === payload.isin
				},)
				const etf = etfs.find((e,) => {
					return e.isin === payload.isin
				},)

				const currencyData = currencyList.find((c,) => {
					return c.currency === (payload.currency)
				},)
				if (!currencyData) {
					continue
				}
				const { rate, } = currencyData
				const lastPrice = equity ?
					equity.currencyName === 'GBX' ?
						equity.lastPrice / 100 :
						equity.lastPrice :
					etf ?
						etf.currencyName === 'GBX' ?
							etf.close / 100 :
							etf.close :
						0

				const emitentName = equity?.emitentName ?? etf?.fundsName ?? 'N/A'
				const branchName = equity?.branchName ?? etf?.sectorName ?? 'N/A'
				const stockCountryName = equity?.stockCountryName ?? etf?.geographyInvestmentName ?? 'N/A'

				const units = payload.cryptoAmount ?? payload.units ?? 0
				const costPrice = payload.purchasePrice ?? payload.transactionPrice ?? 0
				const costValueFC = Number(units,) * Number(costPrice,)
				const costValueUSD = costValueFC * rate
				const marketValueFC = Number(units,) * Number(lastPrice,)
				const marketValueUSD = marketValueFC * rate
				const profitUSD = marketValueUSD - costValueUSD
				const profitPercentage = costPrice > 0 ?
					((Number(lastPrice,) - Number(costPrice,)) / Number(costPrice,)) * 100 :
					0
				let group = await this.prismaService.assetMetalGroup.findFirst({
					where: {
						accountId: oldMetal.accountId,
						currency:  payload.currency,
						isin:      payload.isin,
					},
					include: { metals: true, },
				},)

				const newPayload = {
					...payload,
					marketValueUSD,
					costValueUSD,
					marketValueFC,
					costValueFC,
					profitUSD,
					profitPercentage,
				}
				const typeId = isinTypeMap.get(payload.isin,)
				const type = typeId === '2' ?
					EquityType.Equity :
					EquityType.ETF
				if (group) {
					const accountAssets = [...group.metals, newPayload,]

					const totalValue = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum
						}
						return sum + ((a.transactionPrice ?? 0) * a.units)
					}, 0,)

					const totalUnits = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum
						}
						return sum + a.units
					}, 0,)
					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.units
						}
						return sum + a.units
					}, 0,)

					const costPrice = totalUnits > 0 ?
						totalValue / totalUnits :
						0
					const costValueUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.costValueUSD
						}
						return sum + a.costValueUSD
					}, 0,)

					const costValueFC = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.costValueFC
						}
						return sum + a.costValueFC
					}, 0,)

					const marketValueUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.marketValueUSD
						}
						return sum + a.marketValueUSD
					}, 0,)

					const marketValueFC = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.marketValueFC
						}
						return sum + a.marketValueFC
					}, 0,)
					const profitUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.profitUSD
						}
						return sum + a.profitUSD
					}, 0,)
					const {transactionDate,} = accountAssets.reduce((latest, current,) => {
						return new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
							current :
							latest
					},)
					await this.prismaService.assetMetalGroup.update({
						where: { id: group.id, },
						data:  {
							totalUnits:        totalBuySellUnits,
							costPrice,
							costValueFC,
							costValueUSD,
							marketValueFC,
							marketValueUSD,
							profitUSD,
							profitPercentage,
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							transactionDate,
						},
					},)
				} else {
					group = await this.prismaService.assetMetalGroup.create({
						data: {
							client:            { connect: { id: oldMetal.clientId, }, },
							account:           { connect: { id: oldMetal.accountId, }, },
							entity:            { connect: { id: oldMetal.entityId, }, },
							bank:              { connect: { id: oldMetal.bankId, }, },
							portfolio:         { connect: { id: oldMetal.portfolioId, }, },
							productType:       MetalType.ETF,
							currency:          payload.currency,
							isin:              payload.isin,
							security:          payload.security,
							assetName:         oldMetal.assetName,
							isArchived:        oldMetal.isArchived,
							totalUnits:        units,
							costPrice,
							costValueFC,
							costValueUSD,
							marketValueFC,
							marketValueUSD,
							profitUSD,
							profitPercentage,
							issuer:            emitentName,
							sector:            branchName,
							country:           stockCountryName,
							currentStockPrice: lastPrice,
							transactionPrice:  payload.transactionPrice,
							transactionDate:   new Date(payload.transactionDate,),
							type,
						},
						include: { metals: true, },
					},)
				}

				await this.prismaService.assetMetal.create({
					data: {
						clientId:          oldMetal.clientId,
						portfolioId:       oldMetal.portfolioId,
						entityId:          oldMetal.entityId,
						bankId:            oldMetal.bankId,
						accountId:         oldMetal.accountId,
						assetName:         oldMetal.assetName,
						productType:       MetalType.ETF,
						currency:          payload.currency,
						security:          payload.security,
						operation:         payload.operation,
						transactionDate:   new Date(payload.transactionDate,),
						transactionPrice:  payload.transactionPrice,
						bankFee:           payload.bankFee ?? 0,
						isin:              payload.isin,
						units,
						costPrice,
						costValueUSD,
						costValueFC,
						marketValueUSD,
						marketValueFC,
						profitUSD,
						profitPercentage,
						issuer:            emitentName,
						sector:            branchName,
						country:           stockCountryName,
						currentStockPrice: lastPrice,
						rate,
						isFutureDated:     oldMetal.isFutureDated,
						groupId:           group.id,
						comment:           payload.comment,
						type,
					},
				},)
			} else if (isMetalDirect) {
				const metalCurrencyData = metalData.find((c,) => {
					return c.currency === (payload.metalType)
				},)
				const currencyData = currencyList.find((c,) => {
					return c.currency === (payload.currency)
				},)
				if (!metalCurrencyData || !currencyData) {
					continue
				}
				const getMetalFullName = (metalName: MetalDataList,): string => {
					switch (metalName) {
					case MetalDataList.XAU:
						return 'Gold'
					case MetalDataList.XAG:
						return 'Silver'
					case MetalDataList.XPT:
						return 'Platinum'
					case MetalDataList.XPD:
						return 'Palladium'
					default:
						throw new Error('Unknown metal',)
					}
				}
				const { rate, currency,} = metalCurrencyData
				const {rate: currencyRate,} = currencyData
				const metalName = getMetalFullName(currency,)
				const metalMarketPrice =  parseFloat((rate / currencyRate).toFixed(2,),)
				const costValueUSD = payload.purchasePrice * payload.units
				const costValueFC = payload.purchasePrice * payload.units
				const marketValueUSD = parseFloat((payload.units * rate).toFixed(2,),)
				const marketValueFC = payload.units * metalMarketPrice
				const profitUSD = marketValueUSD - costValueUSD
				const profitPercentage = profitUSD / costValueUSD * 100
				let group = await this.prismaService.assetMetalGroup.findFirst({
					where: {
						accountId: oldMetal.accountId,
						currency:  payload.currency,
						metalType: payload.metalType,
					},
					include: { metals: true, },
				},)

				const newPayload = {
					...payload,
					units:            payload.units,
					costPrice:        payload.purchasePrice,
					transactionPrice: payload.purchasePrice,
					costValueUSD,
					costValueFC,
					marketValueUSD,
					marketValueFC,
					profitUSD,
					profitPercentage,
				}
				if (group) {
					const accountAssets = [...group.metals, newPayload,]
					const { rate: metalRate, } = metalCurrencyData

					const totalValue = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum
						}
						return sum + ((a.transactionPrice ?? 0) * a.units)
					}, 0,)

					const totalUnits = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum
						}
						return sum + a.units
					}, 0,)
					const totalBuySellUnits = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.units
						}
						return sum + a.units
					}, 0,)

					const costPrice = totalUnits > 0 ?
						totalValue / totalUnits :
						0
					const costValueUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.costValueUSD
						}
						return sum + a.costValueUSD
					}, 0,)

					const costValueFC = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.costValueFC
						}
						return sum + a.costValueFC
					}, 0,)

					const marketValueUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.marketValueUSD
						}
						return sum + a.marketValueUSD
					}, 0,)

					const marketValueFC = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.marketValueFC
						}
						return sum + a.marketValueFC
					}, 0,)
					const profitUSD = accountAssets.reduce((sum, a,) => {
						if (a.operation === AssetOperationType.SELL) {
							return sum - a.profitUSD
						}
						return sum + a.profitUSD
					}, 0,)
					const {transactionDate,} = accountAssets.reduce((latest, current,) => {
						return new Date(current.transactionDate,) > new Date(latest.transactionDate,) ?
							current :
							latest
					},)
					await this.prismaService.assetMetalGroup.update({
						where: { id: group.id, },
						data:  {
							totalUnits: totalBuySellUnits,
							costPrice,
							costValueUSD,
							marketValueUSD,
							profitUSD,
							profitPercentage,
							transactionDate,
							costValueFC,
							marketValueFC,
							metalPrice: metalRate,
						},
					},)
				} else {
					group = await this.prismaService.assetMetalGroup.create({
						data: {
							client:            { connect: { id: oldMetal.clientId, }, },
							account:           { connect: { id: oldMetal.accountId, }, },
							entity:            { connect: { id: oldMetal.entityId, }, },
							bank:              { connect: { id: oldMetal.bankId, }, },
							portfolio:         { connect: { id: oldMetal.portfolioId, }, },
							productType:       MetalType.DIRECT_HOLD,
							metalType:         payload.metalType,
							currency:          payload.currency,
							assetName:         oldMetal.assetName,
							isArchived:        oldMetal.isArchived,
							transactionDate:   new Date(payload.transactionDate,),
							transactionPrice:  payload.purchasePrice,
							costValueUSD,
							marketValueUSD,
							profitUSD,
							profitPercentage,
							costValueFC,
							marketValueFC,
							currentStockPrice: metalMarketPrice,
							costPrice:         payload.purchasePrice,
							totalUnits:        payload.units,
							metalName,
							metalPrice:        rate,
						},
						include: { metals: true, },
					},)
				}

				await this.prismaService.assetMetal.create({
					data: {
						assetName:         oldMetal.assetName,
						clientId:          oldMetal.clientId,
						portfolioId:       oldMetal.portfolioId,
						entityId:          oldMetal.entityId,
						bankId:            oldMetal.bankId,
						accountId:         oldMetal.accountId,
						productType:       MetalType.DIRECT_HOLD,
						metalType:         payload.metalType,
						currency:          payload.currency,
						units:             payload.units,
						operation:         payload.operation,
						transactionDate:   new Date(payload.transactionDate,),
						transactionPrice:  payload.purchasePrice,
						costValueUSD,
						costValueFC,
						marketValueUSD,
						marketValueFC,
						profitUSD,
						profitPercentage,
						rate,
						isFutureDated:     oldMetal.isFutureDated,
						currentStockPrice: metalMarketPrice,
						costPrice:         payload.purchasePrice,
						metalName,
						metalPrice:        rate,
						groupId:           group.id,
						comment:           payload.comment,
					},
				},)
			}
		}
	}

	public async optionAssetRefactoredHandle(): Promise<void> {
		const [oldOptions, currencyList,] = await Promise.all([
			this.prismaService.asset.findMany({
				where: { assetName: AssetNamesType.OPTIONS, },
			},),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
		],)

		for (const asset of oldOptions) {
			if (!asset.clientId || !asset.portfolioId || !asset.entityId || !asset.bankId || !asset.accountId) {
				continue
			}
			const payload = JSON.parse(asset.payload as string,)
			const currencyData = currencyList.find((item,) => {
				return item.currency === payload.currency
			},)
			if (!currencyData) {
				continue
			}
			const marketValueUSD = parseFloat((payload.currentMarketValue * currencyData.rate).toFixed(2,),)
			await this.prismaService.assetOption.create({
				data: {
					client:             { connect: { id: asset.clientId, }, },
					portfolio:          { connect: { id: asset.portfolioId, }, },
					entity:             { connect: { id: asset.entityId, }, },
					bank:               { connect: { id: asset.bankId, }, },
					account:            { connect: { id: asset.accountId, }, },
					assetName:          asset.assetName,
					marketValueUSD,
					currency:           payload.currency,
					strike:             payload.strike,
					premium:            payload.premium,
					maturityDate:       payload.maturityDate,
					startDate:          payload.startDate,
					contracts:          payload.contracts,
					pairAssetCurrency:  payload.pairAssetCurrency,
					marketOpenValue:       payload.marketOpenValue,
					currentMarketValue:       payload.currentMarketValue,
					principalValue:       payload.principalValue,
					comment:            payload.comment,
					rate:               asset.rate ?? 1,
					isFutureDated:      asset.isFutureDated,
				},
			},)
		}
	}

	public async realEstateAssetRefactoredHandle(): Promise<void> {
		const [oldREs, currencyList,] = await Promise.all([
			this.prismaService.asset.findMany({
				where: { assetName: AssetNamesType.REAL_ESTATE, },
			},),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
		],)

		for (const asset of oldREs) {
			if (!asset.clientId || !asset.portfolioId || !asset.entityId || !asset.bankId || !asset.accountId) {
				continue
			}
			const payload = JSON.parse(asset.payload as string,)
			const currencyData = currencyList.find((item,) => {
				return item.currency === payload.currency
			},)
			if (!currencyData) {
				continue
			}
			const marketValueUSD = parseFloat((payload.currencyValue * currencyData.rate).toFixed(2,),)
			const profitUSD = parseFloat((Math.round((marketValueUSD - payload.usdValue) * 100,) / 100).toFixed(2,),)
			const profitPercentage =  payload.usdValue ?
				parseFloat((profitUSD / payload.usdValue * 100).toFixed(2,),) :
				0
			await this.prismaService.assetRealEstate.create({
				data: {
					client:             { connect: { id: asset.clientId, }, },
					portfolio:          { connect: { id: asset.portfolioId, }, },
					entity:             { connect: { id: asset.entityId, }, },
					bank:               { connect: { id: asset.bankId, }, },
					account:            { connect: { id: asset.accountId, }, },
					assetName:          asset.assetName,
					marketValueUSD,
					currency:           payload.currency,
					currencyValue:           payload.currencyValue,
					profitUSD,
					profitPercentage,
					investmentDate:       payload.investmentDate,
					usdValue:           payload.usdValue,
					marketValueFC:          payload.marketValueFC,
					projectTransaction:  payload.projectTransaction,
					country:            payload.country,
					city:               payload.city,
					comment:            payload.comment,
					rate:               asset.rate ?? 1,
					isFutureDated:      asset.isFutureDated,
				},
			},)
		}
	}

	public async otherInvestmentsAssetRefactoredHandle(): Promise<void> {
		const [oldOthers, currencyList, historyCurrencyData,] = await Promise.all([
			this.prismaService.asset.findMany({
				where: { assetName: AssetNamesType.OTHER, },
			},),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
			this.prismaService.currencyHistoryData.findMany(),
		],)

		for (const asset of oldOthers) {
			if (!asset.clientId || !asset.portfolioId || !asset.entityId || !asset.bankId || !asset.accountId) {
				continue
			}
			const payload = JSON.parse(asset.payload as string,)
			const currencyData = currencyList.find((item,) => {
				return item.currency === payload.currency
			},)
			if (!currencyData) {
				continue
			}
			const costRateDate = new Date(payload.investmentAssetName,)
			// const costCurrencyData = (historyCurrencyData
			// 	.filter((item,) => {
			// 		return new Date(item.date,).getTime() <= costRateDate.getTime() && currencyData?.id === item.currencyId
			// 	},)
			// 	.sort((a, b,) => {
			// 		return new Date(b.date,).getTime() - new Date(a.date,).getTime()
			// 	},)[0])
			const costCurrencyData = historyCurrencyData
				.filter((item,) => {
					return new Date(item.date,).getTime() >= costRateDate.getTime() && item.currencyId === currencyData?.id
				},)
				.sort((a, b,) => {
					return new Date(a.date,).getTime() - new Date(b.date,).getTime()
				},)[0]
			const costValueUSD = (Number(payload.currencyValue,) * (costCurrencyData?.rate ?? currencyData?.rate ?? 1))
			const marketValueUSD = parseFloat((payload.currencyValue * currencyData.rate).toFixed(2,),)
			const profitUSD = parseFloat((Math.round((marketValueUSD - costValueUSD) * 100,) / 100).toFixed(2,),)
			const profitPercentage = costValueUSD ?
				parseFloat((profitUSD / costValueUSD * 100).toFixed(2,),) :
				0
			await this.prismaService.assetOtherInvestment.create({
				data: {
					client:              { connect: { id: asset.clientId, }, },
					portfolio:           { connect: { id: asset.portfolioId, }, },
					entity:              { connect: { id: asset.entityId, }, },
					bank:                { connect: { id: asset.bankId, }, },
					account:             { connect: { id: asset.accountId, }, },
					assetName:           asset.assetName,
					marketValueUSD,
					costValueUSD,
					currency:            payload.currency,
					currencyValue:           payload.currencyValue,
					profitUSD,
					profitPercentage,
					investmentDate:       payload.investmentDate,
					usdValue:            payload.usdValue,
					investmentAssetName:          payload.investmentAssetName,
					serviceProvider:     payload.serviceProvider,
					customFields:             payload.customFields,
					comment:             payload.comment,
					rate:                asset.rate ?? 1,
					isFutureDated:       asset.isFutureDated,
				},
			},)
		}
	}

	public async privateEquityAssetRefactoredHandle(): Promise<void> {
		const [oldPEs, currencyList,] = await Promise.all([
			this.prismaService.asset.findMany({
				where: { assetName: AssetNamesType.PRIVATE_EQUITY, },
			},),
			this.cBondsCurrencyService.getAllCurrenciesWithHistory(),
		],)

		for (const asset of oldPEs) {
			if (!asset.clientId || !asset.portfolioId || !asset.entityId || !asset.bankId || !asset.accountId) {
				continue
			}
			const payload = JSON.parse(asset.payload as string,)
			const currencyData = currencyList.find((item,) => {
				return item.currency === payload.currency
			},)
			if (!currencyData) {
				continue
			}
			const marketValueUSD = parseFloat((payload.currencyValue * currencyData.rate).toFixed(2,),)
			const capitalCalled = Number(payload.capitalCalled,)
			const pl = parseFloat(((payload.currencyValue - capitalCalled - (payload.managementExpenses ?? 0) - (payload.otherExpenses ?? 0)) / capitalCalled * 100).toFixed(2,),)
			await this.prismaService.assetPrivateEquity.create({
				data: {
					client:              { connect: { id: asset.clientId, }, },
					portfolio:           { connect: { id: asset.portfolioId, }, },
					entity:              { connect: { id: asset.entityId, }, },
					bank:                { connect: { id: asset.bankId, }, },
					account:             { connect: { id: asset.accountId, }, },
					assetName:           asset.assetName,
					marketValueUSD,
					currency:            payload.currency,
					currencyValue:           payload.currencyValue,
					pl,
					fundType:           payload.fundType,
					status:             payload.status,
					entryDate:          payload.entryDate,
					fundTermDate:       payload.fundTermDate,
					lastValuationDate:  payload.lastValuationDate,
					serviceProvider:    payload.serviceProvider,
					geography:          payload.geography,
					fundName:           payload.fundName,
					fundID:             payload.fundID,
					fundSize:           payload.fundSize,
					aboutFund:          payload.aboutFund,
					investmentPeriod:   payload.investmentPeriod,
					capitalCalled,
					moic:               Number(payload.moic,),
					irr:                Number(payload.irr,),
					liquidity:          Number(payload.liquidity,),
					totalCommitment:    Number(payload.totalCommitment,),
					tvpi:               Number(payload.tvpi,),
					managementExpenses: Number(payload.managementExpenses,),
					otherExpenses:      Number(payload.otherExpenses,),
					carriedInterest:    Number(payload.carriedInterest,),
					distributions:      Number(payload.distributions,),
					holdingEntity:      payload.holdingEntity,
					comment:             payload.comment,
					rate:                asset.rate ?? 1,
					isFutureDated:       asset.isFutureDated,
				},
			},)
		}
	}

	public async cashAssetRefactoredHandle(): Promise<void> {
		const [oldREs,] = await Promise.all([
			this.prismaService.asset.findMany({
				where: { assetName: AssetNamesType.CASH, clientId: '93936e3b-7598-48c8-ab5c-67863bcfd03d',},
			},),
		],)

		for (const asset of oldREs) {
			if (!asset.clientId || !asset.portfolioId || !asset.entityId || !asset.bankId || !asset.accountId) {
				continue
			}
			const payload = JSON.parse(asset.payload as string,)
			await this.prismaService.assetCash.create({
				data: {
					client:             { connect: { id: asset.clientId, }, },
					portfolio:          { connect: { id: asset.portfolioId, }, },
					entity:             { connect: { id: asset.entityId, }, },
					bank:               { connect: { id: asset.bankId, }, },
					account:            { connect: { id: asset.accountId, }, },
					assetName:          asset.assetName,
					currency:           payload.currency,
					comment:            payload.comment,
				},
			},)
		}
	}

	// public async migrateLegacyTransactionTypesToVersions(): Promise<void> {
	// 	const clean = (s?: string | null,): string => {
	// 		return (s ?? '').replace(/\s+/g, ' ',).trim()
	// 	}
	// 	const keyOf = (s: string,): string => {
	// 		return clean(s,).toLocaleLowerCase()
	// 	}
	// 	const normCF = (s?: string | null,): string => {
	// 		const v = clean(s,).toLowerCase()
	// 		if (v === 'inflow' || v === 'cash in' || v === 'cash_in') {
	// 			return 'Inflow'
	// 		}
	// 		if (v === 'outflow' || v === 'cash out' || v === 'cash_out') {
	// 			return 'Outflow'
	// 		}
	// 		return ''
	// 	}
	// 	const normPL = (s?: string | null,): string | null => {
	// 		const v = clean(s,).toUpperCase()
	// 		if (v === 'P') {
	// 			return 'P'
	// 		}
	// 		if (v === 'L') {
	// 			return 'L'
	// 		}
	// 		return null
	// 	}

	// 	const legacyTypes = await this.prismaService.transactionType.findMany({
	// 		where: {
	// 			isDeleted: false,
	// 			versions:  { none: {}, },
	// 			OR:        [
	// 				{ name: { not: null, }, },
	// 				{ category: { not: null, }, },
	// 				{ pl: { not: null, }, },
	// 				{ cashFlow: { not: null, }, },
	// 			],
	// 		},
	// 		select:  { id: true, name: true, category: true, pl: true, cashFlow: true, },
	// 		orderBy: { createdAt: 'asc', },
	// 	},)

	// 	const list = legacyTypes.filter((t,) => {
	// 		return clean(t.name,) !== ''
	// 	},)
	// 	if (!list.length) {
	// 		return
	// 	}

	// 	const catMap = new Map<string, string>()
	// 	for (const t of list) {
	// 		const raw = clean(t.category,)
	// 		if (!raw) {
	// 			continue
	// 		}
	// 		const k = keyOf(raw,)
	// 		if (!catMap.has(k,)) {
	// 			catMap.set(k, raw,)
	// 		}
	// 	}

	// 	const categoryNames = Array.from(catMap.values(),)
	// 	if (categoryNames.length) {
	// 		await this.prismaService.transactionTypeCategory.createMany({
	// 			data:           categoryNames.map((name,) => {
	// 				return { name, }
	// 			},),
	// 			skipDuplicates: true,
	// 		},)
	// 	}

	// 	const categories = await this.prismaService.transactionTypeCategory.findMany({
	// 		where:  { name: { in: categoryNames, }, },
	// 		select: { id: true, name: true, },
	// 	},)
	// 	const catIdByKey = new Map<string, string>()
	// 	for (const c of categories) {
	// 		catIdByKey.set(keyOf(c.name,), c.id,)
	// 	}

	// 	const tasks = list.map(async(t,) => {
	// 		const name = clean(t.name,)
	// 		const catId = clean(t.category,) ?
	// 			(catIdByKey.get(keyOf(clean(t.category,),),) ?? null) :
	// 			null
	// 		const cf = normCF(t.cashFlow,)
	// 		const pl = normPL(t.pl,)
	// 		const created = await this.prismaService.transactionTypeVersion.create({
	// 			data: {
	// 				typeId:       t.id,
	// 				version:      1,
	// 				isCurrent:    true,
	// 				name,
	// 				categoryId:   catId,
	// 				cashFlow:     cf,
	// 				pl,
	// 				annualAssets: [],
	// 				comment:      null,
	// 			},
	// 			select: { id: true, },
	// 		},)
	// 		await this.prismaService.transaction.updateMany({
	// 			where: { transactionTypeId: t.id,},
	// 			data:  { transactionTypeVersionId: created.id, },
	// 		},)
	// 		// await this.prismaService.transactionDraft.updateMany({
	// 		// 	where: { transactionTypeId: t.id, NOT: { transactionTypeVersionId: created.id, }, },
	// 		// 	data:  { transactionTypeVersionId: created.id, },
	// 		// },)
	// 	},)

	// 	await Promise.all(tasks,)
	// }

	public async applyTransactionTypeRelations(): Promise<void> {
		const clean = (s?: string | null,): string => {
			return (s ?? '').replace(/\s+/g, ' ',).trim()
		}
		const key = (s: string,): string => {
			return clean(s,).toLocaleLowerCase()
		}

		const allNamesSet = new Set<string>()
		for (const r of relations) {
			allNamesSet.add(clean(r.transactionType,),)
			if (r.relatedTransactionType) {
				allNamesSet.add(clean(r.relatedTransactionType,),)
			}
		}
		const allNames = Array.from(allNamesSet,).filter(Boolean,)
		if (!allNames.length) {
			return
		}

		const types = await this.prismaService.transactionType.findMany({
			where:  { versions: { some: { isCurrent: true, name: { in: allNames, }, }, }, },
			select: { id: true, versions: { where: { isCurrent: true, }, select: { name: true, }, }, },
		},)

		const idByName = new Map<string, string>()
		for (const t of types) {
			const n = clean(t.versions[0]?.name ?? '',)
			if (n) {
				idByName.set(key(n,), t.id,)
			}
		}

		const ops = relations.flatMap((r,) => {
			const mainId = idByName.get(key(r.transactionType,),)
			if (!mainId) {
				return []
			}
			const relatedId =
			r.relatedTransactionType ?
				idByName.get(key(r.relatedTransactionType,),) :
				undefined

			const data: Prisma.TransactionTypeUpdateInput = {
				asset: r.asset,
				...(relatedId ?
					{ relatedTypeId: relatedId, } :
					{}),
			}

			return [this.prismaService.transactionType.update({ where: { id: mainId, }, data, },),]
		},)

		if (!ops.length) {
			return
		}
		await Promise.allSettled(ops,)
	}

	public async applyAnnualAssetsFromIncomeUsdFilter(): Promise<void> {
		const clean = (s?: string | null,): string => {
			return (s ?? '').replace(/\s+/g, ' ',).trim()
		}
		const key = (s: string,): string => {
			return clean(s,).toLocaleLowerCase()
		}

		const assetByGroup: Record<keyof typeof incomeUsdFilter, AssetNamesType> = {
			Equity:  AssetNamesType.EQUITY_ASSET,
			Bond:    AssetNamesType.BONDS,
			Crypto:  AssetNamesType.CRYPTO,
			Options: AssetNamesType.OPTIONS,
			Loan:    AssetNamesType.LOAN,
			Pe:      AssetNamesType.PRIVATE_EQUITY,
			Real:    AssetNamesType.REAL_ESTATE,
			Deposit: AssetNamesType.CASH_DEPOSIT,
			Other:   AssetNamesType.OTHER,
		}

		const nameToAssets = new Map<string, Set<AssetNamesType>>()
		const rawNames = new Set<string>()

		for (const group of Object.keys(incomeUsdFilter,) as Array<keyof typeof incomeUsdFilter>) {
			const names = incomeUsdFilter[group]
			const asset = assetByGroup[group]
			for (const n of names) {
				const k = key(n,)
				if (!k) {
					continue
				}
				rawNames.add(n,)
				const set = nameToAssets.get(k,) ?? new Set<AssetNamesType>()
				set.add(asset,)
				nameToAssets.set(k, set,)
			}
		}

		if (!rawNames.size) {
			return
		}

		const versions = await this.prismaService.transactionTypeVersion.findMany({
			where: {
				isCurrent: true,
				OR:        Array.from(rawNames,).map((n,) => {
					return {
						name: { equals: n, mode: Prisma.QueryMode.insensitive, },
					}
				},),
			},
			select: { id: true, name: true, annualAssets: true, },
		},)

		const ops = versions.flatMap((v,) => {
			const assets = Array.from(nameToAssets.get(key(v.name,),) ?? [],)
			const current = Array.isArray(v.annualAssets,) ?
				v.annualAssets :
				[]
			const merged = Array.from(new Set([...current, ...assets,],),)
			if (merged.length === current.length && merged.every((x,) => {
				return current.includes(x,)
			},)) {
				return []
			}
			return [
				this.prismaService.transactionTypeVersion.update({
					where:  { id: v.id, },
					data:   { annualAssets: merged, },
					select: { id: true, },
				},),
			]
		},)

		if (ops.length) {
			await Promise.allSettled(ops,)
		}
	}

	public async updateAsset(id: string, body: UpdateAssetDto,): Promise<Asset> {
		if (body.assetName === AssetNamesType.LOAN) {
			return this.assetRepository.updateLoan(id, body,)
		}
		if (body.assetName === AssetNamesType.OPTIONS) {
			return this.assetRepository.updateOption(id, body,)
		}
		if (body.assetName === AssetNamesType.CASH_DEPOSIT) {
			return this.assetRepository.updateDeposit(id, body,)
		}
		if (body.assetName === AssetNamesType.BONDS) {
			return this.assetRepository.updateBond(id, body,)
		}
		if (body.assetName === AssetNamesType.OTHER) {
			return this.assetRepository.updateOtherInvestment(id, body,)
		}
		if (body.assetName === AssetNamesType.REAL_ESTATE) {
			return this.assetRepository.updateRealEstate(id, body,)
		}
		if (body.assetName === AssetNamesType.PRIVATE_EQUITY) {
			return this.assetRepository.updatePrivateEquity(id, body,)
		}
		if (body.assetName === AssetNamesType.CRYPTO) {
			return this.assetRepository.updateCrypto(id, body,)
		}
		if (body.assetName === AssetNamesType.EQUITY_ASSET) {
			return this.assetRepository.updateEquity(id, body,)
		}
		if (body.assetName === AssetNamesType.METALS) {
			return this.assetRepository.updateMetal(id, body,)
		}
		throw new HttpException('Asset not found ', HttpStatus.NOT_FOUND,)
	}
}