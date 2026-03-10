import React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	Rotate,
} from '../../../../assets/icons'

import * as styles from '../deposit.styles'

type Props = {
	title: string
	isDisabled?: boolean
	showResetBtn?: boolean
	handleClear?: () => void
}

export const SectionHeader: React.FC<Props> = ({
	title,
	showResetBtn = true,
	isDisabled,
	handleClear,
},) => {
	return (
		<div className={styles.sectionHeader}>
			<div className={styles.containerButtons}>
				{showResetBtn && (
					<Button<ButtonType.ICON>
						onClick={handleClear}
						disabled={isDisabled}
						className={styles.clearBtn}
						additionalProps={{
							btnType:  ButtonType.ICON,
							icon:     <Rotate width={20} height={20} />,
							size:     Size.SMALL,
							color:    Color.NON_OUT_BLUE,
						}}
					/>
				)}
			</div>
			<p>{title}</p>
		</div>
	)
}