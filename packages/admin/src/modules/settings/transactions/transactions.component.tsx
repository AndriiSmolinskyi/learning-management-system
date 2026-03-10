import React from 'react'
import {
	Header,
} from './components/header.component'
import {
	Dialog,
	Drawer,
} from '../../../shared/components'
import {
	AddTransactionType,
} from './components/add-transaction.component'
import {
	toggleState,
} from '../../../shared/utils'
import {
	SuccessCreateDialog,
} from './components/success-create-dialog.component'
import {
	Table,
} from './components/table.component'
import type {
	TransactionTypeFilter,
} from '../../../shared/types'
import {
	RelationsDialog,
} from './components/relation-dialog.component'
import {
	DeleteTransactionTypeModal,
} from './components/delete-modal.component'
import {
	useTransactionTypeStore,
} from './transaction-settings.store'
import {
	useTransactionTypeList,
} from '../../../shared/hooks/settings/transaction-settings.hook'
import {
	useDebounce,
} from '../../../shared/hooks'
import {
	EditTransactionType,
} from './components/edit-transaction.component'
import {
	AuditTrail,
} from './components/audit-trail.component'
import {
	Category,
} from './components/category.component'

export const Transactions: React.FC = () => {
	const [isCreateOpen, setIsCreateOpen,] = React.useState<boolean>(false,)
	const [isExitDialogOpen, setIsExitDialogOpen,] = React.useState<boolean>(false,)
	const [isSuccessDialogOpen, setIsSuccessDialogOpen,] = React.useState<boolean>(false,)
	const [draftId, setDraftId,] = React.useState<string | undefined>()
	const [transactionTypeFilter, setTransactionTypeFilter,] = React.useState<TransactionTypeFilter | undefined>()
	const [transactionTypeId, setTransactionTypeId,] = React.useState<string | undefined>(undefined,)
	const [isRelationsOpen, setIsRelationsOpen,] = React.useState<boolean>(false,)
	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteTransactionTypeId, setDeleteTransactionTypeId,] = React.useState<string | undefined>(undefined,)
	const [isUpdateOpen, setIsUpdateOpen,] = React.useState<boolean>(false,)
	const [isAuditOpen, setIsAuditOpen,] = React.useState<boolean>(false,)
	const [transactionRelatedTypeId, setTransactionRelatedTypeId,] = React.useState<string | undefined>(undefined,)
	const [isCategoryDrawerOpen, setCategoryDrawerOpen,] = React.useState<boolean>(false,)

	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)

	const toggleExitDialogVisible = toggleState(setIsExitDialogOpen,)

	const toggleSuccessDialogVisible = toggleState(setIsSuccessDialogOpen,)

	const handleSetTransactionId = (id: string,): void => {
		setTransactionTypeId(id,)
	}

	const handleSetTransactionTypeId = (id: string,): void => {
		setTransactionRelatedTypeId(id,)
	}

	const handleOpenDrawer = React.useCallback(() => {
		setIsCreateOpen(true,)
	}, [],)

	const handleOpenCreate = (): void => {
		setIsCreateOpen(true,)
	}

	const handleCloseSaveExit = (): void => {
		setIsExitDialogOpen(false,)
	}

	const handleAddDrawerClose = React.useCallback((id?: number,) => {
		toggleState(setIsCreateOpen,)()
	}, [],)

	const handleDraftResume = React.useCallback((id: string,) => {
		setDraftId(id,)
		handleOpenDrawer()
	}, [],)

	const toggleRelationsVisible = React.useCallback((id: string,) => {
		setTransactionTypeId(id,)
		toggleState(setIsRelationsOpen,)()
	}, [],)

	const handleCloseRelations = (): void => {
		setIsRelationsOpen(false,)
		setTransactionTypeId(undefined,)
		setTransactionRelatedTypeId(undefined,)
	}

	const handleOpenDeleteModal = (transactionTypeId: string,): void => {
		setDeleteTransactionTypeId(transactionTypeId,)
		toggleDeleteDialog()
	}

	const toggleUpdateVisible = React.useCallback((id?: string,) => {
		setTransactionTypeId(id,)
		toggleState(setIsUpdateOpen,)()
	}, [],)

	const handleUpdateDrawerClose = React.useCallback(() => {
		toggleState(setIsUpdateOpen,)()
		setTransactionTypeId(undefined,)
	}, [],)

	const {
		filter,
	} = useTransactionTypeStore()

	const finalFilter = useDebounce(filter, 700,)

	const {
		data: transactionTypeList,
	} = useTransactionTypeList(finalFilter,)

	const toggleAuditOpen = React.useCallback(() => {
		toggleState(setIsAuditOpen,)()
	}, [],)

	const toggleAuditClose = React.useCallback(() => {
		toggleState(setIsAuditOpen,)()
	}, [],)

	const toggleCategoryDrawerOpen = React.useCallback(() => {
		toggleState(setCategoryDrawerOpen,)()
	}, [],)

	const toggleCategoryDrawerClose = React.useCallback(() => {
		toggleState(setCategoryDrawerOpen,)()
	}, [],)

	return (
		<div>
			<Header
				transactionTypeList={transactionTypeList}
				transactionTypeFilter={transactionTypeFilter}
				onAddTransaction={handleOpenDrawer}
				setTransactionTypeFilter={setTransactionTypeFilter}
				toggleAuditOpen={toggleAuditOpen}
				toggleCategoryDrawerOpen={toggleCategoryDrawerOpen}
			/>
			<Table
				handleResume={handleDraftResume}
				toggleRelationsVisible={toggleRelationsVisible}
				handleOpenDeleteModal={handleOpenDeleteModal}
				transactionTypeList={transactionTypeList}
				toggleUpdateVisible={toggleUpdateVisible}
				onAddTransaction={handleOpenDrawer}
			/>
			<Drawer
				isOpen={isCreateOpen}
				onClose={toggleExitDialogVisible}
				isCloseButtonShown
				nonPortalContainer
			>
				<AddTransactionType
					isExitDialogOpen={isExitDialogOpen}
					toggleExitDialogVisible={toggleExitDialogVisible}
					onClose={handleAddDrawerClose}
					toggleSuccessDialogVisible={toggleSuccessDialogVisible}
					draftId={draftId}
					setDraftId={setDraftId}
					handleSetTransactionId={handleSetTransactionId}
					handleCloseSaveExit={handleCloseSaveExit}
					handleSetTransactionTypeId={handleSetTransactionTypeId}
					isRelationsOpen={isRelationsOpen}
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
					toggleRelationsVisible={toggleRelationsVisible}
					transactionTypeId={transactionTypeId}
					isRelationsOpen={isRelationsOpen}
				/>
			</Dialog>
			<Dialog
				onClose={() => {
					setIsRelationsOpen(false,)
					setTransactionTypeId(undefined,)
					setTransactionRelatedTypeId(undefined,)
				}}
				open={isRelationsOpen}
				isCloseButtonShown
			>
				<RelationsDialog
					transactionTypeId={transactionTypeId}
					transactionRelatedTypeId={transactionRelatedTypeId}
					handleCloseRelations={handleCloseRelations}
					onAddTransaction={handleOpenCreate}
				/>
			</Dialog>
			<Dialog
				onClose={() => {
					setIsDeleteModalShown(false,)
				}}
				open={isDeleteModalShowed}
				isCloseButtonShown
			>
				<DeleteTransactionTypeModal
					onClose={toggleDeleteDialog}
					transactionTypeId={deleteTransactionTypeId}
				/>
			</Dialog>
			<Drawer
				isOpen={isUpdateOpen}
				onClose={handleUpdateDrawerClose}
				isCloseButtonShown
			>
				<EditTransactionType
					onClose={handleUpdateDrawerClose}
					transactionTypeId={transactionTypeId}
				/>
			</Drawer>
			<Drawer
				isOpen={isAuditOpen}
				onClose={toggleAuditClose}
				isCloseButtonShown
			>
				<AuditTrail
					onClose={toggleAuditClose}
				/>
			</Drawer>
			<Drawer
				isOpen={isCategoryDrawerOpen}
				onClose={toggleCategoryDrawerClose}
				isCloseButtonShown
			>
				<Category/>
			</Drawer>
		</div>
	)
}

export default Transactions

