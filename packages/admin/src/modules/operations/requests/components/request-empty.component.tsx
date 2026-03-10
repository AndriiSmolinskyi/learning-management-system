import React from 'react'

import {
	EmptyState, Plus,
} from '../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components'

import * as styles from '../requests.styles'

type Props = {
	toggleCreateVisible: () => void
}

export const RequestEmpty: React.FC<Props> = ({
	toggleCreateVisible,
},) => {
	return (
		<div className={styles.emptyContainer}>
			<EmptyState width={164} height={164}/>
			<p className={styles.emptyText}>Nothing here yet. Add request to get started</p>
			<Button<ButtonType.TEXT>
				disabled={false}
				onClick={toggleCreateVisible}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Add request',
					leftIcon: <Plus width={20} height={20} />,
					size:     Size.SMALL,
					color:    Color.BLUE,
				}}
			/>
		</div>
	)
}
