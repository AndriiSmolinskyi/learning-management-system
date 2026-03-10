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

import * as styles from '../equities.styles'

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
						color:    Color.NON_OUT_BLUE,
					}}
				/>
			</div>
			<p>{title}</p>
		</div>
	)
}