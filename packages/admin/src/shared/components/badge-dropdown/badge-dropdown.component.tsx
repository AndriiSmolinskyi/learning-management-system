import React from 'react'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import type {
	LabelColor,
} from '../label'
import {
	Label,
} from '../label'
import {
	CollapseArrowIcon,
} from '../../../assets/icons'

import {
	toggleState,
} from '../../utils'

import * as styles from './badge-dropdown.styles'

type Props<T extends string | number = string> = {
	value: T
	options: Array<T>
	onChange: (value: T) => void
	getLabelColor: (value: T) => LabelColor | undefined
	widthStyle?: string
}

export const BadgeDropdown = <T extends string | number = string>({
	value,
	options,
	onChange,
	getLabelColor,
	widthStyle,
}: Props<T>,): React.ReactNode => {
	const [isOpen, setIsOpen,] = React.useState<boolean>(false,)

	const content = (
		<div className={cx(styles.dropdownContainer, widthStyle,)}>
			{options.map((item,) => {
				return (
					<div
						key={item}
						onClick={() => {
							onChange(item,)
						}}
						className={styles.dropdownItem}
					>
						<Label
							className={Classes.POPOVER_DISMISS}
							label={item}
							color={getLabelColor(item,)}
						/>
					</div>
				)
			},)}
		</div>
	)

	return (
		<Popover
			usePortal={false}
			placement='bottom'
			content={content}
			popoverClassName={styles.popoverContainer}
			onClosing={() => {
				setIsOpen(false,)
			}}
		>
			<div
				className={cx(styles.badgeButton(isOpen,), widthStyle,)}
				onClick={() => {
					toggleState(setIsOpen,)()
				}}
			>
				<Label
					label={value}
					color={getLabelColor(value,)}
				/>
				<CollapseArrowIcon/>
			</div>
		</Popover>
	)
}