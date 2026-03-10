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
	useDepositStore,
} from '../deposit.store'
import type {
	IAnalyticDeposit,
} from '../../../../services/analytics/analytics.types'
import {
	Redo,
} from '../../../../assets/icons'

import * as styles from '../deposit.styles'

type Props = {
	row: IAnalyticDeposit
	isTableNamesShown: boolean
	refetchData: () => void
	handleOpenDeleteModal: (assetId: string) => void
}

export const TableItem: React.FC<Props> = ({
	row,
	isTableNamesShown,
	refetchData,
	handleOpenDeleteModal,
},) => {
	const {
		filter,
		setBankId,
		setCurrency,
		setAssetId,
	} = useDepositStore()

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
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{row.startDate ?
					format(row.startDate, 'dd.MM.yyyy',) :
					<span className={styles.empty}>- -</span>}
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{row.maturityDate ?
					format(row.maturityDate, 'dd.MM.yyyy',) :
					<span className={styles.empty}>- -</span>}
			</td>
			<td className={styles.tableCell}></td>
			<td className={styles.tableCell}>{row.currency}{row.isTransferred && <Redo width={16} height={16} className={styles.transferIcon}/>}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{localeString(Number(row.currencyValue,), '', 0, false,)}
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{localeString(Number(row.usdValue,), 'USD', 0, false,)}
			</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>
				{localeString(Number(row.interest,),)}%
			</td>
			<td className={styles.tableCell}></td>
			<td className={styles.tableCell}>{row.policy}</td>
		</tr>
	)
}
