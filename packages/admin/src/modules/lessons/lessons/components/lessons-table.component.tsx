import React from 'react'

import {
	EmptyTable,
} from './empty-table.component'
import {
	EmptyFilter,
} from './empty-filter.component'
import {
	Loader,
} from '../../../../shared/components'
import {
	TableHeader,
} from './table-header.component'
import {
	LessonItem,
} from './lesson-item.component'
import {
	useLessonsList,
} from '../../../../shared/hooks/lessons/lessons.hook'
import {
	useLessonStore,
} from '../lessons.store'
import {
	useDebounce,
} from '../../../../shared/hooks/use-debounce.hook'

import * as styles from '../lessons.styles'

type Props = {
	toggleCreateVisible: VoidFunction
	toggleDetailsVisible: (id: string) => void
}

export const LessonsTable: React.FC<Props> = ({
	toggleCreateVisible,
	toggleDetailsVisible,
},) => {
	const {
		filter,
	} = useLessonStore()

	const finalFilter = useDebounce(filter, 700,)

	const {
		data: lessonList,
		isFetching,
	} = useLessonsList(finalFilter,)

	const noLessons = lessonList?.total === 0
	const noFilteredResult = !lessonList?.items.length

	return (
		<div className={styles.tableContainer}>
			<TableHeader />

			<div className={styles.requestListContainer(false,)}>
				{isFetching && (
					<Loader />
				)}

				{!isFetching && noLessons && (
					<EmptyTable
						toggleCreateVisible={toggleCreateVisible}
					/>
				)}

				{!isFetching && !noLessons && noFilteredResult && (
					<EmptyFilter />
				)}

				{!isFetching && !noLessons && !noFilteredResult && (
					<>
						{lessonList.items.map((lesson,) => {
							return (
								<LessonItem
									key={lesson.id}
									lesson={lesson}
									toggleDetailsVisible={toggleDetailsVisible}
								/>
							)
						},)}
					</>
				)}
			</div>
		</div>
	)
}