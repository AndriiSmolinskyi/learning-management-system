import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	baseStyle,
	iconBtnStyle,
	colorStyles,
} from '../button.styles'
import {
	Size,
} from '../button.types'
import type {
	ButtonProps,
	ButtonType,
} from '../button.types'

export const IconBtn: React.FC<ButtonProps<ButtonType.ICON>> = ({
	loading,
	disabled,
	additionalProps,
	className,
	...buttonProps
},) => {
	const {
		size = Size.MEDIUM, color, icon,
	} = additionalProps

	const styles = cx(baseStyle(size,), iconBtnStyle(size,), color && colorStyles[color],)

	return (
		<button
			type='button'
			className={cx(styles, className,)}
			disabled={disabled ?? loading}
			{...buttonProps}
		>
			{loading ?
				<span>Loading...</span> :
				icon}
		</button>
	)
}
