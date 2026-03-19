import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	Classes,
} from '@blueprintjs/core'

import {
	Button,
	ButtonType,
	Color,
	Input,
	Size,
} from '../../../../shared/components'
import {
	ReportTitleIcon,
} from '../../../../assets/icons'
import {
	RouterKeys,
} from '../../../../router/keys'

import * as styles from '../lessons.styles'

type TAddLessonFormValues = {
	title: string
	comment: string
}

const resetValuesData: TAddLessonFormValues = {
	title:   '',
	comment: '',
}

type Props = {
	onClose: VoidFunction
	toggleSuccessDialogVisible: (lessonId: string) => void
}

export const AddLessonDialog: React.FC<Props> = ({
	onClose,
},) => {
	const [lessonForm, setLessonForm,] = React.useState<TAddLessonFormValues>(resetValuesData,)

	const navigate = useNavigate()

	const hasValidationErrors = Boolean(
		!lessonForm.title.trim(),
	)

	return (
		<div className={styles.modalWrapper}>
			<div className={styles.modalContent}>
				<ReportTitleIcon width={42} height={42} />
				<h4 className={styles.modalTitle}>Add new lesson</h4>

				<div className={styles.selectWrapper}>
					<Input
						label=''
						input={{
							value:       lessonForm.title,
							placeholder: 'Enter lesson title',
							onChange:    (e,) => {
								setLessonForm((prev,) => {
									return {
										...prev,
										title: e.target.value,
									}
								},)
							},
						}}
					/>

					<Input
						label=''
						input={{
							value:       lessonForm.comment,
							placeholder: 'Enter lesson comment',
							onChange:    (e,) => {
								setLessonForm((prev,) => {
									return {
										...prev,
										comment: e.target.value,
									}
								},)
							},
						}}
					/>
				</div>
			</div>

			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						onClose()
						setLessonForm(resetValuesData,)
					}}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Cancel',
						size:    Size.MEDIUM,
						color:   Color.MICRO,
					}}
				/>

				<Button<ButtonType.TEXT>
					onClick={() => {
						onClose()

						navigate(`${RouterKeys.LESSONS}/${RouterKeys.CUSTOM_LESSONS}`, {
							state: {
								customPayload: {
									title:   lessonForm.title.trim(),
									comment: lessonForm.comment.trim() || undefined,
								},
								lessonId: null,
							},
						},)
					}}
					className={Classes.POPOVER_DISMISS}
					disabled={hasValidationErrors}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Continue',
						size:    Size.MEDIUM,
						color:   Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}