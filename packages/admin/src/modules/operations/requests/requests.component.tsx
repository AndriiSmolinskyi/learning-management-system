import React from 'react'
import {
	useLocation,
	useNavigate,
} from 'react-router-dom'

import {
	AddRequest,
	EditRequest,
	RequestDetails,
	RequestFilter,
	RequestTable,
	SuccessCreateDialog,
} from './components'
import {
	Dialog,
	Drawer,
} from '../../../shared/components'

import {
	toggleState,
} from '../../../shared/utils'
import {
	useUserStore,
} from '../../../store/user.store'
import {
	Roles,
} from '../../../shared/types'
import {
	RouterKeys,
} from '../../../router/keys'

import * as styles from './requests.styles'
import {
	useDocumentStore,
} from '../../../store/document.store'
import {
	DeleteRequestModal,
} from './components/delete-modal.component'

const Requests: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const edit = location.state?.edit
	const details = location.state?.details

	const [requestId, setRequestId,] = React.useState<number | undefined>(edit?.requestId ?? details?.requestId,)
	const [isCreateOpen, setIsCreateOpen,] = React.useState<boolean>(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState<boolean>(false,)
	const [isExitDialogOpen, setIsExitDialogOpen,] = React.useState<boolean>(false,)
	const [isUpdateOpen, setIsUpdateOpen,] = React.useState<boolean>(Boolean(edit?.requestId,),)
	const [isDetailsOpen, setIsDetailsOpen,] = React.useState<boolean>(Boolean(details?.requestId,),)
	const [draftId, setDraftId,] = React.useState<number | undefined>()
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteRequestId, setDeleteRequestId,] = React.useState<number | undefined>(undefined,)
	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
	const handleOpenDeleteModal = (requestId: number,): void => {
		setDeleteRequestId(requestId,)
		toggleDeleteDialog()
	}
	const {
		userInfo,
	} = useUserStore()
	const {
		clearDocuments,
	} = useDocumentStore()

	const toggleCreateVisible = React.useCallback(() => {
		toggleState(setIsCreateOpen,)()
	}, [],)

	const handleDraftResume = React.useCallback((id: number,) => {
		setDraftId(id,)
		toggleCreateVisible()
	}, [],)

	const toggleSuccessDialogVisible = toggleState(setIsSuccessDialogOpen,)

	const toggleExitDialogVisible = toggleState(setIsExitDialogOpen,)

	const toggleDetailsVisible = React.useCallback((id: number,) => {
		setRequestId(id,)
		toggleState(setIsDetailsOpen,)()
	}, [],)

	const toggleUpdateVisible = React.useCallback((id?: number,) => {
		setRequestId(id,)
		toggleState(setIsUpdateOpen,)()
	}, [],)

	const handleAddDrawerClose = React.useCallback((id?: number,) => {
		setDraftId(undefined,)
		setRequestId(id,)
		toggleState(setIsCreateOpen,)()
		clearDocuments()
	}, [],)

	const handleUpdateDrawerClose = React.useCallback(() => {
		toggleState(setIsUpdateOpen,)()
		setRequestId(undefined,)
		clearDocuments()
	}, [],)

	const handleDetailsDrawerClose = React.useCallback(() => {
		toggleState(setIsDetailsOpen,)()
		setRequestId(undefined,)
	}, [],)

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER, Roles.INVESTMEN_ANALYST,].includes(role,)
		},)
		if (!hasPermission) {
			navigate(RouterKeys.ANALYTICS,)
		}
	}, [],)

	return (
		<div className={styles.container}>
			<RequestFilter
				toggleCreateVisible={toggleCreateVisible}
			/>
			<RequestTable
				toggleCreateVisible={toggleCreateVisible}
				handleResume={handleDraftResume}
				toggleDetailsVisible={toggleDetailsVisible}
				toggleUpdateVisible={toggleUpdateVisible}
				handleOpenDeleteModal={handleOpenDeleteModal}
			/>
			<Drawer
				isOpen={isCreateOpen}
				onClose={toggleExitDialogVisible}
				isCloseButtonShown
			>
				<AddRequest
					isExitDialogOpen={isExitDialogOpen}
					toggleExitDialogVisible={toggleExitDialogVisible}
					onClose={handleAddDrawerClose}
					draftId={draftId}
					toggleSuccessDialogVisible={toggleSuccessDialogVisible}
				/>
			</Drawer>
			<Drawer
				isOpen={isUpdateOpen}
				onClose={handleUpdateDrawerClose}
				isCloseButtonShown
			>
				<EditRequest
					onClose={handleUpdateDrawerClose}
					requestId={requestId}
				/>
			</Drawer>
			<Drawer
				isOpen={isDetailsOpen}
				onClose={handleDetailsDrawerClose}
				isCloseButtonShown
			>
				<RequestDetails
					onClose={handleDetailsDrawerClose}
					requestId={requestId}
					toggleUpdateVisible={toggleUpdateVisible}
				/>
			</Drawer>
			<Dialog
				onClose={() => {
					setIsSuccessDialogOpen(false,)
				}}
				open={isSuccessDialogOpen}
				isCloseButtonShown
			>
				{requestId && (
					<SuccessCreateDialog
						handleViewDetails={() => {
							setIsSuccessDialogOpen(false,)
							toggleState(setIsDetailsOpen,)()
						}}
					/>
				)}
			</Dialog>
			<Dialog
				onClose={() => {
					setIsDeleteModalShown(false,)
				}}
				open={isDeleteModalShowed}
				isCloseButtonShown
			>
				<DeleteRequestModal
					onClose={toggleDeleteDialog}
					requestId={deleteRequestId}
				/>
			</Dialog>
		</div>
	)
}

export default Requests
