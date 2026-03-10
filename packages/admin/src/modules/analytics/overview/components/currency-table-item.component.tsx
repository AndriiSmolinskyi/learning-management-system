import React from 'react'

import {
	useOverviewStore,
} from '../overview.store'
import type {
	TCurrencyAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	localeString,
} from '../../../../shared/utils'

import * as styles from '../overview.styles'

type Props = {
	data: TCurrencyAnalytics
	totalValue: number
	handleRowClick?: (data: TCurrencyAnalytics) => void
}

export const CurrencyTableItem: React.FC<Props> = ({
	data,
	totalValue,
	handleRowClick,
},) => {
	const {
		filter,
	} = useOverviewStore()
	return (
		<div
			className={styles.smallItemContainer(Boolean(filter.tableCurrencies?.includes(data.currency,),),)}
			onClick={() => {
				handleRowClick?.(data,)
			}}
		>
			<p className={styles.smallTableCell}>
				{data.currency}
			</p>
			<p className={styles.smallTableCellNumber}>
				{['BTC', 'ETH',].includes(data.currency,) ?
					localeString(data.currencyValue, '', 2 , true,) :
					localeString(data.currencyValue, '', 0 , false,)}
			</p>
			<p className={styles.smallTableCellNumber}>
				{localeString(data.usdValue, 'USD', 0 , false,)}
			</p>
			<p className={styles.smallTableCellNumber}>
				{totalValue ?
					localeString(Number((data.usdValue / totalValue * 100).toFixed(2,),), '', 2,) :
					0}%
			</p>
		</div>
	)
}
