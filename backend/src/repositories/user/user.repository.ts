import { PrismaService, } from 'nestjs-prisma'
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import type { Prisma, } from '@prisma/client'
import type { User, } from '@prisma/client'

import { text, } from '../../shared/text'

@Injectable()
export class UserRepository {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	/**
	 * 1.2/1.3/1.4
	 * Retrieves a user by their unique identifier.
	 * @param id - The unique identifier of the user to retrieve.
	 * @returns A promise that resolves to the user with the specified ID, or null if no user is found.
	 */
	public async findById(id: string,): Promise<User> {
		const user = await this.prismaService.user.findUnique({
			where: {
				id,
			},
		},)

		if (!user) {
			throw new HttpException(text.userNotExist, HttpStatus.NOT_FOUND,)
		}

		return user
	}

	/**
	 * 1.4
	 * Updates a user in the database by their unique identifier.
	 * @param id - The unique identifier of the user to update.
	 * @param data - The data to update for the user.
	 * @returns A promise that resolves to the updated user.
	 */
	public async updateById(id: string, data: Prisma.UserUpdateInput,): Promise<User> {
		return this.prismaService.user.update({
			where: {
				id,
			},
			data,
		},)
	}
}
