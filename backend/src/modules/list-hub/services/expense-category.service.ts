import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'

import {
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
} from '../../../shared/constants/messages.constants'

import type {
	Message,
} from '../../../shared/types'
import type {
	IListItemBody,
} from '../list-hub.types'
import type { ExpenseCategoryCreateDto, } from '../dto'

@Injectable()
export class ExpenseCategoryListService {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	/**
	 * 4.2.2
	 * Retrieves all expense category list items from the database.
	 * @returns A promise that resolves to an array of {@link IListItemBody} objects.
	 * Each object represents a expense category list item with its `value` and `label`.
	 * @throws {HttpException} If there is an error retrieving the expense category list items.
	 * The error message and HTTP status code are provided in the exception.
	 */
	public async getExpenseCategoryList(clientId: string,): Promise<Array<IListItemBody>> {
		try {
			return this.prismaService.expenseCategoryList.findMany({
				where: {
					OR: [
						{ clientId, },
						{ clientId: null, },
					],
				},
				select: {
					name: true,
				},
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.RETRIEVE_EXPENSE_LIST_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 4.2.2
	 * Creates a new expense category list item in the database.
	 * @param body - The body of the request containing the `value` and `label` of the new expense category list item.
	 * @returns A promise that resolves to a {@link Message} object indicating the success of the operation.
	 * @throws {HttpException} If there is an error creating the expense category list item.
	 * The error message and HTTP status code are provided in the exception.
	*/
	public async createExpenseCategoryListItem(data: ExpenseCategoryCreateDto,): Promise<Message> {
		try {
			await this.prismaService.expenseCategoryList.create({
				data,
			},)
			return {
				message: SUCCESS_MESSAGES.EXPENSE_CATEGORY_ADDED,
			}
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.EXPENSE_CATEGORY_ADD_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}
}