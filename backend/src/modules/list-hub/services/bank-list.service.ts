import { PrismaService, } from 'nestjs-prisma'
import {  Injectable, } from '@nestjs/common'
import type { BankSourceIdsDto, ListItemCreateDto, } from '../dto'
import type { BankList, Prisma, } from '@prisma/client'

@Injectable()
export class BankListService {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	/**
	 * 1.3/1.4/1.5.1
	 * Retrieves all bank list items from the database.
	 * @returns A promise that resolves to an array of {@link IBankListItemBody} objects.
	 * Each object represents a bank list item with its `value` and `label`.
	 * @throws {HttpException} If there is an error retrieving the bank list items.
	 * The error message and HTTP status code are provided in the exception.
	 */
	public async getBankList(): Promise<Array<BankList>> {
		return this.prismaService.bankList.findMany()
	}

	/**
	 * 1.3/1.4/1.5.2
	 * Creates a new bank list item in the database.
	 * @param body - The body of the request containing the `value` and `label` of the new bank list item.
	 * @returns A promise that resolves to a {@link Message} object indicating the success of the operation.
	 * @throws {HttpException} If there is an error creating the bank list item.
	 * The error message and HTTP status code are provided in the exception.
	*/
	public async createBankListItem(data: ListItemCreateDto,): Promise<BankList> {
		return this.prismaService.bankList.create({
			data,
		},)
	}

	/**
 * Retrieves a list of unique {@link BankList} records associated with the specified client, portfolio, or entity.
 *
 * This method performs the following steps:
 * - Queries the `Bank` table using any combination of provided `clientId`, `portfolioId`, or `entityId`.
 * - Includes the related `bankList` for each matched bank.
 * - Filters out any `null` bankList relations.
 * - Deduplicates the result by `BankList.id` to ensure uniqueness.
 *
 * @param body - The {@link BankSourceIdsDto} containing optional filter IDs for `clientId`, `portfolioId`, and `entityId`.
 * @returns A promise that resolves to an array of unique {@link BankList} objects.
 */
	public async getBankListBySourceId(body: BankSourceIdsDto,): Promise<Array<BankList>> {
		const filters: Array<Prisma.BankWhereInput> = [
			body.clientIds?.length ?
				{ clientId: { in: body.clientIds, }, } :
				undefined,
			body.portfolioIds?.length ?
				{ portfolioId: { in: body.portfolioIds, }, } :
				undefined,
			body.entityIds?.length ?
				{ entityId: { in: body.entityIds, }, } :
				undefined,
		].filter((f,): f is NonNullable<typeof f> => {
			return Boolean(f,)
		},)

		const banks = await this.prismaService.bank.findMany({
			where: {
				AND: filters.length > 0 ?
					filters :
					undefined ,
			},
			include: {
				bankList: true,
			},
		},)

		return banks
			.map((item,) => {
				return item.bankList
			},)
			.filter((item,): item is BankList => {
				return item !== null
			},)
			.reduce((acc: Array<BankList>, current: BankList,) => {
				const alreadyIncluded = acc.some((item,) => {
					return item.id === current.id
				},)
				if (alreadyIncluded) {
					return acc
				}
				return [...acc, current,]
			}, [],)
	}
}