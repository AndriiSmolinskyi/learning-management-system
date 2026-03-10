import type {
	IAnalyticCrypto,
} from '../../../services/analytics/analytics.types'
import {
	AssetOperationType,
} from '../../../shared/types'
import type {
	TExcelSheetType,
} from '../../../shared/types'
import {
	format,
} from 'date-fns'
import {
	formatWithAllDecimals,
	localeString,
} from '../../../shared/utils'

export const getProductTypeValue = (row: IAnalyticCrypto,): string => {
	return row.productType || 'Crypto Direct Hold'
}

export const getIssuerValue = (row: IAnalyticCrypto,): string => {
	if (row.productType === 'Crypto ETF') {
		return row.issuer ?? '- -'
	}
	return '- -'
}

export const getISINValue = (row: IAnalyticCrypto,): string => {
	if (row.productType === 'Crypto ETF') {
		return row.isin ?? '- -'
	}
	return '- -'
}

export const getSecurityValue = (row: IAnalyticCrypto,): string => {
	if (row.productType === 'Crypto ETF') {
		return row.security ?? '- -'
	}
	return '- -'
}

export const getCurrencyValue = (row: IAnalyticCrypto,): string => {
	if (row.productType === 'Crypto ETF') {
		return row.currency ?? '- -'
	}
	return 'USD'
}

export const getCurrentStockPriceValue = (row: IAnalyticCrypto,): string => {
	if (row.currentStockPrice) {
		return String(row.currentStockPrice,)
	}
	return '- -'
}

export const getUnitsValue = (row: IAnalyticCrypto, operation?: string,): string => {
	if (row.productType === 'Crypto ETF') {
		if (row.units && operation) {
			return operation === AssetOperationType.BUY ?
				formatWithAllDecimals(row.units,) :
				`-${formatWithAllDecimals(row.units,)}`
		}
		return '- -'
	}
	return '- -'
}

export const getValueInCryptoValue = (row: IAnalyticCrypto,): string => {
	if (row.productType === 'Crypto ETF' || !row.cryptoAmount) {
		return '- -'
	}
	return formatWithAllDecimals(row.cryptoAmount,)
}

export const getValueDateValue = (row: IAnalyticCrypto,): string => {
	const dateToFormat = row.productType === 'Crypto ETF' ?
		row.valueDate :
		row.purchaseDate
	if (dateToFormat) {
		return format(new Date(dateToFormat,), 'dd.MM.yyyy',)
	}
	return '- -'
}

export const getCostPriceValue = (row: IAnalyticCrypto,): string => {
	if (row.productType === 'Crypto ETF') {
		if (row.costPrice) {
			return localeString(row.costPrice, '', 2,)
		}
		return '- -'
	}
	return localeString(row.purchasePrice, '', 2,)
}

export const getCountryValue = (row: IAnalyticCrypto,): string => {
	if (row.productType === 'Crypto ETF') {
		return row.country ?? 'Global'
	}
	return '- -'
}

export const getSectorValue = (row: IAnalyticCrypto,): string => {
	if (row.productType === 'Crypto ETF') {
		return row.sector ?? 'Undefined'
	}
	return '- -'
}

export const getWalletExchangeValue = (row: IAnalyticCrypto,): string => {
	if (row.productType === 'Crypto ETF') {
		return '- -'
	}
	return row.exchangeWallet ?? '- -'
}

export const getCryptoSheetData = (tableData: Array<IAnalyticCrypto>,): TExcelSheetType => {
	return [[
		'Product type',
		'Portfolio',
		'Entity',
		'Bank',
		'Account',
		'Issuer',
		'ISIN',
		'Security',
		'Crypto',
		'Currency',
		'Units',
		'Cost price',
		'Current stock price',
		'Cost value USD',
		'Market value USD',
		'Profit USD',
		'Profit %',
		'Country',
		'Wallet/Exchange',
		'Value Date',

	], ...tableData.flatMap((row,) => {
		const rows: Array<Array<string | number | Date>> = []
		rows.push([
			getProductTypeValue(row,),
			row.portfolioName,
			row.entityName,
			row.bankName,
			row.accountName,
			getIssuerValue(row,),
			getISINValue(row,),
			getSecurityValue(row,),
			row.cryptoCurrencyType ?? '- -',
			getCurrencyValue(row,),
			Number(row.units,),
			row.costPrice ?
				Number(row.costPrice,) :
				Number(row.purchasePrice,),
			Number(row.currentStockPrice,),
			Number(row.costValueUsd,),
			Number(row.marketValueUsd,),
			Number(row.profitUsd,),
			Number(row.profitPercentage,),
			getCountryValue(row,),
			getWalletExchangeValue(row,),
			row.valueDate ?
				String(row.valueDate,) :
				'- -',
		],)
		return rows
	},),]
}