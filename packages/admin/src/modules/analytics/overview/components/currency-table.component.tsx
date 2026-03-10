import React from 'react'

import {
	CurrencyTableHeader,
} from './currency-table-header.component'
import {
	CurrencyTableItem,
} from './currency-table-item.component'

import {
	SortOrder,
} from '../../../../shared/types'
import type {
	TOverviewTableFilter,
} from '../overview.types'
import {
	TOverviewSortVariants,
} from '../overview.types'
import {
	sortOverviewList,
} from '../overview.utils'
import type {
	TCurrencyAnalytics,
} from '../../../../services/analytics/analytics.types'

import * as styles from '../overview.styles'

type Props = {
	data: Array<TCurrencyAnalytics>
	handleRowClick?: (data: TCurrencyAnalytics) => void
}

export const CurrencyTable: React.FC<Props> = ({
	data,
	handleRowClick,
},) => {
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [filter, setFilter,] = React.useState<TOverviewTableFilter>({
		sortBy:    TOverviewSortVariants.USD_VALUE,
		sortOrder: SortOrder.DESC,
	},)

	const total = data.reduce<number>((acc, item,) => {
		return item.usdValue + acc
	}, 0,)

	const sortedList = sortOverviewList(data, filter,)

	const checkTbodyHeight = (): void => {
		if (tbodyRef.current && tableRef.current) {
			const tableHeight = tableRef.current.offsetHeight
			const tbodyScrollHeight = tbodyRef.current.scrollHeight
			setIsTbodyEmpty((tableHeight - tbodyScrollHeight - 43.99) > 0,)
		}
	}

	React.useEffect(() => {
		checkTbodyHeight()
		const handleResize = (): void => {
			checkTbodyHeight()
		}
		window.addEventListener('resize', handleResize,)
		return () => {
			window.removeEventListener('resize', handleResize,)
		}
	}, [sortedList,],)
	const rowHeight = 44
	React.useEffect(() => {
		const table = tbodyRef.current
		if (!table) {
			return undefined
		}
		const onWheel: (e: WheelEvent) => void = (e,) => {
			e.preventDefault()
			table.scrollTop = table.scrollTop + (Math.sign(e.deltaY,) * rowHeight)
		}
		table.addEventListener('wheel', onWheel, {
			passive: false,
		},)
		return (): void => {
			table.removeEventListener('wheel', onWheel,)
		}
	}, [],)
	return (
		<div className={styles.smallTableWrapper} ref={tableRef}>
			<CurrencyTableHeader
				filter={filter}
				setFilter={setFilter}
				isTbodyEmpty={isTbodyEmpty}
			/>
			<div className={styles.currencyTable} ref={tbodyRef}>
				{sortedList.map((item,) => {
					return (
						<CurrencyTableItem
							key={item.currency}
							data={item}
							totalValue={total}
							handleRowClick={handleRowClick}
						/>
					)
				},)}
			</div>
		</div>
	)
}
