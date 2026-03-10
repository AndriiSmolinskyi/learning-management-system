import React from 'react'

import {
	EmptyState, Plus,
} from '../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components'

import * as styles from '../reports.styles'

type Props = {
	toggleCreateVisible: () => void
}

export const EmptyTable: React.FC<Props> = ({
	toggleCreateVisible,
},) => {
	return (
		<div className={styles.emptyContainer}>
			<EmptyState width={164} height={164}/>
			<p className={styles.emptyText}>Nothing here yet. Add report to get started</p>
			<Button<ButtonType.TEXT>
				onClick={toggleCreateVisible}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Add report',
					leftIcon: <Plus width={20} height={20} />,
					size:     Size.SMALL,
					color:    Color.BLUE,
				}}
			/>
		</div>
	)
}
