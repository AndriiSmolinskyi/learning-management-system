import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	AssetRoutes,
} from './asset.constants'
import type {
	TEditAssetProps,
	IAsset,
	TAssetCreateBody,
	TAssetGetTotalUnits,
	TAssetTransferRequest,
	IAssetWithRelationsDecrypted,
	AssetNamesType,
	TDeleteRefactoredAssetPayload,
} from '../../shared/types'
import type {
	TGetAssetsBySourceProps,
} from './asset.types'
import queryString from 'query-string'
import type {
	DocumentIds,
} from '../document/document.types'
import type {
	TAssetSelectItem,
} from '../../shared/types'

class AssetService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = AssetRoutes.MODULE

	public async getAssetList(portfolioId: string,): Promise<Array<IAsset>> {
		return this.httpService.get(`${this.module}/${AssetRoutes.GET_ASSET_LIST}/${portfolioId}`,)
	}

	public async createAsset(body: TAssetCreateBody,): Promise<IAsset> {
		return this.httpService.post(`${this.module}/${AssetRoutes.CREATE}`, body,)
	}

	public async transferAsset(body: TAssetTransferRequest,): Promise<IAsset> {
		return this.httpService.patch(`${this.module}/${AssetRoutes.TRANSFER}`, body,)
	}

	public async updateAsset({
		id, ...body
	}: TEditAssetProps,):
		Promise<IAsset> {
		return this.httpService.patch(`${this.module}/${id}`, {
			...body,
		},)
	}

	public async getAssetById(assetId?: string,): Promise<IAssetWithRelationsDecrypted> {
		return this.httpService.get(`${this.module}/${assetId}`,)
	}

	public async getRefactoredAssetById(data: {id: string, assetName: AssetNamesType, hasMainId?: boolean},): Promise<IAssetWithRelationsDecrypted> {
		return this.httpService.get(`${this.module}/${AssetRoutes.GET_ASSET}`, {
			params: {
				...data,
			},
		},)
	}

	public async getAssetsByAccountAndName(accountId: string, assetName: string,): Promise<Array<IAsset>> {
		return this.httpService.get(`${this.module}/${AssetRoutes.GET_ASSETS_BY_ACCOUNT_NAME}`, {
			params: {
				accountId, assetName,
			},
		},)
	}

	public async getAssetsBySourceId(
		props: TGetAssetsBySourceProps,
	): Promise<Array<IAsset>> {
		return this.httpService.get(`${this.module}/${AssetRoutes.SOURCE}`, {
			params: {
				...props,
			},
		},)
	}

	public async getAssetUnits(
		params: TAssetGetTotalUnits,
	): Promise<{totalUnits: number}> {
		return this.httpService.get(`${this.module}/${AssetRoutes.ASSET_TOTAL_UNITS}`, {
			params,
		},)
	}

	public async getAssetListByBanksIds(ids?: DocumentIds,): Promise<Array<IAsset>> {
		return this.httpService.get(
			`${this.module}/${AssetRoutes.ASSET_LIST_BY_IDS}?${queryString.stringify(ids ?? {

			}, {
				arrayFormat: 'bracket',
			},)}`,
		)
	}

	public async deleteAssetById(id: string,): Promise<IAsset> {
		return this.httpService.delete(`${this.module}/${id}`,)
	}

	public async deleteRefactoredAssetById(data: TDeleteRefactoredAssetPayload,): Promise<IAsset> {
		return this.httpService.delete(`${this.module}/${AssetRoutes.ASSET_NAME}/${data.id}`, {
			params: {
				assetName: data.assetName,
				userInfo:  data.userInfo,
			},
		},
		)
	}

	public async getBondAndEquityForSelect(
		params: TGetAssetsBySourceProps,
	): Promise<Array<TAssetSelectItem>> {
		return this.httpService.get(
			`${this.module}/${AssetRoutes.ASSETS_FOR_REQUEST}`,
			{
				params,
			},
		)
	}
}

export const assetService = new AssetService(new HttpFactoryService().createHttpService(),)
