import React from 'react'
import {
	FormField,
} from '../../../../../../shared/components'
import {
	useEditClientStore,
} from '../../store/edit-client.store'
import {
	ChevronDown,
	ChevronUpBlue,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../../../../shared/components'
import * as styles from './edit-client.style'

type Props = {
	hasErrors: boolean
}

export const FirstStepEdit:React.FC<Props> = () => {
	const {
		values,
		setValues,
	} = useEditClientStore()

	const [isOpen, setIsOpen,] = React.useState(false,)

	const handleToggle = (): void => {
		setIsOpen((prevState,) => {
			return !prevState
		},)
	}

	return (
		<div className={styles.editFormItem({
			isActive: isOpen,
		},)}>
			<div className={styles.editFormItemHeader}>
				<div>
					<h5 className={styles.editFormItemTitle}>Personal details</h5>
					<p className={styles.editFormItemText}>{values.firstName} {values.lastName}</p>
				</div>
				<Button<ButtonType.ICON>
					onClick={handleToggle}
					additionalProps={{
						btnType:   ButtonType.ICON,
						size:      Size.SMALL,
						icon:      isOpen ?
							<ChevronUpBlue width={20} height={20} /> :
							<ChevronDown width={20} height={20} />,
						color:     Color.NONE,
					}}
				/>
			</div>
			{isOpen && (
				<div className={styles.editFormItemInputs}>
					<FormField
						name='firstName'
						placeholder='First name'
						value={values.firstName}
						onChange={(e,) => {
							setValues({
								firstName: e.target.value,
							},)
						}}
					/>
					<FormField
						name='lastName'
						placeholder='Last name'
						value={values.lastName}
						onChange={(e,) => {
							setValues({
								lastName: e.target.value,
							},)
						}}
					/>
				</div>
			)}
		</div>
	)
}