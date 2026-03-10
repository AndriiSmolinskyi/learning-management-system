/* eslint-disable complexity */
import React from 'react'
import type {
	IAsset,
} from '../../../../../../../shared/types'
import {
	cx,
} from '@emotion/css'
import {
	formatWithAllDecimals,
} from '../../../../../../../shared/utils'

import * as styles from '../sub-items.style'

interface IAssetDrawerProps {
  asset: IAsset;
}

// todo: clear if new version good
// export const PrivateEquityDetails: React.FC<IAssetDrawerProps> = ({
// 	asset,
// },) => {
// 	const parsedPayload = JSON.parse(asset.payload,)

// 	const renderField = (label: string, value: string | number | null | undefined, addBorder: boolean = true,): React.JSX.Element | null => {
// 		if (value !== null && value !== undefined) {
// 			return (
// 				<div className={cx(styles.drawerTextBlock, {
// 					[styles.drawerBorderBottom]: addBorder,
// 				},)}>
// 					<p className={styles.drawerTypeText}>{label}</p>
// 					<p className={styles.drawerText}>{value}</p>
// 				</div>
// 			)
// 		}
// 		return null
// 	}

// 	const hasComment = parsedPayload.comment !== null && parsedPayload.comment !== undefined
// 	const hasProfit = parsedPayload.profitLossCurrency !== null && parsedPayload.profitLossCurrency !== undefined
// 	const hasHolding = parsedPayload.holdingEntity !== null && parsedPayload.holdingEntity !== undefined
// 	const hasDistributions = parsedPayload.distributions !== null && parsedPayload.distributions !== undefined
// 	const hasCarriedInterest = parsedPayload.carriedInterest !== null && parsedPayload.carriedInterest !== undefined
// 	const hasOtherExpenses = parsedPayload.otherExpenses !== null && parsedPayload.otherExpenses !== undefined
// 	const hasManagementExpenses = parsedPayload.managementExpenses !== null && parsedPayload.managementExpenses !== undefined

// 	return (
// 		<div className={styles.drawerContent}>
// 			<div className={cx(styles.drawerTextBlock, styles.drawerItemBorder,)}>
// 				<p className={styles.drawerTypeText}>Asset</p>
// 				<p className={styles.drawerText}>{asset.assetName}</p>
// 			</div>
// 			<div className={styles.drawerItemBorder}>
// 				{renderField('Fund type', parsedPayload.fundType,)}
// 				{renderField('Status', parsedPayload.status,)}
// 				{renderField('Currency', parsedPayload.currency,)}
// 				{renderField('Entry date', parsedPayload.entryDate && new Date(parsedPayload.entryDate,).toLocaleDateString('en-GB', {
// 					day:   '2-digit',
// 					month: '2-digit',
// 					year:  'numeric',
// 				},)
// 					.replace(/\//g, '.',),)}
// 				{renderField('Current value',formatWithAllDecimals(parsedPayload.currencyValue,) ,)}
// 				{renderField('Service provider', parsedPayload.serviceProvider,)}
// 				{renderField('Geography', parsedPayload.geography,)}
// 				{renderField('Fund name', parsedPayload.fundName,)}
// 				{renderField('Fund ID', parsedPayload.fundID,)}
// 				{renderField('Fund size', parsedPayload.fundSize,)}
// 				{renderField('About fund', parsedPayload.aboutFund,)}
// 				{renderField('Investment Period', parsedPayload.investmentPeriod,)}
// 				{renderField('Fund term date', parsedPayload.fundTermDate && new Date(parsedPayload.fundTermDate,).toLocaleDateString('en-GB', {
// 					day:   '2-digit',
// 					month: '2-digit',
// 					year:  'numeric',
// 				},)
// 					.replace(/\//g, '.',),)}
// 				{renderField('Capital called', formatWithAllDecimals(parsedPayload.capitalCalled,),)}
// 				{renderField('Last date of valuation', parsedPayload.lastValuationDate && new Date(parsedPayload.lastValuationDate,).toLocaleDateString('en-GB', {
// 					day:   '2-digit',
// 					month: '2-digit',
// 					year:  'numeric',
// 				},)
// 					.replace(/\//g, '.',),)}
// 				{renderField('MOIC',formatWithAllDecimals(parsedPayload.moic,),)}
// 				{parsedPayload.irr && renderField('IRR', formatWithAllDecimals(parsedPayload.irr,),)}
// 				{parsedPayload.liquidity && renderField('Liquidity', formatWithAllDecimals(parsedPayload.liquidity,),)}
// 				{renderField('Total Commitment', formatWithAllDecimals(parsedPayload.totalCommitment,),)}
// 				{renderField('TVPI', formatWithAllDecimals(parsedPayload.tvpi,), hasManagementExpenses,)}
// 				{parsedPayload.managementExpenses && renderField('Management expenses',formatWithAllDecimals(parsedPayload.managementExpenses,), hasOtherExpenses,)}
// 				{parsedPayload.otherExpenses && renderField('Other expenses', formatWithAllDecimals(parsedPayload.otherExpenses,), hasCarriedInterest,)}
// 				{parsedPayload.carriedInterest && renderField('Carried interest', formatWithAllDecimals(parsedPayload.carriedInterest,), hasDistributions,)}
// 				{parsedPayload.distributions && renderField('Distributions', formatWithAllDecimals(parsedPayload.distributions,), hasHolding,)}
// 				{parsedPayload.holdingEntity && renderField('Entity of holding', parsedPayload.holdingEntity, hasProfit,)}
// 				{parsedPayload.profitLossCurrency && renderField('P/L', formatWithAllDecimals(parsedPayload.profitLossCurrency,), hasComment,)}
// 				{parsedPayload.comment && renderField('Comment', parsedPayload.comment, false,)}
// 			</div>
// 		</div>
// 	)
// }
export const PrivateEquityDetails: React.FC<IAssetDrawerProps> = ({
	asset,
},) => {
	const parsedPayload = JSON.parse(asset.payload,)

	const renderField = (
		label: string,
		value: string | number | null | undefined,
		addBorder: boolean = true,
	): React.JSX.Element | null => {
		if (value !== null && value !== undefined) {
			return (
				<div
					className={cx(
						styles.drawerTextBlock,
						{
							[styles.drawerBorderBottom]: addBorder,
						},
					)}
				>
					<p className={styles.drawerTypeText}>{label}</p>
					<p className={styles.drawerText}>{value}</p>
				</div>
			)
		}
		return null
	}

	const hasComment = parsedPayload.comment !== null && parsedPayload.comment !== undefined
	const hasProfit =
		parsedPayload.profitLossCurrency !== null &&
		parsedPayload.profitLossCurrency !== undefined
	const hasHolding =
		parsedPayload.holdingEntity !== null &&
		parsedPayload.holdingEntity !== undefined
	const hasDistributions =
		parsedPayload.distributions !== null &&
		parsedPayload.distributions !== undefined
	const hasCarriedInterest =
		parsedPayload.carriedInterest !== null &&
		parsedPayload.carriedInterest !== undefined
	const hasOtherExpenses =
		parsedPayload.otherExpenses !== null &&
		parsedPayload.otherExpenses !== undefined
	const hasManagementExpenses =
		parsedPayload.managementExpenses !== null &&
		parsedPayload.managementExpenses !== undefined
	const hasIrr = parsedPayload.irr !== null && parsedPayload.irr !== undefined
	const hasLiquidity =
		parsedPayload.liquidity !== null && parsedPayload.liquidity !== undefined

	return (
		<div className={styles.drawerContent}>
			<div className={cx(styles.drawerTextBlock, styles.drawerItemBorder,)}>
				<p className={styles.drawerTypeText}>Asset</p>
				<p className={styles.drawerText}>{asset.assetName}</p>
			</div>
			<div className={styles.drawerItemBorder}>
				{renderField('Fund type', parsedPayload.fundType,)}
				{renderField('Status', parsedPayload.status,)}
				{renderField('Currency', parsedPayload.currency,)}
				{renderField(
					'Entry date',
					parsedPayload.entryDate &&
						new Date(parsedPayload.entryDate,).toLocaleDateString('en-GB', {
							day:   '2-digit',
							month: '2-digit',
							year:  'numeric',
						},)
							.replace(/\//g, '.',),
				)}
				{renderField(
					'Current value',
					formatWithAllDecimals(parsedPayload.currencyValue,),
				)}
				{renderField('Service provider', parsedPayload.serviceProvider,)}
				{renderField('Geography', parsedPayload.geography,)}
				{renderField('Fund name', parsedPayload.fundName,)}
				{renderField('Fund ID', parsedPayload.fundID,)}
				{renderField('Fund size', parsedPayload.fundSize,)}
				{renderField('About fund', parsedPayload.aboutFund,)}
				{renderField('Investment Period', parsedPayload.investmentPeriod,)}
				{renderField(
					'Fund term date',
					parsedPayload.fundTermDate &&
						new Date(parsedPayload.fundTermDate,).toLocaleDateString('en-GB', {
							day:   '2-digit',
							month: '2-digit',
							year:  'numeric',
						},)
							.replace(/\//g, '.',),
				)}
				{renderField(
					'Capital called',
					formatWithAllDecimals(parsedPayload.capitalCalled,),
				)}
				{renderField(
					'Last date of valuation',
					parsedPayload.lastValuationDate &&
						new Date(parsedPayload.lastValuationDate,).toLocaleDateString(
							'en-GB',
							{
								day:   '2-digit',
								month: '2-digit',
								year:  'numeric',
							},
						)
							.replace(/\//g, '.',),
				)}
				{renderField('MOIC', formatWithAllDecimals(parsedPayload.moic,),)}
				{hasIrr &&
					renderField('IRR', formatWithAllDecimals(parsedPayload.irr,),)}
				{hasLiquidity &&
					renderField(
						'Liquidity',
						formatWithAllDecimals(parsedPayload.liquidity,),
					)}
				{renderField(
					'Total Commitment',
					formatWithAllDecimals(parsedPayload.totalCommitment,),
				)}
				{renderField(
					'TVPI',
					formatWithAllDecimals(parsedPayload.tvpi,),
					hasManagementExpenses,
				)}
				{hasManagementExpenses &&
					renderField(
						'Management expenses',
						formatWithAllDecimals(parsedPayload.managementExpenses,),
						hasOtherExpenses,
					)}
				{hasOtherExpenses &&
					renderField(
						'Other expenses',
						formatWithAllDecimals(parsedPayload.otherExpenses,),
						hasCarriedInterest,
					)}
				{hasCarriedInterest &&
					renderField(
						'Carried interest',
						formatWithAllDecimals(parsedPayload.carriedInterest,),
						hasDistributions,
					)}
				{hasDistributions &&
					renderField(
						'Distributions',
						formatWithAllDecimals(parsedPayload.distributions,),
						hasHolding,
					)}
				{hasHolding &&
					renderField(
						'Entity of holding',
						parsedPayload.holdingEntity,
						hasProfit,
					)}
				{hasProfit &&
					renderField(
						'P/L',
						formatWithAllDecimals(parsedPayload.profitLossCurrency,),
						hasComment,
					)}
				{hasComment &&
					renderField('Comment', parsedPayload.comment, false,)}
			</div>
		</div>
	)
}
