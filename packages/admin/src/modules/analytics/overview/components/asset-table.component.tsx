import React from 'react'

import {
	AssetTableHeader,
} from './asset-table-header.component'
import {
	AssetTableItem,
} from './asset-table-item.component'

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
	TOverviewAssetAnalytics, TOverviewProps,
} from '../../../../services/analytics/analytics.types'
import {
	localeString,
} from '../../../../shared/utils'

import * as styles from '../overview.styles'

type Props = {
	data: Array<TOverviewAssetAnalytics>
	handleRowClick?: (data: TOverviewAssetAnalytics) => void
	assetCombinedFilter?: TOverviewProps
}

export const AssetTable: React.FC<Props> = ({
	data,
	handleRowClick,
	assetCombinedFilter,
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
		if (filterStore.tableAssetNames?.length) {
			let total = 0
			filterStore.tableAssetNames.forEach((assetName,) => {
				const currentAsset = data.find((asset,) => {
					return asset.assetName === assetName
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
		<div className={styles.smallTableWrapper} ref={tableRef}>
			<AssetTableHeader
				filter={filter}
				setFilter={setFilter}
				assetCombinedFilter={assetCombinedFilter}
				isTbodyEmpty={isTbodyEmpty}
			/>
			<div className={styles.bankTable} ref={tbodyRef}>
				{sortedList.map((item,) => {
					return (
						<AssetTableItem
							key={item.assetName}
							data={item}
							totalValue={total}
							handleRowClick={handleRowClick}
							assetCombinedFilter={assetCombinedFilter}
						/>
					)
				},)}
			</div>
			<div className={styles.assetTableFooter}>
				<p className={styles.assetTotalCell}>Total: {data.length}</p>
				<p className={styles.assetTableValueCell(isTbodyEmpty,)}>
					{totalUsdValue ?
						localeString(totalUsdValue, 'USD', 0, false,) :
						'$0'}
				</p>
			</div>
		</div>
	)
}
