import type {
	IOptionType,
} from '../../../../../../../../shared/types'

export interface IPortfolioValidateValues {
    documents?: IOptionType | null;
    portfolioName: string;
    portfolioType: IOptionType | undefined;
    resident?: IOptionType ;
    taxResident?: IOptionType;
}

export interface IPortfolioFormValues {
    documents?: IOptionType | null;
    portfolioName: string;
    portfolioType: IOptionType;
    resident?: IOptionType ;
    taxResident?: IOptionType;
}

export interface IPortfolioErrorValues {
    portfolioName?: string;
    portfolioType?: string;
}
