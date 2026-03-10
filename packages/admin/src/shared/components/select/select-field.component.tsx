import React from 'react'
import {
	Field,
} from 'react-final-form'
import type {
	ActionMeta,
} from 'react-select'

import {
	SelectComponent,
} from './select.component'
import type {
	CreatebleSelectEnum,
} from '../../constants/createble-select.constants'
import type {
	IOptionType, SelectValueType,
} from '../../types'

import * as styles from './select.style'

interface ISelectFieldProps <T = string> {
	name: string
	options: Array<IOptionType<T>>
	isMulti?: boolean
	placeholder?: string
	validate?: (value: SelectValueType<T>) => string | undefined
	initialValue?: SelectValueType<T>
	error?: string
	leftIcon?: React.ReactNode
	onChange?: (
		selectedOption: SelectValueType<T>,
		actionMeta: ActionMeta<IOptionType<T>>
	) => void
	value?: SelectValueType<T>
	isCreateble?: boolean
	isSearchable?: boolean
	isDisabled?: boolean
	createbleStatus?: CreatebleSelectEnum
	isBadges?: boolean
	isClearable?: boolean
	tabIndex?: number
	createFn?: (isin: string) => Promise<void>
	isLoading?: boolean
}

export function SelectField<T = string>({
	name,
	options,
	isMulti = false,
	placeholder,
	validate,
	leftIcon,
	initialValue = undefined,
	onChange,
	value,
	isCreateble = false,
	createbleStatus,
	isSearchable = false,
	isDisabled = false,
	isBadges = false,
	isClearable = false,
	createFn,
	isLoading,
	tabIndex,
}: ISelectFieldProps<T>,): React.ReactNode {
	return (
		<Field<SelectValueType<T>>
			name={name}
			validate={validate}
			initialValue={initialValue}
		>
			{({
				input, meta,
			},) => {
				const handleChange = (
					selectedOption: SelectValueType<T>,
					actionMeta: ActionMeta<IOptionType<T>>,
				): void => {
					if (onChange) {
						onChange(selectedOption, actionMeta,)
					}
					input.onChange(selectedOption,)
				}
				return (
					<div className={styles.wrapper}>
						<SelectComponent
							options={options}
							value={value ?? input.value}
							isMulti={isMulti}
							leftIcon={leftIcon}
							placeholder={placeholder}
							onChange={handleChange}
							isCreateble={isCreateble}
							isSearchable={isSearchable}
							createbleStatus={createbleStatus}
							isDisabled={isDisabled}
							isBadges={isBadges}
							createFn={createFn}
							isClearable={isClearable}
							isLoading={isLoading}
							tabIndex={tabIndex}
						/>
						{meta.touched && meta.error && <span>{meta.error}</span>}
					</div>
				)
			}}
		</Field>
	)
}
