import type {
	IOptionType,
	CurrencyList,
} from '../../../../../../../../../../shared/types'

export interface IRealEstateFormValues {
	assetName?: IOptionType
	currency?: IOptionType<CurrencyList>
	investmentDate?: Date
	currencyValue?: number
	usdValue?: number
	marketValueFC?: number
	projectTransaction?: IOptionType
	operation?: IOptionType
	comment?: string
	country?: IOptionType
	city?: string
}

export interface IEditRealEstateFormValues extends Omit<IRealEstateFormValues, 'currency' | 'projectTransaction' | 'operation' | 'country'> {
  currency?: string;
  projectTransaction?: string;
  operation?: string;
  country?: string;
}