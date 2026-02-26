import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { PrismaService,} from 'nestjs-prisma'

import {
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
} from '../../../shared/constants'

import type { Message, } from '../../../shared/types'
import type { IListItemBody, ISelectItemBody,} from '../list-hub.types'
import { CryptoService, } from '../../crypto/crypto.service'

@Injectable()
export class ServiceProvidersListService {
	constructor(
		private readonly cryptoService: CryptoService,
		private readonly prismaService: PrismaService,
	) {}

	/**
	 * 1.3/1.4
	 * Retrieves all service provider list items from the database.
	 * @returns A promise that resolves to an array of {@link IListItemBody} objects.
	 * Each object represents a service provider list item with its `value` and `label`.
	 * @throws {HttpException} If there is an error retrieving the service provider list items.
	 * The error message and HTTP status code are provided in the exception.
	 */
	public async getServiceProvidersList(): Promise<Array<IListItemBody>> {
		try {
			const serviceProviders = await this.prismaService.serviceProvidersList.findMany({
				select: {
					name: true,
				},
			},)
			return serviceProviders.map((provider,) => {
				return {
					name: this.cryptoService.decryptString(provider.name,),
				}
			},)
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.RETRIEVE_SERVICE_PROVIDERS_LIST, HttpStatus.BAD_REQUEST,)
		}
	}

	/**
	 * 1.3/1.4
	 * Retrieves all service provider list items from the database.
	 * @returns A promise that resolves to an array of {@link IListItemBody} objects.
	 * Each object represents a service provider list item with its `value` and `label`.
	 * @throws {HttpException} If there is an error retrieving the service provider list items.
	 * The error message and HTTP status code are provided in the exception.
	 */
	// todo: clear after new version qa passed
	// public async getEncryptedServiceProvidersList(): Promise<Array<ISelectItemBody>> {
	// 	try {
	// 		const serviceProviders = await this.prismaService.transaction.findMany({
	// 			select: {
	// 				serviceProvider: true,
	// 			},
	// 		},)
	// 		const decryptedList = serviceProviders
	// 			.map((sp,) => {
	// 				if (!sp.serviceProvider) {
	// 					return null
	// 				}
	// 				return {
	// 					encrypted: sp.serviceProvider,
	// 					decrypted: this.cryptoService.decryptString(sp.serviceProvider,),
	// 				}
	// 			},)
	// 			.filter((item,): item is NonNullable<typeof item> => {
	// 				return item !== null
	// 			},)
	// 		const uniqueMap = new Map<string, { encrypted: string; decrypted: string }>()
	// 		decryptedList.forEach((item,) => {
	// 			if (!uniqueMap.has(item.decrypted,)) {
	// 				uniqueMap.set(item.decrypted, item,)
	// 			}
	// 		},)
	// 		const uniqueServiceProviders = Array.from(uniqueMap.values(),).map((item,) => {
	// 			return {
	// 				value: item.encrypted,
	// 				label: item.decrypted,
	// 			}
	// 		},)
	// 		return uniqueServiceProviders
	// 	} catch (error) {
	// 		throw new HttpException(ERROR_MESSAGES.RETRIEVE_SERVICE_PROVIDERS_LIST, HttpStatus.BAD_REQUEST,)
	// 	}
	// }

	public async getEncryptedServiceProvidersList(): Promise<Array<ISelectItemBody>> {
		try {
			const providers = await this.prismaService.serviceProvidersList.findMany({
				select: {
					name: true,
				},
			},)

			const decrypted = providers.map((p,) => {
				const decryptedName = this.cryptoService.decryptString(p.name,)
				return {
					value: p.name,
					label: decryptedName,
				}
			},)

			return decrypted
		} catch {
			throw new HttpException(
				ERROR_MESSAGES.RETRIEVE_SERVICE_PROVIDERS_LIST,
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	/**
	 * 1.3/1.4
	 * Creates a new service provider list item in the database.
	 * @param data - The body of the request containing the `value` and `label` of the new service provider list item.
	 * @returns A promise that resolves to a {@link Message} object indicating the success of the operation.
	 * @throws {HttpException} If there is an error creating the service provider list item.
	 * The error message and HTTP status code are provided in the exception.
	 */
	public async createServiceProviderListItem(data: IListItemBody,): Promise<Message> {
		try {
			await this.prismaService.serviceProvidersList.create({
				data: {
					name: this.cryptoService.encryptString(data.name,),
				},
			},)
			return {
				message: SUCCESS_MESSAGES.SERVICE_PROVIDER_ADDED,
			}
		} catch (error) {
			throw new HttpException(ERROR_MESSAGES.SERVICE_PROVIDER_CREATE_ERROR, HttpStatus.BAD_REQUEST,)
		}
	}
}