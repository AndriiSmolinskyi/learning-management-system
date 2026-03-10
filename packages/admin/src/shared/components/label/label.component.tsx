import React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	LabelColor,
	LabelSize,
} from './label.types'

import * as styles from './label.styles'

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
	label?: string | number
	size?: LabelSize
	color?: LabelColor
	className?: string
}

export const Label: React.FC<Props> = ({
	color = LabelColor.GRAY,
	size = LabelSize.SMALL,
	className,
	label,
	...props
},) => {
	return (
		<div
			className={cx(styles.label(color, size,), className,)}
			{...props}
		>
			<p>
				{label}
			</p>
		</div>
	)
}

