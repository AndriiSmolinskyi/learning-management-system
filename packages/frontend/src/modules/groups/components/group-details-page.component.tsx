// import React from 'react'
// import {
// 	useParams,
// } from 'react-router-dom'
// import {
// 	useMyGroup,
// } from '../../../shared/hooks/groups/groups.hook'
// import {
// 	Book,
// } from '../../../assets/icons'
// import * as styles from './list.styles'

// export const GroupDetailsPage: React.FC = () => {
// 	const {
// 		id,
// 	} = useParams()

// 	const {
// 		data,
// 		isFetching,
// 	} = useMyGroup(id,)

// 	if (isFetching) {
// 		return (
// 			<div>
// 				<p>Loading group...</p>
// 			</div>
// 		)
// 	}

// 	if (!data) {
// 		return (
// 			<div>
// 				<p>Group not found</p>
// 			</div>
// 		)
// 	}

// 	return (
// 		<div className={styles.wrapper}>

// 			<div className={styles.headerWrapper}>
// 				<div className={styles.titleIconBlock}>
// 					<Book width={32} height={32} />
// 					<p className={styles.headerTitle}>{data.courseName}</p>
// 				</div>
// 			</div>

// 			<div className={styles.main}>
// 				<div className={styles.side}>
// 					{data.lessons.map((lesson, index,) => {
// 						return (
// 							<div key={lesson.id} className={styles.lessonItemList}>
// 								<p >{index + 1}. {lesson.title}</p>
// 							</div>
// 						)
// 					},)}
// 				</div>
// 			</div>

// 		</div>
// 	)
// }

// export default GroupDetailsPage

import React from 'react'
import {
	useParams,
} from 'react-router-dom'

import {
	useMyGroup,
} from '../../../shared/hooks/groups/groups.hook'
import {
	Book,
} from '../../../assets/icons'
import {
	LessonDetailsContent,
} from '../../../modules/lessons/lessons/components/lesson-details-content.component'
import * as styles from './list.styles'

export const GroupDetailsPage: React.FC = () => {
	const {
		id,
	} = useParams()

	const {
		data,
		isFetching,
	} = useMyGroup(id,)

	const [selectedLessonId, setSelectedLessonId,] = React.useState<string | undefined>(undefined,)

	React.useEffect(() => {
		if (!data?.lessons.length) {
			return
		}

		setSelectedLessonId((prev,) => {
			if (prev && data.lessons.some((lesson,) => {
				return lesson.id === prev
			},)) {
				return prev
			}

			return data.lessons[0]?.id
		},)
	}, [data,],)

	const selectedLesson = React.useMemo(() => {
		return data?.lessons.find((lesson,) => {
			return lesson.id === selectedLessonId
		},)
	}, [data, selectedLessonId,],)

	if (isFetching) {
		return (
			<div>
				<p>Loading group...</p>
			</div>
		)
	}

	if (!data) {
		return (
			<div>
				<p>Group not found</p>
			</div>
		)
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.headerWrapper}>
				<div className={styles.titleIconBlock}>
					<Book width={32} height={32} />
					<p className={styles.headerTitle}>{data.courseName}</p>
				</div>
			</div>

			<div className={styles.main}>
				<div className={styles.side}>
					{data.lessons.map((lesson, index,) => {
						const isActive = selectedLessonId === lesson.id

						return (
							<div
								key={lesson.id}
								className={styles.lessonItemList(isActive,)}
								onClick={() => {
									setSelectedLessonId(lesson.id,)
								}}
							>
								<p>{index + 1}. {lesson.title}</p>
							</div>
						)
					},)}
				</div>

				{selectedLesson ?
					<LessonDetailsContent payload={selectedLesson.payload} /> :
					<p>No lesson selected</p>}
			</div>
		</div>
	)
}

export default GroupDetailsPage