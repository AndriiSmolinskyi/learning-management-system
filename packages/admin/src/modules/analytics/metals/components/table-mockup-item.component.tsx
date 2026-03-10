import React from 'react'
import {
	format,
} from 'date-fns'
import {
	cx,
} from '@emotion/css'
import {
	localeString,
} from '../../../../shared/utils'

import type {
	IAssetExtended,
} from '../../../..//shared/types'

import * as styles from '../metals.styles'

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
			{isTableNamesShown && <><td className={styles.tableCreatingCell}></td>
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{asset.portfolio?.name}</div>
				</td>
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{asset.entity?.name}</div>
				</td>
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{asset.bank?.bankName}</div>
				</td>
				<td className={styles.tableCell}>
					<div className={styles.cellContent}>{asset.account?.accountName}</div>
				</td></>}
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(parsedPayload.units ?? 0, '', 0, false,)}</td>
			<td className={styles.tableCell}>{parsedPayload.metalType ?? 'N/A'}</td>
			<td className={styles.tableCell}>{parsedPayload.metalName ?? 'N/A'}</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{parsedPayload.transactionDate ?
					format(parsedPayload.transactionDate, 'dd.MM.yyyy',) :
					'N/A'}
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.amountColor(false,), styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.amountColor(false,), styles.tableNumberField,)}>N/A</td>
		</tr>
	)
}
