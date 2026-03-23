/* eslint-disable complexity */
import React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
	AddAnotherButton,
	SelectComponent,
	Input,
} from '../../../shared/components'
import {
	Trash,
} from '../../../assets/icons'
import {
	useGroup,
	useChangeGroupLessons,
} from '../../../shared/hooks/groups/groups.hook'
import {
	useLessonsList,
} from '../../../shared/hooks/lessons/lessons.hook'
import type {
	GetLessonsQuery,
	GroupLessonItem,
	IOptionType,
	SelectOptionType,
	SelectValueType,
	LessonItem,
} from '../../../shared/types'
import {
	LessonsSortBy,
	SortOrder,
} from '../../../shared/types'
import {
	isDeepEqual,
} from '../../../shared/utils'

import * as styles from './edit-groups.style'

type Props = {
	onClose: () => void
	groupId: string | undefined
}

const LESSONS_FILTER: GetLessonsQuery = {
	search:    undefined,
	sortBy:    LessonsSortBy.TITLE,
	sortOrder: SortOrder.ASC,
	page:      1,
	pageSize:  100,
}

const mapLessonToOption = (
	lesson: LessonItem,
): IOptionType<SelectOptionType> => {
	return {
		label: lesson.title,
		value: {
			id:   lesson.id,
			name: lesson.title,
		},
	}
}

const normalizeIds = (ids: Array<string>,): Array<string> => {
	return [...ids,].sort((a, b,) => {
		return a.localeCompare(b,)
	},)
}

export const GroupsLessons: React.FC<Props> = ({
	onClose,
	groupId,
},) => {
	const [showSelect, setShowSelect,] = React.useState<boolean>(false,)
	const [lessonIds, setLessonIds,] = React.useState<Array<string>>([],)
	const [activeLessons, setActiveLessons,] = React.useState<string>('0',)

	const {
		data: group,
		isFetching: isGroupFetching,
	} = useGroup(groupId,)

	const {
		data: lessonsList,
		isFetching: isLessonsFetching,
	} = useLessonsList(LESSONS_FILTER,)

	const {
		mutateAsync: changeGroupLessons,
		isPending: isUpdatingLessons,
	} = useChangeGroupLessons()

	const initialIds = React.useMemo((): Array<string> => {
		return normalizeIds(
			group?.lessons.map((lesson,) => {
				return lesson.id
			},) ?? [],
		)
	}, [group,],)

	const initialActiveLessons = React.useMemo((): string => {
		return String(group?.activeLessons ?? 0,)
	}, [group,],)

	React.useEffect(() => {
		if (!group) {
			return
		}

		setLessonIds(initialIds,)
		setActiveLessons(initialActiveLessons,)
	}, [group, initialIds, initialActiveLessons,],)

	const lessonsMap = React.useMemo(() => {
		const map = new Map<string, LessonItem | GroupLessonItem>()

		lessonsList?.items.forEach((lesson,) => {
			map.set(lesson.id, lesson,)
		},)

		group?.lessons.forEach((lesson,) => {
			map.set(lesson.id, lesson,)
		},)

		return map
	}, [group, lessonsList,],)

	const currentLessons = React.useMemo((): Array<LessonItem | GroupLessonItem> => {
		return lessonIds
			.map((id,) => {
				return lessonsMap.get(id,)
			},)
			.filter((lesson,): lesson is LessonItem | GroupLessonItem => {
				return Boolean(lesson,)
			},)
	}, [lessonIds, lessonsMap,],)

	const availableOptions = React.useMemo((): Array<IOptionType<SelectOptionType>> => {
		return (lessonsList?.items ?? [])
			.filter((lesson,) => {
				return !lessonIds.includes(lesson.id,)
			},)
			.map((lesson,) => {
				return mapLessonToOption(lesson,)
			},)
	}, [lessonIds, lessonsList,],)

	const hasLessonsChanges = React.useMemo((): boolean => {
		return !isDeepEqual(
			normalizeIds(lessonIds,),
			initialIds,
		)
	}, [lessonIds, initialIds,],)

	const hasActiveLessonsChanges = React.useMemo((): boolean => {
		return activeLessons !== initialActiveLessons
	}, [activeLessons, initialActiveLessons,],)

	const hasChanges = hasLessonsChanges || hasActiveLessonsChanges

	const parsedActiveLessons = React.useMemo((): number => {
		const parsed = Number(activeLessons,)

		if (Number.isNaN(parsed,) || parsed < 0) {
			return 0
		}

		return parsed
	}, [activeLessons,],)

	const hasActiveLessonsError = parsedActiveLessons > currentLessons.length

	const handleRemoveLesson = (lessonId: string,): void => {
		setLessonIds((prev,) => {
			return prev.filter((id,) => {
				return id !== lessonId
			},)
		},)

		setActiveLessons((prev,) => {
			const nextLength = lessonIds.filter((id,) => {
				return id !== lessonId
			},).length

			const prevNumber = Number(prev,)

			if (Number.isNaN(prevNumber,) || prevNumber < 0) {
				return '0'
			}

			return String(Math.min(prevNumber, nextLength,),)
		},)
	}

	const isSingleSelectOption = (
		selectedOption: SelectValueType<SelectOptionType>,
	): selectedOption is IOptionType<SelectOptionType> => {
		return Boolean(selectedOption,) && !Array.isArray(selectedOption,)
	}

	const handleAddLesson = (
		selectedOption: SelectValueType<SelectOptionType>,
	): void => {
		if (!isSingleSelectOption(selectedOption,)) {
			return
		}

		const nextId = selectedOption.value.id

		setLessonIds((prev,) => {
			if (prev.includes(nextId,)) {
				return prev
			}

			return [
				...prev,
				nextId,
			]
		},)

		setShowSelect(false,)
	}

	const handleSave = async(): Promise<void> => {
		if (!groupId || hasActiveLessonsError) {
			return
		}

		await changeGroupLessons({
			id:   groupId,
			body: {
				lessonIds,
				activeLessons: parsedActiveLessons,
			},
		},)

		onClose()
	}

	return (
		<div className={styles.formContainer}>
			<h3 className={styles.formHeader}>Group lessons</h3>

			<div className={styles.editFormWrapper}>
				<div className={styles.fieldsContainerPadding(false,)}>
					{isGroupFetching && (
						<p>Loading group lessons...</p>
					)}

					<div className={styles.activeBlock}>
						<p className={styles.fieldTitle}>Active lessons</p>
						<Input
							label=''
							input={{
								value:       activeLessons,
								placeholder: 'Enter active lessons count',
								onChange:    (e,) => {
									const {
										value,
									} = e.target

									if (value === '') {
										setActiveLessons('',)
										return
									}

									if ((/^\d+$/).test(value,)) {
										setActiveLessons(value,)
									}
								},
							}}
						/>
						{hasActiveLessonsError && (
							<p>Active lessons cannot be greater than total lessons count.</p>
						)}
					</div>

					{!isGroupFetching && currentLessons.length === 0 && (
						<p>No lessons added yet.</p>
					)}

					{!isGroupFetching && currentLessons.length > 0 && (
						<div className={styles.itemsBlock}>
							{currentLessons.map((lesson, index,) => {
								return (
									<div key={lesson.id} className={styles.viewBlock}>
										<div>
											<p className={styles.fieldTitle}>
												{index + 1}. {lesson.title}
											</p>
										</div>
										<Button<ButtonType.ICON>
											onClick={() => {
												handleRemoveLesson(lesson.id,)
											}}
											additionalProps={{
												btnType: ButtonType.ICON,
												icon:    <Trash width={20} height={20} />,
												size:    Size.SMALL,
												color:   Color.NON_OUT_RED,
											}}
										/>
									</div>
								)
							},)}
						</div>
					)}

					{showSelect && (
						<div className={styles.selectBlock}>
							<SelectComponent<SelectOptionType>
								options={availableOptions}
								value={undefined}
								placeholder='Select lesson'
								onChange={(selectedOption,) => {
									handleAddLesson(selectedOption,)
								}}
								isSearchable
								isClearable
								isLoading={isLessonsFetching}
							/>
						</div>
					)}

					<div className={styles.addAnother}>
						<AddAnotherButton
							disabled={Boolean(
								showSelect || isLessonsFetching || availableOptions.length === 0,
							)}
							handleAddAnother={() => {
								setShowSelect(true,)
							}}
						/>
					</div>
				</div>

				<div className={styles.editBtnWrapper}>
					<Button<ButtonType.TEXT>
						onClick={onClose}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Cancel',
							size:    Size.MEDIUM,
							color:   Color.SECONDRAY_GRAY,
						}}
					/>

					<Button<ButtonType.TEXT>
						onClick={handleSave}
						disabled={Boolean(
							!hasChanges || isUpdatingLessons || !groupId || hasActiveLessonsError,
						)}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    isUpdatingLessons ?
								'Saving...' :
								'Save lessons',
							size:    Size.MEDIUM,
						}}
					/>
				</div>
			</div>
		</div>
	)
}