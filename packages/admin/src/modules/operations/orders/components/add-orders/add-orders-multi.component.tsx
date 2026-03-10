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
} from '../../../../../shared/types'
import type {
	IOptionType,
} from '../../../../../shared/types'
import {
	XmarkSecond,
} from '../../../../../assets/icons'
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
export const AddOrdersMultiSelect: React.FC<ICustomMultiSelectProps> = ({
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
				<span className='some__svg'>{icon}</span>
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
			<div className={styles.customMultiSelectItem}>
				<span>{data.label.slice(0, 8,)}</span>
				<span {...removeProps}>
					<XmarkSecond className={styles.customMultiSelectItemBtn} />
				</span>
			</div>
		)
	}

	return 	(
		<Select
			isMulti
			value={value}
			isClearable={false}
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