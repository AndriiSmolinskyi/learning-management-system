/* eslint-disable no-nested-ternary */
import React from 'react'
import {
	format,
} from 'date-fns'
import {
	cx,
} from '@emotion/css'
import {
	ItemDetails,
} from './item-details'
import {
	localeString,
} from '../../../../shared/utils'
import {
	usePrivateEquityStore,
} from '../private-equity.store'
import type {
	IAnalyticPrivate,
} from '../../../../services/analytics/analytics.types'
import {
	Redo,
} from '../../../../assets/icons'

import * as styles from '../private-equity.styles'

type Props = {
	row: IAnalyticPrivate
	refetchData: () => void
	handleOpenDeleteModal: (assetId: string) => void
	isTableNamesShown: boolean
}

export const TableItem: React.FC<Props> = ({
	row,
	refetchData,
	handleOpenDeleteModal,
	isTableNamesShown,
},) => {
	const {
		filter,
		setBankId,
		setCurrency,
		setAssetId,
	} = usePrivateEquityStore()
	const capitalCalled = Number(row.capitalCalled,)
	const totalCommitment = Number(row.totalCommitment,)

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetId(filter.assetId?.includes(row.assetId,) ?
			filter.assetId.length === 1 ?
				undefined :
				filter.assetId.filter((item,) => {
					return item !== row.assetId
				},) :
			[...(filter.assetId ?? []), row.assetId,],)
	}, [filter,],)

	return (
		<tr
			className={styles.tableRow(Boolean(filter.assetId?.includes(row.assetId,),), false,)}
			onClick={handleRowClick}
		>
			<td className={styles.tableBtnCell}>
				<ItemDetails row={row} refetchData={refetchData} handleOpenDeleteModal={handleOpenDeleteModal}/>
			</td>
			{isTableNamesShown && <><td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.fundType}</div>
			</td>
			<td className={styles.tableCell}>
				<span className={styles.statusTableCell(row.status,)}>{row.status}</span>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.portfolioName}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.entityName}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.bankName}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.accountName}</div>
			</td></>}
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.isTransferred && <Redo width={16} height={16} className={styles.transferIcon}/>}{row.fundName}</div>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>{row.fundID}</div>
			</td>
			<td className={styles.tableCell}></td>
			<td className={styles.tableCell}>{row.currency}</td>
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
			<td className={cx(styles.tableCell, styles.amountColor(row.usdValue >= 0,), styles.tableNumberField,)}>
				{localeString(row.usdValue, 'USD', 0, false,)}
			</td>
			<td className={cx(styles.tableCell, styles.amountColor(row.pl >= 0,), styles.tableNumberField,)}>
				{localeString(row.pl, '', 0,)}%
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{row.entryDate ?
					format(row.entryDate, 'dd.MM.yyyy',) :
					''}
			</td>
			<td className={styles.tableCell}></td>
		</tr>
	)
}
