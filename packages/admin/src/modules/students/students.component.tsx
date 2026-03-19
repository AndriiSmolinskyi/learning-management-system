import React from 'react'
import {
	Header,
} from './components/header.component'
import {
	Drawer,
	Dialog,
} from '../../shared/components'
import {
	toggleState,
} from '../../shared/utils'
import {
	AddStudents,
} from './components/add-students.component'
import {
	SuccessCreateDialog,
} from './components/success-create-dialog.component'
import {
	useDebounce,
} from '../../shared/hooks/use-debounce.hook'
import {
	useStudentsStore,
} from './students.store'
import {
	useStudentsList,
} from '../../shared/hooks/students/students.hooks'
import {
	DeleteModal,
} from './components/delete-modal.component'
import {
	Table,
} from './components/table.component'
import {
	EditStudent,
} from './components/edit-student.component'
import {
	StudentDetails,
} from './components/students-details.component'
import * as styles from './students.styles'

export const Students: React.FC = () => {
	const [isCreateOpen, setIsCreateOpen,] = React.useState<boolean>(false,)
	const [isExitDialogOpen, setIsExitDialogOpen,] = React.useState<boolean>(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState<boolean>(false,)
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteStudentId, setDeleteStudentId,] = React.useState<string | undefined>(undefined,)
	const [isUpdateOpen, setIsUpdateOpen,] = React.useState<boolean>(false,)
	const [studentId, setStudentId,] = React.useState<string | undefined>(undefined,)
	const [isDetailsOpen, setIsDetailsOpen,] = React.useState<boolean>(false,)
	const [detailsStudentId, setDetailsStudentId,] = React.useState<string | undefined>(undefined,)

	const toggleExitDialogVisible = toggleState(setIsExitDialogOpen,)
	const toggleSuccessDialogVisible = toggleState(setIsSuccessDialogOpen,)
	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)

	const handleAddDrawerClose = React.useCallback((): void => {
		setIsCreateOpen(false,)
	}, [],)

	const handleCloseSaveExit = (): void => {
		setIsExitDialogOpen(false,)
	}

	const handleOpenDrawer = React.useCallback((): void => {
		setIsCreateOpen(true,)
	}, [],)

	const handleOpenDeleteModal = (studentId: string,): void => {
		setDeleteStudentId(studentId,)
		toggleDeleteDialog()
	}

	const toggleUpdateVisible = React.useCallback((id?: string,) => {
		setStudentId(id,)
		toggleState(setIsUpdateOpen,)()
	}, [],)

	const handleUpdateDrawerClose = React.useCallback((): void => {
		setIsUpdateOpen(false,)
		setStudentId(undefined,)
	}, [],)

	const toggleDetailsVisible = React.useCallback((id?: string,) => {
		setDetailsStudentId(id,)
		toggleState(setIsDetailsOpen,)()
	}, [],)

	const handleDetailsDrawerClose = React.useCallback((): void => {
		setIsDetailsOpen(false,)
		setDetailsStudentId(undefined,)
	}, [],)

	const {
		filter,
	} = useStudentsStore()

	const finalFilter = useDebounce(filter, 700,)

	const {
		data: studentList,
	} = useStudentsList(finalFilter,)

	return (
		<div className={styles.pageWrapper}>
			<Header
				onAddStudent={handleOpenDrawer}
			/>

			<Table
				handleOpenDeleteModal={handleOpenDeleteModal}
				studentList={studentList?.items}
				toggleUpdateVisible={toggleUpdateVisible}
				toggleDetailsVisible={toggleDetailsVisible}
				onAddStudent={handleOpenDrawer}
			/>

			<Drawer
				isOpen={isCreateOpen}
				onClose={toggleExitDialogVisible}
				isCloseButtonShown
				nonPortalContainer
			>
				<AddStudents
					isExitDialogOpen={isExitDialogOpen}
					toggleExitDialogVisible={toggleExitDialogVisible}
					onClose={handleAddDrawerClose}
					toggleSuccessDialogVisible={toggleSuccessDialogVisible}
					handleCloseSaveExit={handleCloseSaveExit}
				/>
			</Drawer>

			<Dialog
				onClose={() => {
					setIsSuccessDialogOpen(false,)
				}}
				open={isSuccessDialogOpen}
				isCloseButtonShown
			>
				<SuccessCreateDialog
					onExit={() => {
						setIsSuccessDialogOpen(false,)
					}}
				/>
			</Dialog>

			<Dialog
				onClose={() => {
					setIsDeleteModalShown(false,)
				}}
				open={isDeleteModalShowed}
				isCloseButtonShown
			>
				<DeleteModal
					onClose={toggleDeleteDialog}
					studentId={deleteStudentId}
				/>
			</Dialog>

			<Drawer
				isOpen={isUpdateOpen}
				onClose={handleUpdateDrawerClose}
				isCloseButtonShown
				nonPortalContainer
			>
				<EditStudent
					onClose={handleUpdateDrawerClose}
					studentId={studentId}
				/>
			</Drawer>

			<Drawer
				isOpen={isDetailsOpen}
				onClose={handleDetailsDrawerClose}
				isCloseButtonShown
				nonPortalContainer
			>
				<StudentDetails
					onClose={handleDetailsDrawerClose}
					studentId={detailsStudentId}
				/>
			</Drawer>
		</div>
	)
}

export default Students