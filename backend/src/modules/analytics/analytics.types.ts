/* eslint-disable max-lines */
import type { CryptoList, CurrencyData, CurrencyDataList, MetalDataList, Prisma, } from '@prisma/client'
import type { AssetNamesType, TAssetExtended, } from '../asset/asset.types'
import type { AssetOperationType, CryptoType, MetalType, } from '../../shared/types'
import type { ISelectItemBody, ITransactionTypeList, } from '../list-hub/list-hub.types'

export type TUsdTotals = {
	usdValue: number
}

export enum TransactionType {
	INCOME = 'Income',
	EXPENSE = 'Expense',
}

export type TransactionChartData = {
	name: TransactionType
	value?: number
}

export type TCurrencyAnalytics = {
	currency: CurrencyDataList | CryptoList | MetalDataList
	currencyValue: number
	usdValue: number
}

export type TCryptoCurrencyAnalytics = TCurrencyAnalytics & {
	productType: CryptoType
}

export type TMetalCurrencyAnalytics = TCurrencyAnalytics & {
	productType: MetalType
}

export type TBondsCurrencyAnalytics = {
	currency: CurrencyDataList
	usdValue: number
}

export type TEntityAnalytics = {
	id: string
	entityName: string
	usdValue: number
	portfolioName?: string
}

export type TEntityCashAnalytics = {
	id: string
	entityName: string
	currencyValue: number
	usdValue: number
	portfolioName?: string
}

export type TBankAnalytics = {
	id: string
	bankName: string
	usdValue: number
	accountName?: string
	accountId?: string
}

export type TCryptoBankAnalytics = TBankAnalytics & {
	productType: CryptoType
}

export type TMetalBankAnalytics = TBankAnalytics & {
	productType: MetalType
}

export type TBankCashAnalytics = {
	id: string
	bankName: string
	usdValue: number
	currencyValue: number
	accountName?: string
	accountId?: string
}

export type TCityAnalytics = {
	city: string
	usdValue: number
}

export type TMaturityAnalytics = {
	year: number
	usdValue: number
}
export interface ILoanAnalytic {
	id: string,
	portfolioName: string,
	entityName: string,
	bankName: string,
	accountName: string,
	name: string,
	startDate: string,
	maturityDate: string,
	currency: CurrencyDataList,
	currencyValue: number,
	usdValue: number,
	interest: number,
	todayInterest: number,
	maturityInterest: number,
	assetMainId?: string
	isTransferred?: boolean
}
export interface ILoansByFilter {
	list: Array<ILoanAnalytic>
	totalAssets: number,
}

export type IAnalyticPrivate = {
	assetId: string,
	portfolioName: string | undefined,
	entityName: string | undefined,
	bankName: string | undefined,
	accountName: string | undefined
	currency: CurrencyDataList
	currencyValue: number
	fundType: string,
	status: string
	fundName: string
	fundID: string
	entryDate: string
	capitalCalled: number
	totalCommitment: number
	usdValue: number,
	pl: number;
	assetMainId?: string
	isTransferred?: boolean
}

export interface IPrivateByFilter {
	list: Array<IAnalyticPrivate>
	totalAssets: number,
}

export type IAnalyticDeposit = {
	assetId: string
	portfolioName: string | undefined,
	entityName: string | undefined,
	bankName: string | undefined,
	accountName: string | undefined,
	startDate: string,
	maturityDate?: string,
	currency: CurrencyDataList,
	currencyValue: number,
	interest: number
	policy: string
	usdValue: number,
	mainAssetId?: string
	isTransferred: boolean
}

export interface IDepositByFilter {
	list: Array<IAnalyticDeposit>
	totalAssets: number
}

export enum TLoanTableSortVariants {
	START_DATE = 'startDate',
	MATURITY_DATE = 'maturityDate',
	USD_VALUE = 'usdValue',
}

export enum TDepositTableSortVariants {
	START_DATE = 'startDate',
	MATURITY_DATE = 'maturityDate',
	USD_VALUE = 'usdValue',

	PORTFOLIO_NAME = 'portfolioName',
	ENTITY_NAME = 'entityName',
	BANK_NAME = 'bankName',
	ACCOUNT_NAME = 'accountName',
	CURRENCY = 'currency',
	CURRENCY_VALUE = 'currencyValue',
	INTEREST = 'interest',
	POLICY = 'policy'
}

export enum TPrivateTableSortVariants {
	ENTRY_DATE = 'entryDate',
}

export enum TBondTableSortVariants {
	PROFIT_USD = 'profitUsd',
	PROFIT_PERCENTAGE = 'profitPercentage',
	COST_VALUE_USD = 'costValueUsd',
	MARKET_VALUE_USD = 'marketValueUsd',
	ISIN = 'isin',
	SECURITY = 'security',
	COST_VALUE_FC = 'costValueFC',
	MARKET_VALUE_FC = 'marketValueFC',
	TOTAL_UNITS = 'totalUnits',
}

export enum TBondTableSortVariants2 {
	PROFIT_USD = 'profitUSD',
	PROFIT_PERCENTAGE = 'profitPercentage',
	COST_VALUE_USD = 'costValueUSD',
	MARKET_VALUE_USD = 'marketValueUSD',
	ISIN = 'isin',
	SECURITY = 'security',
	COST_VALUE_FC = 'costValueFC',
	MARKET_VALUE_FC = 'marketValueFC',
	VALUE_DATE = 'valueDate',
	TOTAL_UNITS = 'totalUnits',
}

export enum TEquityTableSortVariants {
	PROFIT_USD = 'profitUSD',
	PROFIT_PERCENTAGE = 'profitPercentage',
	COST_VALUE_USD = 'costValueUSD',
	MARKET_VALUE_USD = 'marketValueUSD',
	COST_VALUE_FC = 'costValueFC',
	MARKET_VALUE_FC = 'marketValueFC',
	ISIN = 'isin',
	SECURITY = 'security',
	VALUE_DATE = 'transactionDate',
	TOTAL_UNITS = 'totalUnits'
}

export enum TTransactionTableSortVariants {
	DATE = 'transactionDate',
	ISIN = 'isin',
	SECURITY = 'security',
	ID = 'id',
	AMOUNT = 'amount',
}

export enum TCryptoTableSortVariants {
	USD_AMOUNT = 'usdAmount',
	CRYPTO_AMOUNT = 'cryptoAmount',
	PURCHASE_DATE = 'purchaseDate',
	PURCHASE_PRICE = 'purchasePrice',
	PROFIT_USD = 'profitUSD',
	PROFIT_PER = 'profitPercentage',
	COST_VALUE_USD = 'costValueUSD',
	MARKET_VALUE_USD = 'marketValueUSD',
	CURRENT_STOCK_PRICE = 'currentStockPrice',
	UNITS = 'totalUnits',
	VALUE_DATE = 'valueDate',
	COST_PRICE = 'costPrice',
}

export type TRealEstateAssetAnalytics = {
	id: string
	portfolio: string
	entity: string
	bank: string
	account: string
	country?: string
	city?: string
	projectTransaction: string
	operation?: string
	date: string
	currency: string
	currencyValue: number
	usdValue: number
	marketUsdValue: number
	markeValueFC?: number
	profitUsd: number
	profitPercentage: number
	assetMainId?: string
	isTransferred?: boolean
}

export type TOptionsAssetAnalytics = {
	id: string
	portfolio: string
	entity: string
	bank: string
	account: string
	currency: CurrencyDataList
	startDate: string
	maturity: string
	pair: string
	strike: number
	principalValue: number
	marketValue: number
	premium: number
	assetMainId?: string
	isTransferred?: boolean
}

export type TOverviewAssetAnalytics = {
	assetName: AssetNamesType
	usdValue: number
	currencyValue: number
}

export interface IAnalyticBond {
	id: string
	portfolioName: string,
	entityName: string,
	bankName: string,
	accountName: string,
	isin: string,
	security: string,
	currency: string,
	units: number,
	costPrice: number,
	profitUsd: number,
	profitPercentage: number,
	marketValueUsd: number,
	costValueUsd: number,
	marketValueFC: number,
	costValueFC: number,
	currentAccrued: number,
	yield: number,
	nextCouponDate: string | null,
	issuer: string,
	maturity: string | null,
	sector: string,
	coupon: string,
	country: string,
	marketPrice: number
	operation: AssetOperationType,
	unitPrice: number
	valueDate: string
	mainAssetId?: string
	groupId?: string
	isTransferred?: boolean
}

export interface IAnalyticBondWithInnerAssets {
	id: string
	portfolioName: string
	entityName: string
	bankName: string
	accountName: string,
	isin: string
	security: string
	yield: number
	profitUsd: number
	profitPercentage: number
	costPrice: number
	costValueUsd: number
	marketValueUsd: number
	marketValueFC: number
	costValueFC: number
	nextCouponDate: string | null
	issuer: string | null
	maturity: string | null
	sector: string | null
	coupon: string | null
	country: string | null
	units: number
	marketPrice: number
	assets: Array<IAnalyticBond>
	operation: AssetOperationType
	currentAccrued: number
	mainAssetId?: string
}

export interface IBondsByFilters {
	list: Array<IAnalyticBond | IAnalyticBondWithInnerAssets>
}

export interface IAnalyticEquity {
	id: string,
	equityType: string,
	portfolioName: string
	entityName: string,
	bankName: string,
	accountName: string,
	issuer: string,
	isin: string,
	security: string,
	currency: CurrencyDataList,
	costPrice: number,
	profitUsd: number,
	profitPercentage: number,
	units: number,
	costValueUsd: number,
	marketValueUsd: number,
	costValueFC: number,
	marketValueFC: number,
	currentStockPrice: number,
	country: string,
	sector: string,
	operation: AssetOperationType,
	transactionPrice?: number
	valueDate: string
	mainAssetId?: string
}

export interface IAnalyticCryptoETF {
	id: string,
	productType:CryptoType,
	equityType: string,
	portfolioName: string
	entityName: string,
	bankName: string,
	accountName: string,
	issuer: string,
	isin: string,
	security: string,
	currency: CurrencyDataList,
	costPrice: number,
	profitUsd: number,
	profitPercentage: number,
	units: number,
	costValueUsd: number,
	marketValueUsd: number,
	costValueFC: number,
	marketValueFC: number,
	currentStockPrice: number,
	country: string,
	sector: string,
	operation: AssetOperationType,
	transactionPrice: number
	valueDate: string
}

export interface IAnalyticMetalETF extends Omit<IAnalyticCryptoETF, 'productType'> {
	productType: MetalType
}

export interface IAnalyticEquityWithInnerAssets {
	id: string
	equityType: string
	portfolioName: string,
	entityName: string,
	bankName: string,
	accountName: string,
	isin: string,
	security: string,
	profitUsd: number,
	costPrice: number,
	issuer: string,
	sector: string,
	country: string,
	marketValueUsd: number,
	costValueFC: number,
	marketValueFC: number,
	currentStockPrice: number
	units: number
	assets: Array<IAnalyticEquity>
	operation: AssetOperationType,
	profitPercentage: number
	costValueUsd: number
	currency: CurrencyDataList
	mainAssetId?: string
}

export interface IAnalyticCryptoETFWithInnerAssets extends IAnalyticEquityWithInnerAssets {
	productType: CryptoType
}

export interface IAnalyticMetalETFWithInnerAssets extends IAnalyticEquityWithInnerAssets {
	productType: MetalType
}

export interface IAnalyticCrypto {
	id: string,
	portfolioName: string,
	entityName: string,
	bankName: string,
	accountName: string,
	productType: CryptoType,
	exchangeWallet: string,
	cryptoCurrencyType: string,
	cryptoAmount: number,
	usdAmount: number,
	purchaseDate?: string,
	purchasePrice: number,
	costValueUsd: number,
	marketValueUsd: number,
	profitUsd: number,
	profitPercentage: number,
	isin?: string,
	security?: string,
	units?: number,
	costPrice?: number,
	costValueFC?: number,
	marketValueFC?: number,
	currentStockPrice?: number,
	issuer?: string,
	sector?: string,
	country?: string,
	currency?: string,
	valueDate?: string,
}

export interface IEquitiesByFilters {
	list: Array<IAnalyticEquity | IAnalyticEquityWithInnerAssets>
}

export interface ICryptoByFilters {
	list: Array<IAnalyticCrypto | IAnalyticCryptoETF | IAnalyticCryptoETFWithInnerAssets>
	totalAssets: number
}

export type TDepositAssetAnalytics = {
	id: string
	portfolio: string
	entity: string
	bank: string
	startDate: string
	maturityDate: string
	currency: string
	currencyValue: number
	usdValue: number
	interest: number
	policy: string
}

export interface ICryptoFilterSelectsData {
	cryptoTypes: Array<string>
	wallets: Array<string>
	productTypes: Array<string>
}

export interface IEquityFilterSelectsData {
	equityTypes: Array<string>
	equityIsins: Array<string>
	equitySecurities: Array<string>
	metalCurrencies?: Array<MetalDataList>
	cryptoCurrencies?: Array<CryptoList>
	wallets?: Array<string>
}

export interface IPrivateEquityFilterSelectsData {
	peFundNames: Array<string>
	peFundTyped: Array<string>
}

export interface IAssetInitialData {
	currencyList: Array<CurrencyData>,
	assets: Array<TAssetExtended>
}

// export type AssetBondGroupWithRelations = Prisma.AssetBondGroupGetPayload<{
// 	include: {
// 		bank: true
// 		account: true
// 		entity: true
// 		portfolio: true
// 	}
// }>

// export type AssetCryptoGroupWithRelations = Prisma.AssetCryptoGroupGetPayload<{
// 	include: {
// 		bank: true
// 		account: true
// 		entity: true
// 		portfolio: true
// 	}
// }>

// export type AssetEquityGroupWithRelations = Prisma.AssetEquityGroupGetPayload<{
// 	include: {
// 		bank: true
// 		account: true
// 		entity: true
// 		portfolio: true
// 	}
// }>

// export type AssetMetalGroupWithRelations = Prisma.AssetMetalGroupGetPayload<{
// 	include: {
// 		bank: true
// 		account: true
// 		entity: true
// 		portfolio: true
// 	}
// }>

// export type AssetDepositWithRelations = Prisma.AssetDepositGetPayload<{
// 	include: {
// 		bank: true
// 		account: true
// 		entity: true
// 		portfolio: true
// 	}
// }>

// export type AssetLoanWithRelations = Prisma.AssetLoanGetPayload<{
// 	include: {
// 		bank: true
// 		account: true
// 		entity: true
// 		portfolio: true
// 	}
// }>

// export type AssetOptionWithRelations = Prisma.AssetOptionGetPayload<{
// 	include: {
// 		bank: true
// 		account: true
// 		entity: true
// 		portfolio: true
// 	}
// }>

// export type AssetOtherWithRelations = Prisma.AssetOtherInvestmentGetPayload<{
// 	include: {
// 		bank: true
// 		account: true
// 		entity: true
// 		portfolio: true
// 	}
// }>

// export type AssetPrivateEquityWithRelations = Prisma.AssetPrivateEquityGetPayload<{
// 	include: {
// 		bank: true
// 		account: true
// 		entity: true
// 		portfolio: true
// 	}
// }>

// export type AssetRealEstateWithRelations = Prisma.AssetRealEstateGetPayload<{
// 	include: {
// 		bank: true
// 		account: true
// 		entity: true
// 		portfolio: true
// 	}
// }>

export type AssetBondGroupWithRelations = Prisma.AssetBondGroupGetPayload<{
	select: {
		bonds: {
			select: {
				marketValueUSD: true;
				assetName: true;
				marketValueFC: true
				currency: true
				units:     true
				marketPrice: true
				isin: true
				operation: true
			}
		}
		marketValueUSD: true;
		assetName: true;
		marketValueFC: true
		currency: true
		totalUnits:     true
		marketPrice: true
		isin: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetBondGroupWithHistoryRelations = Prisma.AssetBondGroupGetPayload<{
	select: {
		bonds: {
			select: {
				marketValueUSD: true;
				assetName: true;
				marketValueFC: true
				currency: true
				units:     true
				marketPrice: true
				isin: true
				operation: true
				assetBondVersions: {
					where: {
						createdAt: { lte: Date };
					};
					orderBy: {
						createdAt: 'desc';
					};
					take: 1;
					select: {
						marketValueUSD:      true,
								assetName:          true,
								marketValueFC:      true,
								currency:           true,
								units:          true,
								marketPrice:    true,
								isin:           true,
								operation:      true,
					};
				};
			}
		}
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetCryptoGroupWithRelations = Prisma.AssetCryptoGroupGetPayload<{
	select: {
		cryptos: {
			select: {
				marketValueUSD: true;
				assetName: true;
				marketValueFC: true
				currency: true
				cryptoCurrencyType: true
				units:     true
				productType:    true
				cryptoAmount: true,
				type: true
				operation: true
				isin: true
			}
		}
		marketValueUSD: true;
		assetName: true;
		marketValueFC: true
		currency: true
		cryptoCurrencyType: true
		totalUnits:     true
		productType:    true
		cryptoAmount: true,
		type: true
		isin: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetCryptoGroupWithHistoryRelations = Prisma.AssetCryptoGroupGetPayload<{
	select: {
		cryptos: {
			select: {
				marketValueUSD: true;
				assetName: true;
				marketValueFC: true
				currency: true
				cryptoCurrencyType: true
				units:     true
				productType:    true
				cryptoAmount: true,
				type: true
				operation: true
				isin: true
				id: true
				assetCryptoVersions: {
					where: {
						createdAt: { lte: Date };
					};
					orderBy: {
						createdAt: 'desc';
					};
					take: 1;
					select: {
						marketValueUSD: true;
						assetName: true;
						marketValueFC: true;
						currency: true;
						cryptoCurrencyType: true;
						units: true;
						productType: true;
						cryptoAmount: true;
						type: true;
						isin: true;
						operation: true;
						id: true
					};
				};
			}
		}
		marketValueUSD: true;
		assetName: true;
		marketValueFC: true
		currency: true
		cryptoCurrencyType: true
		totalUnits:     true
		productType:    true
		cryptoAmount: true,
		type: true
		isin: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetEquityGroupWithRelations = Prisma.AssetEquityGroupGetPayload<{
	select: {
		equities: {
			select: {
				marketValueUSD: true;
				assetName: true;
				marketValueFC: true
				currency: true
				units:     true
				type: true
				operation: true
				isin: true
			}
		}
		marketValueUSD: true;
		assetName: true;
		marketValueFC: true
		currency: true
		totalUnits:     true
		type: true
		isin: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetEquityGroupWithHistoryRelations = Prisma.AssetEquityGroupGetPayload<{
	select: {
		equities: {
			select: {
				marketValueUSD:      true,
						assetName:          true,
						marketValueFC:      true,
						currency:           true,
						units:          true,
						type:           true,
						isin:           true,
						operation:      true,
				assetEquityVersions: {
							where: {
								createdAt: {
									lte: Date,
								},
							},
							orderBy: {
								createdAt: 'desc',
							},
							take:   1,
							select: {
								marketValueUSD:      true,
						assetName:          true,
						marketValueFC:      true,
						currency:           true,
						units:          true,
						type:           true,
						isin:           true,
						operation:      true,
							},
						},
			}
		}
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
		type: true;
		currency: true;
				isin: true;
	};
}>

export type AssetMetalGroupWithRelations = Prisma.AssetMetalGroupGetPayload<{
	select: {
				marketValueUSD: true
				assetName: true
				marketValueFC: true
				currency: true
				metalType: true
				totalUnits: true
				productType: true
				type: true
				isin: true
		metals: {
			select: {
				marketValueUSD: true
				assetName: true
				marketValueFC: true
				currency: true
				metalType: true
				units: true
				productType: true
				type: true
				operation: true
				isin: true
			}
		}
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetMetalGroupWithHistoryRelations = Prisma.AssetMetalGroupGetPayload<{
	select: {
				marketValueUSD: true
				assetName: true
				marketValueFC: true
				currency: true
				metalType: true
				totalUnits: true
				productType: true
				type: true
				isin: true
		metals: {
			select: {
				marketValueUSD: true
				assetName: true
				marketValueFC: true
				currency: true
				metalType: true
				units: true
				productType: true
				type: true
				operation: true
				isin: true
				assetMetalVersions: {
					where: {
						createdAt: { lte: Date };
					};
					orderBy: {
						createdAt: 'desc';
					};
					take: 1;
					select: {
						marketValueUSD: true
				assetName: true
				marketValueFC: true
				currency: true
				metalType: true
				units: true
				productType: true
				type: true
				operation: true
				isin: true
					};
				};
			}
		}
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetDepositWithRelations = Prisma.AssetDepositGetPayload<{
	select: {
		usdValue: true;
		assetName: true;
		currencyValue: true
		currency: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetDepositWithHistoryRelations = Prisma.AssetDepositGetPayload<{
	select: {
		usdValue: true;
		assetName: true;
		currencyValue: true
		currency: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
		assetDepositVersions: {
					where: {
						createdAt: { lte: Date, },
					},
					select: {
						usdValue:      true,
						assetName:      true,
						currencyValue:  true,
						currency:       true,
					},
					orderBy: { createdAt: 'desc', },
					take:    1,
				},
	};
}>

export type AssetLoanWithRelations = Prisma.AssetLoanGetPayload<{
	select: {
		marketValueUSD: true;
		assetName: true;
		currencyValue: true
		currency: true
		usdValue: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetLoanWithHistoryRelations = Prisma.AssetLoanGetPayload<{
	select: {
		marketValueUSD: true;
		assetName: true;
		currencyValue: true
		currency: true
		usdValue: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
		versions: {
					where: {
						createdAt: { lte: Date, },
					},
					orderBy: { createdAt: 'desc', },
					take:    1,
					select:  {
						marketValueUSD: true,
						assetName:      true,
						currencyValue:  true,
						currency:       true,
						usdValue:       true,
					},
				},
	};
}>

export type AssetOptionWithRelations = Prisma.AssetOptionGetPayload<{
	select: {
		marketValueUSD: true;
		assetName: true;
		currentMarketValue: true
		currency: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetOptionWithHistoryRelations = Prisma.AssetOptionGetPayload<{
	select: {
		marketValueUSD: true;
		assetName: true;
		currentMarketValue: true
		currency: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
		versions: {
					where: {
						createdAt: { lte: Date, },
					},
					select: {
						marketValueUSD:     true,
						assetName:          true,
						currentMarketValue:  true,
						currency:           true,
					},
					orderBy: { createdAt: 'desc', },
					take:    1,
				},
	};
}>

export type AssetOtherWithRelations = Prisma.AssetOtherInvestmentGetPayload<{
	select: {
		marketValueUSD: true;
		assetName: true;
		currencyValue: true
		currency: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetOtherWithHistoryRelations = Prisma.AssetOtherInvestmentGetPayload<{
	select: {
		marketValueUSD: true;
		assetName: true;
		currencyValue: true
		currency: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
		versions: {
					where: {
						createdAt: { lte: Date, },
					},
					select: {
						marketValueUSD: true,
						assetName:      true,
						currencyValue:  true,
						currency:       true,
					},
					orderBy: {
						createdAt: 'desc',
					},
					take: 1,
				},
	};
}>

export type AssetPrivateEquityWithRelations = Prisma.AssetPrivateEquityGetPayload<{
	select: {
		marketValueUSD: true;
		assetName: true;
		currencyValue: true
		currency: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetPrivateEquityWithHistoryRelations = Prisma.AssetPrivateEquityGetPayload<{
	select: {
		marketValueUSD: true;
		assetName: true;
		currencyValue: true
		currency: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
		versions:  {
					where: {
						createdAt: {
							lte: Date,
						},
					},
					select: {
						marketValueUSD: true,
						assetName:      true,
						currencyValue:  true,
						currency:       true,
					},
					orderBy: { createdAt: 'desc', },
					take:    1,
				},
	};
}>

export type AssetRealEstateWithRelations = Prisma.AssetRealEstateGetPayload<{
	select: {
		marketValueUSD: true;
		assetName: true;
		currencyValue: true
		currency: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export type AssetRealEstateWithHistoryRelations = Prisma.AssetRealEstateGetPayload<{
	select: {
		marketValueUSD: true;
		assetName: true;
		currencyValue: true
		currency: true
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
		versions: {
					where: {
						createdAt: {
							lte: Date,
						},
					},
					select: {
						marketValueUSD: true,
						assetName:      true,
						currencyValue:  true,
						currency:       true,
					},
					orderBy: {
						createdAt: 'desc',
					},
					take: 1,
				},
	};
}>

export interface IFilteredRefactoredAssets {
	bondAssets: Array<AssetBondGroupWithRelations>
	cryptoAssets: Array<AssetCryptoGroupWithRelations>
	equityAssets: Array<AssetEquityGroupWithRelations>
	metalAssets: Array<AssetMetalGroupWithRelations>
	depositAssets: Array<AssetDepositWithRelations>
	loanAssets: Array<AssetLoanWithRelations>
	optionAssets: Array<AssetOptionWithRelations>
	otherAssets: Array<AssetOtherWithRelations>
	peAssets: Array<AssetPrivateEquityWithRelations>
	reAssets: Array<AssetRealEstateWithRelations>
}

export interface IFilteredRefactoredAssetsWithHistory {
	bondAssets: Array<AssetBondGroupWithHistoryRelations>
	cryptoAssets: Array<AssetCryptoGroupWithHistoryRelations>
	equityAssets: Array<AssetEquityGroupWithHistoryRelations>
	metalAssets: Array<AssetMetalGroupWithHistoryRelations>
	depositAssets: Array<AssetDepositWithHistoryRelations>
	loanAssets: Array<AssetLoanWithHistoryRelations>
	optionAssets: Array<AssetOptionWithHistoryRelations>
	otherAssets: Array<AssetOtherWithHistoryRelations>
	peAssets: Array<AssetPrivateEquityWithHistoryRelations>
	reAssets: Array<AssetRealEstateWithHistoryRelations>
}

export type TOverviewTransactionWithRelations = Prisma.TransactionGetPayload<{
	select: {
		amount: true;
		currency: true;
		bank: {
			include: {
				bankList: true;
			};
		};
		account: {
			select: {
				id: true;
				accountName: true;
			};
		};
		entity: {
			select: {
				id: true;
				name: true;
			};
		};
		portfolio: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>

export interface IAnalyticsAvailability {
	hasCash: boolean
	hasEquity: boolean
	hasMetal: boolean
	hasCrypto: boolean
	hasDeposit: boolean
	hasLoan: boolean
	hasBond: boolean
	hasOption: boolean
	hasOther:  boolean
	hasPE: boolean
	hasRE: boolean
}

export interface IOtherInvestmentsSelects {
	serviceProviders: Array<string>
	investmentAssetNames: Array<string>
}

export interface ITransactionFilteredSelects {
	serviceProviders: Array<ISelectItemBody>
	isins: Array<string>
	securities: Array<string>
	transactionNames: Array<ITransactionTypeList>
}