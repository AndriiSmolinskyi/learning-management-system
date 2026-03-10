/* eslint-disable complexity */

import React from 'react'

import {
	Button, ButtonType, Color, Drawer, Size,
} from '../../../../../shared/components'
import {
	Check,
	CheckNegative,
	PenSquareGray,
	Archive,
	ArchiveRestore,
	ClientLists,
	Trash,
} from '../../../../../assets/icons'
import type {
	IBudgetPlan,
} from '../../../../../shared/types'
import {
	useUpdateBudgetPlan,
} from '../../../../../shared/hooks'
import {
	Dialog,
} from '../../../../../shared/components/dialog/dialog.component'
import {
	formatBigNumber,
	toggleState,
} from '../../../../../shared/utils'
import {
	DeleteBudgetModal,
} from '../delete-modal/delete-modal.component'
import {
	EditBudgetPlan,
} from '../../../budget/components/edit-budget-plan/edit-budget-plan.component'
import {
	useBudgetDetailsStore,
} from '../../budget-details.store'

import * as styles from './details.styles'

interface IProps {
	children?: React.ReactNode
	budgetPlan: IBudgetPlan
}

export const BudgetDetailsBlock: React.FC<IProps> = ({
	children,
	budgetPlan,
},) => {
	const [isDeleteModalOpen, setIsDeleteModalOpen,] = React.useState<boolean>(false,)
	const [isEditOpen, setIsEditOpen,] = React.useState<boolean>(false,)
	const {
		isYearly,
	} = useBudgetDetailsStore()
	const toggleExitDialogVisible = toggleState(setIsEditOpen,)
	const toggleDeleteModalVisible = toggleState(setIsDeleteModalOpen,)
	const {
		mutateAsync: updateBudgetPlan,
	} = useUpdateBudgetPlan()
	return (
		<div className={styles.detailsWrapper}>
			<div className={styles.topBlock}>
				<p className={styles.titleName(budgetPlan.isActivated,)}>
					<span>{budgetPlan.name}</span>
					{budgetPlan.isActivated ?
						<Check width={24} height={24}/> :
						<CheckNegative width={24} height={24}/>}
				</p>
				<div className={styles.buttonsBlock}>

					<Button<ButtonType.TEXT>
						className={styles.button}
						onClick={toggleExitDialogVisible}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Edit',
							size:     Size.SMALL,
							color:    Color.SECONDRAY_COLOR,
							leftIcon: <PenSquareGray width={20} height={20} />,
						}}
					/>
					<Button<ButtonType.TEXT>
						onClick={() => {
							updateBudgetPlan({
								id: budgetPlan.id, isActivated: !budgetPlan.isActivated,
							},)
						}}
						className={styles.button}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     budgetPlan.isActivated ?
								'Deactivate' :
								'Activate',
							size:     Size.SMALL,
							color:    budgetPlan.isActivated ?
								Color.SECONDARY_RED :
								Color.SECONDARY_GREEN,
							leftIcon: budgetPlan.isActivated ?
								<Archive width={20} height={20} /> :
								<ArchiveRestore width={20} height={20} />,
						}}
					/>
					<Button<ButtonType.TEXT>
						className={styles.button}
						onClick={toggleDeleteModalVisible}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Delete',
							size:     Size.SMALL,
							color:    Color.SECONDARY_RED,
							leftIcon: <Trash width={20} height={20} />,
						}}
					/>
				</div>
			</div>
			<div className={styles.infoBlocksWrapper}>
				<p className={styles.firstInfoBlock(budgetPlan.isActivated,)}>
					<span className={styles.totalText(budgetPlan.isActivated,)}>{isYearly ?
						'Expected Yearly Income' :
						'Expected Monthly Income'}</span>
					<span className={styles.totalManage(budgetPlan.isActivated,)}>${isYearly ?
						formatBigNumber(budgetPlan.totalManage * 12,)						 :
						formatBigNumber(budgetPlan.totalManage,)
					}</span>
				</p>
				<p className={styles.secondInfoBlock(budgetPlan.isActivated,)}>
					<span className={styles.totalText(budgetPlan.isActivated,)}>Total in banks</span>
					<span className={styles.totalBanks(budgetPlan.isActivated,)}>${formatBigNumber(budgetPlan.totalBanks,)	}</span>
				</p>
				<p className={styles.secondInfoBlock(budgetPlan.isActivated,)}>
					<span className={styles.clientNameText}>
						<ClientLists width={24} height={24}/>
						{budgetPlan.client.firstName} {budgetPlan.client.lastName}
					</span>
				</p>
			</div>
			<Dialog
				onClose={() => {
					setIsDeleteModalOpen(false,)
				}}
				open={isDeleteModalOpen}
				isCloseButtonShown
			>
				<DeleteBudgetModal
					onClose={toggleDeleteModalVisible}
					budgetId={budgetPlan.id}
				/>
			</Dialog>
			<Drawer
				isOpen={isEditOpen}
				onClose={toggleExitDialogVisible}
				isCloseButtonShown
			>
				<EditBudgetPlan
					onClose={toggleExitDialogVisible}
					budgetPlanId={budgetPlan.id}
				/>
			</Drawer>
			{children}
		</div>
	)
}