/* eslint-disable complexity */
import React from 'react'

import {
	Button,
	ButtonType,
	Color,
	Size,
	AddAnotherButton,
	SelectComponent,
} from '../../../shared/components'
import {
	Trash,
} from '../../../assets/icons'
import {
	useGroup,
	useChangeGroupStudents,
} from '../../../shared/hooks/groups/groups.hook'
import {
	useStudentsList,
} from '../../../shared/hooks/students/students.hooks'
import type {
	GetStudentsQuery,
	GroupStudentProfileItem,
	IOptionType,
	SelectOptionType,
	SelectValueType,
	StudentItem,
} from '../../../shared/types'
import {
	StudentsSortBy,
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

const STUDENTS_FILTER: GetStudentsQuery = {
	search:    undefined,
	sortBy:    StudentsSortBy.FIRST_NAME,
	sortOrder: SortOrder.ASC,
	page:      1,
	pageSize:  100,
}

const mapStudentToOption = (
	student: StudentItem,
): IOptionType<SelectOptionType> => {
	return {
		label: `${student.firstName} ${student.lastName}`,
		value: {
			id:   student.id,
			name: `${student.firstName} ${student.lastName}`,
		},
	}
}

const normalizeIds = (ids: Array<string>,): Array<string> => {
	return [...ids,].sort((a, b,) => {
		return a.localeCompare(b,)
	},)
}

export const GroupsStudents: React.FC<Props> = ({
	onClose,
	groupId,
},) => {
	const [showSelect, setShowSelect,] = React.useState<boolean>(false,)
	const [studentIds, setStudentIds,] = React.useState<Array<string>>([],)

	const {
		data: group,
		isFetching: isGroupFetching,
	} = useGroup(groupId,)

	const {
		data: studentsList,
		isFetching: isStudentsFetching,
	} = useStudentsList(STUDENTS_FILTER,)

	const {
		mutateAsync: changeGroupStudents,
		isPending: isUpdatingStudents,
	} = useChangeGroupStudents()

	const initialIds = React.useMemo((): Array<string> => {
		return normalizeIds(
			group?.studentProfiles.map((student,) => {
				return student.userId
			},) ?? [],
		)
	}, [group,],)

	React.useEffect(() => {
		if (!group) {
			return
		}

		setStudentIds(initialIds,)
	}, [group, initialIds,],)

	const studentsMap = React.useMemo(() => {
		const map = new Map<string, StudentItem | GroupStudentProfileItem>()

		studentsList?.items.forEach((student,) => {
			map.set(student.id, student,)
		},)

		group?.studentProfiles.forEach((student,) => {
			map.set(student.userId, student,)
		},)

		return map
	}, [group, studentsList,],)

	const currentStudents = React.useMemo((): Array<StudentItem | GroupStudentProfileItem> => {
		return studentIds
			.map((id,) => {
				return studentsMap.get(id,)
			},)
			.filter((student,): student is StudentItem | GroupStudentProfileItem => {
				return Boolean(student,)
			},)
	}, [studentIds, studentsMap,],)

	const availableOptions = React.useMemo((): Array<IOptionType<SelectOptionType>> => {
		return (studentsList?.items ?? [])
			.filter((student,) => {
				return !studentIds.includes(student.id,)
			},)
			.map((student,) => {
				return mapStudentToOption(student,)
			},)
	}, [studentIds, studentsList,],)

	const hasChanges = React.useMemo((): boolean => {
		return !isDeepEqual(
			normalizeIds(studentIds,),
			initialIds,
		)
	}, [studentIds, initialIds,],)

	const handleRemoveStudent = (studentId: string,): void => {
		setStudentIds((prev,) => {
			return prev.filter((id,) => {
				return id !== studentId
			},)
		},)
	}

	const isSingleSelectOption = (
		selectedOption: SelectValueType<SelectOptionType>,
	): selectedOption is IOptionType<SelectOptionType> => {
		return Boolean(selectedOption,) && !Array.isArray(selectedOption,)
	}

	const handleAddStudent = (
		selectedOption: SelectValueType<SelectOptionType>,
	): void => {
		if (!isSingleSelectOption(selectedOption,)) {
			return
		}

		const nextId = selectedOption.value.id

		setStudentIds((prev,) => {
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
		if (!groupId) {
			return
		}

		await changeGroupStudents({
			id:   groupId,
			body: {
				studentIds,
			},
		},)

		onClose()
	}

	return (
		<div className={styles.formContainer}>
			<h3 className={styles.formHeader}>Group students</h3>

			<div className={styles.editFormWrapper}>

				<div className={styles.fieldsContainerPadding(false,)}>
					{isGroupFetching && (
						<p>Loading group students...</p>
					)}

					{!isGroupFetching && currentStudents.length === 0 && (
						<p>No students added yet.</p>
					)}

					{!isGroupFetching && currentStudents.length > 0 && (
						<div className={styles.itemsBlock}>
							{currentStudents.map((student,) => {
								const studentId = 'userId' in student ?
									student.userId :
									student.id

								return (
									<div key={studentId} className={styles.viewBlock}>
										<div>
											<p className={styles.fieldTitle}>{student.firstName} {student.lastName}</p>
										</div>
										<Button<ButtonType.ICON>
											onClick={() => {
												handleRemoveStudent(studentId,)
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
								placeholder='Select student'
								onChange={(selectedOption,) => {
									handleAddStudent(selectedOption,)
								}}
								isSearchable
								isClearable
								isLoading={isStudentsFetching}
							/>
						</div>
					)}

					<div className={styles.addAnother}>
						<AddAnotherButton
							disabled={Boolean(
								showSelect || isStudentsFetching || availableOptions.length === 0,
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
							!hasChanges || isUpdatingStudents || !groupId,
						)}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    isUpdatingStudents ?
								'Saving...' :
								'Save students',
							size:    Size.MEDIUM,
						}}
					/>
				</div>
			</div>
		</div>
	)
}