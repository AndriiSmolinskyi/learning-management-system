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

export const OptionsDetails: React.FC<IAssetDrawerProps> = ({
	asset,
},) => {
	const parsedPayload = JSON.parse(asset.payload,)

	const renderField = (label: string, value: string | number | null | undefined, addBorder: boolean = true,): React.JSX.Element | null => {
		if (value !== null && value !== undefined) {
			return (
				<div className={cx(styles.drawerTextBlock, {
					[styles.drawerBorderBottom]: addBorder,
				},)}>
					<p className={styles.drawerTypeText}>{label}</p>
					<p className={styles.drawerText}>{value}</p>
				</div>
			)
		}
		return null
	}

	const hasComment = parsedPayload.comment !== null && parsedPayload.comment !== undefined

	return (
		<div className={styles.drawerContent}>
			<div className={cx(styles.drawerTextBlock, styles.drawerItemBorder,)}>
				<p className={styles.drawerTypeText}>Asset</p>
				<p className={styles.drawerText}>{asset.assetName}</p>
			</div>
			<div className={styles.drawerItemBorder}>
				{renderField('Currency', parsedPayload.currency,)}
				{renderField('Start date', parsedPayload.startDate && new Date(parsedPayload.startDate,).toLocaleDateString('en-GB', {
					day:   '2-digit',
					month: '2-digit',
					year:  'numeric',
				},)
					.replace(/\//g, '.',),)}
				{renderField('Maturity date', parsedPayload.maturityDate && new Date(parsedPayload.maturityDate,).toLocaleDateString('en-GB', {
					day:   '2-digit',
					month: '2-digit',
					year:  'numeric',
				},)
					.replace(/\//g, '.',),)}
				{renderField('Currency pair or asset', parsedPayload.pairAssetCurrency,)}
				{renderField('Principal value', formatWithAllDecimals(parsedPayload.principalValue,),)}
				{renderField('Strike', formatWithAllDecimals(parsedPayload.strike,),)}
				{renderField('Premium', formatWithAllDecimals(parsedPayload.premium,),)}
				{renderField('Market value at open', formatWithAllDecimals(parsedPayload.marketOpenValue,),)}
				{renderField('Current market value USD', formatWithAllDecimals(parsedPayload.currentMarketValue,),)}
				{renderField('Contracts', formatWithAllDecimals(parsedPayload.contracts,), hasComment,)}
				{renderField('Comment', parsedPayload.comment, false,)}
			</div>
		</div>
	)
}
