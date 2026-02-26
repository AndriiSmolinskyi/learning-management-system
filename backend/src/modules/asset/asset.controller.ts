import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
	Query,
	UsePipes,
	ValidationPipe,
	Delete,
} from '@nestjs/common'
import {
	ApiBody,
	ApiParam,
	ApiTags,
	ApiQuery,
} from '@nestjs/swagger'
import type { Asset, } from '@prisma/client'
import { GetBondsEquityDto, } from './dto/get-bonds-equity.dto'
import { JWTAuthGuard, RolesGuard,} from '../../shared/guards'
import { AssetService, } from './asset.service'
import { AssetRoutes, ApiBodyDescriptions, } from './asset.constants'
import { RolesDecorator, } from '../../shared/decorators'
import type { TAssetSelectItem, } from './asset.types'
import { CreateAssetDto,  GetAssetUnitsDto,  GetByIdDto, GetByIdRefactoredDto, GetByIdsDto, SourceIdDto, TransferAssetDto, UpdateAssetDto,} from './dto'
import { Roles, } from '../../shared/types'
import { TDeleteRefactoredAssetPayload,} from './asset.types'
import type { AssetWithRelationsDecrypted, } from './asset.types'

@Controller(AssetRoutes.MODULE,)
@UseGuards(JWTAuthGuard, RolesGuard,)
@ApiTags('Asset',)
export class AssetController {
	constructor(
		private readonly assetService: AssetService,
	) { }

	/**
	 * CR - 167
	 * Retrieves a refactored asset by its ID and type.
	 * @remarks
	 * This endpoint fetches the complete details of a specific asset (refactored version) based on its unique ID
	 * and asset type (e.g., Deposit, Etf, Metal, etc.). It is protected by JWT authentication and restricted
	 * to specific user roles.
	 * Only users with the roles `Roles.BACK_OFFICE_MANAGER`, `Roles.FAMILY_OFFICE_MANAGER`, or `Roles.INVESTMEN_ANALYST`
	 * have access to this endpoint.
	 * @param data - Query parameters for identifying the asset.
	 * @param data.id - The unique identifier of the asset to retrieve.
	 * @param data.assetName - The name/type of the asset to retrieve (e.g., Deposit, Etf, Metal, Crypto).
	 * @returns A Promise that resolves to the decrypted asset with its related entities.
	 */
	@Get(AssetRoutes.GET_ASSET,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	public async getRefactoredAssetById(
		@Query() data: GetByIdRefactoredDto,
	): Promise<AssetWithRelationsDecrypted> {
		return this.assetService.getRefactoredAssetById(data,)
	}

	/**
	 * CR - 001
	  * Retrieves a list of assets by an array of bank account IDs.
 * @remarks
 * This endpoint allows users to fetch assets associated with multiple bank accounts.
 * Accessible to users with roles BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, or INVESTMEN_ANALYST.
 * @param args - DTO containing an array of bank account IDs.
 * @returns A Promise resolving to an array of assets associated with the given bank account IDs.
 */
	@Get(AssetRoutes.ASSET_LIST_BY_IDS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiQuery({
		name:        'id',
		type:        GetByIdsDto,
		description: ApiBodyDescriptions.GET_ASSETS_BY_BANKS_IDS,
	},)
	public async getAssetListByBanksIds(
		@Query() args: GetByIdsDto,
	): Promise<Array<Asset>> {
		return this.assetService.getAssetListByBanksIds(args.id,)
	}

	/**
	 * Retrieves a list of assets based on the portfolio ID.
	 * @remarks
	 * This endpoint fetches all assets linked to the specified portfolio. It is guarded by JWT authentication and roles guard.
	 * Only users with the roles `Roles.BACK_OFFICE_MANAGER` or `Roles.FAMILY_OFFICE_MANAGER` can access this endpoint.
	 * @param portfolioId - The unique identifier of the portfolio.
	 * @returns A Promise that resolves to an array of assets associated with the specified portfolio.
	 */
	@Get(AssetRoutes.GET_ASSET_LIST,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'portfolioId',
		description: ApiBodyDescriptions.PORTFOLIO_ID,
	},)
	public async getAssetList(
		@Param('portfolioId',) portfolioId: string,
	): Promise<Array<Asset>> {
		return this.assetService.getAssetList(portfolioId,)
	}

	/**
	 * Creates a new asset with the provided data.
	 * @remarks
	 * This endpoint allows users to create a new asset by providing the necessary details. It is guarded by JWT authentication and roles guard.
	 * Only users with the roles `Roles.BACK_OFFICE_MANAGER` or `Roles.FAMILY_OFFICE_MANAGER` can access this endpoint.
	 * @param body - The asset creation form values, including asset details like name, type, and value.
	 * @returns A Promise that resolves to the created asset.
	 */
	@Post(AssetRoutes.CREATE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		description: ApiBodyDescriptions.CREATE_ASSET,
		type:        CreateAssetDto,
	},)
	public async createAsset(
		@Body() body: CreateAssetDto,
	): Promise<Asset> {
		return this.assetService.createAsset(body,)
	}

	/**
	 * 3.1.9
	 * Retrieves assets by source account ID.
 * @remarks
 * This endpoint fetches all assets linked to a specified source account.
 * Accessible to users with roles BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, or INVESTMEN_ANALYST.
 * @param query - The source account ID as a string.
 * @returns A Promise resolving to a list of assets for the given account.
 */
	@Get(AssetRoutes.SOURCE,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
	},)
	@UsePipes(new ValidationPipe({ transform: true, },),)
	@ApiQuery({
		description: ApiBodyDescriptions.SOURCE_ID,
		type:        SourceIdDto,
	},)
	public async getAssetsBySourceId(
		@Query('accountId',) query: string,
	): Promise<Array<Asset>> {
		return this.assetService.getAssetsBySourceId({accountId: query,},)
	}

	@Get(AssetRoutes.ASSETS_FOR_REQUEST,)
	@RolesDecorator({
		roles: [
			Roles.BACK_OFFICE_MANAGER,
			Roles.FAMILY_OFFICE_MANAGER,
			Roles.INVESTMEN_ANALYST,
		],
		clientAccess: true,
	},)
	public async getBondAndEquityForSelect(
	@Query() query: GetBondsEquityDto,
	): Promise<
	Array<TAssetSelectItem>
	> {
		return this.assetService.getBondAndEquityForSelect(query,)
	}

	/**
 * CR-085
 * Retrieves the total units of a specified asset.
 *
 * @remarks
 * This endpoint is used to calculate the total number of currently held units
 * for a given asset, based on ISIN, currency or metal type, and account ID.
 *
 * The result is computed by summing all BUY operations and subtracting all SELL operations
 * from the user's asset portfolio. Applicable for BONDS, EQUITY_ASSET, and METALS.
 *
 * @access Restricted to roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, INVESTMEN_ANALYST.
 * Client access is allowed.
 *
 * @param query - A query object containing accountId, currency (or metal), ISIN, and assetName.
 * @returns An object with the total calculated units for the specified asset.
 */
	@Get(AssetRoutes.ASSET_TOTAL_UNITS,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiQuery({
		name:        'Total units request body',
		type:        GetAssetUnitsDto,
		description: ApiBodyDescriptions.TOTAL_UNITS,
	},)
	public async getAssetUnits(
			@Query() query: GetAssetUnitsDto,
	): Promise<{totalUnits: number}> {
		return this.assetService.getAssetUnits(query,)
	}

	/**
 		* CR - 075
 		* Transfers an asset to a different account, bank, entity, portfolio, or client.
 		* @remarks
 		* - This route updates the ownership-related fields (`accountId`, `bankId`, `entityId`, `portfolioId`, `clientId`) of an existing asset.
 		* - The asset is identified by its `id`, which must be provided in the request body.
 		* - Accessible only to users with roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER.
 		* @param body - The request body must include the `id` of the asset and new ownership data.
 		* @returns The updated asset after transfer.
 	*/
	@Patch(AssetRoutes.TRANSFER,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiBody({
		type:        TransferAssetDto,
		description: ApiBodyDescriptions.TRANSFER_ASSET,
	},)
	public async transferAsset(
		@Body() body: TransferAssetDto,
	): Promise<Asset> {
		return this.assetService.transferAsset(body,)
	}

	/**
	 * Updates an existing asset by its ID.
	 * @remarks
	 * This endpoint allows updating the details of an existing asset. It is guarded by JWT authentication and roles guard.
	 * Only users with the roles `Roles.BACK_OFFICE_MANAGER` or `Roles.FAMILY_OFFICE_MANAGER` can access this endpoint.
	 * @param params - Parameters for identifying the asset.
	 * @param params.id - The unique identifier of the asset to update.
	 * @param body - The updated asset data, including fields like name, type, or value.
	 * @returns A Promise that resolves to the updated asset.
	 */
	@Patch(AssetRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        'id',
		description: ApiBodyDescriptions.ASSET_ID,
	},)
	@ApiBody({
		description: ApiBodyDescriptions.UPDATE_ASSET,
		type:        UpdateAssetDto,
	},)
	public async updateAsset(
		@Param() params: GetByIdDto,
		@Body() body: UpdateAssetDto,
	): Promise<Asset> {
		return this.assetService.updateAsset(params.id, body,)
	}

	/**
	 * 3.2.7
	 * Retrieves a list of assets based on account ID and asset name.
	 * @remarks
	 * This endpoint fetches all assets that match the specified account ID and asset name. It is guarded by JWT authentication and roles guard.
	 * Only users with the roles `Roles.BACK_OFFICE_MANAGER` or `Roles.FAMILY_OFFICE_MANAGER` can access this endpoint.
	 * @param accountId - The unique identifier of the account.
	 * @param assetName - The name of the asset to filter.
	 * @returns A Promise that resolves to an array of assets matching the specified criteria or an empty array if none are found.
	 */
	@Get(AssetRoutes.GET_ASSETS_BY_ACCOUNT_NAME,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiQuery({
		name:        'accountId',
		required:    true,
		description: ApiBodyDescriptions.ACCOUNT_ID,
	},)
	@ApiQuery({
		name:        'assetName',
		required:    true,
		description: ApiBodyDescriptions.ASSET_NAME,
	},)
	public async getAssetsByAccountAndName(
	@Query('accountId',) accountId: string,
	@Query('assetName',) assetName: string,
	): Promise<Array<Asset>> {
		return this.assetService.getAssetsByAccountAndName(accountId, assetName,)
	}

	/**
	 * CR - 040
	 * Retrieves an asset by its unique ID.
 * @remarks
 * This endpoint fetches a single asset based on its identifier.
 * Accessible to users with roles BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER, or INVESTMEN_ANALYST.
 * The method ensures client-level access validation as well.
 *
 * @param params - Object containing the asset ID (`id`) as a route parameter.
 * @returns A Promise resolving to the asset that matches the provided ID.
 */
	@Get(AssetRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,],
		clientAccess: true,
	},)
	@ApiParam({
		name:        'assetId',
		description: ApiBodyDescriptions.ASSET_ID,
	},)
	public async getAssetById(
			@Param() params: GetByIdDto,
	): Promise<AssetWithRelationsDecrypted> {
		return this.assetService.getAssetById(params.id,)
	}

	/**
	* CR - 071
	* Deletes asset by its ID.
	*
	* @remarks
	* - This route is used to delete the specific asset by its `id`.
	* - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER.
	*
	* @param params - The ID of the asset to delete.
	*/
	@Delete(AssetRoutes.ID,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        ApiBodyDescriptions.ASSET_ID,
		description: ApiBodyDescriptions.ASSET_ID,
	},)
	public async deleteAssetById(
			@Param() params: GetByIdDto,
	): Promise<Asset> {
		return this.assetService.deleteAssetById(params.id,)
	}

	/**
	 * CR - 167
	 * Deletes a specific asset by its ID and asset type.
	 * @remarks
	 * - This route is used to delete a specific asset by its `id`, taking into account the provided `assetName` (asset type).
	 * - It supports multiple asset categories such as CASH_DEPOSIT, BONDS, EQUITY_ASSET, etc.
	 * - It is accessible by users with specific roles: BACK_OFFICE_MANAGER, FAMILY_OFFICE_MANAGER.
	 *
	 * @param params - The ID of the asset to delete.
	 * @param assetName - The type of asset to delete (e.g., CASH_DEPOSIT, BONDS, CRYPTO, etc.).
	 */
	@Delete(`${AssetRoutes.ASSET_NAME}/${AssetRoutes.ID}`,)
	@RolesDecorator({
		roles:        [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,],
	},)
	@ApiParam({
		name:        ApiBodyDescriptions.ASSET_ID,
		description: ApiBodyDescriptions.ASSET_ID,
	},)
	public async deleteRefactoredAssetById(
		@Param() params: GetByIdDto,
		@Query() query: TDeleteRefactoredAssetPayload,
	): Promise<Asset> {
		return this.assetService.deleteRefactoredAssetById({id: params.id, query,},)
	}
}
