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
	useOptionsStore,
} from '../options.store'
import type {
	TOptionsAssetAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	Redo,
} from '../../../../assets/icons'

import * as styles from '../options.styles'

type Props = {
	row: TOptionsAssetAnalytics
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
		setMaturityYear,
		setAssetIds,
	} = useOptionsStore()

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}
		setBankId(undefined,)
		setMaturityYear(undefined,)
		setAssetIds(filter.assetIds?.includes(row.id,) ?
			filter.assetIds.length === 1 ?
				undefined :
				filter.assetIds.filter((item,) => {
					return item !== row.id
				},) :
			[...(filter.assetIds ?? []), row.id,],)
	}, [filter,],)

	return (
		<tr
			className={styles.tableRow(Boolean(filter.assetIds?.includes(row.id,),), false,)}
			onClick={handleRowClick}
		>
			<td className={styles.tableBtnCell}>
				<ItemDetails row={row} refetchData={refetchData} handleOpenDeleteModal={handleOpenDeleteModal}/>
			</td>
			{isTableNamesShown && <><td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.portfolio}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.entity}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.bank}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.account}</div>
			</td></>}
			<td className={cx(styles.tableCell,)}>{row.isTransferred && <Redo width={16} height={16} className={styles.transferIcon}/>}{row.currency}</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{row.startDate ?
					format(row.startDate, 'dd.MM.yyyy',) :
					''}
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{row.maturity ?
					format(row.maturity, 'dd.MM.yyyy',) :
					''}
			</td>
			<td className={cx(styles.tableCell,)}></td>
			<td className={cx(styles.tableCell,)}>{row.pair}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(row.premium, '', 0, true,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(row.strike, '', 0, true,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(row.marketValue, 'USD', 0, false,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(row.principalValue, '', 0, false,)}</td>
			<td className={cx(styles.tableCell,)}></td>
		</tr>
	)
}
