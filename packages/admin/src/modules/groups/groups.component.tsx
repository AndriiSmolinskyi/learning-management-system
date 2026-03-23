import React from 'react'
import {
	Drawer,
	Dialog,
} from '../../shared/components'
import {
	toggleState,
} from '../../shared/utils'
import {
	useDebounce,
} from '../../shared/hooks/use-debounce.hook'
import {
	useGroupsStore,
} from './groups.store'
import {
	useGroupsList,
} from '../../shared/hooks/groups/groups.hook'
import {
	Header,
} from './components/header.component'
import {
	Table,
} from './components/table.component'
import {
	AddGroups,
} from './components/add-groups.component'
import {
	EditGroup,
} from './components/edit-groups.component'
import {
	DeleteModal,
} from './components/delete-modal.component'
import {
	SuccessCreateDialog,
} from './components/success-create-dialog.component'
import type {
	TEditableGroup,
} from './groups.types'
import {
	GroupsStudents,
} from './components/groups-students.component'
import {
	GroupsLessons,
} from './components/groups-lessons.component'
import {
	GroupDetails,
} from './components/groups-details.component'
import * as styles from './groups.styles'

export const Groups: React.FC = () => {
	const [isCreateOpen, setIsCreateOpen,] = React.useState<boolean>(false,)
	const [isExitDialogOpen, setIsExitDialogOpen,] = React.useState<boolean>(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState<boolean>(false,)
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteGroupId, setDeleteGroupId,] = React.useState<string | undefined>(undefined,)
	const [isUpdateOpen, setIsUpdateOpen,] = React.useState<boolean>(false,)
	const [editableGroup, setEditableGroup,] = React.useState<TEditableGroup | undefined>(undefined,)
	const [isStudentsOpen, setIsStudentsOpen,] = React.useState<boolean>(false,)
	const [studentsGroupId, setStudentsGroupId,] = React.useState<string | undefined>(undefined,)
	const [isLessonsOpen, setIsLessonsOpen,] = React.useState<boolean>(false,)
	const [lessonsGroupId, setLessonsGroupId,] = React.useState<string | undefined>(undefined,)
	const [isDetailsOpen, setIsDetailsOpen,] = React.useState<boolean>(false,)
	const [detailsGroupId, setDetailsGroupId,] = React.useState<string | undefined>(undefined,)

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

	const handleOpenDeleteModal = (groupId: string,): void => {
		setDeleteGroupId(groupId,)
		toggleDeleteDialog()
	}

	const toggleUpdateVisible = React.useCallback((group: TEditableGroup,) => {
		setEditableGroup(group,)
		toggleState(setIsUpdateOpen,)()
	}, [],)

	const handleUpdateDrawerClose = React.useCallback((): void => {
		setIsUpdateOpen(false,)
		setEditableGroup(undefined,)
	}, [],)

	const toggleStudentsVisible = React.useCallback((id?: string,) => {
		setStudentsGroupId(id,)
		setIsStudentsOpen((prev,) => {
			return !prev
		},)
	}, [],)

	const handleStudentsDrawerClose = React.useCallback((): void => {
		setIsStudentsOpen(false,)
		setStudentsGroupId(undefined,)
	}, [],)

	const toggleLessonsVisible = React.useCallback((id?: string,) => {
		setLessonsGroupId(id,)
		setIsLessonsOpen((prev,) => {
			return !prev
		},)
	}, [],)

	const handleLessonsDrawerClose = React.useCallback((): void => {
		setIsLessonsOpen(false,)
		setLessonsGroupId(undefined,)
	}, [],)

	const toggleDetailsVisible = React.useCallback((id?: string,) => {
		setDetailsGroupId(id,)
		setIsDetailsOpen(true,)
	}, [],)

	const handleDetailsDrawerClose = React.useCallback((): void => {
		setIsDetailsOpen(false,)
		setDetailsGroupId(undefined,)
	}, [],)

	const {
		filter,
	} = useGroupsStore()

	const finalFilter = useDebounce(filter, 700,)

	const {
		data: groupList,
	} = useGroupsList(finalFilter,)

	return (
		<div className={styles.pageWrapper}>
			<Header
				onAddGroup={handleOpenDrawer}
			/>

			<Table
				groupList={groupList?.items}
				onAddGroup={handleOpenDrawer}
				toggleUpdateVisible={toggleUpdateVisible}
				toggleLessonsVisible={toggleLessonsVisible}
				toggleDetailsVisible={toggleDetailsVisible}
				handleOpenDeleteModal={handleOpenDeleteModal}
				toggleStudentsVisible={toggleStudentsVisible}
			/>

			<Drawer
				isOpen={isCreateOpen}
				onClose={toggleExitDialogVisible}
				isCloseButtonShown
				nonPortalContainer
			>
				<AddGroups
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
					groupId={deleteGroupId}
				/>
			</Dialog>

			<Drawer
				isOpen={isUpdateOpen}
				onClose={handleUpdateDrawerClose}
				isCloseButtonShown
				nonPortalContainer
			>
				<EditGroup
					onClose={handleUpdateDrawerClose}
					group={editableGroup}
				/>
			</Drawer>
			<Drawer
				isOpen={isStudentsOpen}
				onClose={handleStudentsDrawerClose}
				isCloseButtonShown
				nonPortalContainer
			>
				<GroupsStudents
					onClose={handleStudentsDrawerClose}
					groupId={studentsGroupId}
				/>
			</Drawer>
			<Drawer
				isOpen={isLessonsOpen}
				onClose={handleLessonsDrawerClose}
				isCloseButtonShown
				nonPortalContainer
			>
				<GroupsLessons
					onClose={handleLessonsDrawerClose}
					groupId={lessonsGroupId}
				/>
			</Drawer>
			<Drawer
				isOpen={isDetailsOpen}
				onClose={handleDetailsDrawerClose}
				isCloseButtonShown
				nonPortalContainer
			>
				<GroupDetails
					onClose={handleDetailsDrawerClose}
					groupId={detailsGroupId}
				/>
			</Drawer>
		</div>
	)
}

export default Groups