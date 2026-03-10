import {
	AssetNamesType,
} from '../../../shared/types'

export enum TransactionsSortFields {
	ID = 'id',
	AMOUNT = 'amount',
	TRANSACTION_DATE = 'transactionDate',
	ISIN = 'isin',
	SECURITY = 'security',
}

export const TRANSACTIONS_TAKE = 50

export const relatedTransactions = [
	{
		name: 'Bond Call', asset: AssetNamesType.BONDS,
	},
	{
		name: 'Bond Call - reversal', asset: AssetNamesType.BONDS,
	},
	{
		name: 'Bond Coupon payment', nextTransaction: 'Bonds Coupon fee',
	},
	{
		name: 'Bond Maturity', asset: AssetNamesType.BONDS,
	},
	{
		name: 'Bond Maturity - reversal', asset: AssetNamesType.BONDS,
	},
	{
		name: 'Bond Purchase', nextTransaction: 'Bond Purchase fee',
	},
	{
		name: 'Bond Purchase fee', asset: AssetNamesType.BONDS,
	},
	{
		name: 'Bond Purchase - reversal', nextTransaction: 'Bond Purchase fee - reversal',
	},
	{
		name: 'Bond Purchase fee - reversal', asset: AssetNamesType.BONDS,
	},
	{
		name: 'Bond Sell', nextTransaction: 'Bond Sell fee',
	},
	{
		name: 'Bond Sell - reversal', nextTransaction: 'Bond Sell fee - reversal',
	},
	{
		name: 'Bond Sell fee', asset: AssetNamesType.BONDS,
	},
	{
		name: 'Crypto Sale', nextTransaction: 'Crypto Fee',
	},
	{
		name: 'Crypto Fee', asset: AssetNamesType.CRYPTO,
	},
	{
		name: 'Crypto Sale - reversal', nextTransaction: 'Crypto Fee',
	},
	{
		name: 'Crypto Fee', asset: AssetNamesType.CRYPTO,
	},
	{
		name: 'Crypto Purchase', nextTransaction: 'Crypto Fee',
	},
	{
		name: 'Crypto Fee', asset: AssetNamesType.CRYPTO,
	},
	{
		name: 'Crypto Purchase - reversal', nextTransaction: 'Crypto Fee',
	},
	{
		name: 'Crypto Fee', asset: AssetNamesType.CRYPTO,
	},

	{
		name: 'Bond Sell fee - reversal', asset: AssetNamesType.BONDS,
	},
	{
		name: 'Deposit Open', asset: AssetNamesType.CASH_DEPOSIT,
	},
	{
		name: 'Equity Purchase', nextTransaction: 'Equity Purchase fee',
	},
	{
		name: 'Equity Purchase fee', asset: AssetNamesType.EQUITY_ASSET,
	},
	{
		name: 'Equity Sell', nextTransaction: 'Equity Sell fee',
	},
	{
		name: 'Equity Sell fee', asset: AssetNamesType.EQUITY_ASSET,
	},
	{
		name: 'Equity Purchase reversal', nextTransaction: 'Equity Purchase fee - reversal',
	},
	{
		name: 'Equity Purchase fee - reversal', asset: AssetNamesType.EQUITY_ASSET,
	},
	{
		name: 'Equity dividend payment', nextTransaction: 'Equity dividend tax',
	},
	{
		name: 'Equity Sell - reversal', nextTransaction: 'Equity Sell fee - reversal',
	},
	{
		name: 'Equity Sell fee - reversal', asset: AssetNamesType.EQUITY_ASSET,
	},
	{
		name: 'Metal Purchase', nextTransaction: 'Metal Purchase fee',
	},
	{
		name: 'Metal Purchase fee', asset: AssetNamesType.METALS,
	},
	{
		name: 'Metal Purchase - reversal', nextTransaction: 'Metal Purchase fee - reversal',
	},
	{
		name: 'Metal Purchase fee - reversal', asset: AssetNamesType.METALS,
	},
	{
		name: 'Metal Sell', nextTransaction: 'Metal Sell fee',
	},
	{
		name: 'Metal Sell fee', asset: AssetNamesType.METALS,
	},
	{
		name: 'Metal Sell - reversal', nextTransaction: 'Metal Sell fee - reversal',
	},
	{
		name: 'Metal Sell fee - reversal', asset: AssetNamesType.METALS,
	},
	{
		name: 'Option Premium', asset: AssetNamesType.OPTIONS,
	},
	{
		name: 'Option Premium - reversal', asset: AssetNamesType.OPTIONS,
	},
	{
		name: 'Option Premium - Buy back', asset: AssetNamesType.OPTIONS,
	},
	{
		name: 'Option Purchase', nextTransaction: 'Option Purchase fee',
	},
	{
		name: 'Option Purchase fee', asset: AssetNamesType.OPTIONS,
	},
	{
		name: 'Option Sell', nextTransaction: 'Option Sell fee',
	},
	{
		name: 'Option Sell fee', asset: AssetNamesType.OPTIONS,
	},
	{
		name: 'Purchase private equity', nextTransaction: 'Purchase private equity fee',
	},
	{
		name: 'Purchase private equity fee', asset: AssetNamesType.PRIVATE_EQUITY,
	},
	{
		name: 'Purchase private equity fee - reversal', asset: AssetNamesType.PRIVATE_EQUITY,
	},
	{
		name: 'Real Estate Purchase', asset: AssetNamesType.REAL_ESTATE,
	},
]