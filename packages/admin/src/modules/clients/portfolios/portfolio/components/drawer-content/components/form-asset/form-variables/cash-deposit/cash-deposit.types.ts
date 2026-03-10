import type {
	IOptionType,
	CurrencyList,
} from '../../../../../../../../../../shared/types'

export interface ICashDepositFormValues {
	assetName?: IOptionType
	currency?: IOptionType<CurrencyList>
	interest?: number
	currencyValue?: number
	startDate?: Date | undefined
	maturityDate?: Date
	policy?: IOptionType
	toBeMatured?: boolean
	comment?: string
}

export interface IDepositFormEditFields extends Omit<ICashDepositFormValues, 'currency'> {
  currency?: string;
}