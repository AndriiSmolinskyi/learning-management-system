import React from 'react'

import {
	SearchEmptyState,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	useLessonStore,
} from '../lessons.store'
import * as styles from '../lessons.styles'

export const EmptyFilter: React.FC = () => {
	const {
		resetLessonStore,
	} = useLessonStore()

	return (
		<div className={styles.emptyContainer}>
			<SearchEmptyState width={164} height={164} />
			<p className={styles.emptyText}>No results found. Try a different search</p>

			<Button<ButtonType.TEXT>
				onClick={() => {
					resetLessonStore()
				}}
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