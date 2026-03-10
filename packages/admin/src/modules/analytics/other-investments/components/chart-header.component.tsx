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

import * as styles from '../other-investments.styles'

type Props = {
	title: string
	handleClear?: () => void
	isDisabled?: boolean
}

export const ChartHeader: React.FC<Props> = ({
	title,
	handleClear,
	isDisabled,
},) => {
	return (
		<div className={styles.chartHeader}>
			<div className={styles.resetButton}>
				<Button<ButtonType.ICON>
					onClick={handleClear}
					disabled={isDisabled}
					className={styles.clearBtn}
					additionalProps={{
						btnType:  ButtonType.ICON,
						icon:     <Rotate />,
						size:     Size.SMALL,
						color:    Color.SECONDRAY_COLOR,
					}}
				/>
			</div>
			<p>{title}</p>
		</div>
	)
}