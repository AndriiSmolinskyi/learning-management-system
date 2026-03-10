import React from 'react'
import type {
	IAsset,
} from '../../../../../../../shared/types'
import {
	cx,
} from '@emotion/css'
import {
	localeString,
} from '../../../../../../../shared/utils'

import * as styles from '../sub-items.style'

interface IAssetDrawerProps {
  asset: IAsset;
}

export const CollateralDetails: React.FC<IAssetDrawerProps> = ({
	asset,
},) => {
	const parsedPayload = JSON.parse(asset.payload,)

	const renderField = (label: string, value: string | number | null | undefined, addBorder: boolean = true,): React.JSX.Element | null => {
		if (value !== null && value !== undefined && value !== 0) {
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
				{renderField('End date', parsedPayload.endDate && new Date(parsedPayload.endDate,).toLocaleDateString('en-GB', {
					day:   '2-digit',
					month: '2-digit',
					year:  'numeric',
				},)
					.replace(/\//g, '.',),)}
				{renderField('Amount in Currency', localeString(parsedPayload.currencyAmount, '', 2, true,),)}
				{renderField('Amount in USD', localeString(parsedPayload.usdAmount, '', 2, true,),)}
				{renderField('Credit provider', parsedPayload.creditProvider,)}
				{renderField('Credit amount', parsedPayload.creditAmount, hasComment,)}
				{renderField('Comment', parsedPayload.comment, false,)}
			</div>
		</div>
	)
}
