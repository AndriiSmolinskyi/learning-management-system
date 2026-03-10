import React from 'react'

import {
	EntityTableHeader,
} from './entity-table-header.component'
import {
	EntityTableItem,
} from './entity-table-item.component'

import {
	useOverviewStore,
} from '../overview.store'
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
	TEntityAnalytics,
} from '../../../../services/analytics/analytics.types'
import {
	localeString,
} from '../../../../shared/utils'

import * as styles from '../overview.styles'

type Props = {
	data: Array<TEntityAnalytics>
	handleRowClick?: (data: TEntityAnalytics) => void
}

export const EntityTable: React.FC<Props> = ({
	data,
	handleRowClick,
},) => {
	const {
		filter: filterStore,
	} = useOverviewStore()
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [totalUsdValue, setTotalUsdValue,] = React.useState<number | undefined>(0,)
	const [filter, setFilter,] = React.useState<TOverviewTableFilter>({
		sortBy:    TOverviewSortVariants.USD_VALUE,
		sortOrder: SortOrder.DESC,
	},)

	React.useEffect(() => {
		if (filterStore.tableEntityIds?.length) {
			let total = 0
			filterStore.tableEntityIds.forEach((entityId,) => {
				const currentAsset = data.find((asset,) => {
					return asset.id === entityId
				},)
				if (currentAsset?.usdValue) {
					total = total + currentAsset.usdValue
				}
			},)
			setTotalUsdValue(total,)
		} else {
			setTotalUsdValue(data.reduce<number>((acc, item,) => {
				return item.usdValue + acc
			}, 0,),)
		}
	}, [data, filterStore.tableEntityIds,],)

	const total = data.reduce<number>((acc, item,) => {
		return item.usdValue + acc
	}, 0,)

	const sortedList = sortOverviewList(data, filter,)

	const checkTbodyHeight = (): void => {
		if (tbodyRef.current && tableRef.current) {
			const tableHeight = tableRef.current.offsetHeight
			const tbodyScrollHeight = tbodyRef.current.scrollHeight
			setIsTbodyEmpty((tableHeight - tbodyScrollHeight - 43.99 - 43.99) > 0,)
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
		<div className={styles.bankTableWrapper} ref={tableRef}>
			<EntityTableHeader
				filter={filter}
				setFilter={setFilter}
				isTbodyEmpty={isTbodyEmpty}
			/>
			<div className={styles.bankTable} ref={tbodyRef}>
				{sortedList.map((item,) => {
					return (
						<EntityTableItem
							key={item.id}
							data={item}
							totalValue={total}
							handleRowClick={handleRowClick}
						/>
					)
				},)}
			</div>
			<div className={styles.entityTableFooter}>
				<p className={styles.entityTotalCell}>Total: {data.length}</p>
				<p className={styles.entityTableValueCell(isTbodyEmpty,)}>
					{totalUsdValue ?
						localeString(totalUsdValue, 'USD', 0, false,) :
						'$0'}
				</p>
			</div>
		</div>
	)
}
