import type {
	ILoanAnalytic,
} from '../../../services/analytics/analytics.types'
import type {
	TExcelSheetType,
} from '../../../shared/types'

export const getLoanSheetData = (tableData: Array<ILoanAnalytic>,): TExcelSheetType => {
	return [[
		'Portfolio',
		'Entity',
		'Bank',
		'Account',
		'Name',
		'Start date',
		'Maturity',
		'Currency',
		'Value FC',
		'Value USD',
		'Interest',
		'Interest today',
		'Interest maturity',
	], ...tableData.map(({
		portfolioName,
		entityName,
		bankName,
		accountName,
		name,
		startDate,
		maturityDate,
		currency,
		currencyValue,
		usdValue,
		interest,
		todayInterest,
		maturityInterest,
	},) => {
		return [
			portfolioName,
			entityName,
			bankName,
			accountName,
			name,
			String(startDate,),
			String(maturityDate,),
			currency,
			Number(currencyValue,),
			Number(usdValue,),
			Number(interest,),
			Number(todayInterest,),
			Number(maturityInterest,),
		]
	},),]
}