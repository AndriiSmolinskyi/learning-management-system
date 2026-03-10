import type {
	IOptionType,
	AssetNamesType,
	CryptoType,
	MetalType,
} from '../../../../../../../../shared/types'

export interface IAssetFormValues {
    documents?: string
    assetName: IOptionType<AssetNamesType>;
}

export interface IAssetErrorValues {
    assetName?: string;
}

export interface IAssetValidateValues {
   assetName: IOptionType<AssetNamesType> | undefined;
	productType?: IOptionType<CryptoType> | IOptionType<MetalType> | string | undefined;
}
