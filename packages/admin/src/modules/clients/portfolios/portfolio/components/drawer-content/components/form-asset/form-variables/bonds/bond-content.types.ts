import type {
	IOptionType,
	CurrencyList,
} from '../../../../../../../../../../shared/types'

export interface IBondFormFields {
	assetName?: IOptionType
	currency?: IOptionType<CurrencyList>
	valueDate?: Date;
	isin?: IOptionType;
	security?: string;
	units?: number;
	unitPrice?: number;
	bankFee?: number;
	accrued?: number;
	operation?: IOptionType;
	comment?: string;
	documents?: IOptionType
}

export interface IBondFormEditFields extends Omit<IBondFormFields, 'currency' | 'isin'> {
  currency?: string;
  isin?: string;
}