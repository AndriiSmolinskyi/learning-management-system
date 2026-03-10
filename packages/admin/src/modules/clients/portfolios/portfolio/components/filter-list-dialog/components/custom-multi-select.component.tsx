import * as React from 'react'

import type {
	ActionMeta,
	MultiValueProps,
} from 'react-select'
import Select, {
	components,
	type ControlProps,
} from 'react-select'
import type {
	SelectValueType,
} from '../../../../../../../shared/types'
import type {
	IOptionType,
} from '../../../../../../../shared/types'

import * as styles from './custom-multi-select.styles'

interface ICustomMultiSelectProps{
	icon: React.ReactNode;
	onChange: (
		selectedOption: SelectValueType,
		actionMeta: ActionMeta<IOptionType>
	) => void
	value?: SelectValueType
	list: Array<IOptionType> | undefined
	placeholder?: string
}
export const CustomMultiSelect: React.FC<ICustomMultiSelectProps> = ({
	icon,
	onChange,
	value = [],
	list = [],
	placeholder = 'Select..',
},) => {
	const CustomControl = ({
		children, ...props
	}: ControlProps<IOptionType, boolean>,): React.JSX.Element => {
		return (
			<div className={styles.inputWrapper}>
				<span className={styles.leftSvg(props.menuIsOpen,)}>{icon}</span>
				<components.Control {...props}>
					{children}
				</components.Control>
			</div>
		)
	}

	const CustomMultiValue = (props: MultiValueProps<IOptionType, boolean>,): React.JSX.Element => {
		const {
			data, removeProps,
		} = props
		return (
			<div className={styles.customMultiValueStyles(data.value,)}>
				<span {...removeProps} className={styles.multiValueText}>{data.label}</span>
			</div>
		)
	}

	return 	(
		<Select
			isMulti
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			options={list}
			classNamePrefix='react-select'
			className={styles.selectStyle}
			components={{
				Control:    CustomControl,
				MultiValue: CustomMultiValue,
			}}
		/>
	)
}