/* eslint-disable complexity */
import type {
	Asset,
} from '@prisma/client'
import { AssetNamesType, } from '../../modules/asset/asset.types'
import type {
	IBondsAsset,
	ICashAsset,
	ICollateralAsset,
	ICryptoAsset,
	IDepositAsset,
	IEquityAsset,
	ILoanAsset,
	IMetalsAsset,
	IOptionAsset,
	IOtherAsset,
	IPrivateAsset,
	IRealEstateAsset,
} from '../../modules/asset/asset.types'

export type UnionAssetType =
	IBondsAsset |
	ICashAsset |
	ICollateralAsset |
	ICryptoAsset |
	IDepositAsset |
	IEquityAsset |
	ILoanAsset |
	IMetalsAsset |
	IOptionAsset |
	IOtherAsset |
	IPrivateAsset |
	IRealEstateAsset

interface IAssetPayload {
   asset: Asset
	assetName: AssetNamesType
}

type AssetTypeMap = {
	[AssetNamesType.BONDS]: IBondsAsset;
	[AssetNamesType.CASH]: ICashAsset;
	[AssetNamesType.CASH_DEPOSIT]: IDepositAsset;
	[AssetNamesType.COLLATERAL]: ICollateralAsset;
	[AssetNamesType.CRYPTO]: ICryptoAsset;
	[AssetNamesType.EQUITY_ASSET]: IEquityAsset;
	[AssetNamesType.OTHER]: IOtherAsset;
	[AssetNamesType.METALS]: IMetalsAsset;
	[AssetNamesType.OPTIONS]: IOptionAsset;
	[AssetNamesType.PRIVATE_EQUITY]: IPrivateAsset;
	[AssetNamesType.REAL_ESTATE]: IRealEstateAsset;
	[AssetNamesType.LOAN]: ILoanAsset;
}

type ReturnTypeOfSwitchParser<T extends AssetNamesType> =
    T extends AssetNamesType.BONDS ? IBondsAsset :
    T extends AssetNamesType.CASH ? ICashAsset :
    T extends AssetNamesType.CASH_DEPOSIT ? IDepositAsset :
    T extends AssetNamesType.COLLATERAL ? ICollateralAsset :
    T extends AssetNamesType.CRYPTO ? ICryptoAsset :
    T extends AssetNamesType.EQUITY_ASSET ? IEquityAsset :
    T extends AssetNamesType.LOAN ? ILoanAsset :
    T extends AssetNamesType.METALS ? IMetalsAsset :
    T extends AssetNamesType.OPTIONS ? IOptionAsset :
    T extends AssetNamesType.OTHER ? IOtherAsset :
    T extends AssetNamesType.PRIVATE_EQUITY ? IPrivateAsset :
    T extends AssetNamesType.REAL_ESTATE ? IRealEstateAsset :
    null;

export const payloadParserUtil = <T extends keyof AssetTypeMap>(
	asset: Asset,
): AssetTypeMap[T] | null => {
	try {
		const {payload, ...data} = asset
		const parsedPayload = JSON.parse(payload as string,)
		return {
			...data,
			...parsedPayload,
		} as AssetTypeMap[T]
	} catch (error) {
		return null
	}
}

export const assetParserUtil = <T extends AssetNamesType>(data: IAssetPayload,): ReturnTypeOfSwitchParser<T> | null => {
	const {assetName, asset,} = data
	switch (assetName) {
	case AssetNamesType.BONDS:
		return payloadParserUtil<AssetNamesType.BONDS>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.CASH:
		return payloadParserUtil<AssetNamesType.CASH>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.CASH_DEPOSIT:
		return payloadParserUtil<AssetNamesType.CASH_DEPOSIT>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.COLLATERAL:
		return payloadParserUtil<AssetNamesType.COLLATERAL>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.CRYPTO:
		return payloadParserUtil<AssetNamesType.CRYPTO>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.EQUITY_ASSET:
		return payloadParserUtil<AssetNamesType.EQUITY_ASSET>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.LOAN:
		return payloadParserUtil<AssetNamesType.LOAN>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.METALS:
		return payloadParserUtil<AssetNamesType.METALS>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.OPTIONS:
		return payloadParserUtil<AssetNamesType.OPTIONS>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.OTHER:
		return payloadParserUtil<AssetNamesType.OTHER>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.PRIVATE_EQUITY:
		return payloadParserUtil<AssetNamesType.PRIVATE_EQUITY>(asset,) as ReturnTypeOfSwitchParser<T>
	case AssetNamesType.REAL_ESTATE:
		return payloadParserUtil<AssetNamesType.REAL_ESTATE>(asset,) as ReturnTypeOfSwitchParser<T>
	default:
		return null
	}
}

export const assetParser = <T extends UnionAssetType = UnionAssetType>(asset: Asset,): T | null => {
	const {
		payload,
		...data
	} = asset
	try {
		if (typeof payload === 'string') {
			const parsedPayload = JSON.parse(payload,)
			return {
				...data,
				...parsedPayload,
			} as T
		}
		return null
	} catch (error) {
		return null
	}
}