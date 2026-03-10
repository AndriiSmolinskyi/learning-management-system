import type {
	IPortfolioErrorValues,
	IPortfolioValidateValues,
} from './form-portfolio.types'
import {
	ValidatePortfolioMessages,
} from './form-portfolio.constants'

export const validatePortfolio = (values: IPortfolioValidateValues,): IPortfolioErrorValues => {
	const errors: IPortfolioErrorValues = {
	}
	if (!values.portfolioName) {
		errors.portfolioName = ValidatePortfolioMessages.PORTFOLIO_NAME_ERROR
	}

	if (!values.portfolioType?.label) {
		errors.portfolioType = ValidatePortfolioMessages.PORTFOLIO_TYPE_ERROR
	}
	return errors
}