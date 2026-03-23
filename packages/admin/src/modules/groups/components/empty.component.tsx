import * as React from 'react'

import {
	EmptyState,
	Plus,
} from '../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../shared/components'
import * as styles from './table.style'

type Props = {
	toggleCreateVisible: () => void
}

export const GroupEmpty: React.FC<Props> = ({
	toggleCreateVisible,
},) => {
	return (
		<div className={styles.emptyContainer}>
			<EmptyState width={164} height={164} />
			<p className={styles.emptyText}>Nothing here yet. Add group to get started</p>
			<Button<ButtonType.TEXT>
				onClick={toggleCreateVisible}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Add group',
					leftIcon: <Plus />,
					size:     Size.SMALL,
					color:    Color.BLUE,
				}}
			/>
		</div>
	)
}