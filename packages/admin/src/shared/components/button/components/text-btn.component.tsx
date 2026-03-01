import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Size,
	Color,
} from '../button.types'
import type {
	ButtonProps,
	ButtonType,
} from '../button.types'
import {
	baseStyle,
	textBtnStyle,
	colorStyles,
} from '../button.styles'

export const TextBtn: React.FC<ButtonProps<ButtonType.TEXT>> = ({
	loading,
	disabled,
	additionalProps,
	className,
	...buttonProps
},) => {
	const {
		size = Size.MEDIUM,
		color = Color.MAIN_COLOR,
		text,
		leftIcon,
		rightIcon,
	} = additionalProps

	const styles = cx(baseStyle(size,), textBtnStyle(size,), colorStyles[color],)

	return (
		<button
			type='button'
			className={cx(styles, className,)}
			disabled={disabled ?? loading}
			{...buttonProps}
		>
			{loading ?
				(
					'Loading...'
				) :
				(
					<>
						{leftIcon && <span className='left-icon'>{leftIcon}</span>}
						{text && <span className='text'>{text}</span>}
						{rightIcon && <span className='right-icon'>{rightIcon}</span>}
					</>
				)}
		</button>
	)
}
