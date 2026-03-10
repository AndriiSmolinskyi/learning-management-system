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
import * as styles from '../loan.styles'

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
			{isTableNamesShown && <><td className={styles.tableCell}>
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
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{parsedPayload.name ?? 'N/A'}</div>
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{parsedPayload.startDate ?
					format(parsedPayload.startDate, 'dd.MM.yyyy',) :
					'N/A'}
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{parsedPayload.maturityDate ?
					format(parsedPayload.maturityDate, 'dd.MM.yyyy',) :
					'N/A'}
			</td>
			<td className={styles.tableCell}>{parsedPayload.currency ?? 'N/A'}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{localeString(Number(parsedPayload.currencyValue ?? 0,), '', 0, false,)}
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{parsedPayload.usdValue ?? 'N/A'}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>{localeString(Number(parsedPayload.interest ?? 0,), '', 0, false,)}%</div>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>{localeString(Number(parsedPayload.todayInterest ?? 0,), '', 0, false,)}%</div>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>{localeString(Number(parsedPayload.maturityInterest ?? 0,), '', 0, false,)}%</div>
			</td>
		</tr>
	)
}
