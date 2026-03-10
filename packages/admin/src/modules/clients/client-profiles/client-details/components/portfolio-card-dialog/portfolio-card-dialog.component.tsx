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
} from '../../../../../../shared/components/button'
import {
	Archive,
	ArchiveRestore,
	Eye,
	PenSquare,
	Briefcase,
	Trash,
} from '../../../../../../assets/icons'

import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	usePortfolioActivate,
} from '../../../../../../shared/hooks/portfolio'
import {
	actionBtn,
	deactivateWrapper,
	dialogContainer,
	menuActions,
	popoverContainer,
	restoreWrapper,
	lastPopover,
} from './portfolio-card-dialog.styles'

interface IProps {
	children: React.ReactNode
	popoverRef?: React.MutableRefObject<null>
	id: string
	isActivated: boolean
	setDialogOpen: (value: boolean) => void
	status?: boolean
	isLast?: boolean
	setMainPortfolioId?: (value: string) => void
	setIsDrawerOpen?: (value: boolean) => void
	handleEditCondition?: () => void
	handleOpenPortfolioDeleteModal: (id: string) => void
}

export const PortfolioCardDialog: React.FC<IProps> = ({
	children,
	popoverRef,
	id,
	isActivated,
	setDialogOpen,
	status,
	isLast,
	setMainPortfolioId,
	setIsDrawerOpen,
	handleEditCondition,
	handleOpenPortfolioDeleteModal,
},) => {
	const navigate = useNavigate()
	const {
		mutateAsync: changePortfolioStatus,
	} = usePortfolioActivate(id,)
	const handleStatusChange = async(id: string, status: boolean,): Promise<void> => {
		changePortfolioStatus({
			id, isActivated: !status,
		},)
	}

	const handleAddSubPortfolio = (): void => {
		if (setMainPortfolioId) {
			setMainPortfolioId(id,)
		}
		if (setIsDrawerOpen) {
			setIsDrawerOpen(true,)
		}
	}

	const content = (
		<div className={dialogContainer}>
			{!isActivated && (
				<div className={restoreWrapper}>
					<Button<ButtonType.TEXT>
						className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
						onClick={() => {
							handleStatusChange(id, status ?? false,)
						}}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Restore',
							leftIcon: <ArchiveRestore width={20} height={20} />,
							size:     Size.MEDIUM,
							color:    Color.NON_OUT_GREEN,
						}}
					/>
				</div>
			)}
			<div className={menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						navigate(`${RouterKeys.PORTFOLIO}/${id}`,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'View details',
						leftIcon: <Eye width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={handleEditCondition}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit',
						leftIcon: <PenSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={handleAddSubPortfolio}
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add sub-portfolio',
						leftIcon: <Briefcase width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
			</div>
			<Button<ButtonType.TEXT>
				className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
				onClick={() => {
					handleOpenPortfolioDeleteModal(id,)
				}}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Delete',
					leftIcon: <Trash width={20} height={20} />,
					size:     Size.MEDIUM,
					color:    Color.NON_OUT_RED,
				}}
			/>
			{isActivated && (
				<div className={deactivateWrapper}>
					<Button<ButtonType.TEXT>
						className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
						onClick={() => {
							handleStatusChange(id, status ?? false,)
						}}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Deactivate',
							leftIcon: <Archive width={20} height={20} />,
							size:     Size.MEDIUM,
							color:    Color.NON_OUT_RED,
						}}
					/>
				</div>
			)}
		</div>)

	return (
		<Popover
			usePortal={true}
			placement='right-start'
			content={content}
			autoFocus={false}
			enforceFocus={false}
			popoverClassName={cx(
				popoverContainer,
				{
					[lastPopover]: isLast,
				},
			)}
			onClosing={() => {
				setDialogOpen(false,)
			}}
		>
			{children}
		</Popover>
	)
}