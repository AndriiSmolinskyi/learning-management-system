/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import type {
	IAssetExtended,
} from '../../../../shared/types'

import * as styles from '../crypto.styles'

type Props = {
	asset: IAssetExtended
	mutatedAssetsIds: Array<string> | undefined
	shouldShowEtfColumns: boolean
	shouldShowDirectColumns: boolean
	isTableNamesShown: boolean
}

export const TableMockupItem: React.FC<Props> = ({
	asset,
	mutatedAssetsIds,
	shouldShowEtfColumns,
	shouldShowDirectColumns,
	isTableNamesShown,
},) => {
	const parsedPayload = JSON.parse(asset.payload,)
	return (
		<tr className={styles.tableMockupRow()}>
			<td className={styles.tableCreatingCell}></td>
			{isTableNamesShown && <><td className={styles.tableCell}>
				<div className={styles.cellContent}>{parsedPayload.productType ?? 'N/A'}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{asset.portfolio?.name}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{asset.entity?.name}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{asset.bank?.bankName}</div>
			</td></>}
			{shouldShowEtfColumns && <td className={styles.tableCell}>
				<div className={styles.cellContent}>N/A</div>
			</td>}
			{shouldShowEtfColumns && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{parsedPayload.isin ?? 'N/A'}</div>
				</td>
			)}
			{shouldShowEtfColumns && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{parsedPayload.security ?? 'N/A'}</div>
				</td>
			)}
			{shouldShowDirectColumns && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{parsedPayload.cryptoCurrencyType ?? 'N/A'}</div>
				</td>
			)}
			{shouldShowEtfColumns && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{parsedPayload.currencyValue ?? 'N/A'}</div>
				</td>
			)}
			{shouldShowEtfColumns && (
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>'N/A'</div>
				</td>
			)}
			{shouldShowEtfColumns && (
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>{parsedPayload.units ?? 'N/A'}</div>
				</td>
			)}
			{shouldShowDirectColumns && (
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>{parsedPayload.cryptoAmount ?? 'N/A'}</div>
				</td>
			)}
			{shouldShowEtfColumns && (
				<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
					{parsedPayload.valueDate ?? parsedPayload.purchaseDate ?? 'N/A'}
				</td>
			)}
			{shouldShowEtfColumns && (
				<td className={cx(styles.tableCell, styles.tableNumberField,)}>
					<div className={styles.cellContent}>N/A</div>
				</td>
			)}
			<td className={cx(styles.tableCell, styles.amountColor(false,), styles.tableNumberField,)}>
				N/A
			</td>
			<td className={cx(styles.tableCell, styles.amountColor(false,), styles.tableNumberField,)}>
				N/A
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>N/A</div>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>N/A</div>
			</td>
			{shouldShowEtfColumns && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>N/A</div>
				</td>
			)}
			{shouldShowDirectColumns && (
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>N/A</div>
				</td>
			)}
		</tr>
	)
}
