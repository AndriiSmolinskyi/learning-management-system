import React from 'react'
import type {
	ButtonProps,
} from './'
import {
	IconBtn,
	TextBtn,
	ButtonType,
} from './'

export const Button = <T extends ButtonType>({
	additionalProps,
	loading = false,
	disabled = false,
	...buttonProps
}: ButtonProps<T>,): React.ReactElement => {
	const {
		btnType,
	} = additionalProps

	switch (btnType) {
	case ButtonType.TEXT:
		return (
			<TextBtn
				loading={loading}
				disabled={disabled}
				additionalProps={additionalProps}
				{...buttonProps}
			/>
		)

	case ButtonType.ICON:
		return (
			<IconBtn
				loading={loading}
				disabled={disabled}
				additionalProps={additionalProps}
				{...buttonProps}
			/>
		)

	default:
		throw new Error('Unsupported button type',)
	}
}

export default Button
