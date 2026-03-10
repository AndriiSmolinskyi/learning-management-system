import type {
	IPortfolio,
} from '../../../../../shared/types'

export const getResumeStep = (portfolio: IPortfolio,): number => {
	const {
		accounts, banks, entities,
	} = portfolio
	if (accounts.length > 0) {
		return 5
	} else if (banks.length > 0) {
		return 4
	} else if (entities.length > 0) {
		return 3
	}
	return 2
}