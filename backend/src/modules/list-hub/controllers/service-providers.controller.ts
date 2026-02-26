import {
	Body,
	Controller,
	Post,
	UseGuards,
	Get,
} from '@nestjs/common'
import {
	ApiBody,
	ApiTags,
} from '@nestjs/swagger'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { ServiceProvidersListService, } from '../services'
import { ServiceProvidersRoutes, ServiceProvidersApiBodyDescriptions, } from '../list-hub.constants'
import { RolesDecorator, } from '../../../shared/decorators'

import { Roles, type Message, } from '../../../shared/types'
import type {IListItemBody, ISelectItemBody, } from '../list-hub.types'
import { ListItemCreateDto, } from '../dto/list-item-create.dto'

@Controller(ServiceProvidersRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('ServiceProviders',)
export class ServiceProvidersListController {
	constructor(
		private readonly serviceProvidersListServicem: ServiceProvidersListService,
	) { }

	/**
	 * 1.3/1.4
	 * Retrieves all service provider list items from the database.
	 * @returns A promise that resolves to an array of service provider list items.
	 * Each item contains the properties defined in the IListItemBody interface.
	 */
	@Get(ServiceProvidersRoutes.GET,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getServiceProvidersList(): Promise<Array<IListItemBody>> {
		return this.serviceProvidersListServicem.getServiceProvidersList()
	}

	/**
	 * 1.3/1.4
	 * Retrieves all service provider list items from the database.
	 * @returns A promise that resolves to an array of service provider list items.
	 * Each item contains the properties defined in the IListItemBody interface.
	 */
	@Get(ServiceProvidersRoutes.GET_ENCRYPTED,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getEncryptedServiceProvidersList(): Promise<Array<ISelectItemBody>> {
		return this.serviceProvidersListServicem.getEncryptedServiceProvidersList()
	}

	/**
	 * 1.3/1.4
	 * Creates a new service provider list item in the database.
	 * @param body - The body of the request containing the details of the new service provider list item.
	 * The body should conform to the IListItemBody interface.
	 * @returns A promise that resolves to a Message object.
	 * The Message object contains a success message indicating that the service provider list item was created.
	 * @throws Will throw an error if the creation of the service provider list item fails.
	 */
	@Post(ServiceProvidersRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: ServiceProvidersApiBodyDescriptions.CREATE_SERVICE_PROVIDER,
		type:        ListItemCreateDto,
	},)
	public async createServiceProviderListItem(
		@Body() body: ListItemCreateDto,
	): Promise<Message> {
		return this.serviceProvidersListServicem.createServiceProviderListItem(body,)
	}
}
