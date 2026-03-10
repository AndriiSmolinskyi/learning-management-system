import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../shared/components/button'
import {
	Archive,
	ArchiveRestore,
	Eye,
	PenSquare,
	Trash,
} from '../../../../../assets/icons'
import {
	RouterKeys,
} from '../../../../../router/keys'
import {
	useUpdateBudgetPlan,
} from '../../../../../shared/hooks'
import {
	actionBtn,
	deactivateWrapper,
	dialogContainer,
	menuActions,
	popoverContainer,
	restoreWrapper,
	deactivateButton,
	activateButton,
} from './card-dialog.styles'

interface IProps {
	children: React.ReactNode
	popoverRef?: React.MutableRefObject<null>
	id: string
	handlePopoverCondition?: () => void
	status?: boolean
	isPopoverShown?: boolean
	usePortal?: boolean,
	toggleEditVisible: (id?: string) => void
	toggleDeleteVisible: (id?: string) => void
}

export const BudgetCardDialog: React.FC<IProps> = ({
	children,
	popoverRef,
	id,
	handlePopoverCondition,
	status,
	toggleEditVisible,
	usePortal = false,
	toggleDeleteVisible,
},) => {
	const {
		mutateAsync: updateBudgetPlan,
	} = useUpdateBudgetPlan()
	const navigate = useNavigate()
	const handleNavigate = (): void => {
		navigate(`${RouterKeys.BUDGET_MANAGMENT}/${id}`,)
	}
	const content = (
		<div className={dialogContainer}>
			{status !== undefined && !status && <div className={restoreWrapper}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn, activateButton,)}
					onClick={() => {
						updateBudgetPlan({
							id, isActivated: true,
						},)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Restore',
						leftIcon: <ArchiveRestore width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_GREEN,
					}}
				/>
			</div>}
			<div className={menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'View details',
						leftIcon: <Eye width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
					onClick={handleNavigate}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						toggleEditVisible(id,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit',
						leftIcon: <PenSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						toggleDeleteVisible(id,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete',
						leftIcon: <Trash width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_RED,
					}}
				/>
			</div>
			{status !== undefined && status && <div className={deactivateWrapper}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn, deactivateButton,)}
					onClick={() => {
						updateBudgetPlan({
							id, isActivated: false,
						},)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Deactivate',
						leftIcon: <Archive width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_RED,
					}}
				/>
			</div>}
		</div>)

	return (
		<Popover
			usePortal={usePortal}
			placement='right-start'
			content={content}
			popoverClassName={cx(
				popoverContainer,
				Classes.POPOVER_DISMISS,
			)}
			popoverRef={popoverRef}
			autoFocus={false}
			enforceFocus={false}
			onClosing={() => {
				if (handlePopoverCondition) {
					handlePopoverCondition()
				}
			}}
		>
			{children}
		</Popover>
	)
}