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
	useLoanStore,
} from '../loan.store'
import type {
	ILoanAnalytic,
} from '../../../../services/analytics/analytics.types'
import {
	Redo,
} from '../../../../assets/icons'

import * as styles from '../loan.styles'

type Props = {
	row: ILoanAnalytic
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
	} = useLoanStore()

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetId(filter.assetId?.includes(row.id,) ?
			filter.assetId.length === 1 ?
				undefined :
				filter.assetId.filter((item,) => {
					return item !== row.id
				},) :
			[...(filter.assetId ?? []), row.id,],)
	}, [filter,],)

	return (
		<tr
			className={styles.tableRow(Boolean(filter.assetId?.includes(row.id,),), false,)}
			onClick={handleRowClick}
		>
			<td className={styles.tableBtnCell}>
				<ItemDetails row={row} refetchData={refetchData} handleOpenDeleteModal={handleOpenDeleteModal}/>
			</td>
			{isTableNamesShown && <><td className={styles.tableCell}>
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
				<div className={styles.cellContent}>{row.name}{row.isTransferred && <Redo width={16} height={16} className={styles.transferIcon}/>}</div>
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{row.startDate ?
					format(row.startDate, 'dd.MM.yyyy',) :
					''}
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{row.maturityDate ?
					format(row.maturityDate, 'dd.MM.yyyy',) :
					''}
			</td>
			<td className={styles.tableCell}></td>
			<td className={styles.tableCell}>{row.currency}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{localeString(Number(row.currencyValue,), '', 0, false,)}
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{localeString(row.usdValue, 'USD', 0, false,)}
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>{localeString(Number(row.interest,), '', 2, true,)}%</div>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>{localeString(Number(row.todayInterest,), '', 2, true,)}%</div>
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				<div className={styles.cellContent}>{localeString(Number(row.maturityInterest,), '', 2, true,)}%</div>
			</td>
			<td className={styles.tableCell}></td>
		</tr>
	)
}
