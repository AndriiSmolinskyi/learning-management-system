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

import * as styles from '../real-estate.styles'

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
				<div className={styles.cellContent}>{parsedPayload.country ?? 'N/A'}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{parsedPayload.city ?? 'N/A'}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{parsedPayload.projectTransaction ?? 'N/A'}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>
					{parsedPayload.operation ?
						parsedPayload.operation :
						'N/A'}
				</div>
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{parsedPayload.date ?
					format(parsedPayload.date, 'dd.MM.yyyy',) :
					'N/A'}
			</td>
			<td className={styles.tableCell}>{parsedPayload.currency}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(parsedPayload.currencyValue ?? 0, '', 0, false,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(parsedPayload.usdValue ?? 0, 'USD', 0, false,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.amountColor(false,), styles.tableNumberField,)}>N/A</td>
			<td className={cx(styles.tableCell, styles.amountColor(false,), styles.tableNumberField,)}>N/A</td>
		</tr>
	)
}
