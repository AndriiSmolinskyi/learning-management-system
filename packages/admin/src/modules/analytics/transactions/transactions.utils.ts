/* eslint-disable complexity */
import type {
	TExcelSheetType, TransactionAnalytics,
} from '../../../shared/types'

export const getTransactionsSheetData = (tableData: Array<TransactionAnalytics>,): TExcelSheetType => {
	return [[
		'Date',
		'Portfolio',
		'Entity',
		'Bank',
		'Account',
		'Transaction name',
		'Currency',
		'Value FC',
		'Value in USD',
		'Comment',
		'Service provider',
		'ISIN',
		'Security',
	], ...tableData.map(({
		transactionDate,
		portfolioName,
		entityName,
		bankName,
		accountName,
		typeVersion,
		currency,
		amount,
		usdValue,
		isin,
		security,
		serviceProvider,
		comment,
	},) => {
		return [
			String(transactionDate ?? '- -',),
			portfolioName ?? '- -',
			entityName ?? '- -',
			bankName ?? '- -',
			accountName ?? '- -',
			typeVersion?.name ?? '- -A',
			currency ?? '- -',
			Number(amount,),
			Number(usdValue,),
			comment ?? '- -',
			serviceProvider ?? '- -',
			isin ?? '- -',
			security ?? '- -',
		]
	},),]
}