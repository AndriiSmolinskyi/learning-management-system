import type {
	IOptionType,
	CurrencyList,
} from '../../../../../../../../../../shared/types'

export interface ILoanFormFieldsValues {
  assetName?: IOptionType
  loanName?: string;
  startDate?: Date;
  maturityDate?: Date;
  currency?: IOptionType<CurrencyList>
  currencyValue?: number;
  usdValue?: number;
  interest?: number;
  todayInterest?: number;
  maturityInterest?: number;
  comment?: string;
  documents?: IOptionType
}

export interface IEditLoanFormFieldsValues extends Omit<ILoanFormFieldsValues, 'currency'> {
  currency?: string;
}