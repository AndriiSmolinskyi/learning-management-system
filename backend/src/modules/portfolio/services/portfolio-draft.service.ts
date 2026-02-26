import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type { Portfolio, PortfolioDraft,} from '@prisma/client'
import { ERROR_MESSAGES, } from '../../../shared/constants/messages.constants'
import type { CreatePortfolioDto, } from '../dto/create-portfolio.dto'
import { PortfolioRepository, } from '../../../repositories/portfolio/portfolio.repository'
import { RedisCacheService, } from '../../../modules/redis-cache/redis-cache.service'
import { cacheKeysToDeletePortfolio, } from '../portfolio.constants'
import { PortfolioRoutes, } from '../portfolio.constants'
import { CryptoService, } from '../../crypto/crypto.service'

@Injectable()
export class PortfolioDraftService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly portfolioRepository: PortfolioRepository,
		private readonly cacheService: RedisCacheService,
		private readonly cryptoService: CryptoService,

	) {}

	/**
	 * 1.3
	 * Converts a portfolio draft into a fully-fledged portfolio by transferring its data and related entities.
	 * This function processes the draft data, including documents, entities, bank entities, and account entities,
	 * and creates a new portfolio with this data.
	 * After successfully creating the portfolio and its related entities, the draft is deleted.
	 * @param draftId - The unique identifier of the portfolio draft to be converted.
	 * @returns A Promise that resolves to a Message object indicating the success of the operation.
	 * @throws HttpException - If there is an error during the conversion process, such as the draft not being found or an issue with the transaction.
	 */
	public async updateDraftToPortfolio(draftId: string,): Promise<Portfolio> {
		try {
			const portfolio = await this.prismaService.$transaction(async(tx,) => {
				const draft = await tx.portfolioDraft.findUnique({
					where:   { id: draftId, },
					include: {
						documents:       true,
						entities:        { include: { documents: true, }, },
						banks:           true,
						accounts:  true,
						assets:          { include: { documents: true, }, },
					},
				},)

				if (!draft) {
					throw new HttpException(ERROR_MESSAGES.DRAFT_TO_PORTFOLIO_ERROR, HttpStatus.NOT_FOUND,)
				}

				const newPortfolio = await tx.portfolio.create({
					data: {
						clientId:        draft.clientId,
						name:            this.cryptoService.encryptString(draft.name,),
						type:            draft.type,
						...(draft.resident ?
							{resident:        this.cryptoService.encryptString(draft.resident,),} :
							{}),
						...(draft.taxResident ?
							{taxResident:        this.cryptoService.encryptString(draft.taxResident,),} :
							{}),
						mainPortfolioId: draft.mainPortfolioId,
					},
				},)
				if (draft.documents.length > 0) {
					await Promise.all(
						draft.documents.map(async(doc,) => {
							await tx.document.update({
								where: { id: doc.id, },
								data:  {
									portfolioId:      newPortfolio.id,
									portfolioDraftId: null,
								},
							},)
						},),
					)
				}

				await Promise.all(
					draft.entities.map(async(entity,) => {
						await tx.entity.update({
							where: { id: entity.id, },
							data:  {
								portfolioId:             newPortfolio.id,
								portfolioDraftId: null,

							},
						},)
					},),
				)

				if (draft.banks.length > 0) {
					await Promise.all(
						draft.banks.map(async(bank,) => {
							await tx.bank.update({
								where: { id: bank.id, },
								data:  {
									portfolioId:      newPortfolio.id,
									portfolioDraftId: null,

								},
							},)
						},),
					)
				}

				if (draft.accounts.length > 0) {
					await Promise.all(
						draft.accounts.map(async(account,) => {
							await tx.account.update({
								where: { id: account.id, },
								data:  {
									portfolioId:      newPortfolio.id,
									portfolioDraftId: null,

								},
							},)
						},),
					)
				}

				await Promise.all(
					draft.assets.map(async(asset,) => {
						await tx.asset.update({
							where: { id: asset.id, },
							data:  {
								portfolioId:      newPortfolio.id,
								portfolioDraftId: null,

							},
						},)
					},),
				)

				await tx.portfolioDraft.delete({
					where: { id: draftId, },
				},)
				return newPortfolio
			},)
			// const payload = {
			// 	method: 'get',
			// 	url:    `/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
			// 	query:  { clients: [portfolio.clientId,], },
			// }
			// await this.cacheService.deleteByCacheParams(payload,)
			// this.eventEmitter.emit(eventNames.PORTFOLIO_CREATED, {portfolioId: draftId,},)
			return portfolio
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.DRAFT_TO_PORTFOLIO_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 1.3
	 * Creates a new portfolio draft based on the provided form values.
	 * @param body - The form values for the portfolio creation, including portfolio name, type, residency information, client ID, and reference type.
	 * @returns A Promise that resolves to an object containing the Inewly created portfolio draft.
	 * @throws PrismaError - If an error occurs during the portfolio creation process, an exception with a message is thrown.
	 */
	public async createPortfolioDraft(data: CreatePortfolioDto,): Promise<PortfolioDraft> {
		await this.cacheService.deleteByUrl(cacheKeysToDeletePortfolio,)
		return this.prismaService.portfolioDraft.create({
			data: {
				...data,
				name:        this.cryptoService.encryptString(data.name,),
				...(data.resident ?
					{resident:    this.cryptoService.encryptString(data.resident,),} :
					{}),
				...(data.taxResident ?
					{taxResident:    this.cryptoService.encryptString(data.taxResident,),} :
					{}),
			},
		},)
	}

	/**
	 * 1.3
	 * Deletes a portfolio draft by its ID.
	 * This method removes the portfolio draft from the database based on the provided draft ID.
	 * @param id - The ID of the portfolio draft to be deleted.
	 * @returns A Promise that resolves when the portfolio draft is successfully deleted.
	 * @throws HttpException - If an error occurs during the deletion process, an exception with a message is thrown.
	 */
	public async deletePortfolioDraft(id: string,): Promise<void> {
		try {
			await this.cacheService.deleteByUrl([
				`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
			],)
			await this.portfolioRepository.deletePortfolioDraftWithDocuments(id,)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.NOT_FOUND, HttpStatus.NOT_FOUND,)
		}
	}
}