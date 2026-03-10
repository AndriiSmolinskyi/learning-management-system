/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
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
	useUserStore,
} from '../../../../../../store/user.store'
import {
	Roles,
} from '../../../../../../shared/types'
import {
	usePortfolioStateStore,
} from '../../store/portfolio-state.store'
import {
	actionBtn,
	deactivateWrapper,
	dialogContainer,
	menuActions,
	popoverContainer,
	restoreWrapper,
	deactivateButton,
	activateButton,
} from './portfolio-card-dialog.styles'

interface IProps {
	children: React.ReactNode
	popoverRef?: React.MutableRefObject<null>
	id: string
	handlePopoverCondition?: () => void
	addSubportfolioClick?: () => void
	handleOpenDeleteModal?: (portfolioId: string) => void
	status?: boolean
	isSubportfolio?: boolean
	handleEditCondition?: () => void
	mainPortfolioId?: string
	isPopoverShown?: boolean
	usePortal?: boolean,
}

export const PortfolioCardDialog: React.FC<IProps> = ({
	children,
	popoverRef,
	id,
	handlePopoverCondition,
	status,
	addSubportfolioClick,
	handleOpenDeleteModal,
	isSubportfolio,
	handleEditCondition,
	mainPortfolioId,
	usePortal = false,
},) => {
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)
	const navigate = useNavigate()
	const {
		mutateAsync: changePortfolioStatus,
	} = usePortfolioActivate(id,)
	const {
		mutatedPortfolioIds,
		// setMutatedPortfolioIds,
	} = usePortfolioStateStore()
	const {
		userInfo,
	} = useUserStore()

	const handleStatusChange = async(id: string, status: boolean,): Promise<void> => {
		changePortfolioStatus({
			id, isActivated: !status,
		},)
	}
	const subportfolioId = id
	const handleNavigate = (): void => {
		if (mutatedPortfolioIds?.includes(id,) || (isSubportfolio && mutatedPortfolioIds?.includes(subportfolioId,))) {
			return
		}
		if (isSubportfolio && mainPortfolioId) {
			navigate(`${RouterKeys.PORTFOLIO}/${mainPortfolioId}/${RouterKeys.SUB_PORTFOLIO}/${subportfolioId}`,)
		} else {
			navigate(`${RouterKeys.PORTFOLIO}/${id}`,)
		}
	}

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [],)

	const content = (
		<div className={dialogContainer}>
			{status !== undefined && !status && isAllowed && <div className={restoreWrapper}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn, activateButton,)}
					onClick={() => {
						// setMutatedPortfolioIds(id,)
						handleStatusChange(id, status,)
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
					onClick={handleNavigate}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'View details',
						leftIcon: <Eye width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				{isAllowed && <Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={handleEditCondition}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit',
						leftIcon: <PenSquare width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>}
				{!isSubportfolio && isAllowed && <Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={addSubportfolioClick}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add sub-portfolio',
						leftIcon: <Briefcase width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>}
				{isAllowed && <Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn,)}
					onClick={() => {
						if (handleOpenDeleteModal) {
							handleOpenDeleteModal(subportfolioId,)
						}
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete',
						leftIcon: <Trash width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_RED,
					}}
				/>}
			</div>
			{status !== undefined && status && isAllowed && <div className={deactivateWrapper}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, actionBtn, deactivateButton,)}
					onClick={() => {
						// setMutatedPortfolioIds(id,)
						handleStatusChange(id, status,)
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