import type {
	TExcelSheetType,
} from '../../../shared/types'
import type {
	IAnalyticPrivate,
} from '../../../services/analytics/analytics.types'

export const getPrivateEquitySheetData = (tableData: Array<IAnalyticPrivate>,): TExcelSheetType => {
	return [[
		'PE type',
		'Status',
		'Portfolio',
		'Entity',
		'Bank',
		'Account',
		'Name',
		'Number',
		'Currency',
		'Called capital',
		'Total commitment',
		'Values USD',
		'P/L%',
		'Start date',
	], ...tableData.map(({
		fundType,
		status,
		portfolioName,
		entityName,
		bankName,
		accountName,
		fundName,
		fundID,
		currency,
		entryDate,
		capitalCalled,
		totalCommitment,
		usdValue,
		pl,
	},) => {
		return [
			fundType,
			status,
			portfolioName ?? '- -',
			entityName ?? '- -',
			bankName ?? '- -',
			accountName ?? '- -',
			fundName,
			Number(fundID,),
			currency,
			Number(capitalCalled,),
			Number(totalCommitment,),
			Number(usdValue,),
			Number(pl,),
			entryDate ?
				String(entryDate,) :
				'- -',
		]
	},),]
}
