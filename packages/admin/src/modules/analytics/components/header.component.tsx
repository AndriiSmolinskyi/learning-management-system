import React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../shared/components'
import {
	Rotate,
} from '../../../assets/icons'

import * as styles from '../overview/overview.styles'

type Props = {
	title: string
	handleClear?: () => void
	isDisabled?: boolean
	children?: React.ReactNode
}

export const Header: React.FC<Props> = ({
	title,
	handleClear,
	isDisabled,
	children,
},) => {
	return (
		<div className={styles.tableHeader}>
			{handleClear && (
				<div className={styles.containerButtons}>
					<Button<ButtonType.ICON>
						onClick={handleClear}
						disabled={isDisabled}
						className={styles.clearBtn}
						additionalProps={{
							btnType:  ButtonType.ICON,
							icon:     <Rotate width={20} height={20} />,
							size:     Size.SMALL,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>
					{children}
				</div>
			)}
			<p>{title}</p>
		</div>
	)
}