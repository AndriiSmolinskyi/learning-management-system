import React from 'react'
import {
	Switch,
} from '@blueprintjs/core'
import * as styles from './togle-switch.style'

interface IToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<IToggleSwitchProps> = ({
	checked,
	onChange,
	label,
	disabled = false,
},) => {
	return (
		<div className={styles.switchWrapper}>
			<Switch
				checked={checked}
				onChange={(e: React.ChangeEvent<HTMLInputElement>,) => {
					onChange(e.target.checked,)
				}}
				label={label}
				disabled={disabled}
			/>
		</div>
	)
}
