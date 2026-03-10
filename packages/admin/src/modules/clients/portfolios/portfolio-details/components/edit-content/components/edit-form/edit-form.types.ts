
import type {
	IOptionType,
} from '../../../../../../../../shared/types'
import {
	ValidatePortfolioMessages,
} from '../../../../../portfolio/components/drawer-content/components/form-portfolio'

export interface IPortfolioEditFormValues {
	name: string;
	type?: IOptionType;
	resident?: IOptionType ;
	taxResident?: IOptionType;
}

export interface IPortfolioEditFormErrors {
    name?: string;
    type?: string;
}

export const validateEditPortfolio = (values: IPortfolioEditFormValues,): IPortfolioEditFormErrors => {
	const errors: IPortfolioEditFormErrors = {
	}
	if (!values.name) {
		errors.name = ValidatePortfolioMessages.PORTFOLIO_NAME_ERROR
	}

	if (!values.type?.label) {
		errors.type = ValidatePortfolioMessages.PORTFOLIO_TYPE_ERROR
	}
	return errors
}