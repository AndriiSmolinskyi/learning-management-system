/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
import type {ValidationArguments, ValidatorConstraintInterface,} from 'class-validator'
import {ValidatorConstraint,} from 'class-validator'
import type {
	IBondsAssetPayload,
	ICashAssetPaylaod,
	ICollateralPayloadAsset,
	ICryptoPayloadAsset,
	IDepositPayloadAsset,
	IEquityPayloadAsset,
	ILoanPayloadAsset,
	IMetalsPayloadAsset,
	IOptionPayloadAsset,
	IOtherPayloadAsset,
	IPrivatePaylaodAsset,
	IRealEstatePayloadAsset,
} from '../../modules/asset/asset.types'
import {AssetNamesType,} from '../../modules/asset/asset.types'
import { CryptoType, MetalType, } from '../types'

@ValidatorConstraint({ name: 'AssetPayloadValidator', async: false, },)
export class AssetPayloadValidator implements ValidatorConstraintInterface {
	public validate(payload: string, args: ValidationArguments,): boolean {
		const object = args.object as Record<string, string | undefined | null>
		try {
			const parsedPayload = JSON.parse(args.value as string,)
			switch (object.assetName) {
			case AssetNamesType.BONDS:
				return this.validateBondsAsset(this.transformBondsPayload(parsedPayload,),)
			case AssetNamesType.CASH:
				return this.validateCashAsset(this.transformCashPayload(parsedPayload,),)
			case AssetNamesType.CASH_DEPOSIT:
				return this.validateDepositAsset(this.transformDepositPayload(parsedPayload,),)
			case AssetNamesType.COLLATERAL:
				return this.validateCollateralAsset(this.transformCollateralPayload(parsedPayload,),)
			case AssetNamesType.CRYPTO:
				return this.validateCryptoAsset(this.transformCryptoPayload(parsedPayload,),)
			case AssetNamesType.EQUITY_ASSET:
				return this.validateEquityAsset(this.transformEquityPayload(parsedPayload,),)
			case AssetNamesType.LOAN:
				return this.validateLoanAsset(this.transformLoanPayload(parsedPayload,),)
			case AssetNamesType.METALS:
				return this.validateMetalsAsset(this.transformMetalsPayload(parsedPayload,),)
			case AssetNamesType.OPTIONS:
				return this.validateOptionAsset(this.transformOptionPayload(parsedPayload,),)
			case AssetNamesType.OTHER:
				return this.validateOtherAsset(this.transformOtherPayload(parsedPayload,),)
			case AssetNamesType.REAL_ESTATE:
				return this.validateRealEstateAsset(this.transformRealEstatePayload(parsedPayload,),)
			case AssetNamesType.PRIVATE_EQUITY:
				return this.validatePrivateAsset(this.transformPrivatePayload(parsedPayload,),)
			default:
				return false
			}
		} catch {
			return false
		}
	}

	private transformBondsPayload(payload: IBondsAssetPayload,): IBondsAssetPayload {
		return {
			currency:  payload.currency,
			valueDate: payload.valueDate,
			isin:      payload.isin,
			security:  payload.security,
			units:     Number(payload.units,),
			unitPrice: Number(payload.unitPrice,),
			bankFee:   Number(payload.bankFee,),
			accrued:   Number(payload.accrued,),
			operation: payload.operation,
			comment:   payload.comment ?? '',
		}
	}

	private validateBondsAsset(payload: IBondsAssetPayload,): boolean {
		return (
			typeof payload.currency === 'string' &&
			typeof payload.valueDate === 'string' &&
			typeof payload.isin === 'string' &&
			(
				typeof payload.security === 'string' ||
				typeof payload.security === 'number'
			) &&
			typeof payload.units === 'number' &&
			typeof payload.unitPrice === 'number' &&
			typeof payload.bankFee === 'number' &&
			typeof payload.accrued === 'number' &&
			typeof payload.operation === 'string' &&
			typeof payload.comment === 'string'
		)
	}

	private transformCashPayload(payload: ICashAssetPaylaod,): ICashAssetPaylaod {
		return {
			currency: payload.currency,
			comment:  payload.comment ?? '',
		}
	}

	private validateCashAsset(payload: ICashAssetPaylaod,): boolean {
		return (
			typeof payload.currency === 'string' &&
			typeof payload.comment === 'string'
		)
	}

	private transformDepositPayload(payload: IDepositPayloadAsset,): IDepositPayloadAsset {
		return {
			currency:      payload.currency,
			interest:       Number(payload.interest,),
			currencyValue: Number(payload.currencyValue,),
			startDate:     new Date(payload.startDate,),
			maturityDate:  payload.maturityDate ?
				new Date(payload.maturityDate,) :
				undefined,
			policy:        String(payload.policy,),
			comment:       payload.comment ?? '',
		}
	}

	private validateDepositAsset(payload: IDepositPayloadAsset,): boolean {
		return (
			typeof payload.currency === 'string' &&
			typeof payload.interest === 'number' &&
			typeof payload.currencyValue === 'number' &&
			payload.startDate instanceof Date &&
			(payload.maturityDate === undefined ||
			payload.maturityDate instanceof Date) &&
			typeof payload.policy === 'string' &&
			typeof payload.comment === 'string'
		)
	}

	private transformCollateralPayload(payload: ICollateralPayloadAsset,): ICollateralPayloadAsset {
		return {
			currency:       String(payload.currency,),
			startDate:      new Date(payload.startDate,),
			endDate:        new Date(payload.endDate,),
			currencyValue:  Number(payload.currencyValue,),
			usdValue:       Number(payload.usdValue,),
			creditProvider: String(payload.creditProvider,),
			creditAmount:   Number(payload.creditAmount,),
			comment:        payload.comment ?? '',
		}
	}

	private validateCollateralAsset(payload: ICollateralPayloadAsset,): boolean {
		return (
			typeof payload.currency === 'string' &&
			payload.startDate instanceof Date &&
			payload.endDate instanceof Date &&
			typeof payload.currencyValue === 'number' &&
			typeof payload.usdValue === 'number' &&
			typeof payload.creditProvider === 'string' &&
			typeof payload.creditAmount === 'number' &&
			typeof payload.comment === 'string'
		)
	}

	private transformCryptoPayload(payload: ICryptoPayloadAsset,): ICryptoPayloadAsset {
		if (payload.productType === CryptoType.ETF) {
			return {
				productType:        payload.productType,
				currency:         payload.currency,
				transactionDate:  payload.transactionDate && new Date(payload.transactionDate,),
				isin:             String(payload.isin,),
				security:         String(payload.security,),
				units:            Number(payload.units,),
				transactionPrice: Number(payload.transactionPrice,),
				bankFee:          Number(payload.bankFee,),
				equityType:       String(payload.equityType,),
				operation:        payload.operation,
				comment:          payload.comment ?? '',
			}
		}
		return {
			productType:        payload.productType,
			cryptoCurrencyType: payload.cryptoCurrencyType,
			cryptoAmount:       Number(payload.cryptoAmount,),
			exchangeWallet:     String(payload.exchangeWallet,),
			purchaseDate:       payload.purchaseDate && new Date(payload.purchaseDate,),
			purchasePrice:      Number(payload.purchasePrice,),
			comment:            payload.comment ?? '',
		}
	}

	private validateCryptoAsset(payload: ICryptoPayloadAsset,): boolean {
		if (payload.productType === CryptoType.ETF) {
			return (
				typeof payload.productType === 'string' &&
				typeof payload.currency === 'string' &&
			payload.transactionDate instanceof Date &&
			typeof payload.isin === 'string' &&
			(
				typeof payload.security === 'string' ||
				typeof payload.security === 'number'
			) &&
			typeof payload.units === 'number' &&
			typeof payload.transactionPrice === 'number' &&
			typeof payload.bankFee === 'number' &&
			typeof payload.equityType === 'string' &&
			typeof payload.operation === 'string' &&
			typeof payload.comment === 'string'
			)
		}
		return (
			typeof payload.productType === 'string' &&
			typeof payload.cryptoCurrencyType === 'string' &&
		typeof payload.cryptoAmount === 'number' &&
		typeof payload.exchangeWallet === 'string' &&
		payload.purchaseDate instanceof Date &&
		typeof payload.purchasePrice === 'number' &&
		typeof payload.comment === 'string'
		)
	}

	private transformEquityPayload(payload: IEquityPayloadAsset,): IEquityPayloadAsset {
		return {
			currency:         payload.currency,
			transactionDate:  new Date(payload.transactionDate,),
			isin:             String(payload.isin,),
			security:         String(payload.security,),
			units:            Number(payload.units,),
			transactionPrice: Number(payload.transactionPrice,),
			bankFee:          Number(payload.bankFee,),
			equityType:       String(payload.equityType,),
			operation:        payload.operation,
			comment:          payload.comment ?? '',
		}
	}

	private validateEquityAsset(payload: IEquityPayloadAsset,): boolean {
		return (
			typeof payload.currency === 'string' &&
			payload.transactionDate instanceof Date &&
			typeof payload.isin === 'string' &&
			(
				typeof payload.security === 'string' ||
				typeof payload.security === 'number'
			) &&
			typeof payload.units === 'number' &&
			typeof payload.transactionPrice === 'number' &&
			typeof payload.bankFee === 'number' &&
			typeof payload.equityType === 'string' &&
			typeof payload.operation === 'string' &&
			typeof payload.comment === 'string'
		)
	}

	private transformLoanPayload(payload: ILoanPayloadAsset,): ILoanPayloadAsset {
		return {
			loanName:         String(payload.loanName,),
			startDate:        new Date(payload.startDate,),
			maturityDate:     new Date(payload.maturityDate,),
			currency:         payload.currency,
			currencyValue:    Number(payload.currencyValue,),
			usdValue:         Number(payload.usdValue,),
			interest:         Number(payload.interest,),
			todayInterest:    Number(payload.todayInterest,),
			maturityInterest: Number(payload.maturityInterest,),
			comment:          payload.comment ?? '',
		}
	}

	private validateLoanAsset(payload: ILoanPayloadAsset,): boolean {
		return (
			typeof payload.loanName === 'string' &&
			payload.startDate instanceof Date &&
			payload.maturityDate instanceof Date &&
			typeof payload.currency === 'string' &&
			typeof payload.currencyValue === 'number' &&
			typeof payload.usdValue === 'number' &&
			typeof payload.interest === 'number' &&
			typeof payload.todayInterest === 'number' &&
			typeof payload.maturityInterest === 'number' &&
			typeof payload.comment === 'string'
		)
	}

	private transformMetalsPayload(payload: IMetalsPayloadAsset,): IMetalsPayloadAsset {
		if (payload.productType === MetalType.ETF) {
			return {
				productType:        payload.productType,
				currency:         payload.currency,
				transactionDate:  new Date(payload.transactionDate,),
				isin:             String(payload.isin,),
				security:         String(payload.security,),
				units:            Number(payload.units,),
				transactionPrice: Number(payload.transactionPrice,),
				bankFee:          Number(payload.bankFee,),
				equityType:       String(payload.equityType,),
				operation:        payload.operation,
				comment:          payload.comment ?? '',
			}
		}

		return {
			currency:        payload.currency,
			metalType:       payload.metalType,
			transactionDate: new Date(payload.transactionDate,),
			purchasePrice:   Number(payload.purchasePrice,),
			units:           Number(payload.units,),
			operation:       String(payload.operation,),
			comment:         payload.comment ?? '',
		}
	}

	private validateMetalsAsset(payload: IMetalsPayloadAsset,): boolean {
		if (payload.productType === MetalType.ETF) {
			return (
				typeof payload.productType === 'string' &&
				typeof payload.currency === 'string' &&
			payload.transactionDate instanceof Date &&
			typeof payload.isin === 'string' &&
			(
				typeof payload.security === 'string' ||
				typeof payload.security === 'number'
			) &&
			typeof payload.units === 'number' &&
			typeof payload.transactionPrice === 'number' &&
			typeof payload.bankFee === 'number' &&
			typeof payload.equityType === 'string' &&
			typeof payload.operation === 'string' &&
			typeof payload.comment === 'string'
			)
		}
		return (
			typeof payload.currency === 'string' &&
			typeof payload.metalType === 'string' &&
			payload.transactionDate instanceof Date &&
			typeof payload.purchasePrice === 'number' &&
			typeof payload.units === 'number' &&
			typeof payload.operation === 'string' &&
			typeof payload.comment === 'string'
		)
	}

	private transformOptionPayload(payload: IOptionPayloadAsset,): IOptionPayloadAsset {
		return {
			currency:           payload.currency,
			startDate:          new Date(payload.startDate,),
			maturityDate:       new Date(payload.maturityDate,),
			pairAssetCurrency:  String(payload.pairAssetCurrency,),
			principalValue:     Number(payload.principalValue,),
			strike:             Number(payload.strike,),
			premium:            Number(payload.premium,),
			marketOpenValue:    Number(payload.marketOpenValue,),
			currentMarketValue: Number(payload.currentMarketValue,),
			contracts:          Number(payload.contracts,),
			comment:            payload.comment ?? '',
		}
	}

	private validateOptionAsset(payload: IOptionPayloadAsset,): boolean {
		return (
			typeof payload.currency === 'string' &&
			payload.startDate instanceof Date &&
			payload.maturityDate instanceof Date &&
			typeof payload.pairAssetCurrency === 'string' &&
			typeof payload.principalValue === 'number' &&
			typeof payload.strike === 'number' &&
			typeof payload.premium === 'number' &&
			typeof payload.marketOpenValue === 'number' &&
			typeof payload.currentMarketValue === 'number' &&
			typeof payload.contracts === 'number' &&
			typeof payload.comment === 'string'
		)
	}

	private transformOtherPayload(payload: any,): IOtherPayloadAsset {
		return {
			investmentAssetName: String(payload.investmentAssetName,),
			currency:            String(payload.currency,),
			investmentDate:      new Date(payload.investmentDate,),
			currencyValue:       Number(payload.currencyValue,),
			usdValue:            Number(payload.usdValue,),
			serviceProvider:     String(payload.serviceProvider,),
			comment:             payload.comment ?? '',
		}
	}

	private validateOtherAsset(payload: IOtherPayloadAsset,): boolean {
		return (
			typeof payload.investmentAssetName === 'string' &&
			typeof payload.currency === 'string' &&
			payload.investmentDate instanceof Date &&
			typeof payload.currencyValue === 'number' &&
			typeof payload.usdValue === 'number' &&
			typeof payload.serviceProvider === 'string' &&
			typeof payload.comment === 'string'
		)
	}

	private transformRealEstatePayload(payload: any,): IRealEstatePayloadAsset {
		return {
			currency:           String(payload.currency,),
			investmentDate:     new Date(payload.investmentDate,),
			currencyValue:      Number(payload.currencyValue,),
			usdValue:           Number(payload.usdValue,),
			marketValueFC:      Number(payload.marketValueFC,),
			projectTransaction: String(payload.projectTransaction,),
			operation:          payload.operation ?? '',
			comment:            payload.comment ?? '',
			country:            payload.country ?? '',
			city:               payload.city ?? '',
		}
	}

	private validateRealEstateAsset(payload: IRealEstatePayloadAsset,): boolean {
		return (
			typeof payload.currency === 'string' &&
			payload.investmentDate instanceof Date &&
			typeof payload.currencyValue === 'number' &&
			typeof payload.usdValue === 'number' &&
			typeof payload.marketValueFC === 'number' &&
			typeof payload.projectTransaction === 'string' &&
			typeof payload.operation === 'string' &&
			typeof payload.comment === 'string' &&
			typeof payload.country === 'string' &&
			typeof payload.city === 'string'
		)
	}

	private transformPrivatePayload(payload: any,): IPrivatePaylaodAsset {
		return {
			status:             String(payload.status,),
			currency:           String(payload.currency,),
			entryDate:          new Date(payload.entryDate,),
			currencyValue:      Number(payload.currencyValue,),
			serviceProvider:    String(payload.serviceProvider,),
			geography:          payload.geography ?? '',
			fundName:           String(payload.fundName,),
			fundID:             payload.fundID,
			fundType:           String(payload.fundType,),
			fundSize:           payload.fundSize ?? '',
			aboutFund:          String(payload.aboutFund,),
			investmentPeriod:   payload.investmentPeriod ?? '',
			fundTermDate:       new Date(payload.fundTermDate,),
			capitalCalled:      Number(payload.capitalCalled,),
			lastValuationDate:  new Date(payload.lastValuationDate,),
			moic:               Number(payload.moic,),
			irr:                Number(payload.irr ?? 0,),
			liquidity:          Number(payload.liquidity ?? 0,),
			totalCommitment:    Number(payload.totalCommitment,),
			tvpi:               Number(payload.tvpi,),
			managementExpenses: Number(payload.managementExpenses ?? 0,),
			otherExpenses:      Number(payload.otherExpenses ?? 0,),
			carriedInterest:    Number(payload.carriedInterest ?? 0,),
			distributions:      Number(payload.distributions ?? 0,),
			holdingEntity:      String(payload.holdingEntity ?? '',),
			comment:            payload.comment ?? '',
		}
	}

	private validatePrivateAsset(payload: IPrivatePaylaodAsset,): boolean {
		return (
			typeof payload.currency === 'string' &&
			payload.entryDate instanceof Date &&
			typeof payload.currencyValue === 'number' &&
			typeof payload.serviceProvider === 'string' &&
			typeof payload.geography === 'string' &&
			typeof payload.fundName === 'string' &&
			typeof payload.fundID === 'string' &&
			typeof payload.fundType === 'string' &&
			typeof payload.status === 'string' &&
			typeof payload.fundSize === 'string' &&
			typeof payload.aboutFund === 'string' &&
			typeof payload.investmentPeriod === 'string' &&
			payload.fundTermDate instanceof Date &&
			typeof payload.capitalCalled === 'number' &&
			payload.lastValuationDate instanceof Date &&
			typeof payload.moic === 'number' &&
			typeof payload.irr === 'number' &&
			typeof payload.liquidity === 'number' &&
			typeof payload.totalCommitment === 'number' &&
			typeof payload.tvpi === 'number' &&
			typeof payload.managementExpenses === 'number' &&
			typeof payload.otherExpenses === 'number' &&
			typeof payload.carriedInterest === 'number' &&
			typeof payload.distributions === 'number' &&
			typeof payload.holdingEntity === 'string' &&
			typeof payload.comment === 'string'
		)
	}

	public defaultMessage(args: ValidationArguments,): string {
		return `The payload is invalid for the asset type "${(args.object as any).assetName}".`
	}
}