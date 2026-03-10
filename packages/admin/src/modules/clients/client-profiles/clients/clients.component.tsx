import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	ClientList,
} from './components/client-list'
import {
	ClientHeaderPage,
} from './components/client-header-page/client-header-page.component'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	Roles,
} from '../../../../shared/types'
import {
	RouterKeys,
} from '../../../../router/keys'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	Dialog,
} from '../../../../shared/components'
import {
	DeleteClientModal,
} from './components/delete-modal/delete-modal.component'
import * as styles from './clients.style'

export interface ISortParams {
    sortBy?: Array<string>
    sortOrder?: Array<string>
	search?: string
	isActivated?: boolean
	totalAssetsFrom?: number
	totalAssetsTo?: number
}

const Clients: React.FunctionComponent = () => {
	const [openedPopovers, setOpenedPopovers,] = React.useState<Record<string, boolean>>({
	},)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen,] = React.useState<boolean>(false,)
	const [clientId, setClientId,] = React.useState<string | undefined>(undefined,)
	const toggleDeleteDialog = toggleState(setIsDeleteDialogOpen,)
	const handleOpenDeleteModal = (clientId: string,): void => {
		setClientId(clientId,)
		toggleDeleteDialog()
	}
	const navigate = useNavigate()
	const {
		userInfo,
	} = useUserStore()

	const handleMoreToggle = (clientId: string,): void => {
		setOpenedPopovers((prevState,) => {
			return {
				...prevState, [clientId]: !prevState[clientId],
			}
		},)
	}

	React.useEffect(() => {
		if (userInfo.name) {
			const hasPermission = userInfo.roles.some((role,) => {
				return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
			},)
			if (!hasPermission) {
				navigate(RouterKeys.PORTFOLIO,)
			}
		}
	}, [userInfo,],)

	return (
		<div className={styles.clientWrapper}>
			<ClientHeaderPage />
			<ClientList
				openedPopovers={openedPopovers}
				handleMoreToggle={handleMoreToggle}
				handleOpenDeleteModal={handleOpenDeleteModal}
			/>
			<Dialog
				onClose={() => {
					setIsDeleteDialogOpen(false,)
				}}
				open={isDeleteDialogOpen}
				isCloseButtonShown
			>
				<DeleteClientModal
					onClose={toggleDeleteDialog}
					clientId={clientId}
				/>
			</Dialog>
		</div>
	)
}

export default Clients
