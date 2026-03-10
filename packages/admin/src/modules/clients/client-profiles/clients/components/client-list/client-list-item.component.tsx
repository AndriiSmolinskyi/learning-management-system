import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	Check,
	CheckNegative,
	XmarkMid,
	MoreVertical,
} from '../../../../../../assets/icons/'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import type {
	Client,
} from '../../../../../../shared/types'
import {
	localeString,
} from '../../../../../../shared/utils'
import {
	ClientItemModal,
} from './client-item-modal'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	RouterKeys,
} from '../../../../../../router/keys'

import * as styles from '../../clients.style'
import {
	useEditClientStore,
} from '../../../client-details/store/edit-client.store'

interface IClientListItemProps {
	client: Client
	index: number
	isActive: boolean
	commentDialogVisible: boolean
	handleMoreToggle: (clientId: string) => void
	handleViewDetailsClick: (clientId: string) => void
	handleEditButtonClick: (client: Client) => void
	handleActivate: (id: string) => Promise<void>
	handleDeactivate: (id: string) => Promise<void>
	setClientModalData: (client: Client | null) => void
	handleCloseCommentDialog: () => void
	handleOpenDeleteModal: (clientId: string) => void
}

export const ClientListItem: React.FC<IClientListItemProps> = ({
	client,
	handleMoreToggle,
	handleViewDetailsClick,
	handleEditButtonClick,
	handleActivate,
	handleDeactivate,
	setClientModalData,
	handleCloseCommentDialog,
	handleOpenDeleteModal,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const buttonRef = React.useRef<HTMLDivElement | null>(null,)
	const navigate = useNavigate()
	const {
		mutatedClientIds,
	} = useEditClientStore()
	const handleNavigate = (e: React.MouseEvent,): void => {
		if (mutatedClientIds?.includes(client.id,)) {
			return
		}
		if (buttonRef.current && buttonRef.current.contains(e.target as Node,)) {
			return
		}
		navigate(`${RouterKeys.CLIENTS}/${client.id}`,)
	}

	return (
		<div className={styles.bodyClientList(mutatedClientIds?.includes(client.id,),)} onClick={handleNavigate}>
			<div className={styles.bodyClientListItem}>
				{client.isActivated ?
					(
						<Check width={20} height={20} />
					) :
					(
						<CheckNegative width={20} height={20} />
					)}
				<p className={styles.bodyClientListItemName(client.isActivated,)}>
					{client.firstName} {client.lastName}
				</p>
			</div>
			<div className={styles.bodyClientListItem}>
				<p className={styles.bodyClientListItemText(client.isActivated,)}>
					{client.emails[0]}
				</p>
			</div>
			<div className={styles.bodyClientListItem}>
				<p className={styles.bodyClientListItemText(client.isActivated,)}>
					{client.contacts[0]}
				</p>
			</div>
			<div className={styles.bodyClientListItem}>
				<p className={styles.bodyClientListItemText(client.isActivated,)}>
					{localeString(Number(client.totalAssets,), 'USD', 0, false,)}
				</p>
			</div>
			<div className={styles.bodyClientListItem}>
				<p className={styles.bodyClientListItemText(client.isActivated,)}>
					{new Date(client.createdAt,).toLocaleDateString('en-GB', {
						year:  'numeric',
						month: '2-digit',
						day:   '2-digit',
					},)
						.replace(/\//g, '.',)}
				</p>
			</div>
			{!mutatedClientIds?.includes(client.id,) && <div className={styles.bodyClientListItem} ref={buttonRef}>
				<ClientItemModal
					client={client}
					handleViewDetailsClick={handleViewDetailsClick}
					handleEditButtonClick={handleEditButtonClick}
					handleActivate={handleActivate}
					handleDeactivate={handleDeactivate}
					setClientModalData={setClientModalData}
					handleCloseCommentDialog={handleCloseCommentDialog}
					setDialogOpen={setIsPopoverShown}
					handleOpenDeleteModal={handleOpenDeleteModal}
				>
					<Button<ButtonType.ICON>
						disabled={false}
						onClick={() => {
							toggleState(setIsPopoverShown,)()
						}}
						className={styles.dotsButton(isPopoverShown,)}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							color:   Color.SECONDRAY_GRAY,
							icon:    isPopoverShown ?
								<XmarkMid width={20} height={20} />			:
								<MoreVertical width={20} height={20} />	,
						}}
					/>
				</ClientItemModal>
			</div>}
		</div>
	)
}
