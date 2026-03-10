import type {
	IOptionType,
	MetalList,
	MetalType,
} from '../../../../../../../../../../shared/types'

export interface IMetalsFormValues {
	assetName?: IOptionType
	metalType?: IOptionType<MetalList>
	transactionDate?: Date
	purchasePrice?: number
	units?: number
	operation?: IOptionType
	comment?: string
  }

export interface IEditMetalsFormValues extends Omit<IMetalsFormValues, 'metalType' | 'operation'> {
  metalType?: string;
  operation?: string;
}

export interface IMetalFormStepDetailsValues extends Omit<IMetalsFormValues, 'productType'> {
	productType?: IOptionType<MetalType>;
}