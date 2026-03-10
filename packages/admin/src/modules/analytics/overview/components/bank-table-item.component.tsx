import React from 'react'

import {
	useOverviewStore,
} from '../overview.store'
import type {
	TBankAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	localeString,
} from '../../../../shared/utils'

import * as styles from '../overview.styles'

type Props = {
	data: TBankAnalytics
	initialTotalUsdValue: number
	handleRowClick?: (data: TBankAnalytics) => void
	isLast?: boolean
}

export const BankTableItem: React.FC<Props> = ({
	data,
	initialTotalUsdValue,
	handleRowClick,
	isLast = false,
},) => {
	const {
		filter,
	} = useOverviewStore()

	const isBankSelected = Boolean(filter.tableBankIds?.includes(data.id,),)
	const isAccountSelected = Boolean(filter.tableAccountIds?.includes(data.accountId ?? '',),)
	const isHighlighted = isBankSelected || isAccountSelected

	return (
		// <div
		// 	className={styles.currencyItemContainer(isHighlighted, isLast,)}
		// 	onClick={() => {
		// 		handleRowClick?.(data,)
		// 	}}
		// >
		// 	<div className={styles.bankButtonTableCell()} />
		// 	<p className={styles.bigTableCell()}>
		// 		{data.bankName}
		// 	</p>
		// 	<p className={styles.bigTableCellNumber()}>
		// 		{localeString(data.usdValue, 'USD', 0, false,)}
		// 	</p>
		// 	<p className={styles.bigTableCellNumber()}>
		// 		{initialTotalUsdValue ?
		// 			(data.usdValue / initialTotalUsdValue * 100).toFixed(2,) :
		// 			0}%
		// 	</p>
		// </div>
		<div
			className={styles.currencyItemContainer(isHighlighted,)}
			onClick={() => {
				handleRowClick?.(data,)
			}}
		>
			<div className={styles.bankButtonTableCell()} />
			<p className={styles.bigTableCell()}>
				{data.bankName}
			</p>
			<p className={styles.bigTableCell()}>
			&nbsp;
			</p>
			<p className={styles.bigTableCellNumber()}>
				{localeString(data.usdValue, 'USD', 0 , false,)}
			</p>
			<p className={styles.bigTableCellNumber()}>
				{initialTotalUsdValue ?
					(data.usdValue / initialTotalUsdValue * 100).toFixed(2,) :
					0}%
			</p>
		</div>
	)
}
