/* eslint-disable complexity */
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
} from '../../../../shared/types'

import * as styles from '../private-equity.styles'

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
	const capitalCalled = Number(parsedPayload.capitalCalled,)
	const totalCommitment = Number(parsedPayload.totalCommitment,)

	return (
		<tr className={styles.tableMockupRow()}>
			<td className={styles.tableCreatingCell}></td>
			{isTableNamesShown && <><td className={styles.tableCell}>
				<div className={styles.cellContent}>{parsedPayload.fundType ?? 'N/A'}</div>
			</td>
			<td className={styles.tableCell}>{parsedPayload.status ?? 'N/A'}</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{asset.portfolio?.name}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{asset.account?.accountName}</div>
			</td></>}
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{parsedPayload.fundName ?? 'N/A'}</div>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>{parsedPayload.fundID ?? 'N/A'}</div>
			</td>
			<td className={styles.tableCell}>{parsedPayload.currency ?? 'N/A'}</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{parsedPayload.entryDate ?
					format(parsedPayload.entryDate, 'dd.MM.yyyy',) :
					'N/A'}
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{isNaN(capitalCalled,) ?
					0 :
					localeString(capitalCalled, '', 0, false,)}
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{isNaN(totalCommitment,) ?
					0 :
					localeString(totalCommitment, '', 0, false,)
				}
			</td>
			<td className={cx(styles.tableCell, styles.amountColor(false,), styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.amountColor(false,), styles.tableNumberField,)}>parsedPayload</td>
		</tr>
	)
}
