import type {
	TOtherInvestmentExtended,
} from '../../../services/analytics/analytics.types'
import type {
	TExcelSheetType,
} from '../../../shared/types'

export const getOtherInvestmentsSheetData = (tableData: Array<TOtherInvestmentExtended>,): TExcelSheetType => {
	return [[
		'Portfolio',
		'Entity',
		'Bank',
		'Account',
		'Asset name',
		'Service provider',
		'Currency',
		'Value in currency',
		'Cost Value USD',
		'Market Value USD',
		'Profit USD',
		'Profit %',
		'Value date',
	], ...tableData.map(({
		portfolioName = '- -',
		entityName = '- -',
		bankName = '- -',
		accountName = '- -',
		investmentAssetName = '- -',
		serviceProvider = '- -',
		currency = '- -',
		currencyValue = 0,
		investmentDate = '- -',
		usdValue = 0,
		marketValueUsd = 0,
		profitUsd = 0,
		percent = 0,
	},) => {
		return [
			portfolioName,
			entityName,
			bankName,
			accountName,
			investmentAssetName,
			serviceProvider,
			currency,
			Number(currencyValue,),
			Number(usdValue,),
			Number(marketValueUsd,),
			Number(profitUsd,),
			Number(percent,),
			investmentDate ?
				String(investmentDate,) :
				'- -',
		]
	},),]
}