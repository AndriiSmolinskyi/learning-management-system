import * as React from 'react'
import * as styles from './custom-checkbox.styles'
import {
	cx,
} from '@emotion/css'
import {
	CheckedIcon,
} from '../../../assets/icons'
import {
	MinusCheckIcon,
} from '../../../assets/icons'

type TInputProps = {
	checked: boolean;
	value?: boolean
  }

type TCustomCheckboxProps = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    input: TInputProps
    text?: string
    label: string
	disabled?: boolean
    isSelectAll?: boolean
};

export const CustomCheckbox: React.FC<TCustomCheckboxProps> = ({
	onChange, input, text, label, disabled,isSelectAll,
},) => {
	return (
		<div className={styles.checkboxWrapperStyles}>
			<label htmlFor={label} className={styles.labelStyles}>
				<input
					className={styles.checkboxStyles}
					type='checkbox'
					checked={input.checked}
					onChange={onChange}
					id={label}
					aria-label={label}
					disabled={disabled}
				/>
				<span className={cx(styles.customCheckboxStyles, {
					[styles.customCheckboxCheckedStyles]: input.checked,
					[styles.disabledInput]:               disabled,
				},)}>{input.checked && (isSelectAll ?
						<MinusCheckIcon/> :
						<CheckedIcon/>)}</span>
				{text ?
					<span className={styles.textStyles}>{text}</span> :
					null}
			</label>
		</div>
	)
}

