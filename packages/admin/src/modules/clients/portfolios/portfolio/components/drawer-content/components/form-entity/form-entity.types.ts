import type {
	IOptionType,
} from '../../../../../../../../shared/types'

export interface IEntityFormValues {
    documents?: IOptionType | null;
    entityName: string;
    country: IOptionType;
    authorizedSignatoryName: string ;
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface IEntityErrorValues {
    entityName?: string;
    country?: string;
    authorizedSignatoryName?: string;
}

export interface IEntityValidateValues {
    documents?: IOptionType | null;
    entityName: string;
    country: IOptionType | undefined;
    authorizedSignatoryName: string ;
    firstName?: string;
    lastName?: string;
    email?: string;
}