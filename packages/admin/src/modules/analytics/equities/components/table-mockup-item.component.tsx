/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	format,
} from 'date-fns'

import {
	localeString,
} from '../../../../shared/utils'
import type {
	IAssetExtended,
} from '../../../../shared/types'

import * as styles from '../equities.styles'

type Props = {
	asset: IAssetExtended
	isTableNamesShown: boolean
	mutatedAssetsIds: Array<string> | undefined
}

export const TableMockupItem: React.FC<Props> = ({
	asset,
	mutatedAssetsIds,
	isTableNamesShown,
},) => {
	const parsedPayload = JSON.parse(asset.payload,)

	return (
		<tr className={styles.tableMockupRow()}>
			<td className={styles.tableCreatingCell}></td>
			{isTableNamesShown && <><td className={styles.tableCellMinimized}>
				<div className={styles.cellContent}>{parsedPayload.equityType}</div>
			</td>
			<td className={styles.tableCellMinimized}>
				<div className={styles.cellContent}>{asset.portfolio?.name}</div>
			</td>
			<td className={styles.tableCellMinimized}>
				<div className={styles.cellContent}>{asset.entity?.name}</div>
			</td>
			<td className={styles.tableCellMinimized}>
				<div className={styles.cellContent}>{asset.bank?.bankName}</div>
			</td>
			<td className={styles.tableCellMinimized}>
				<div className={styles.cellContent}>{asset.account?.accountName}</div>
			</td></>}
			<td className={cx(styles.tableCellMinimized, styles.textNowrap, styles.tableNumberField,)}>
				{parsedPayload.valueDate ?
					format(parsedPayload.valueDate, 'dd.MM.yyyy',) :
					'N/A'}
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{parsedPayload.issuer ?? 'N/A'}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{parsedPayload.isin ?? 'N/A'}</div>
			</td>
			<td className={styles.tableCellMinimized}>
				<div className={styles.cellContent}>{parsedPayload.security ?? 'N/A'}</div>
			</td>
			<td className={styles.tableCellMinimized}>{parsedPayload.currency ?? 'N/A'}</td>
			<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>{localeString(parsedPayload.units ?? 0, '', 0, false,)}</td>
			<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.amountColor(false,), styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.amountColor(false,), styles.tableNumberField,)}>N/A</td>
			<td className={styles.tableCellMinimized}><div className={styles.cellContent}>N/A</div></td>
			<td className={styles.tableCellMinimized}><div className={styles.cellContent}>N/A</div></td>
		</tr>
	)
}
