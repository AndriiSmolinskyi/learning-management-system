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

export const BondDetails: React.FC<IAssetDrawerProps> = ({
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
				{renderField('Value date', asset.createdAt && new Date(parsedPayload.valueDate,).toLocaleDateString('en-GB', {
					day:   '2-digit',
					month: '2-digit',
					year:  'numeric',
				},)
					.replace(/\//g, '.',),)}
				{renderField('ISIN', parsedPayload.isin,)}
				{renderField('Security', parsedPayload.security,)}
				{renderField('Units', formatWithAllDecimals(parsedPayload.units,),)}
				{renderField('Unit price', formatWithAllDecimals(parsedPayload.unitPrice,),)}
				{renderField('Bank fee', formatWithAllDecimals(parsedPayload.bankFee,),)}
				{renderField('Accrued', formatWithAllDecimals(parsedPayload.accrued,),)}
				{renderField('Operation', parsedPayload.operation, hasComment,)}
				{renderField('Comment', parsedPayload.comment, false,)}
			</div>
		</div>
	)
}
