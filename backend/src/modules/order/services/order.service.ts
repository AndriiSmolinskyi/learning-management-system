/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable no-mixed-operators */
import { Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Order, } from '@prisma/client'
import type { TOrderListRes, OrderWithCashValue, TExtendedOrder, TOrderUnits,} from '../order.types'
import type { CreateOrderDto, } from '../dto/create-order.dto'
import type { UpdateOrderDto, } from '../dto/update-order.dto'
import { NotFoundException, } from '@nestjs/common'
import type { OrderFilterDto, } from '../dto/orders-filter.dto'
import { Prisma, } from '@prisma/client'
import type { UpdateOrderStatusDto, } from '../dto/update-order-status.dto'
import { CryptoService, } from '../../../modules/crypto/crypto.service'
import type { OrderPortfolioUnitsDto, } from '../dto'
// todo: before asset refactor
// import { assetParser, } from '../../../shared/utils'
// import type { IBondsAsset, } from '../../asset/asset.types'
// import { AssetOperationType, } from '../../../shared/types'
import { AssetNamesType, } from '../../asset/asset.types'

@Injectable()
export class OrderService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly cryptoService: CryptoService,

	) {}

	/**
	 *  3.2.1, 3.2.2
	 * Creates a new order along with its details.
	 *
	 * @param dto - Data transfer object containing order and details information.
	 * @returns A promise resolving to the created order object.
	 */
	public async createOrder(dto: CreateOrderDto,): Promise<OrderWithCashValue> {
		const order = await this.prismaService.order.create({
			data: {
				type:        dto.type,
				status:      dto.status,
				requestId:   dto.requestId,
				portfolioId: dto.portfolioId,
				details:     {
					create: dto.details.map((detail,) => {
						return {
							security:      detail.security,
							isin:          detail.isin,
							units:         detail.units,
							priceType:     detail.priceType,
							price:         detail.price,
							currency:      detail.currency,
							unitExecuted:  detail.unitExecuted,
							priceExecuted: detail.priceExecuted,
							yield:         detail.yield,
						}
					},),
				},
			},
			include: {
				request: {
					include: {
						bank:      true,
						assetBond:  {
							select: { id: true, assetName: true, isin: true, security: true, },
						},
						assetEquity: {
							select: { id: true, assetName: true, isin: true, security: true, type: true, },
						},
					},
				},
				portfolio: true,
				details:   true,
			},
		},)

		let totalCashValue = 0
		const isBond = Boolean(order.request.assetBond,)
		const isEquity = Boolean(order.request.assetEquity,)

		order.details.forEach((detail,) => {
			const units = parseFloat(detail.units,)
			const price = parseFloat(detail.price,)

			if (isBond) {
				totalCashValue = totalCashValue + units * price * 10
			} else if (isEquity) {
				totalCashValue = totalCashValue + units * price
			}
		},)

		return {
			...order,
			cashValue: totalCashValue,
		}
	}

	/**
	 *  3.2.3
	 * Retrieves a list of all orders and their total count.
	 *
	 * @returns A promise resolving to an object containing the total count and the list of orders.
	 */
	public async getOrders(): Promise<TOrderListRes> {
		const [total, list,] = await this.prismaService.$transaction([
			this.prismaService.order.count(),
			this.prismaService.order.findMany({
				orderBy: { updatedAt: 'desc', },
				include: {
					request: {
						include: {
							bank: true,
						},
					},
					portfolio: true,
					details:   true,
				},
			},),
		],)
		const decryptedList = list.map((order,) => {
			return {
				...order,
				portfolio: {
					...order.portfolio,
					name: this.cryptoService.decryptString(order.portfolio.name,),
				},
			}
		},)
		return { total, list: decryptedList, }
	}

	/**
	 * 3.2.6
	 * Updates the status of an existing order.
	 *
	 * @param orderId - The ID of the order to update.
	 * @param status - The new status to set for the order.
	 * @returns A promise resolving to the updated order object.
	 */
	public async updateOrderStatus(body: UpdateOrderStatusDto,): Promise<Order> {
		return this.prismaService.order.update({
			where: { id: body.orderId, },
			data:  { status: body.status, },
		},)
	}

	/**
	 * 3.2.5
	 * Updates an existing order and its details.
	 *
	 * @param orderId - The ID of the order to update.
	 * @param dto - Data transfer object containing updated order details.
	 * @returns A promise resolving to the updated order object.
	 * @throws NotFoundException - If any detail ID is not found.
	 */
	public async editOrder(orderId: number, dto: UpdateOrderDto,): Promise<Order> {
		const updatePromises = dto.details.map(async(detail,) => {
			if (!detail.id) {
				return this.prismaService.orderDetails.create({
					data: {
						orderId,
						...detail,
					},
				},)
			}

			const existingDetail = await this.prismaService.orderDetails.findUnique({
				where: { id: detail.id, },
			},)

			if (!existingDetail) {
				throw new NotFoundException(`Order detail with id ${detail.id} not found`,)
			}

			return this.prismaService.orderDetails.update({
				where: { id: detail.id, },
				data:  detail,
			},)
		},)
		await Promise.all(updatePromises,)

		const updatedOrder = await this.prismaService.order.update({
			where:   { id: orderId, },
			data:    { updatedAt: new Date(), },
			include: { details: true, },
		},)

		return updatedOrder
	}

	/**
	 *  3.2.4
	 * Deletes multiple order details based on their IDs.
	 *
	 * @param ids - Array of detail IDs to delete.
	 * @returns A promise that resolves when the operation is complete.
	 * @throws TypeError - If the provided parameter is not an array.
	 */
	public async deleteOrderDetails(ids: Array<string>,): Promise<void> {
		if (!Array.isArray(ids,)) {
			throw new TypeError('Parameter "ids" must be an array',)
		}

		await this.prismaService.orderDetails.deleteMany({
			where: { id: { in: ids, }, },
		},)
	}

	/**
	 * 3.2.1, 3.2.8, 3.2.9
	 * Retrieves filtered orders based on provided criteria.
	 *
	 * @param filter - Object containing filtering and sorting options.
	 * @returns A promise resolving to an object containing the total count and the filtered list of orders.
	 */
	// todo: clear after new ver good
	// public async getOrdersFiltered(filter: OrderFilterDto,): Promise<TOrderListRes> {
	// 	const {
	// 		sortBy = 'updatedAt',
	// 		sortOrder = Prisma.SortOrder.desc,
	// 		search,
	// 		statuses,
	// 		...params
	// 	} = filter
	// 	const orderBy: Prisma.OrderOrderByWithRelationInput = {
	// 		[sortBy]: sortOrder,
	// 	}

	// 	const where: Prisma.OrderWhereInput = {
	// 		...(search && {
	// 			OR: [
	// 				{
	// 					request: {
	// 						bank: {
	// 							bankName: {
	// 								contains: search,
	// 								mode:     Prisma.QueryMode.insensitive,
	// 							},
	// 						},
	// 					},
	// 				},
	// 				{
	// 					status: {
	// 						contains: search,
	// 						mode:     Prisma.QueryMode.insensitive,
	// 					},
	// 				},
	// 				{
	// 					portfolio: {
	// 						name: {
	// 							contains: search,
	// 							mode:     Prisma.QueryMode.insensitive,
	// 						},
	// 					},
	// 				},
	// 				...(isNaN(Number(search,),) ?
	// 					[] :
	// 					[
	// 						{
	// 							id: {
	// 								equals: Number(search,),
	// 							},
	// 						},
	// 					]),
	// 			],
	// 		}),
	// 		...(statuses && {
	// 			status: {
	// 				in: statuses,
	// 			},
	// 		}),
	// 		portfolio: {
	// 			isActivated: true,
	// 			client:      {
	// 				isActivated: true,
	// 			},
	// 		},
	// 		request: {
	// 			clientId:    { in: filter.clientIds, },
	// 			portfolioId: { in: filter.portfolioIds, },
	// 			entityId:    { in: filter.entityIds, },
	// 			...(filter.bankListIds?.length ?
	// 				{
	// 					bank: {
	// 						is: {
	// 							bankListId: { in: filter.bankListIds, },
	// 						},
	// 					},
	// 				} :
	// 				undefined),
	// 			bankId:    { in: filter.bankIds, },
	// 			accountId:   { in: filter.accountIds,},
	// 			...(filter.assetIds?.length ?
	// 				{ asset: {
	// 					assetName: { in: filter.assetIds, },
	// 				}, } :
	// 				undefined),
	// 		},
	// 		details: {
	// 			some: {
	// 				...(filter.isins?.length ?
	// 					{ isin: { in: filter.isins, }, } :
	// 					{}),
	// 				...(filter.securities?.length ?
	// 					{ security: { in: filter.securities, }, } :
	// 					{}),
	// 			},
	// 		},
	// 		...(params.type && {
	// 			type: params.type,
	// 		}),
	// 	}

	// 	const [total, list,] = await this.prismaService.$transaction([
	// 		this.prismaService.order.count({ where, },),
	// 		this.prismaService.order.findMany({
	// 			where,
	// 			orderBy,
	// 			include: {
	// 				details: true,
	// 				request: {
	// 					include: {
	// 						bank:      true,
	// 						account:   true,
	// 						client:    true,
	// 						entity:    true,
	// 						portfolio: true,
	// 						assetBond:  {
	// 							select: { id: true, assetName: true, isin: true, security: true, },
	// 						},
	// 						assetEquity: {
	// 							select: { id: true, assetName: true, isin: true, security: true, type: true, },
	// 						},
	// 					},
	// 				},
	// 				portfolio: true,
	// 			},
	// 		},),
	// 	],)
	// 	const ordersWithCashValue: Array<OrderWithCashValue> = list.map((order,) => {
	// 		let totalCashValue = 0
	// 		const isBond = Boolean(order.request.assetBond,)
	// 		const isEquity = Boolean(order.request.assetEquity,)

	// 		order.details.forEach((detail,) => {
	// 			const units = parseFloat(detail.units,)
	// 			const price = parseFloat(detail.price,)

	// 			if (isBond) {
	// 				totalCashValue = totalCashValue + units * price * 10
	// 			} else if (isEquity) {
	// 				totalCashValue = totalCashValue + units * price
	// 			}
	// 		},)

	// 		const asset = order.request.assetBond ?? order.request.assetEquity ?? null

	// 		return {
	// 			...order,
	// 			cashValue: totalCashValue,
	// 			portfolio: {
	// 				...order.portfolio,
	// 				name: this.cryptoService.decryptString(order.portfolio.name,),
	// 			},
	// 			request: {
	// 				...order.request,
	// 				asset,
	// 				portfolio: {
	// 					...order.request.portfolio,
	// 					name: order.request.portfolio && this.cryptoService.decryptString(order.request.portfolio.name,),
	// 				},
	// 				entity: {
	// 					...order.request.entity,
	// 					name: order.request.entity && this.cryptoService.decryptString(order.request.entity.name,),
	// 				},
	// 				client: {
	// 					...order.request.client,
	// 					firstName: order.request.client && this.cryptoService.decryptString(order.request.client.firstName,),
	// 					lastName:  order.request.client && this.cryptoService.decryptString(order.request.client.lastName,),
	// 				},
	// 			},
	// 		}
	// 	},)
	// 	return { total, list: ordersWithCashValue, }
	// }
	public async getOrdersFiltered(filter: OrderFilterDto,): Promise<TOrderListRes> {
		const {
			sortBy = 'updatedAt',
			sortOrder = Prisma.SortOrder.desc,
			search,
			statuses,
			...params
		} = filter
		const orderBy: Prisma.OrderOrderByWithRelationInput = {
			[sortBy]: sortOrder,
		}

		const where: Prisma.OrderWhereInput = {
			...(statuses && {
				status: {
					in: statuses,
				},
			}),
			portfolio: {
				isActivated: true,
				client:      {
					isActivated: true,
				},
			},
			request: {
				clientId:    { in: filter.clientIds, },
				portfolioId: { in: filter.portfolioIds, },
				entityId:    { in: filter.entityIds, },
				...(filter.bankListIds?.length ?
					{
						bank: {
							is: {
								bankListId: { in: filter.bankListIds, },
							},
						},
					} :
					undefined),
				bankId:    { in: filter.bankIds, },
				accountId:   { in: filter.accountIds,},
				...(filter.assetIds?.length ?
					{ asset: {
						assetName: { in: filter.assetIds, },
					}, } :
					undefined),
			},
			details: {
				some: {
					...(filter.isins?.length ?
						{ isin: { in: filter.isins, }, } :
						{}),
					...(filter.securities?.length ?
						{ security: { in: filter.securities, }, } :
						{}),
				},
			},
			...(params.type && {
				type: params.type,
			}),
		}

		const [total, list,] = await this.prismaService.$transaction([
			this.prismaService.order.count({ where, },),
			this.prismaService.order.findMany({
				where,
				orderBy,
				include: {
					details: true,
					request: {
						include: {
							bank:      true,
							account:   true,
							client:    true,
							entity:    true,
							portfolio: true,
							assetBond:  {
								select: { id: true, assetName: true, isin: true, security: true, },
							},
							assetEquity: {
								select: { id: true, assetName: true, isin: true, security: true, type: true, },
							},
						},
					},
					portfolio: true,
				},
			},),
		],)

		const ordersWithCashValue: Array<OrderWithCashValue> = list.map((order,) => {
			let totalCashValue = 0
			const isBond = Boolean(order.request.assetBond,)
			const isEquity = Boolean(order.request.assetEquity,)

			order.details.forEach((detail,) => {
				const units = parseFloat(detail.units,)
				const price = parseFloat(detail.price,)

				if (isBond) {
					totalCashValue = totalCashValue + units * price * 10
				} else if (isEquity) {
					totalCashValue = totalCashValue + units * price
				}
			},)

			const asset = order.request.assetBond ?? order.request.assetEquity ?? null

			return {
				...order,
				cashValue: totalCashValue,
				portfolio: {
					...order.portfolio,
					name: this.cryptoService.decryptString(order.portfolio.name,),
				},
				request: {
					...order.request,
					asset,
					portfolio: order.request.portfolio && {
						...order.request.portfolio,
						name: this.cryptoService.decryptString(order.request.portfolio.name,),
					},
					bank: order.request.bank && {
						...order.request.bank,
						bankName: this.cryptoService.decryptString(order.request.bank.bankName,),
					},
					entity: {
						...order.request.entity,
						name: order.request.entity && this.cryptoService.decryptString(order.request.entity.name,),
					},
					client: {
						...order.request.client,
						firstName: order.request.client && this.cryptoService.decryptString(order.request.client.firstName,),
						lastName:  order.request.client && this.cryptoService.decryptString(order.request.client.lastName,),
					},
				},
			} as unknown as OrderWithCashValue
		},)

		const searchLower = search?.trim().toLowerCase() ?? ''

		if (!searchLower) {
			return {
				total,
				list: ordersWithCashValue,
			}
		}

		const filteredList = ordersWithCashValue.filter((order,) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const o = order as any

			const portfolioName = o.request?.portfolio?.name ?
				String(o.request.portfolio.name,).toLowerCase() :
				''

			const bankName = o.request?.bank?.bankName ?
				String(o.request.bank.bankName,).toLowerCase() :
				''

			const status = order.status ?
				order.status.toLowerCase() :
				''

			const idMatch = String(order.id,).includes(searchLower,)

			return (
				portfolioName.includes(searchLower,) ||
      bankName.includes(searchLower,) ||
      status.includes(searchLower,) ||
      idMatch
			)
		},)

		return {
			total: filteredList.length,
			list:  filteredList,
		}
	}

	/**
	 * 3.2.4
	 * Retrieves a specific order by its ID, including related details.
	 *
	 * @param orderId - The ID of the order to retrieve.
	 * @returns A promise resolving to the order object.
	 * @throws NotFoundException - If the order is not found.
	 */
	public async getOrderById(orderId: number,): Promise<TExtendedOrder> {
		const order = await this.prismaService.order.findUnique({
			where:   { id: orderId, },
			include: {
				details: true,
				request: {
					include: { bank: true, asset: true,},
				},
				portfolio: true,
			},
		},)

		if (!order) {
			throw new NotFoundException(`Order with id ${orderId} not found`,)
		}

		return {
			...order,
			portfolio: {
				...order.portfolio,
				name: this.cryptoService.decryptString(order.portfolio.name,),
			},
		}
	}

	/**
		 * CR-071
		 * Deletes a order by its ID along with all associated data.
		 * @param id - The unique identifier of the order to be deleted.
		 * @returns A Promise that resolves when the deletion process is complete.
		 * @throws Will throw an error if the deletion fails at any step.
		 */
	public async deleteOrderById(id: string,): Promise<void> {
		await this.prismaService.order.delete({
			where: {
				id: Number(id,),
			},
		},)
	}

	/**
		* CR-071
		* Calculates the total number of units for a specific asset (by ISIN) within a given portfolio.
		* The method iterates over all non-archived assets of the portfolio and aggregates the units:
		*  - Adds units for BUY operations.
		*  - Subtracts units for SELL operations.
		*
		* @param filter - Object containing portfolioId, assetName, and isin to filter the target asset.
		* @returns A Promise resolving to an object with the total available units for the specified asset.
		* @throws Will throw an error if the portfolio lookup or data parsing fails.
	*/
	// todo: before asset refactor
	// public async getOrderPortfolioUnits(filter: OrderPortfolioUnitsDto,): Promise<TOrderUnits> {
	// 	const portfolio = await this.prismaService.portfolio.findUnique({
	// 		where: {
	// 			id: filter.portfolioId,
	// 		},
	// 		select: {
	// 			assets: {
	// 				where: {
	// 					isArchived: false,
	// 					assetName:  filter.assetName,
	// 				},
	// 			},
	// 		},
	// 	},)
	// 	if (!portfolio?.assets) {
	// 		return {
	// 			units: 0,
	// 		}
	// 	}
	// 	let totalUnits = 0

	// 	for (const asset of portfolio.assets) {
	// 		const parsedAsset = assetParser<IBondsAsset>(asset,)

	// 		if (!parsedAsset) {
	// 			continue
	// 		} if (parsedAsset.isin !== filter.isin) {
	// 			continue
	// 		}
	// 		if (parsedAsset.operation === AssetOperationType.BUY) {
	// 			totalUnits = totalUnits + parsedAsset.units
	// 		} else {
	// 			totalUnits = totalUnits - parsedAsset.units
	// 		}
	// 	}
	// 	return { units: totalUnits, }
	// }

	// todo: after asset refactor
	public async getOrderPortfolioUnits(filter: OrderPortfolioUnitsDto,): Promise<TOrderUnits> {
		if (filter.assetName === AssetNamesType.BONDS) {
			const bonds = await this.prismaService.assetBondGroup.findMany({
				where: {
					portfolioId: filter.portfolioId,
					isin:        filter.isin,
				},
				select: {
					totalUnits: true,
				},
			},)

			const totalUnits = bonds.reduce((acc, b,) => {
				return acc + b.totalUnits
			}, 0,)
			return { units: totalUnits, }
		}

		if (filter.assetName === AssetNamesType.EQUITY_ASSET) {
			const equities = await this.prismaService.assetEquityGroup.findMany({
				where: {
					portfolioId: filter.portfolioId,
					isin:        filter.isin,
					isArchived:  false,
				},
				select: {
					totalUnits: true,
				},
			},)

			const totalUnits = equities.reduce((acc, e,) => {
				return acc + e.totalUnits
			}, 0,)
			return { units: totalUnits, }
		}

		return { units: 0, }
	}
}
