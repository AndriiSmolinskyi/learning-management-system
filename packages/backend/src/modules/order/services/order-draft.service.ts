/* eslint-disable complexity */
import { Injectable, InternalServerErrorException, } from '@nestjs/common'
import type { OrderDraft, } from '@prisma/client'
import { PrismaService, } from 'nestjs-prisma'
import type { CreateOrderDraftDto, } from '../dto/create-order-draft.dto'
import type { UpdateOrderDraftDto, } from '../dto/update-order-draft.dto'
import { CryptoService, } from '../../../modules/crypto/crypto.service'

@Injectable()
// Service for managing order drafts, including creating, retrieving, and deleting drafts.
export class OrderDraftService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cryptoService: CryptoService,

	) {}

	/**
	 * 3.2.1, 3.2.2
	 * Creates a new order draft.
	 *
	 * @remarks
	 * - This method creates a new order draft along with its details.
	 * - The details are mapped from the provided data, and relationships with requests and portfolios are established if IDs are provided.
	 *
	 * @param data - Data transfer object containing order draft details.
	 * @returns A promise that resolves to the created order draft object.
	 * @throws InternalServerErrorException - If the creation fails due to any database-related issue.
	 */
	public async createOrderDraft(data: CreateOrderDraftDto,): Promise<OrderDraft> {
		try {
			return this.prismaService.orderDraft.create({
				data: {
					type:        data.type,
					requestId:     data.requestId,
					portfolioId:   data.portfolioId,
					details:     {
						create: data.details.map((detail,) => {
							return {
								security:      detail.security ?? null,
								isin:          detail.isin ?? null,
								units:         detail.units ?? null,
								priceType:     detail.priceType ?? null,
								price:         detail.price ?? null,
								currency:      detail.currency ?? null,
								unitExecuted:  detail.unitExecuted ?? null,
								priceExecuted: detail.priceExecuted ?? null,
								yield:         detail.yield ?? null,
							}
						},),
					},
				},
			},)
		} catch (error) {
			// Catches and rethrows errors with a descriptive exception.
			throw new InternalServerErrorException('Failed to create order draft',)
		}
	}

	/**
	 * 3.2.3
	 * Retrieves a list of all order drafts.
	 *
	 * @remarks
	 * - This method fetches all order drafts from the database, sorted by their last update time in descending order.
	 * - Each draft includes its associated details, which may include requests and portfolios.
	 *
	 * @returns A promise that resolves to an array of order draft objects.
	 * @throws InternalServerErrorException - If the fetch operation fails due to any database-related issue.
	 */
	public async getOrderDrafts(): Promise<Array<OrderDraft>> {
		try {
			const orders =  await this.prismaService.orderDraft.findMany({
				orderBy: { updatedAt: 'desc', },
				include: {
					details: true,
					request: {
						include: {
							bank: true,
						},
					},
					portfolio: true,
				},
			},)
			return orders.map((order,) => {
				return {
					...order,
					portfolio: {
						...order.portfolio,
						name: order.portfolio?.name && this.cryptoService.decryptString(order.portfolio.name,),
					},
				}
			},)
		} catch (error) {
			// Catches and rethrows errors with a descriptive exception.
			throw new InternalServerErrorException('Failed to fetch order drafts',)
		}
	}

	/**
	 * 3.2.1, 3.2.2
	 * Deletes an order draft by its ID.
	 *
	 * @remarks
	 * - This method removes an order draft identified by its unique ID from the database.
	 *
	 * @param id - The unique identifier of the order draft to delete.
	 * @returns A promise that resolves when the deletion is complete.
	 * @throws InternalServerErrorException - If the deletion fails due to any database-related issue.
	 */
	public async deleteOrderDraft(id: number,): Promise<void> {
		try {
			await this.prismaService.orderDraft.delete({
				where: { id, },
			},)
		} catch (error) {
			// Catches and rethrows errors with a descriptive exception.
			throw new InternalServerErrorException('Failed to delete order draft',)
		}
	}

	/**
   * 3.2.1, 3.2.2
   * Updates an order draft.
   *
   * @remarks
   * - This method updates an order draft along with its details.
   * - If a detail ID is provided, it updates that specific detail, otherwise it creates a new one.
   *
   * @param id - The unique identifier of the order draft to update.
   * @param data - The data transfer object containing order draft details.
   * @returns A promise that resolves to the updated order draft object.
   * @throws InternalServerErrorException - If the update fails due to any database-related issue.
   */
	public async updateOrderDraft(
		id: number,
		data: UpdateOrderDraftDto,
	): Promise<OrderDraft> {
		const { details, } = data

		try {
			return await this.prismaService.$transaction(async(prisma,) => {
				const existingDetails = await prisma.orderDraftDetails.findMany({
					where:  { orderDraftId: id, },
					select: { id: true, },
				},)

				const incomingDetailIds = details
					.filter((detail,) => {
						return detail.id
					},)
					.map((detail,) => {
						return detail.id
					},)
				const detailsToDelete = existingDetails
					.filter((detail,) => {
						return !incomingDetailIds.includes(detail.id,)
					},)
					.map((detail,) => {
						return { id: detail.id, }
					},)
				const updatedOrderDraft = await prisma.orderDraft.update({
					where: { id, },
					data:  {
						type:    data.type,
						details: {
							create: details
								.filter((detail,) => {
									return !detail.id
								},)
								.map((detail,) => {
									return {
										security:      detail.security ?? null,
										isin:          detail.isin ?? null,
										units:         detail.units ?? null,
										price:         detail.price ?? null,
										currency:      detail.currency ?? null,
										unitExecuted:  detail.unitExecuted ?? null,
										priceExecuted: detail.priceExecuted ?? null,
										yield:         detail.yield ?? null,
									}
								},),
							update: details
								.filter((detail,) => {
									return detail.id
								},)
								.map((detail,) => {
									return {
										where: { id: detail.id, },
										data:  {
											security:      detail.security ?? null,
											isin:          detail.isin ?? null,
											units:         detail.units ?? null,
											priceType:     detail.priceType ?? null,
											price:         detail.price ?? null,
											currency:      detail.currency ?? null,
											unitExecuted:  detail.unitExecuted ?? null,
											priceExecuted: detail.priceExecuted ?? null,
											yield:         detail.yield ?? null,
										},
									}
								},),
							delete: detailsToDelete,
						},
					},
					include: {
						details: true,
					},
				},)

				return updatedOrderDraft
			},)
		} catch (error) {
			throw new InternalServerErrorException('Failed to update order draft',)
		}
	}
}
