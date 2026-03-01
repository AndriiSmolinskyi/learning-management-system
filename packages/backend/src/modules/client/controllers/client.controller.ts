/* eslint-disable no-unused-vars */
/* eslint-disable no-mixed-spaces-and-tabs */
import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	UseGuards,
	Patch,
	Delete,
	UseInterceptors,
} from '@nestjs/common'
import {
	ApiParam,
	ApiTags,
	ApiBody,
} from '@nestjs/swagger'

import { JWTAuthGuard, RolesGuard,} from '../../../shared/guards'
import { RolesDecorator, } from '../../../shared/decorators'
import { ClientService, } from '../services/client.service'
import { ClientRoutes, SwaggerDescriptions, } from '../client.constants'

import {
	ActivateClientDto,
	AddClientDto,
	GetByIdDto,
	GetClientsDto,
	UpdateClientDto,
} from '../dto'
import type {
	TAsyncClientsListRes,
	TClientRes,
	// TClientsListRes,
} from '../client.types'
import { Roles, } from '../../../shared/types'
import { CacheTTL, } from '@nestjs/cache-manager'
import { THREE_DAYS_CACHE_TIME, RedisCacheInterceptor, } from '../../../modules/redis-cache'

@Controller(ClientRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags(SwaggerDescriptions.CLIENT_TAG,)
export class ClientController {
	constructor(
		private readonly clientService: ClientService,
	) { }

	/**
	 * Retrieves a list of clients based on the provided query parameters.
	 * @param query - An object containing the query parameters for filtering and pagination.
	 * @returns A Promise that resolves to an object containing the list of clients and pagination metadata.
	 * @remarks
	 * The `getClients` function retrieves a list of clients based on the provided query parameters.
	 * It uses the `ClientService` to perform the database query and returns the result.
	 * The query parameters include:
	 * - `skip`: The number of clients to skip in the result set.
	 * - `take`: The maximum number of clients to retrieve.
	 * - `sortBy`: The field to sort the clients by.
	 * - `sortOrder`: The order in which to sort the clients (ascending or descending).
	 * - `search`: A search term to filter the clients by.
	 * The returned object contains the list of clients and pagination metadata.
	 */
	@Get(ClientRoutes.LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getClients(
		@Query() filters: GetClientsDto,

	): Promise<TAsyncClientsListRes> {
		return this.clientService.getClients(filters,)
	}

	/**
	 * Creates a new client in the system.
	 * @remarks
	 * This function is responsible for handling the creation of new clients.
	 * It uses the `ClientService` to interact with the database and perform the necessary operations.
	 * @param body - An object containing the details of the client to be created.
	 * The `AddClientDto` type should be used to ensure the correct structure and validation of the input data.
	 * @returns A Promise that resolves to an object representing the newly created client.
	 * The `TClientRes` type should be used to define the structure of the response data.
	 * @throws Will throw an error if the client creation fails or if the input data is invalid.
	*/
	@Get(ClientRoutes.SELECT_LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	public async getClientsForSelect(): Promise<Array<{value: string, label: string}>> {
		return this.clientService.getClientsForSelect()
	}

	/**
 * Creates a new client in the system.
 * @remarks
 * This endpoint is used by authorized roles to register a new client.
 * It accepts the client's data and returns the created client with all necessary metadata.
 * Only users with `BACK_OFFICE_MANAGER` or `FAMILY_OFFICE_MANAGER` roles can perform this operation.
 * @param body - The data required to create a client, such as name, email, and other profile info.
 * @returns A Promise that resolves to the created client entity.
 */
	@Post(ClientRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: 'Create Client',
		type:        AddClientDto,
	},)
	public async createClient(
		@Body() body: AddClientDto,
	): Promise<TClientRes> {
		return this.clientService.createClient(body,)
	}

	/**
	 * Retrieves a client by its ID.
	 * @param params - An object containing the client ID.
	 * @param params.id - The unique identifier of the client.
	 * @returns A Promise that resolves to an object representing the client.
	 * @throws Will throw an error if the client retrieval fails or if the client ID is invalid.
	*/
	@Get(ClientRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: 'Client ID',
	},)
	// @CacheTTL(THREE_DAYS_CACHE_TIME,)
	// @UseInterceptors(RedisCacheInterceptor,)
	public async getClientById(
		@Param() params: GetByIdDto,
	): Promise<TClientRes> {
		return this.clientService.getClientById(params.id,)
	}

	/**
	* 4.2.1
	* Deletes portfolio by its ID.
	 *
	 * @remarks
	 * - This route is used to delete the specific portfolio by its `id`.
	 * - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER.
	 *
	 * @param params - The ID of the portfolio to delete.
	 */
	@Delete(ClientRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: 'Client ID',
	},)
	public async deleteClientById(
			@Param() params: GetByIdDto,
	): Promise<void> {
		return this.clientService.deleteClientById(params.id,)
	}

	/**
	 * Updates an existing client in the system.
	 * @remarks
	 * This function is responsible for handling the update of existing clients.
	 * It uses the `ClientService` to interact with the database and perform the necessary operations.
	 * @param id - The unique identifier of the client to be updated.
	 * @param body - An object containing the updated details of the client.
	 * The `UpdateClientDto` type should be used to ensure the correct structure and validation of the input data.
	 * @returns A Promise that resolves to an object representing the updated client.
	 * The `TClientRes` type should be used to define the structure of the response data.
	 * @throws Will throw an error if the client update fails or if the client ID or input data is invalid.
	*/
	@Patch(ClientRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: 'Client ID',
	},)
	@ApiBody({
		description: 'Update Client',
		type:        UpdateClientDto,
	},)
	public async updateClient(
		@Param('id',) id: string,
		@Body() body: UpdateClientDto,
	): Promise<TClientRes> {
		return this.clientService.updateClientFull(id, body,)
	}

	/**
	 * Activates a client in the system.
	 * @remarks
	 * This function is responsible for handling the activation of clients.
	 * It uses the `ClientService` to interact with the database and perform the necessary operations.
	 * @param id - The unique identifier of the client to be activated.
	 * @param body - An object containing the activation details of the client.
	 * The `ActivateClientDto` type should be used to ensure the correct structure and validation of the input data.
	 * @returns A Promise that resolves to an object representing the activated client.
	 * The `TClientRes` type should be used to define the structure of the response data.
	 * @throws Will throw an error if the client activation fails or if the client ID or input data is invalid.
	*/
	@Patch(ClientRoutes.ACTIVATE_ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: 'Client ID',
	},)
	@ApiBody({
		description: 'Activate Client',
		type:        ActivateClientDto,
	},)
	public async activateClient(
		@Param('id',) id: string,
		@Body() body: ActivateClientDto,
	): Promise<TClientRes> {
		return this.clientService.activateClient(id, body,)
	}

	/**
 * Resends a confirmation email to a client based on their ID.
 * @remarks
 * This is used to re-trigger the email confirmation process for a client.
 * Typically used when the original confirmation email is lost or expired.
 * Only authorized users with proper roles can access this route.
 * @param id - The unique identifier of the client.
 * @returns A Promise that resolves when the email is successfully sent.
 */
   @Post(ClientRoutes.RESEND_CONFIRMATION,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: 'Client ID',
	},)
	public async resendConfirmation(
      @Param('id',) id: string,
	): Promise<void> {
		await this.clientService.sendConfirmation(id,)
	}

	/**
	 * CR - 173
	 * Sends a password reset email to a client based on their email address.
	 * @remarks
	 * This endpoint allows authorized users to trigger the password reset process
	 * for a client who has forgotten or needs to change their password.
	 * The email contains a secure link for the client to set a new password.
	 * Only users with proper roles can access this route.
	 * @param email - The email address of the client.
	 * @returns A Promise that resolves when the password reset email is successfully sent.
	 */
	@Post(ClientRoutes.RESET_PASSWORD,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: 'Client ID',
	},)
   public async resetPassword(
		@Param('email',) email: string,
   ): Promise<void> {
   	await this.clientService.resetPassword(email,)
   }
}
