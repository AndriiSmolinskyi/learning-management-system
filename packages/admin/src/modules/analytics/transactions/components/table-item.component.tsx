/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
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
import {
	useAnalyticTransactionStore,
} from '../transaction.store'
import {
	TransactionCashFlow,
} from '../../../../shared/types'
import type {
	TransactionAnalytics,
} from '../../../../shared/types'

import * as styles from '../transactions.styles'

type Props = {
	row: TransactionAnalytics
}

export const TableItem: React.FC<Props> = ({
	row,
},) => {
	const {
		filter,
		setTransactionIds,
	} = useAnalyticTransactionStore()

	const handleRowClick = React.useCallback((): void => {
		setTransactionIds(filter.transactionIds?.includes(row.id,) ?
			filter.transactionIds.length === 1 ?
				undefined :
				filter.transactionIds.filter((item,) => {
					return item !== row.id
				},) :
			[...(filter.transactionIds ?? []), row.id,],)
	}, [filter,],)
	return (
		<tr
			className={styles.tableRow(Boolean(filter.transactionIds?.includes(row.id,),),)}
			onClick={handleRowClick}
		>
			<td className={cx(styles.smallTableCell, styles.textNowrap,)}>
				{row.transactionDate ?
					format(row.transactionDate, 'dd.MM.yyyy',) :
					''}
			</td>
			<td className={styles.tableCell}>{row.portfolioName}</td>
			<td className={styles.tableCell}>{row.entityName}</td>
			<td className={styles.tableCell}>{row.bankName}</td>
			<td className={styles.tableCell}>{row.accountName}</td>
			<td className={styles.tableCell}>{row.typeVersion?.name}</td>
			<td className={styles.smallTableCell}>{row.currency}</td>
			<td className={cx(styles.smallTableCell, styles.amountColor(row.typeVersion?.cashFlow === TransactionCashFlow.INFLOW,), styles.tableNumberField,)}>
				{
					row.transactionType?.cashFlow === TransactionCashFlow.INFLOW ?
						'+' :
						''
				}
				{localeString(Number(row.amount,), '', 2, true,)}
			</td>
			<td className={cx(styles.tableCell, styles.amountColor(row.typeVersion?.cashFlow === TransactionCashFlow.INFLOW,), styles.tableNumberField,)}>
				{
					row.transactionType?.cashFlow === TransactionCashFlow.INFLOW ?
						'+' :
						''
				}
				{localeString(Number(row.usdValue,), '', 2, true,)}
			</td>
			<td className={cx(styles.bigTableCell, styles.additionalLeftPadding24,)}>{row.comment ?? <span className={styles.empty}>- -</span>}</td>
			<td className={styles.tableCell}>{row.serviceProvider ?? 'N/A'}</td>
			<td className={styles.tableCell}>{row.isin ?? <span className={styles.empty}>- -</span>}</td>
			<td className={styles.tableCell}>{row.security ?? <span className={styles.empty}>- -</span>}</td>
		</tr>
	)
}
