import React from 'react'
import {
	cx,
} from '@emotion/css'
import type {
	IAssetExtended,
} from '../../../../shared/types'
import {
	localeString,
} from '../../../../shared/utils'

import * as styles from '../bonds.styles'

type Props = {
	asset: IAssetExtended
	mutatedAssetsIds: Array<string> | undefined
	isTableNamesShown: boolean
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
			<td className={styles.tableSortCellMinimized}>
				{parsedPayload.isin}
			</td>
			<td className={styles.tableCell}>
				{parsedPayload.security}
			</td>
			<td className={styles.tableCellMinimized}>
				{parsedPayload.currency}
			</td>
			<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>
				{localeString(parsedPayload.units, '', 0, false,)}
			</td>
			<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, false,)}>N/A</td>
			<td className={cx(styles.tableProfitCellMinimized, false,)}>N/A</td>
			<td className={cx(styles.tableCellMinimized, styles.tableNumberField,)}>N/A</td>
			{/* <td className={cx(styles.tableCell, styles.tableNumberField,)}>N/A</td> */}
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				<div className={styles.cellContent}>N/A</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>N/A</div>
			</td>

			<td className={styles.tableCell}>
				<div className={styles.cellContent}>N/A</div>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>N/A</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>N/A</div>
			</td>
		</tr>
	)
}
