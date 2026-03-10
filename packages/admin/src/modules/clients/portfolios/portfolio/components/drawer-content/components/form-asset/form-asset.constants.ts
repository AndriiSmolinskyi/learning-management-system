/* eslint-disable max-lines */
import {
	AssetNamesType,
	CryptoList,
	CryptoType,
	MetalList,
	MetalType,
} from '../../../../../../../../shared/types'
import {
	CurrencyList,
	PrivateEquityStatusEnum,
} from '../../../../../../../../shared/types'
import {
	AssetOperationType,
} from '../../../../../../../../shared/types'

export const enum ValidateAssetMessages {
   ASSET_NAME_ERROR = 'Asset name is required',
	COUNTRY_TYPE_ERROR = 'Country type is required',
	BRANCHNAME_ERROR = 'Brenchname is required',
}

export const assetArray = [
	{
		value: AssetNamesType.BONDS,
		label: 'Bonds',
	},
	{
		value: AssetNamesType.CASH,
		label: 'Cash',
	},
	{
		value: AssetNamesType.CASH_DEPOSIT,
		label: 'Deposit',
	},
	{
		value: AssetNamesType.COLLATERAL,
		label: 'Collateral',
	},
	{
		value: AssetNamesType.CRYPTO,
		label: 'Crypto',
	},
	{
		value: AssetNamesType.EQUITY_ASSET,
		label: 'Equity asset',
	},
	{
		value: AssetNamesType.OTHER,
		label: 'Other investments',
	},
	{
		value: AssetNamesType.METALS,
		label: 'Metals',
	},
	{
		value: AssetNamesType.OPTIONS,
		label: 'Options',
	},
	{
		value: AssetNamesType.PRIVATE_EQUITY,
		label: 'Private equity',
	},
	{
		value: AssetNamesType.REAL_ESTATE,
		label: 'Real estate',
	},
	{
		value: AssetNamesType.LOAN,
		label: 'Loan',
	},
]

export const currencyOptions = [
	{
		value: CurrencyList.AED, label: 'AED',
	},
	{
		value: CurrencyList.AUD, label: 'AUD',
	},
	{
		value: CurrencyList.BRL, label: 'BRL',
	},
	{
		value: CurrencyList.CAD, label: 'CAD',
	},
	{
		value: CurrencyList.CHF, label: 'CHF',
	},
	{
		value: CurrencyList.EUR, label: 'EUR',
	},
	{
		value: CurrencyList.GBP, label: 'GBP',
	},
	{
		value: CurrencyList.HKD, label: 'HKD',
	},
	{
		value: CurrencyList.ILS, label: 'ILS',
	},
	{
		value: CurrencyList.JPY, label: 'JPY',
	},
	{
		value: CurrencyList.MXN, label: 'MXN',
	},
	{
		value: CurrencyList.NOK, label: 'NOK',
	},
	{
		value: CurrencyList.RUB, label: 'RUB',
	},
	{
		value: CurrencyList.TRY, label: 'TRY',
	},
	{
		value: CurrencyList.USD, label: 'USD',
	},
	{
		value: CurrencyList.ZAR, label: 'ZAR',
	},
	{
		value: CurrencyList.DKK, label: 'DKK',
	},
	{
		value: CurrencyList.SEK, label: 'SEK',
	},
	{
		value: CurrencyList.KRW, label: 'KRW',
	},
	{
		value: CurrencyList.CNY, label: 'CNY',
	},
	{
		value: CurrencyList.KZT, label: 'KZT',
	},
]

export const operationsVariables = [
	{
		value: AssetOperationType.BUY, label: 'Buy',
	},
	{
		value: AssetOperationType.SELL, label: 'Sell',
	},
]

export const privateEquityStatusVariables = [
	{
		value: PrivateEquityStatusEnum.OPEN, label: 'Open',
	},
	{
		value: PrivateEquityStatusEnum.CLOSED, label: 'Closed',
	},
]

export const transactionsTypesOpitons = [
	{
		value: 'Deposit Interest', label: 'Deposit Interest',
	},
	{
		value: 'Bond Coupon Payment', label: 'Bond Coupon Payment',
	},
	{
		value: 'Equity Dividend Payment', label: 'Equity Dividend Payment',
	},
	{
		value: 'Deposit Fee', label: 'Deposit Fee',
	},
	{
		value: 'Transfer Fee', label: 'Transfer Fee',
	},
	{
		value: 'Salary Payment', label: 'Salary Payment',
	},
	{
		value: 'Account Holding Fee', label: 'Account Holding Fee',
	},
	{
		value: 'Service Provider Payment', label: 'Service Provider Payment',
	},
	{
		value: 'Credit Card', label: 'Credit Card',
	},
	{
		value: 'Bond Sell', label: 'Bond Sell',
	},
	{
		value: 'Bond Sell Fee', label: 'Bond Sell Fee',
	},
	{
		value: 'Portfolio Management Fee', label: 'Portfolio Management Fee',
	},
	{
		value: 'Tax Payment', label: 'Tax Payment',
	},
	{
		value: 'Audit', label: 'Audit',
	},
	{
		value: 'Postal Fee', label: 'Postal Fee',
	},
	{
		value: 'Lawyer', label: 'Lawyer',
	},
	{
		value: 'Purchase Private Equity Fee', label: 'Purchase Private Equity Fee',
	},
	{
		value: 'Rent Payment', label: 'Rent Payment',
	},
	{
		value: 'Deposit Tax', label: 'Deposit Tax',
	},
	{
		value: 'Equity Sell Fee', label: 'Equity Sell Fee',
	},
	{
		value: 'Equity Dividend Tax', label: 'Equity Dividend Tax',
	},
	{
		value: 'Equity Dividend Issue Fee', label: 'Equity Dividend Issue Fee',
	},
	{
		value: 'Equity Purchase Fee', label: 'Equity Purchase Fee',
	},
	{
		value: 'Bond Purchase Fee', label: 'Bond Purchase Fee',
	},
	{
		value: 'Loan Interest Payment', label: 'Loan Interest Payment',
	},
	{
		value: 'Loan Payment', label: 'Loan Payment',
	},
	{
		value: 'Currency Conversion Sell', label: 'Currency Conversion Sell',
	},
	{
		value: 'Deposit Maturity', label: 'Deposit Maturity',
	},
	{
		value: 'Purchase Private Equity', label: 'Purchase Private Equity',
	},
	{
		value: 'Outcome External Transfer', label: 'Outcome External Transfer',
	},
	{
		value: 'Service Provider Payment - Refund', label: 'Service Provider Payment - Refund',
	},
	{
		value: 'Deposit Call', label: 'Deposit Call',
	},
	{
		value: 'Rebalance (Internal Negative)', label: 'Rebalance (Internal Negative)',
	},
	{
		value: 'Deposit Open', label: 'Deposit Open',
	},
	{
		value: 'Income Internal Transfer', label: 'Income Internal Transfer',
	},
	{
		value: 'Income External Transfer', label: 'Income External Transfer',
	},
	{
		value: 'Outcome Internal Transfer', label: 'Outcome Internal Transfer',
	},
	{
		value: 'Rebalance (Internal)', label: 'Rebalance (Internal)',
	},
	{
		value: 'New Inflow', label: 'New Inflow',
	},
	{
		value: 'Negative Interest', label: 'Negative Interest',
	},
	{
		value: 'Loan', label: 'Loan',
	},
	{
		value: 'Bond Coupon Payment - Tax Reversal', label: 'Bond Coupon Payment - Tax Reversal',
	},
	{
		value: 'Bond Coupon Payment - Tax', label: 'Bond Coupon Payment - Tax',
	},
	{
		value: 'Open Balance', label: 'Open Balance',
	},
	{
		value: 'Portfolio Management Fee - Reversal', label: 'Portfolio Management Fee - Reversal',
	},
	{
		value: 'Purchase Private Equity - Reversal', label: 'Purchase Private Equity - Reversal',
	},
	{
		value: 'Dividend', label: 'Dividend',
	},
	{
		value: 'Credit Card Refund', label: 'Credit Card Refund',
	},
	{
		value: 'Family Transfer', label: 'Family Transfer',
	},
	{
		value: 'Bond Coupon Payment - Reversal', label: 'Bond Coupon Payment - Reversal',
	},
	{
		value: 'Tax Payment - Reversal', label: 'Tax Payment - Reversal',
	},
	{
		value: 'Option Premium - Buy Back', label: 'Option Premium - Buy Back',
	},
	{
		value: 'Loan Lend', label: 'Loan Lend',
	},
	{
		value: 'Equity Sell', label: 'Equity Sell',
	},
	{
		value: 'Bond Maturity', label: 'Bond Maturity',
	},
	{
		value: 'Option Premium', label: 'Option Premium',
	},
	{
		value: 'Bond Call', label: 'Bond Call',
	},
	{
		value: 'Equity Purchase', label: 'Equity Purchase',
	},
	{
		value: 'Investments - Return', label: 'Investments - Return',
	},
	{
		value: 'Account Holding Fee - Reversal', label: 'Account Holding Fee - Reversal',
	},
	{
		value: 'Equity Purchase Fee - Reversal', label: 'Equity Purchase Fee - Reversal',
	},
	{
		value: 'Equity Purchase Reversal', label: 'Equity Purchase Reversal',
	},
	{
		value: 'Equity Dividend Payment - Reversal', label: 'Equity Dividend Payment - Reversal',
	},
	{
		value: 'Equity Dividend Tax - Reversal', label: 'Equity Dividend Tax - Reversal',
	},
	{
		value: 'Bond Purchase', label: 'Bond Purchase',
	},
	{
		value: 'Investments Interest', label: 'Investments Interest',
	},
	{
		value: 'Metal Purchase', label: 'Metal Purchase',
	},
	{
		value: 'Bond Purchase - Reversal', label: 'Bond Purchase - Reversal',
	},
	{
		value: 'Bond Purchase Fee - Reversal', label: 'Bond Purchase Fee - Reversal',
	},
	{
		value: 'Metal Sell', label: 'Metal Sell',
	},
	{
		value: 'Portfolio Management Fee - Reversal', label: 'Portfolio Management Fee - Reversal',
	},
	{
		value: 'Currency Conversion Buy', label: 'Currency Conversion Buy',
	},
	{
		value: 'Private Equity Income', label: 'Private Equity Income',
	},
	{
		value: 'Purchase Private Equity Fee - Reversal', label: 'Purchase Private Equity Fee - Reversal',
	},
	{
		value: 'Stock Dividend Payment', label: 'Stock Dividend Payment',
	},
	{
		value: 'Stock Dividend Tax', label: 'Stock Dividend Tax',
	},
	{
		value: 'Bond Coupon Payment - Tax', label: 'Bond Coupon Payment - Tax',
	},
	{
		value: 'Option Exercise Buy', label: 'Option Exercise Buy',
	},
	{
		value: 'Metal Purchase Fee', label: 'Metal Purchase Fee',
	},
	{
		value: 'Cash Withdrawal', label: 'Cash Withdrawal',
	},
	{
		value: 'Option Exercise Sell', label: 'Option Exercise Sell',
	},
	{
		value: 'Rebalance (Internal Negative)', label: 'Rebalance (Internal Negative)',
	},
	{
		value: 'ATM Withdrawal', label: 'ATM Withdrawal',
	},
	{
		value: 'Rent Income', label: 'Rent Income',
	},
	{
		value: 'Metal Sell Fee', label: 'Metal Sell Fee',
	},
	{
		value: 'Stock Sell', label: 'Stock Sell',
	},
	{
		value: 'Mortgage Payment', label: 'Mortgage Payment',
	},
	{
		value: 'Stock Dividend Issue Fee', label: 'Stock Dividend Issue Fee',
	},
	{
		value: 'Stock Sell Fee', label: 'Stock Sell Fee',
	},
	{
		value: 'Deposit Interest - Reversal', label: 'Deposit Interest - Reversal',
	},
	{
		value: 'Stock Purchase Fee', label: 'Stock Purchase Fee',
	},
	{
		value: 'Stock Purchase Fee - Reversal', label: 'Stock Purchase Fee - Reversal',
	},
	{
		value: 'Bonds Coupon Fee', label: 'Bonds Coupon Fee',
	},
	{
		value: 'Stock Purchase', label: 'Stock Purchase',
	},
	{
		value: 'Telecommunication Payment', label: 'Telecommunication Payment',
	},
	{
		value: 'Electricity Payment', label: 'Electricity Payment',
	},
	{
		value: 'Insurance Payment', label: 'Insurance Payment',
	},
	{
		value: 'Social Insurance Payment', label: 'Social Insurance Payment',
	},
	{
		value: 'Stock Dividend Payment - Reversal', label: 'Stock Dividend Payment - Reversal',
	},
	{
		value: 'Bond Sell - Reversal', label: 'Bond Sell - Reversal',
	},
	{
		value: 'Bond Sell Fee - Reversal', label: 'Bond Sell Fee - Reversal',
	},
	{
		value: 'Option Purchase', label: 'Option Purchase',
	},
	{
		value: 'Social Security', label: 'Social Security',
	},
	{
		value: 'ETF Payment', label: 'ETF Payment',
	},
	{
		value: 'Property Tax', label: 'Property Tax',
	},
	{
		value: 'Real Estate Purchase', label: 'Real Estate Purchase',
	},
	{
		value: 'Bond Call - Reversal', label: 'Bond Call - Reversal',
	},
	{
		value: 'Income Cash Offer', label: 'Income Cash Offer',
	},
	{
		value: 'Loan Maturity', label: 'Loan Maturity',
	},
	{
		value: 'ETF payment Tax', label: 'ETF Payment tax',
	},
	{
		value: 'CLO Coupon Payment', label: 'CLO Coupon Payment',
	},
	{
		value: 'Negative Interest - Reversal', label: 'Negative Interest - Reversal',
	},
	{
		value: 'Stock Dividend Tax - Reversal', label: 'Stock Dividend Tax - Reversal',
	},
	{
		value: 'Stock Purchase Reversal', label: 'Stock Purchase Reversal',
	},
	{
		value: 'Metals Holding Fee', label: 'Metals Holding Fee',
	},
	{
		value: 'Bank Account Change', label: 'Bank Account Change',
	},
	{
		value: 'ATM Deposit', label: 'ATM Deposit',
	},
	{
		value: 'Corporate Activit', label: 'Corporate Activity',
	},
	{
		value: 'Currency Conversion Fee', label: 'Currency Conversion Fee',
	},
	{
		value: 'Bond Maturity - Reversal', label: 'Bond Maturity - Reversal',
	},
	{
		value: 'Split Fee', label: 'Split Fee',
	},
	{
		value: 'Investments Outcome', label: 'Investments Outcome',
	},
	{
		value: 'Rent', label: 'Rent',
	},
	{
		value: 'Real Estate Sell', label: 'Real Estate Sell',
	},
	{
		value: 'Option Sell', label: 'Option Sell',
	},
	{
		value: 'Car Purchase', label: 'Car Purchase',
	},
	{
		value: 'Option Purchase Fee', label: 'Option Purchase Fee',
	},
	{
		value: 'Deposit Open - Credit Card', label: 'Deposit Open - Credit Card',
	},
	{
		value: 'House Maintenance', label: 'House Maintenance',
	},
	{
		value: 'Car Accident Expenses', label: 'Car Accident Expenses',
	},
	{
		value: 'Option Premium - Reversal', label: 'Option Premium - Reversal',
	},
	{
		value: 'Investments - Sell', label: 'Investments - Sell',
	},
	{
		value: 'VAT Payment', label: 'VAT Payment',
	},
	{
		value: 'Car Purchase - Reversal', label: 'Car Purchase - Reversal',
	},
	{
		value: 'Auction Buy', label: 'Auction Buy',
	},
	{
		value: 'Auction Sell', label: 'Auction Sell',
	},
	{
		value: 'Deposit Fee - Reversal', label: 'Deposit Fee - Reversal',
	},
]

export const policyOptions = [
	{
		value: 'Daily', label: 'Daily',
	},
	{
		value: 'Weekly', label: 'Weekly',
	},
	{
		value: 'Monthly', label: 'Monthly',
	},
	{
		value: 'Bi-month', label: 'Bi-month',
	},
	{
		value: 'Quarter', label: 'Quarter',
	},
	{
		value: 'Semiannual', label: 'Semiannual',
	},
	{
		value: 'Annual', label: 'Annual',
	},
	{
		value: 'Liquidity fund', label: 'Liquidity fund',
	},
]

export const cryptoCurrencyOptions = [
	{
		value: CryptoList.BTC, label: 'Bitcoin (BTC)',
	},
	{
		value: CryptoList.ETH, label: 'Ethereum (ETH)',
	},
]

export const cryptoProductTypeOptions = [
	{
		value: CryptoType.ETF, label: 'Crypto ETF',
	},
	{
		value: CryptoType.DIRECT_HOLD, label: 'Crypto Direct Hold',
	},
]

export const metalProductTypeOptions = [
	{
		value: MetalType.ETF, label: 'Metal ETF',
	},
	{
		value: MetalType.DIRECT_HOLD, label: 'Metal Direct Hold',
	},
]

export const equityTypeOptions = [
	{
		value: 'General', label: 'General',
	},
	{
		value: 'ETF', label: 'ETF',
	},
	{
		value: 'Equity', label: 'Equity',
	},
	{
		value: 'Equity 1', label: 'Equity 1',
	},
	{
		value: 'Equity 2', label: 'Equity 2',
	},
	{
		value: 'Equity Metals', label: 'Equity Metals',
	},
	{
		value: 'Equity Fixed Income', label: 'Equity Fixed Income',
	},
]

export const equityOperationOptions = [
	{
		value: AssetOperationType.BUY, label: 'Buy',
	},
	{
		value: AssetOperationType.SELL, label: 'Sell',
	},
]

export const metalOptions = [
	{
		value: MetalList.XAU, label: 'XAU (Gold)',
	},
	{
		value: MetalList.XAG, label: 'XAG (Silver)',
	},
	{
		value: MetalList.XPT, label: 'XPT (Platinum)',
	},
	{
		value: MetalList.XPD, label: 'XPD (Palladium)',
	},
]

export const privateEquitySizeOptions = [
	{
		value: 'Big', label: 'Big',
	},
	{
		value: 'Medium', label: 'Medium',
	},
	{
		value: 'Small', label: 'Small',
	},
]

export const privateEquityTypeOptions = [
	{
		value: 'Venture Capital', label: 'Venture Capital',
	},
	{
		value: 'Growth Equity', label: 'Growth Equity',
	},
	{
		value: 'Infrastructure', label: 'Infrastructure',
	},
	{
		value: 'Real Estate', label: 'Real Estate',
	},
	{
		value: 'CLO', label: 'CLO',
	},
	{
		value: 'Offers', label: 'Offers',
	},
]

export const projectTransactionOptions = [
	{
		label: 'Capital Call', value: 'Capital Call',
	},
	{
		label: 'Main', value: 'Main',
	},
	{
		label: 'Mortgage', value: 'Mortgage',
	},
	{
		label: 'New', value: 'New',
	},
	{
		label: 'Rent', value: 'Rent',
	},
	{
		label: 'Services', value: 'Services',
	},
]

export const realEstateOperationOptions = [
	{
		label: 'Cost', value: 'Cost',
	},
	{
		label: 'Maintenance', value: 'Maintenance',
	},
	{
		label: 'Rent', value: 'Rent',
	},
	{
		label: 'Deposit', value: 'Deposit',
	},
]