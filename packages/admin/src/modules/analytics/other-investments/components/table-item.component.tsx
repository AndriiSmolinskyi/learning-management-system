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
	useOtherInvestmentsStore,
} from '../other-investments.store'
import type {
	TOtherInvestmentExtended,
} from '../../../../services/analytics/analytics.types'
import {
	Redo,
} from '../../../../assets/icons'

import * as styles from '../other-investments.styles'

type Props = {
	row: TOtherInvestmentExtended
	handleOpenDeleteModal: (assetId: string) => void
	refetchData: () => void
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
		setAssetIds,
	} = useOtherInvestmentsStore()

	const handleRowClick = React.useCallback((e: React.MouseEvent<HTMLTableRowElement>,): void => {
		const drawer = document.querySelector('.bp5-overlay',)
		if (drawer && drawer.contains(e.target as Node,)) {
			return
		}
		setBankId(undefined,)
		setCurrency(undefined,)
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
				<div className={styles.cellContent}>{row.isTransferred && <Redo width={16} height={16} className={styles.transferIcon}/>}{row.investmentAssetName}</div>
			</td>
			<td className={styles.tableCell}>
				<div className={styles.cellContent}>{row.serviceProvider}</div>
			</td>
			<td className={styles.tableCell}>{row.currency}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(Number(row.currencyValue,), '', 0, false,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(row.usdValue ?? 0, 'USD', 0, false,)}</td>
			<td className={cx(styles.tableCell, styles.tableNumberField,)}>{localeString(row.marketValueUsd ?? 0, 'USD', 0, false,)}</td>
			<td className={cx(styles.tableCell, styles.amountColor(row.profitUsd >= 0,), styles.tableNumberField,)}>
				{localeString(row.profitUsd, 'USD', 0, false,)}
			</td>
			<td className={cx(styles.tableCell, styles.amountColor(row.percent >= 0,), styles.tableNumberField,)}>
				{localeString(row.percent, '', 2, true,)}%
			</td>
			<td className={cx(styles.tableCell, styles.textNowrap, styles.tableNumberField,)}>
				{row.investmentDate ?
					format(row.investmentDate, 'dd.MM.yyyy',) :
					''}
			</td>
		</tr>
	)
}
