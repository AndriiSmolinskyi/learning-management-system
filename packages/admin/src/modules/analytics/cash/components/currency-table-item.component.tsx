import React from 'react'

import type {
	TAnalyticsTableData,
} from '../../../../shared/types'
import {
	useCashStore,
} from '../cash.store'
import {
	localeString,
} from '../../../../shared/utils'

import * as styles from '../cash.styles'

type Props = {
	data: TAnalyticsTableData
	totalValue: number
	handleRowClick?: (data: TAnalyticsTableData) => void
}

export const CurrencyTableItem: React.FC<Props> = ({
	data,
	totalValue,
	handleRowClick,
},) => {
	const {
		filter,
	} = useCashStore()
	return (
		<div
			className={styles.itemContainer(Boolean(filter.currency?.includes(data.currency,),),)}
			onClick={() => {
				handleRowClick?.(data,)
			}}
		>
			<p className={styles.tableCell}>
				{data.currency}
			</p>
			<p className={styles.tableCellNumber}>
				{localeString(data.currencyValue, '', 0, false,)}
			</p>
			<p className={styles.tableCellNumber}>
				{localeString(data.usdValue, 'USD', 0, false,)}
			</p>
			<p className={styles.tableCellNumber}>
				{totalValue ?
					localeString(data.usdValue / totalValue * 100, '', 2,) :
					0}%
			</p>
		</div>
	)
}
