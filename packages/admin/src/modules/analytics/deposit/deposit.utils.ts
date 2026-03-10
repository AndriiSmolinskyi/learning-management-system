import type {
	TExcelSheetType,
} from '../../../shared/types'
import type {
	IAnalyticDeposit,
} from '../../../services/analytics/analytics.types'

export const getDepositSheetData = (tableData: Array<IAnalyticDeposit>,): TExcelSheetType => {
	return [[
		'Portfolio',
		'Entity',
		'Bank',
		'Account',
		'Start date',
		'Maturity',
		'Currency',
		'Value FC',
		'Value USD',
		'Interest',
		'Policy',

	], ...tableData.map(({
		portfolioName = '',
		entityName = '',
		bankName = '',
		accountName = '',
		startDate,
		maturityDate,
		currency,
		currencyValue,
		usdValue,
		interest,
		policy,
	},) => {
		return [
			portfolioName,
			entityName,
			bankName,
			accountName,
			startDate ?
				String(startDate,) :
				'- -',
			maturityDate ?
				String(maturityDate,) :
				'- -',
			currency,
			Number(currencyValue,),
			Number(usdValue,),
			Number(interest,),
			policy,
		]
	},),]
}
