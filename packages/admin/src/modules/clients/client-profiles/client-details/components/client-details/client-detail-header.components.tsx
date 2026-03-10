import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	Button,
	ButtonType,
	Size,
	Color,
	Dialog,
	Drawer,
} from '../../../../../../shared/components'
import {
	DeactivateButton,
} from './deactivate-btn.component'
import {
	ActivateButton,
} from './activate-btn.component'
import {
	PenSquare,
	MessagePlus,
	CheckSquare,
	Check,
	CheckNegative,
	Trash,
} from '../../../../../../assets/icons'
import {
	AddCommentDialog,
} from '../../../../../../shared/components'
import {
	toggleState,
} from '../../../../../../shared/utils'
import type {
	Client,
} from '../../../../../../shared/types'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	EditClientDrawer,
} from '../edit-client/edit-client.components'

import * as styles from './client-detail.style'

interface IClientDetailsProps {
  data: Client
  toggleDeleteDialog: () => void
}

export const ClientDetailHeader: React.FC<IClientDetailsProps> = ({
	data,
	toggleDeleteDialog,
},) => {
	const navigate = useNavigate()
	const [commentDialogVisible, setCommentDialogVisible,] = React.useState<boolean>(false,)

	const handleCloseCommentDialog = React.useCallback((): void => {
		toggleState(setCommentDialogVisible,)()
	}, [],)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState(false,)

	const handleEditButtonClick = (): void => {
		setIsDrawerOpen(true,)
	}
	const handleDrawerClose = (): void => {
		setIsDrawerOpen(false,)
	}

	return (
		<div className={styles.clientDetailHeader}>
			<div className={styles.clientDetailHeaderLeft}>
				<h3 className={styles.clientDetailHeaderTitle(data.isActivated,)}>{data.firstName} {data.lastName}</h3>
				{data.isActivated ?
					<Check width={20} height={20} /> :
					<CheckNegative width={20} height={20}/>}
			</div>
			<div className={styles.clientDetailHeaderRight}>
				<Button<ButtonType.TEXT>
					className={styles.addPortfolioBtn}
					onClick={handleEditButtonClick}
					additionalProps={{
						btnType:   ButtonType.TEXT,
						text:      'Edit',
						size:      Size.SMALL,
						leftIcon: <PenSquare width={20} height={20} />,
						color:     Color.SECONDRAY_COLOR,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={styles.addPortfolioBtn}
					onClick={handleCloseCommentDialog}
					additionalProps={{
						btnType:   ButtonType.TEXT,
						text:      'Add comment',
						size:      Size.SMALL,
						leftIcon: <MessagePlus width={20} height={20} />,
						color:     Color.SECONDRAY_COLOR,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={styles.addPortfolioBtn}
					onClick={() => {
						navigate(`${RouterKeys.CLIENTS}/${data.id}/${RouterKeys.COMPLIANCE_CHECK}`,)
					}}
					additionalProps={{
						btnType:   ButtonType.TEXT,
						text:      'Compliance check',
						size:      Size.SMALL,
						leftIcon: <CheckSquare width={20} height={20} />,
						color:     Color.SECONDRAY_COLOR,
					}}
				/>
				{data.isActivated ?
					<DeactivateButton id={data.id} /> :
					<ActivateButton id={data.id}/>}
				<Button<ButtonType.TEXT>
					className={styles.button}
					onClick={toggleDeleteDialog}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete',
						size:     Size.SMALL,
						color:    Color.SECONDARY_RED,
						leftIcon: <Trash width={20} height={20} />,
					}}
				/>
				<Drawer
					isOpen={isDrawerOpen}
					onClose={handleDrawerClose}
				>
					<EditClientDrawer
						isOpen={isDrawerOpen}
						onClose={handleDrawerClose}
						id={data.id}
					/>
				</Drawer>
			</div>
			<Dialog
				open={commentDialogVisible}
				isCloseButtonShown
				onClose={handleCloseCommentDialog}
			>
				<AddCommentDialog
					id={data.id}
					comment={data.comment}
					onClose={handleCloseCommentDialog}
				/>
			</Dialog>
		</div>
	)
}