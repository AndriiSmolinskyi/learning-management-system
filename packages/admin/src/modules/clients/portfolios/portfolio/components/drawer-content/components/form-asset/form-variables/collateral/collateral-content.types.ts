import type {
	CurrencyList,
	IOptionType,
} from '../../../../../../../../../../shared/types'

export interface ICollateralFormValues {
	assetName?: IOptionType
	currency?: IOptionType<CurrencyList>
	startDate?: Date
	endDate?: Date
	currencyValue?: number
	usdValue?: number
	creditProvider?: string
	creditAmount?: number
	comment?: string
}

export interface IEditCollateralFormValues extends Omit<ICollateralFormValues, 'currency'> {
  currency?: string;
}