import React from 'react'
import {
	MetalType,
	type IAsset,
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

export const MetalsDetails: React.FC<IAssetDrawerProps> = ({
	asset,
},) => {
	const parsedPayload = JSON.parse(asset.payload,)
	const isMetalETF = parsedPayload.productType === MetalType.ETF
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
				{!isMetalETF && <>
					{renderField('Product type', parsedPayload.productType,)}
					{renderField('Currency', parsedPayload.currency,)}
					{renderField('Metal type', parsedPayload.metalType,)}
					{renderField('Transaction date', parsedPayload.transactionDate && new Date(parsedPayload.transactionDate,).toLocaleDateString('en-GB', {
						day:   '2-digit',
						month: '2-digit',
						year:  'numeric',
					},)
						.replace(/\//g, '.',),)}
					{renderField('Purchase price', formatWithAllDecimals(parsedPayload.purchasePrice,),)}
					{renderField('Units', formatWithAllDecimals(parsedPayload.units,),)}
					{renderField('Operation', parsedPayload.operation, hasComment,)}
					{renderField('Comment', parsedPayload.comment, false,)}
				</>}
				{isMetalETF && <>
					{renderField('Product type', parsedPayload.productType,)}
					{renderField('Currency', parsedPayload.currency,)}
					{renderField('ISIN', parsedPayload.isin,)}
					{renderField('Security', parsedPayload.security,)}
					{renderField('Units', formatWithAllDecimals(parsedPayload.units,),)}
					{renderField('Transaction date', parsedPayload.transactionDate && new Date(parsedPayload.transactionDate,).toLocaleDateString('en-GB', {
						day:   '2-digit',
						month: '2-digit',
						year:  'numeric',
					},)
						.replace(/\//g, '.',),)}
					{renderField('Transaction price', formatWithAllDecimals(parsedPayload.transactionPrice,),)}
					{renderField('Bank fee', formatWithAllDecimals(parsedPayload.bankFee,),)}
					{renderField('Operation', parsedPayload.operation,)}
					{renderField('Comment', parsedPayload.comment, false,)}
				</>}
			</div>
		</div>
	)
}
