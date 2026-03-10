import React from 'react'

import {
	useOverviewStore,
} from '../overview.store'
import type {
	TEntityAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	localeString,
} from '../../../../shared/utils'

import * as styles from '../overview.styles'

type Props = {
	data: TEntityAnalytics
	totalValue: number
	handleRowClick?: (data: TEntityAnalytics) => void
}

export const EntityTableItem: React.FC<Props> = ({
	data,
	totalValue,
	handleRowClick,
},) => {
	const {
		filter,
	} = useOverviewStore()
	return (
		<div
			className={styles.currencyItemContainer(Boolean(filter.tableEntityIds?.includes(data.id,),),)}
			onClick={() => {
				handleRowClick?.(data,)
			}}
		>
			<div className={styles.bankButtonTableCell()} />
			<p className={styles.bigTableCell()}>
				{data.portfolioName}
			</p>
			<p className={styles.bigTableCell()}>
				{data.entityName}
			</p>
			<p className={styles.bigTableCellNumber()}>
				{localeString(data.usdValue, 'USD', 0 , false,)}
			</p>
			<p className={styles.bigTableCellNumber()}>
				{totalValue ?
					(data.usdValue / totalValue * 100).toFixed(2,) :
					0}%
			</p>
		</div>
	)
}
