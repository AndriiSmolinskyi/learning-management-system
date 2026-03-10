import React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	FormField,
	NextButton,
} from '../../../../../../shared/components'
import {
	SaveDraftButton,
} from './save-draft-button.component'

import {
	useAddClientStore,
} from '../../store'

import * as styles from './add-client.styles'

type Props = {
	hasErrors: boolean
	onClose: () => void
}

export const FirstStep:React.FC<Props> = ({
	hasErrors,
	onClose,
},) => {
	const {
		values,
		setValues,
		step,
		setStep,
	} = useAddClientStore()

	return (
		<div className={cx((step !== 1) && 'hidden-el',)}>
			<div className={styles.inputBlock}>
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
			<div className={styles.btnsContainer}>
				<SaveDraftButton onClose={onClose} />
				<NextButton
					disabled={hasErrors}
					handleNext={() => {
						setStep(2,)
					}}
				/>
			</div>
		</div>
	)
}