import React from 'react'
import {
	cx,
} from '@emotion/css'
import type {
	IAsset,
} from '../../../../../../../shared/types'
import {
	formatWithAllDecimals,
} from '../../../../../../../shared/utils'
import * as styles from '../sub-items.style'

interface IAssetDrawerProps {
  asset: IAsset;
}

export const RealEstateDetails: React.FC<IAssetDrawerProps> = ({
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
				{renderField('Investment date', parsedPayload.investmentDate && new Date(parsedPayload.investmentDate,).toLocaleDateString('en-GB', {
					day:   '2-digit',
					month: '2-digit',
					year:  'numeric',
				},)
					.replace(/\//g, '.',),)}
				{renderField('Value on currency', formatWithAllDecimals(parsedPayload.currencyValue,),)}
				{renderField('Value in USD', formatWithAllDecimals(parsedPayload.usdValue,),)}
				{renderField('Market Value in FC', formatWithAllDecimals(parsedPayload.marketValueFC,),)}
				{renderField('Project transaction', parsedPayload.projectTransaction,)}
				{renderField('Country', parsedPayload.country,)}
				{renderField('City', parsedPayload.city,)}
				{renderField('Operation', parsedPayload.operation, hasComment,)}
				{renderField('Comment', parsedPayload.comment, false,)}
			</div>
		</div>
	)
}
