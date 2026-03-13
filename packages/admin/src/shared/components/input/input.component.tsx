/* eslint-disable complexity */
import * as React from 'react'
import {
	cx,
} from '@emotion/css'

import * as styles from './input.styles'

interface IInputProps {
	name?: string
	label: string
	input?: React.InputHTMLAttributes<HTMLInputElement>
	error?: string
	touched?: boolean
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	readOnly?: boolean
	isNumber?: boolean
	isDisabled?: boolean
	showError?: boolean
	isNegative?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, IInputProps>(({
	name,
	label,
	input,
	error,
	touched,
	leftIcon,
	rightIcon,
	readOnly,
	isNumber,
	isDisabled = false,
	showError = false,
	isNegative = false,
	...rest
}, ref,) => {
	const isError = Boolean(error,) && Boolean(touched,)

	const formatNumber = (value: string,): string => {
		if (!isNumber) {
			return value
		}
		const [integerPart = '', decimalPart,] = value.split('.',)
		const formattedInteger = integerPart.replace(
			/\B(?=(\d{3})+(?!\d))/g,
			',',
		)
		return decimalPart === undefined ?
			formattedInteger :
			`${formattedInteger}.${decimalPart}`
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		let formattedValue = e.target.value.replace(/,/g, '',)

		if (formattedValue === '-0') {
			formattedValue = ''
		}

		if (isNumber && formattedValue) {
			if (!isNegative && formattedValue.startsWith('-',)) {
				formattedValue = formattedValue.slice(1,)
			}

			if (formattedValue.startsWith('-',) && (/^-0+[^\.]/).test(formattedValue,)) {
				formattedValue = `-${formattedValue.slice(2,).replace(/^0+/, '',)}`
			}

			if ((/^0+[^\.]/).test(formattedValue,) && !formattedValue.startsWith('-',)) {
				formattedValue = formattedValue.replace(/^0+/, '',)
			}

			if (formattedValue === '0.') {
				formattedValue = '0.'
			}
		}

		if (isNumber) {
			const [integerPart, decimalPart,] = formattedValue.split('.',)
			if (decimalPart && decimalPart.length > 4) {
				formattedValue = `${integerPart}.${decimalPart.slice(0, 4,)}`
			}
		}

		if (input?.onChange) {
			input.onChange({
				...e,
				target: {
					...e.target,
					value: formattedValue,
				},
			},)
		}
	}

	return (
		<section className={styles.sectionStyle}>
			{label && (
				<label htmlFor={name}>
					{label}
				</label>
			)}

			<div
				className={cx(styles.inputWrapper, {
					[styles.errorStyle]: isError,
				},)}
			>
				{leftIcon && <span>{leftIcon}</span>}
				<input
					readOnly={readOnly}
					ref={ref}
					id={name}
					disabled={isDisabled}
					name={name}
					{...input}
					{...rest}
					{...(isNumber && {
						value:    input?.value ?
							formatNumber(String(input.value,),) :
							'',
						onChange: handleChange,
					})}

					className={styles.inputField}
				/>
				{rightIcon && <span>{rightIcon}</span>}
			</div>
			{showError && <p className={styles.errorText}>{error}</p>}
		</section>
	)
},)

export default Input
