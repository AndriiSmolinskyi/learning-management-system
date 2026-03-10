import type {
	IOptionType,
	CurrencyList,
} from '../../../../../../../../../../shared/types'

export interface IOptionsFormValues {
	assetName?: IOptionType
	currency?: IOptionType<CurrencyList>
	startDate?: Date
	maturityDate?: Date
	pairAssetCurrency?: string
	principalValue?: number
	strike?: number
	premium?: number
	marketOpenValue?: number
	currentMarketValue?: number
	contracts?: number
	comment?: string
}