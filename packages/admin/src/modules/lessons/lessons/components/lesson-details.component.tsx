import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	PenSquare,
} from '../../../../assets/icons'
import {
	useLesson,
} from '../../../../shared/hooks/lessons/lessons.hook'
import {
	RouterKeys,
} from '../../../../router/keys'
import {
	LessonDetailsContent,
} from './lesson-details-content.component'

import * as styles from '../lessons.styles'

type Props = {
	onClose: VoidFunction
	lessonId: string | undefined
}

export const LessonDetails: React.FC<Props> = ({
	onClose,
	lessonId,
},) => {
	const navigate = useNavigate()

	const {
		data: lesson,
	} = useLesson(lessonId,)

	if (!lesson) {
		return null
	}

	return (
		<div className={styles.detailsContainer}>
			<h3 className={styles.detailsHeader}>Lesson details</h3>

			<LessonDetailsContent payload={lesson.payload} />

			<div className={styles.addBtnWrapper(true,)}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						onClose()
						navigate(`${RouterKeys.LESSONS}/${RouterKeys.CUSTOM_LESSONS}`, {
							state: {
								lessonId:      lesson.id,
								customPayload: null,
							},
						},)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit',
						leftIcon: <PenSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_COLOR,
					}}
				/>
			</div>

		</div>
	)
}