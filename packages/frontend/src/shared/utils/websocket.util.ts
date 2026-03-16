/* eslint-disable complexity */

import {
	keysToInvalidateBondAnalytics,
	keysToInvalidateCashAnalytics,
	keysToInvalidateCryptoAnalytics,
	keysToInvalidateDepositAnalytics,
	keysToInvalidateEquityAnalytics,
	keysToInvalidateLoanAnalytics,
	keysToInvalidateMetalAnalytics,
	keysToInvalidateOptionAnalytics,
	keysToInvalidateOtherAnalytics,
	keysToInvalidatePEAnalytics,
	keysToInvalidateREAnalytics,
} from '../constants'
import {
	AssetNamesType,
} from '../types'
import {
	queryClient,
} from '../../providers/query.provider'

export const assetQueryKeyUpdate = (assetName: AssetNamesType,): void => {
	if (assetName === AssetNamesType.BONDS) {
		keysToInvalidateBondAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
				exact:    false,
			},)
		},)
	}
	if (assetName === AssetNamesType.CASH) {
		keysToInvalidateCashAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
				exact:    false,
			},)
		},)
	}
	if (assetName === AssetNamesType.CRYPTO) {
		keysToInvalidateCryptoAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
				exact:    false,
			},)
		},)
	}
	if (assetName === AssetNamesType.CASH_DEPOSIT) {
		keysToInvalidateDepositAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
			},)
		},)
	}
	if (assetName === AssetNamesType.EQUITY_ASSET) {
		keysToInvalidateEquityAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
				exact:    false,
			},)
		},)
	}
	if (assetName === AssetNamesType.LOAN) {
		keysToInvalidateLoanAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
				exact:    false,
			},)
		},)
	}
	if (assetName === AssetNamesType.METALS) {
		keysToInvalidateMetalAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
				exact:    false,
			},)
		},)
	}
	if (assetName === AssetNamesType.OPTIONS) {
		keysToInvalidateOptionAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
				exact:    false,
			},)
		},)
	}
	if (assetName === AssetNamesType.OTHER) {
		keysToInvalidateOtherAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
				exact:    false,
			},)
		},)
	}
	if (assetName === AssetNamesType.PRIVATE_EQUITY) {
		keysToInvalidatePEAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
				exact:    false,
			},)
		},)
	}
	if (assetName === AssetNamesType.REAL_ESTATE) {
		keysToInvalidateREAnalytics.forEach((key,) => {
			queryClient.invalidateQueries({
				queryKey: key,
				exact:    false,
			},)
		},)
	}
}