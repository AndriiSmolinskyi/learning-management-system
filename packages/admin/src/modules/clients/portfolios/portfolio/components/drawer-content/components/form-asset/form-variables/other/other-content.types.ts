import type {
	IOptionType,
	CurrencyList,
} from '../../../../../../../../../../shared/types'

export interface IAssetOtherValues {
	assetName?: IOptionType
	investmentAssetName?: string
	currency?: IOptionType<CurrencyList>
	investmentDate?: Date
	currencyValue?: number
	usdValue?: number
	serviceProvider?: string
	comment?: string
}

export interface IEditAssetOtherValues extends Omit<IAssetOtherValues, 'currency'> {
  currency?: string;
}