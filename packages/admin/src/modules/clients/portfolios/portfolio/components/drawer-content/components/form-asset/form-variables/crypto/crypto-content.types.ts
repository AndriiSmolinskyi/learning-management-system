import type {
	AssetOperationType,
	CryptoList,
	CryptoType,
	CurrencyList,
	IOptionType,
} from '../../../../../../../../../../shared/types'

export interface ICryptoFormValues {
	productType?: CryptoType

	assetName?: IOptionType
	cryptoCurrencyType?: IOptionType<CryptoList>
	cryptoAmount?: number
	exchangeWallet?: string
	purchaseDate?: Date
	purchasePrice?: number

	currency?: IOptionType<CurrencyList>
	transactionDate?: Date
	isin?: IOptionType
	units?: number
	transactionPrice?: number
	bankFee?: number
	equityType?: IOptionType
	operation?: IOptionType<AssetOperationType>

	comment?: string
}

export interface IEditCryptoFormValues extends Omit<ICryptoFormValues, 'cryptoCurrencyType'> {
	cryptoCurrencyType?: string;
}

export interface ICryptoFormStepDetailsValues extends Omit<ICryptoFormValues, 'productType'> {
	productType?: IOptionType<CryptoType>;
}
