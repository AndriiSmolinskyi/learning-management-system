import type {
	IOptionType,
	CurrencyList,
} from '../../../../../../../../../../shared/types'

export interface IAssetCashFormValues {
	assetName?: IOptionType
	currency?: IOptionType<CurrencyList>
	comment?: string
}