import {
	PortfolioType,
} from '../../../../../../../../shared/types'

export const portfolioTypesArray = [
	{
		value: PortfolioType.CORPORATE,
		label: 'Corporate',
	},
	{
		value: PortfolioType.PRIVATE,
		label: 'Private',
	},
	{
		value: PortfolioType.JOINT,
		label: 'Joint',
	},
]

export const enum ValidatePortfolioMessages {
  PORTFOLIO_NAME_ERROR = 'Portfolio name is required',
  PORTFOLIO_TYPE_ERROR = 'Portfolio type is required',
}
