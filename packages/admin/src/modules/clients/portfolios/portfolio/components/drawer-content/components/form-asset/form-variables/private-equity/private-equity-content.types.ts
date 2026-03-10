import type {
	IOptionType,
	PrivateEquityStatusEnum,
	CurrencyList,
} from '../../../../../../../../../../shared/types'

export interface IAssetPrivateValues {
  assetName?:IOptionType
  status?: IOptionType<PrivateEquityStatusEnum>
  currency?: IOptionType<CurrencyList>
  entryDate?: string
  currencyValue?: string
  serviceProvider?: IOptionType
  geography?: string
  fundName?: string
  fundID?: string
  fundType?: string
  fundSize?: IOptionType
  aboutFund?: string
  investmentPeriod?: string
  fundTermDate?: string
  capitalCalled?: string
  lastValuationDate?: string
  moic?: number
  irr?: number
  liquidity?: number
  totalCommitment?: string
  tvpi?: string
  managementExpenses?: number
  otherExpenses?: number
  carriedInterest?: number
  distributions?: number
  holdingEntity?: string
  comment?: string
}

export interface IEditAssetPrivateValues extends Omit<IAssetPrivateValues, 'currency' | 'status' | 'serviceProvider' | 'fundSize'> {
  currency?: string;
  status?: string;
  serviceProvider?: string;
  fundSize?: string;
}
