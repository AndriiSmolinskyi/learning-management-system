// import * as React from 'react'

// import {
// 	RadioChecked, RadioEmpty,
// } from '../../../assets/icons'

// import * as styles from './radio.styles'

// interface IRadioProps {
// 	name?: string
// 	label?: string
// 	input?: React.InputHTMLAttributes<HTMLInputElement>
// 	error?: string
// 	touched?: boolean
// }

// export const Radio: React.FC<IRadioProps> = ({
// 	name,
// 	label,
// 	input,
// 	error,
// 	touched,
// 	...rest
// },) => {
// 	return (
// 		<label className={styles.labelStyle}>
// 			<input
// 				className='hidden-el'
// 				id={name}
// 				name={name}
// 				{...input}
// 				{...rest}
// 				type='radio'
// 			/>
// 			{input?.checked ?
// 				<RadioChecked className={styles.images} /> :
// 				<RadioEmpty className={styles.images} />}
// 			{label ?? ''}
// 		</label>
// 	)
// }
import * as React from 'react'
import {
	RadioChecked, RadioEmpty,
} from '../../../assets/icons'
import * as styles from './radio.styles'

interface IRadioProps {
  name?: string
  label?: string
  input?: React.InputHTMLAttributes<HTMLInputElement>
  error?: string
  touched?: boolean
}

export const Radio: React.FC<IRadioProps> = ({
	name,
	label,
	input,
	error,
	touched,
	...rest
},) => {
	const isChecked = Boolean(input?.checked,)

	return (
		<label className={styles.labelStyle}>
			<input
				className='hidden-el'
				id={name}
				name={name}
				{...input}
				{...rest}
				type='radio'
			/>
			<span className={styles.iconBox}>
				{isChecked ?
					(
						<RadioChecked className={styles.icon} />
					) :
					(
						<RadioEmpty className={styles.icon} />
					)}
			</span>
			<span className={styles.text}>{label ?? ''}</span>
		</label>
	)
}
