/* eslint-disable no-await-in-loop */
import { HttpException, HttpStatus, Inject, Injectable, Logger, } from '@nestjs/common'
import { CustomPrismaService, PrismaService, } from 'nestjs-prisma'
import { THIRD_PARTY_PRISMA_SERVICE, } from '../../../../shared/constants'
import type { PrismaClient as ThirdPartyPrismaClient,} from '@third-party-prisma/client'
import { ConfigService, } from '@nestjs/config'
import axios from 'axios'
import { CryptoList, } from '@prisma/client'
import { binanceApiConstants, } from '../cbonds-api.constants'
import { ERROR_MESSAGES, } from '../../../../shared/constants'
import type { IBinancePricesDto, IBinanceTickerPriceResponse, } from '../cbonds-api.types'

@Injectable()
export class BinanceService {
	private readonly binanceApiUrl = this.configService.getOrThrow('BINANCE_API_URL',)

	private readonly logger = new Logger(BinanceService.name,)

	constructor(
		@Inject(THIRD_PARTY_PRISMA_SERVICE,)
		private readonly thirdPartyPrismaService: CustomPrismaService<ThirdPartyPrismaClient>,
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,

	) {}

	/**
	 * Task - 10.4
	 * Retrieves current spot prices for BTCUSDT and ETHUSDT from Binance.
	 * @remarks
	 * Uses Binance public REST API `/api/v3/ticker/price`.
	 * Prices are returned as numbers (parsed from strings).
	 * @returns An object containing BTCUSDT and ETHUSDT prices.
	 */
	public async getSpotPrices(): Promise<IBinancePricesDto> {
		return this.withRetry(
			async() => {
				const [btcResponse, ethResponse,] = await Promise.all([
					axios.get<IBinanceTickerPriceResponse>(
						`${this.binanceApiUrl}/${binanceApiConstants.priceUrl}`,
						{ params: { symbol: binanceApiConstants.btcSymbol, }, },
					),
					axios.get<IBinanceTickerPriceResponse>(
						`${this.binanceApiUrl}/${binanceApiConstants.priceUrl}`,
						{ params: { symbol: binanceApiConstants.ethSymbol, }, },
					),
				],)

				const btcRate = Number(btcResponse.data.price,)
				const ethRate = Number(ethResponse.data.price,)

				if (!Number.isFinite(btcRate,) || !Number.isFinite(ethRate,)) {
					this.logger.error(ERROR_MESSAGES.BINANCE_FETCH_ERROR,)
					throw new HttpException(ERROR_MESSAGES.BINANCE_FETCH_ERROR, HttpStatus.SERVICE_UNAVAILABLE,)
				}

				await Promise.all([
					this.prismaService.cryptoData.update({
						where: { token: CryptoList.BTC, },
						data:  { rate: btcRate, },
					},),
					this.prismaService.cryptoData.update({
						where: { token: CryptoList.ETH, },
						data:  { rate: ethRate, },
					},),
					this.thirdPartyPrismaService.client.cryptoData.update({
						where: { token: CryptoList.BTC, },
						data:  { rate: btcRate, },
					},),
					this.thirdPartyPrismaService.client.cryptoData.update({
						where: { token: CryptoList.ETH, },
						data:  { rate: ethRate, },
					},),
				],)
				return {
					BTCUSDT: btcRate,
					ETHUSDT: ethRate,
				}
			},
			{
				attempts:    3,
				baseDelayMs: 1000,
				context:     binanceApiConstants.retryBinanceContext,
			},
		)
	}

	/**
		* Task - 10.4
 		* Creates a daily snapshot of current crypto rates.
 		* @remarks
 		* - Captures crypto rates for BTC and ETH at a fixed time (12:00).
 		* - Reads current rates from the `cryptoData` table.
 		* - Persists snapshot records into `cryptoHistoryData`.
 		* - Data is stored in both the main database and the third-party (data lake) database.
 		* - Intended to be executed once per day by a scheduled cron job.
 		* @returns A promise that resolves when all snapshot records are successfully saved.
 	*/
	public async handleDailyCryptoHistorySnapshot(): Promise<void> {
		const today = new Date()
		today.setHours(17, 0, 0, 0,)
		try {
			const cryptoData = await this.prismaService.cryptoData.findMany({
				where: {
					token: { in: [CryptoList.BTC, CryptoList.ETH,], },
				},
			},)
			await Promise.all(
				cryptoData.map(async(crypto,) => {
					return this.prismaService.cryptoHistoryData.create({
						data: {
							tokenId: crypto.id,
							rate:    crypto.rate,
							date:    today.toISOString(),
							crypto:  crypto.token,
						},
					},)
				},
				),
			)
			await Promise.all(
				cryptoData.map(async(crypto,) => {
					return this.thirdPartyPrismaService.client.cryptoHistoryData.create({
						data: {
							tokenId: crypto.id,
							rate:    crypto.rate,
							date:    today.toISOString(),
							crypto:  crypto.token,
						},
					},)
				},
				),
			)
		} catch (error) {
			this.logger.error(ERROR_MESSAGES.BINANCE_SNAPSHOT_ERROR,
				error instanceof Error ?
					error.message :
					String(error,),
			)
			throw new HttpException(ERROR_MESSAGES.BINANCE_SNAPSHOT_ERROR, HttpStatus.SERVICE_UNAVAILABLE,)
		}
	}

	/**
		* Executes an asynchronous operation with retry logic.
		* @remarks
		* - Retries the provided async operation in case of failure.
		* - Uses exponential backoff strategy between retry attempts.
		* - Logs each failed attempt with contextual information for monitoring.
		* - Throws the last encountered error after all retries are exhausted.
		* @typeParam T - The return type of the asynchronous operation.
		* @param operation - A function that returns a Promise to be executed with retry logic.
		* @param options - Optional configuration for retry behavior.
		* @param options.attempts - Maximum number of retry attempts (default: 3).
		* @param options.baseDelayMs - Base delay in milliseconds for exponential backoff (default: 500ms).
		* @param options.context - Context label used in logs to identify the operation.
		* @returns A promise that resolves with the result of the operation if successful.
		* @throws The last error thrown by the operation if all retry attempts fail.
	*/
	private async withRetry<T>(
		operation: () => Promise<T>,
		options?: {
		attempts?: number
		baseDelayMs?: number
		context?: string
	},
	): Promise<T> {
		const retries = options?.attempts ?? 3
		const baseDelayMs = options?.baseDelayMs ?? 500
		const context = options?.context ?? 'retry-operation'

		let lastError: unknown

		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				return operation()
			} catch (error) {
				lastError = error
				this.logger.error(`[${context}] attempt ${attempt}/${retries} failed`,
					error instanceof Error ?
						error.stack :
						String(error,),
				)

				if (attempt < retries) {
					const delay = baseDelayMs * (2 ** (attempt - 1))

					await new Promise((resolve,) => {
						setTimeout(resolve, delay,)
					},)
				}
			}
		}
		throw lastError
	}

	// todo: Revome in no need in backup function after testing
	// public async getSpotPrices(): Promise<IBinancePricesDto> {
	// 	try {
	// 		const [btcResponse, ethResponse,] = await Promise.all([
	// 			axios.get<IBinanceTickerPriceResponse>(
	// 				`${this.binanceApiUrl}/${binanceApiConstants.priceUrl}`,
	// 				{ params: { symbol: binanceApiConstants.btcSymbol, }, },
	// 			),
	// 			axios.get<IBinanceTickerPriceResponse>(
	// 				`${this.binanceApiUrl}/${binanceApiConstants.priceUrl}`,
	// 				{ params: { symbol: binanceApiConstants.ethSymbol, }, },
	// 			),
	// 		],)
	// 		const btcRate = Number(btcResponse.data.price,)
	// 		const ethRate = Number(ethResponse.data.price,)
	// 		if (Number.isFinite(btcRate,)) {
	// 			await Promise.all([
	// 				this.prismaService.cryptoData.update({
	// 					where: {
	// 						token: CryptoList.BTC,
	// 					},
	// 					data: {
	// 						rate: btcRate,
	// 					},
	// 				},),
	// 				this.thirdPartyPrismaService.client.cryptoData.update({
	// 					where: {
	// 						token: CryptoList.BTC,
	// 					},
	// 					data: {
	// 						rate: btcRate,
	// 					},
	// 				},),
	// 			],)
	// 		}
	// 		if (Number.isFinite(ethRate,)) {
	// 			await Promise.all([
	// 				this.prismaService.cryptoData.update({
	// 					where: {
	// 						token: CryptoList.ETH,
	// 					},
	// 					data: {
	// 						rate: ethRate,
	// 					},
	// 				},),
	// 				this.thirdPartyPrismaService.client.cryptoData.update({
	// 					where: {
	// 						token: CryptoList.ETH,
	// 					},
	// 					data: {
	// 						rate: ethRate,
	// 					},
	// 				},),
	// 			],)
	// 		}
	// 		return {
	// 			BTCUSDT: btcRate,
	// 			ETHUSDT: ethRate,
	// 		}
	// 	} catch (error) {
	// 		this.logger.error(ERROR_MESSAGES.BINANCE_FETCH_ERROR,	error instanceof Error ?
	// 			error.message :
	// 			String(error,),
	// 		)
	// 		throw new HttpException(ERROR_MESSAGES.BINANCE_FETCH_ERROR, HttpStatus.SERVICE_UNAVAILABLE,)
	// 	}
	// }
}