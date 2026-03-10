import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import {
	ArrowUpRight,
} from '../../../../../../assets/icons'
import {
	RequestListHeader,
} from './request-list-header.component'
import {
	RequestItem,
} from './request-list-item.component'

import {
	SortOrder,
	type IRequest,
} from '../../../../../../shared/types'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import type {
	TRequestListFilter,
} from './request-list.types'
import {
	sortRequestList,
} from './request-list.utils'

import * as styles from './request-list.styles'

type Props = {
	requestList: Array<IRequest>
}

export const RequestList: React.FC<Props> = ({
	requestList,
},) => {
	const [filter, setFilter,] = React.useState<TRequestListFilter>({
		sortBy:    'updatedAt',
		sortOrder: SortOrder.DESC,
	},)

	const navigate = useNavigate()

	const sortedList = sortRequestList(requestList, filter,)

	return (
		<div className={styles.listWrapper}>
			<div className={styles.headerTitle}>
				<h3>Requests</h3>
			</div>
			<RequestListHeader
				filter={filter}
				setFilter={setFilter}
			/>
			<div>
				{sortedList.slice(0, 5,).map((item,) => {
					return (
						<RequestItem
							request={item}
							key={item.id}
						/>
					)
				},)}
			</div>
			<div className={styles.buttonWrapper}>
				<Button<ButtonType.TEXT>
					type='button'
					onClick={() => {
						navigate(RouterKeys.REQUESTS,)
					}}
					additionalProps={{
						btnType:   ButtonType.TEXT,
						text:      'View more',
						size:      Size.MEDIUM,
						color:     Color.SECONDRAY_COLOR,
						rightIcon: <ArrowUpRight width={20} height={20}/>,
					}}
				/>
			</div>
		</div>
	)
}
