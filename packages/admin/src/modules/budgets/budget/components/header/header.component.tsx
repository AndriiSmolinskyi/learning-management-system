
import * as React from 'react'

import {
	BudgetCoinsIcon,
	Plus,
} from '../../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../shared/components'
import {
	BudgetFilter,
} from '../filter/filter.component'

import * as styles from './header.styles'

interface IBudgetHeaderProps {
	toggleCreateVisible: () => void
}

export const BudgetHeader: React.FC<IBudgetHeaderProps> = ({
	toggleCreateVisible,
},) => {
	return (
		<div className={styles.headerWrapper}>
			<div className={styles.titleIconBlock}>
				<BudgetCoinsIcon width={32} height={32}/>
				<p className={styles.headerTitle}>Budget management</p>
			</div>
			<div className={styles.buttonsBlock}>
				<BudgetFilter/>
				<Button<ButtonType.TEXT>
					className={styles.addButton}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Create Budget Plan',
						leftIcon: <Plus/>,
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
					onClick={toggleCreateVisible}
				/>
			</div>
		</div>
	)
}