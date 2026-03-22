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
import * as styles from './groups.styles'

export const Groups: React.FC = () => {
	const [isCreateOpen, setIsCreateOpen,] = React.useState<boolean>(false,)
	const [isExitDialogOpen, setIsExitDialogOpen,] = React.useState<boolean>(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState<boolean>(false,)
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteGroupId, setDeleteGroupId,] = React.useState<string | undefined>(undefined,)
	const [isUpdateOpen, setIsUpdateOpen,] = React.useState<boolean>(false,)
	const [editableGroup, setEditableGroup,] = React.useState<TEditableGroup | undefined>(undefined,)

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
				handleOpenDeleteModal={handleOpenDeleteModal}
				groupList={groupList?.items}
				toggleUpdateVisible={toggleUpdateVisible}
				onAddGroup={handleOpenDrawer}
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
		</div>
	)
}

export default Groups