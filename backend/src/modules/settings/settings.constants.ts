import { AssetNamesType, } from '../asset/asset.types'

export const SettingsRoutes = {
	SETTINGS:                   'settings',
	TRANSACTION_SETTINGS:       'settings/transactions',
	CREATE:                     'create',
	CREATE_CATEGORY:            'create-category',
	CATEGORY_LIST:              'category-list',
	LIST:                       'list',
	ID:                         ':id',
	ID_ITEM:                    'id/:id',
	TRANSACTION_SETTINGS_DRAFT: 'settings/transactions-draft',
	RELATIONS:                  'relations/:id',
	DELETE:                     'delete/:id',
	ACTIVATED:                  'activated/:id',
	UPDATE:                     'update/:id',
	AUDIT_LIST:                 'audit',
	AUDIT_USERS:                'audit/users',
	CATEGORY_LIST_FOR_LIST:     'category-list-for-list',
	UPDATE_CATEGORY:            'category/:id',
	DELETE_CATEGORY:            'category-delete/:id',
}

export const SwaggerDescriptions = {
	SETTINGS_TAG:                   'settings ',
	TRANSACTION_SETTINGS_TAG:       'Transactions settings',
	CREATE_TRANSACTION_TYPE:         'Create new transaction type',
	CREATE_CATEGORY:                'Create new category',
	LIST:                           'Transactions type list',
	UPDATE_TRANSACTION_TYPE:        'Update existing transaction type',
	TRANSACTION_SETTINGS_TAG_DRAFT: 'Transactions settings draft',
}

export const relations = [
	{
		transactionType: 'Bond Call',
		asset:           AssetNamesType.BONDS,
	},
	{
		transactionType: 'Bond Call - reversal',
		asset:           AssetNamesType.BONDS,
	},
	{
		transactionType: 'Bond Maturity',
		asset:           AssetNamesType.BONDS,
	},
	{
		transactionType: 'Bond Maturity - reversal',
		asset:           AssetNamesType.BONDS,
	},
	{
		transactionType:        'Bond Purchase',
		relatedTransactionType: 'Bond Purchase fee',
		asset:                  AssetNamesType.BONDS,
	},
	{
		transactionType:        'Bond Purchase - reversal',
		relatedTransactionType: 'Bond Purchase fee - reversal',
		asset:                  AssetNamesType.BONDS,
	},
	{
		transactionType:        'Bond Sell',
		relatedTransactionType: 'Bond Sell fee',
		asset:                  AssetNamesType.BONDS,
	},
	{
		transactionType:        'Bond Sell - reversal',
		relatedTransactionType: 'Bond Sell fee - reversal',
		asset:                  AssetNamesType.BONDS,
	},

	// ===== Crypto =====
	{
		transactionType:        'Crypto Purchase',
		relatedTransactionType: 'Crypto Fee',
		asset:                  AssetNamesType.CRYPTO,
	},
	{
		transactionType:        'Crypto Purchase - reversal',
		relatedTransactionType: 'Crypto Fee',
		asset:                  AssetNamesType.CRYPTO,
	},
	{
		transactionType:        'Crypto Sale',
		relatedTransactionType: 'Crypto Fee',
		asset:                  AssetNamesType.CRYPTO,
	},
	{
		transactionType:        'Crypto Sale - reversal',
		relatedTransactionType: 'Crypto Fee',
		asset:                  AssetNamesType.CRYPTO,
	},

	// ===== Deposits =====
	{
		transactionType: 'Deposit Open',
		asset:           AssetNamesType.CASH_DEPOSIT,
	},

	// ===== Equity =====
	{
		transactionType:        'Equity Purchase',
		relatedTransactionType: 'Equity Purchase fee',
		asset:                  AssetNamesType.EQUITY_ASSET,
	},
	{
		transactionType:        'Equity Purchase reversal',
		relatedTransactionType: 'Equity Purchase fee - reversal',
		asset:                  AssetNamesType.EQUITY_ASSET,
	},
	{
		transactionType:        'Equity Sell',
		relatedTransactionType: 'Equity Sell fee',
		asset:                  AssetNamesType.EQUITY_ASSET,
	},
	{
		transactionType:        'Equity Sell - reversal',
		relatedTransactionType: 'Equity Sell fee - reversal',
		asset:                  AssetNamesType.EQUITY_ASSET,
	},
	{
		transactionType:        'Equity dividend payment',
		relatedTransactionType: 'Equity dividend tax',
		asset:                  AssetNamesType.EQUITY_ASSET,
	},

	// ===== Metals =====
	{
		transactionType:        'Metal Purchase',
		relatedTransactionType: 'Metal Purchase fee',
		asset:                  AssetNamesType.METALS,
	},
	{
		transactionType:        'Metal Purchase - reversal',
		relatedTransactionType: 'Metal Purchase fee - reversal',
		asset:                  AssetNamesType.METALS,
	},
	{
		transactionType:        'Metal Sell',
		relatedTransactionType: 'Metal Sell fee',
		asset:                  AssetNamesType.METALS,
	},
	{
		transactionType:        'Metal Sell - reversal',
		relatedTransactionType: 'Metal Sell fee - reversal',
		asset:                  AssetNamesType.METALS,
	},

	// ===== Options =====
	{
		transactionType: 'Option Premium',
		asset:           AssetNamesType.OPTIONS,
	},
	{
		transactionType: 'Option Premium - reversal',
		asset:           AssetNamesType.OPTIONS,
	},
	{
		transactionType: 'Option Premium - Buy back',
		asset:           AssetNamesType.OPTIONS,
	},
	{
		transactionType:        'Option Purchase',
		relatedTransactionType: 'Option Purchase fee',
		asset:                  AssetNamesType.OPTIONS,
	},
	{
		transactionType:        'Option Sell',
		relatedTransactionType: 'Option Sell fee',
		asset:                  AssetNamesType.OPTIONS,
	},

	// ===== Private Equity =====
	{
		transactionType:        'Purchase private equity',
		relatedTransactionType: 'Purchase private equity fee',
		asset:                  AssetNamesType.PRIVATE_EQUITY,
	},
	{
		transactionType: 'Purchase private equity fee - reversal',
		asset:           AssetNamesType.PRIVATE_EQUITY,
	},

	// ===== Real Estate =====
	{
		transactionType: 'Real Estate Purchase',
		asset:           AssetNamesType.REAL_ESTATE,
	},
]