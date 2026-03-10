import type {
	IOptionType,
	AssetNamesType,
	CryptoType,
	MetalType,
} from '../../../../../../shared/types'

export type StepType = 1 | 2 | 3

export type SelectedEntity = {
   portfolioId?: string | null
	portfolioDraftId?: string | null
	entityId: string
}

export type SelectedBank = SelectedEntity & {
	bankId: string
}

export type CreateAssetProps = SelectedBank & {
	accountId: string
}

export type CustomField = {
	label: string
	info: string
}

export type AssetFormValues = {
   assetName: IOptionType<AssetNamesType> | undefined
	isin?: IOptionType<string> | undefined
	security?: string
	currencyValue?: string
	assetMainId?: string
	productType?: IOptionType<CryptoType> | IOptionType<MetalType> | undefined
}

export type EditAssetFormValues = {
   assetName: IOptionType<AssetNamesType> | undefined
	// reason: string
	isin?: IOptionType<string> | undefined
	security?: string
	currencyValue?: string
	productType?: IOptionType<CryptoType> | IOptionType<MetalType> | undefined
}

export type OtherFormValues = {
   assetName: IOptionType<AssetNamesType> | undefined
	isin?: IOptionType<string> | undefined
	security?: string
	customFields?: Array<CustomField>
}

export type AssetName = {
	value: AssetNamesType;
	label: string;
}
