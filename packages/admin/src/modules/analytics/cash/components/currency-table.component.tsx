import React from 'react'

import {
	CurrencyTableHeader,
} from './currency-table-header.component'
import {
	CurrencyTableItem,
} from './currency-table-item.component'

import {
	useCashStore,
} from '../cash.store'
import type {
	TAnalyticsTableData,
} from '../../../../shared/types'
import {
	SortOrder,
} from '../../../../shared/types'
import type {
	TCashCurrencyTableFilter,
} from '../cash.types'
import {
	TCashCurrencyTableSortVariants,
} from '../cash.types'
import {
	sortCurrencyList,
} from '../cash.utils'
import {
	localeString,
} from '../../../../shared/utils'

import * as styles from '../cash.styles'

type Props = {
	data: Array<TAnalyticsTableData>
	handleRowClick?: (data: TAnalyticsTableData) => void
}

export const CashCurrencyTable: React.FC<Props> = ({
	data,
	handleRowClick,
},) => {
	const {
		filter: filterStore,
	} = useCashStore()
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)
	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [totalUsdValue, setTotalUsdValue,] = React.useState<number | undefined>(0,)
	const [filter, setFilter,] = React.useState<TCashCurrencyTableFilter>({
		sortBy:    TCashCurrencyTableSortVariants.USD_VALUE,
		sortOrder: SortOrder.DESC,
	},)

	React.useEffect(() => {
		if (filterStore.currency?.length) {
			let total = 0
			filterStore.currency.forEach((currency,) => {
				const currentAsset = data.find((asset,) => {
					return asset.currency === currency
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
	}, [data, filterStore.currency,],)

	const total = data.reduce<number>((acc, item,) => {
		return item.usdValue + acc
	}, 0,)

	const sortedList = sortCurrencyList(data, filter,)

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

	React.useEffect(() => {
		const table = tbodyRef.current
		if (!table) {
			return undefined
		}
		const onWheel = (e: WheelEvent,): void => {
			if (e.shiftKey && e.deltaY !== 0) {
				e.preventDefault()
				table.scrollLeft = table.scrollLeft + e.deltaY
				return
			}
			if (e.deltaY !== 0) {
				e.preventDefault()
				table.scrollTop = table.scrollTop + (Math.sign(e.deltaY,) * 44)
			}
			if (e.deltaX !== 0) {
				table.scrollLeft = table.scrollLeft + e.deltaX
			}
		}
		table.addEventListener('wheel', onWheel, {
			passive: false,
		},)
		return () => {
			table.removeEventListener('wheel', onWheel,)
		}
	}, [],)
	return (
		<div className={styles.cashTableWrapper} ref={tableRef}>
			<CurrencyTableHeader
				filter={filter}
				setFilter={setFilter}
			/>
			<div className={styles.cashTable} ref={tbodyRef}>
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
			<div className={styles.cashTableFooter(isTbodyEmpty,)}>
				<p className={styles.totalCell}>Total: {data.length}</p>
				<p className={styles.valueCell}></p>
				<p className={styles.valueCell}>
					{totalUsdValue ?
						localeString(totalUsdValue, 'USD', 0, false,) :
						'$0'}
				</p>
				<p className={styles.valueCell}></p>
			</div>
		</div>
	)
}
