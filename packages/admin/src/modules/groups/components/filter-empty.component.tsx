import React from 'react'

import {
	SearchEmptyState,
} from '../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../shared/components'
import {
	useGroupsStore,
} from '../groups.store'
import * as styles from './table.style'

export const FilterEmpty: React.FC = () => {
	const {
		resetGroupsStore,
	} = useGroupsStore()

	const handleClearStore = (): void => {
		resetGroupsStore()
	}

	return (
		<div className={styles.emptyContainer}>
			<SearchEmptyState width={164} height={164} />
			<p className={styles.emptyText}>No results found. Try a different search or filter</p>
			<Button<ButtonType.TEXT>
				onClick={handleClearStore}
				additionalProps={{
					btnType: ButtonType.TEXT,
					text:    'Clear',
					size:    Size.SMALL,
					color:   Color.SECONDRAY_GRAY,
				}}
			/>
		</div>
	)
}