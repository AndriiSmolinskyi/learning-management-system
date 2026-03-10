/* eslint-disable no-unused-vars */
/* eslint-disable complexity */
import React from 'react'
import type {
	IAsset,
} from '../../../../../../../shared/types'
import {
	cx,
} from '@emotion/css'
import type {
	CustomField,
} from '../../asset'
import {
	formatWithAllDecimals,
} from '../../../../../../../shared/utils'

import * as styles from '../sub-items.style'

interface IAssetDrawerProps {
  asset: IAsset;
}

export const OtherDetails: React.FC<IAssetDrawerProps> = ({
	asset,
},) => {
	const parsedPayload = JSON.parse(asset.payload,)

	const knownFields = [
		'currency',
		'investmentDate',
		'currencyValue',
		'usdValue',
		'serviceProvider',
		'comment',
		'investmentAssetName',
	]

	return (
		<div className={styles.drawerContent}>
			<div className={cx(styles.drawerTextBlock, styles.drawerItemBorder,)}>
				<p className={styles.drawerTypeText}>Asset</p>
				<p className={styles.drawerText}>{asset.assetName}</p>
			</div>
			<div className={styles.drawerItemBorder}>
				{parsedPayload.investmentAssetName && (
					<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
						<p className={styles.drawerTypeText}>Asset name</p>
						<p className={styles.drawerText}>{parsedPayload.investmentAssetName}</p>
					</div>
				)}
				{parsedPayload.currency && (
					<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
						<p className={styles.drawerTypeText}>Currency</p>
						<p className={styles.drawerText}>{parsedPayload.currency}</p>
					</div>
				)}
				{parsedPayload.investmentDate && (
					<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
						<p className={styles.drawerTypeText}>Date of Investment</p>
						<p className={styles.drawerText}>
							{new Date(parsedPayload.investmentDate,).toLocaleDateString('en-GB', {
								day:   '2-digit',
								month: '2-digit',
								year:  'numeric',
							},)
								.replace(/\//g, '.',)}
						</p>
					</div>
				)}
				{parsedPayload.currencyValue && (
					<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
						<p className={styles.drawerTypeText}>Value in currency</p>
						<p className={styles.drawerText}>{formatWithAllDecimals(parsedPayload.currencyValue,)}</p>
					</div>
				)}
				{parsedPayload.usdValue && (
					<div className={cx(styles.drawerTextBlock, styles.drawerBorderBottom,)}>
						<p className={styles.drawerTypeText}>Value in USD</p>
						<p className={styles.drawerText}>{formatWithAllDecimals(parsedPayload.usdValue,)}</p>
					</div>
				)}
				{parsedPayload.serviceProvider && (
					<div className={cx(styles.drawerTextBlock, {
						[styles.drawerBorderBottom]: parsedPayload.comment,
					},)}>
						<p className={styles.drawerTypeText}>Service provider</p>
						<p className={styles.drawerText}>{parsedPayload.serviceProvider}</p>
					</div>
				)}

				{parsedPayload.comment && (
					<div className={cx(styles.drawerTextBlock, {
						[styles.drawerBorderBottom]: parsedPayload.customFields?.length > 0,
					},)}>
						<p className={styles.drawerTypeText}>Comment</p>
						<p className={styles.drawerText}>{parsedPayload.comment}</p>
					</div>
				)}
				{parsedPayload?.customFields && parsedPayload.customFields?.length > 0 &&
					parsedPayload.customFields.map((field: CustomField, index: number,) => {
						const isLastItem = index === parsedPayload.customFields.length - 1
						return (
							<div key={index} className={cx(styles.drawerTextBlock, {
								[styles.drawerBorderBottom]: !isLastItem,
							},)}>
								<p className={styles.drawerTypeText}>{field.label}</p>
								<p className={styles.drawerText}>{field.info}</p>
							</div>
						)
					},)
				}
			</div>
		</div>
	)
}