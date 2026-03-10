import * as React from 'react'

import {
	inputStyles,
	labelStyles,
	wrapper,
} from './text-area.styles'
import {
	cx,
} from '@emotion/css'

interface ITextAreaProps {
	name?: string
	label: string
	input?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
	error?: string
	touched?: boolean
	className?: string
	tabIndex?: number
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, ITextAreaProps>(({
	name,
	label,
	error,
	touched,
	input,
	tabIndex,
	...rest
}, ref,) => {
	return (
		<section className={wrapper}>
			<label className={labelStyles} htmlFor={name}>
				{label}
			</label>
			<textarea
				ref={ref}
				id={name}
				name={name}
				{...input}
				{...rest}
				className={cx(inputStyles, rest.className,)}
				tabIndex={tabIndex}
			/>
		</section>
	)
},)