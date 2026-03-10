import type {
	IOptionType,
	CurrencyList,
} from '../../../../../../../../../../shared/types'

export interface IEquityFormValues {
	assetName?: IOptionType
	currency?: IOptionType<CurrencyList>
	transactionDate?: Date
	isin?: IOptionType
	units?: number
	transactionPrice?: number
	bankFee?: number
	equityType?: IOptionType
	operation?: IOptionType
	comment?: string
  }

export interface IEquityEditFormValues extends Omit<IEquityFormValues, 'currency' | 'isin'> {
  currency?: string;
  isin?: string;
}