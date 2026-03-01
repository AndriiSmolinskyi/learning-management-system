import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { ERROR_MESSAGES, } from '../../../shared/constants/messages.constants'
import type { ITransactionTypeList, } from '../list-hub.types'

@Injectable()
export class TransactionTypeService {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	public async getTransactionType(): Promise<Array<ITransactionTypeList>> {
		try {
			const rows = await this.prismaService.transactionType.findMany({
				where:  { isDeleted: false, isActivated: true,},
				select: {
					id:            true,
					relatedTypeId: true,
					asset:         true,
					versions:      {
						where:  { isCurrent: true, },
						take:   1,
					},
				},
				orderBy: { counter: 'desc', },
			},)

			return rows
				.map((r,) => {
					return {
						id:            r.id,
						relatedTypeId: r.relatedTypeId ?? '',
						asset:         r.asset ?? '',
						name:          r.versions[0]?.name ?? '',
						cashFlow:      r.versions[0]?.cashFlow ?? '',
						pl:            r.versions[0]?.pl ?? '',
					}
				},)
				.filter((item,) => {
					return item.name.length > 0
				},)
		} catch {
			throw new HttpException(
				ERROR_MESSAGES.RETRIEVE_TRANSACTION_TYPES_ERROR,
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	// public async getTransactionCategoryList(): Promise<Array<string>> {
	// 	try {
	// 		const categoryList = await this.prismaService.transactionType.findMany({
	// 			select: {
	// 				category: true,
	// 			},
	// 		},)
	// 		return [...new Set(categoryList.map((item,) => {
	// 			return item.category
	// 		},),),]
	// 	} catch (error) {
	// 		throw new HttpException(ERROR_MESSAGES.RETRIEVE_TRANSACTION_TYPES_ERROR, HttpStatus.BAD_REQUEST,)
	// 	}
	// }

	// public async getTransactionCategoryList(): Promise<Array<string>> {
	// 	try {
	// 		const rows = await this.prismaService.transactionType.findMany({
	// 			where:    { category: { not: null, }, },
	// 			select:   { category: true, },
	// 			distinct: ['category',],
	// 			orderBy:  { category: 'asc', },
	// 		},)
	// 		return rows
	// 		.map((r,) => {
	// 			return r.category
	// 		},)
	// 		.filter((c,): c is string => {
	// 			return Boolean(c,)
	// 		},)
	// 	} catch {
	// 		throw new HttpException(
	// 			ERROR_MESSAGES.RETRIEVE_TRANSACTION_TYPES_ERROR,
	// 			HttpStatus.BAD_REQUEST,
	// 		)
	// 	}
	// }
}