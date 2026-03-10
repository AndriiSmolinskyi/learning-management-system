import type {
	IOptionType, SelectOptionType,
} from '../../../../../../../../shared/types'

export interface IBankFormValues {
    documents?: string
    bankName: IOptionType<SelectOptionType>;
    country: IOptionType;
    branchName: string ;
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface IBankErrorValues {
    bankName?: string;
    country?: string;
    branchName?: string;
}

export interface IBankValidateValues {
    bankName: IOptionType<SelectOptionType> | undefined;
    country: IOptionType | undefined;
    branchName: string ;
    firstName?: string;
    lastName?: string;
    email?: string;
}