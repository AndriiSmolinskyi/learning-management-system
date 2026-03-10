import type {
	MultiValue,
} from 'react-select'
import type {
	IOptionType,
	RequestStatusType,
	RequestType,
} from '../../../shared/types'

export type StepType = 1 | 2 | 3 | 4

export type LinkedAccountType = {
	id: string
	name: string
	bankId?: string
}

export type RequestFormValues = {
	type: RequestType | undefined
	clientId: IOptionType<LinkedAccountType> | undefined
	bankId: string | undefined
	accountId: IOptionType<LinkedAccountType> | undefined
	portfolioId: IOptionType<LinkedAccountType> | undefined
	entityId: IOptionType<LinkedAccountType> | undefined
   amount?: string
   assetId?: IOptionType<LinkedAccountType> | undefined;
   comment?: string | null
}

export type TRequestSearch = {
	portfolioId?: IOptionType<LinkedAccountType> | undefined
	bankId?: IOptionType<LinkedAccountType> | undefined
	entityId?: IOptionType<LinkedAccountType> | undefined
   assetId?: IOptionType<LinkedAccountType> | undefined;
   statuses?: MultiValue<IOptionType<RequestStatusType>> | undefined;
}

export type TLocationState = {
  edit?: { requestId: string };
  details?: { requestId: string };
};