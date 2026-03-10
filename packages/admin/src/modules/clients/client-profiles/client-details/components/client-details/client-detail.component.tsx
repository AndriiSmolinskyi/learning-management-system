import React from 'react'
import {
	useNavigate,
	useParams,
} from 'react-router-dom'

import {
	ClientDetailHeader,
} from './client-detail-header.components'
import {
	ClientDetailBilling,
} from './client-detail-billing.component'
import {
	ClientDetailTable,
} from './client-detail-table.component'
import {
	ClientDetailPortfolio,
} from './client-detail-portfolio.component'
import {
	ClientHeaderPage,
} from '../../../clients/components/client-header-page/client-header-page.component'

import {
	useClientGet,
} from '../../hooks/use-client-get.hook'
import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	Roles,
} from '../../../../../../shared/types'
import {
	toggleState,
} from '../../../../../../shared/utils'
import {
	Dialog,
} from '../../../../../../shared/components'
import {
	DeleteClientModal,
} from '../../../clients/components/delete-modal/delete-modal.component'
import {
	DeletePortfolioModal,
} from '../../../../portfolios/portfolio/components/delete-modal/delete-modal.component'
import {
	authService,
} from '../../../../../../services/auth'

import * as styles from './client-detail.style'

const ClientDetail: React.FC = () => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen,] = React.useState<boolean>(false,)
	const [isDeletePortfolioDialogOpen, setIsDeletePortfolioDialogOpen,] = React.useState<boolean>(false,)
	const [portfolioId, setPortfolioId,] = React.useState<string | undefined>(undefined,)
	const togglePortfolioDeleteDialog = toggleState(setIsDeletePortfolioDialogOpen,)
	const handleOpenPortfolioDeleteModal = (portfolioId: string,): void => {
		setPortfolioId(portfolioId,)
		togglePortfolioDeleteDialog()
	}
	const toggleDeleteDialog = toggleState(setIsDeleteDialogOpen,)
	const {
		id,
	} = useParams<{ id: string }>()
	const navigate = useNavigate()
	const {
		userInfo,
	} = useUserStore()
	const {
		data, error,
	} = useClientGet(id ?? '',)

	const handleRedirect = async(id: string,): Promise<void> => {
		await authService.clientLogout()
		setTimeout(() => {
			window.open(
				`${import.meta.env.VITE_CLIENT_PORTAL}/admin-redirect/${id}`,
				'_blank',
				'noopener,noreferrer',
			)
		}, 1000,)
	}

	React.useEffect(() => {
		if (error) {
			navigate(RouterKeys.CLIENTS,)
		}
	}, [error,],)

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (!hasPermission) {
			navigate(RouterKeys.PORTFOLIO,)
		}
	}, [],)

	return (
		<div className={styles.clientDetail}>
			{data && (
				<>
					<button
						className={styles.redirectUrl}
						onClick={() => {
							handleRedirect(data.id,)
						}}
					> Client Portal</button>
					<div>
						<ClientHeaderPage clientDetailId={data.id}/>
						<ClientDetailHeader data={data} toggleDeleteDialog={toggleDeleteDialog} />
						<div className={styles.clientDetailsBlock}>
							<div className={styles.BillingPortfolioContainer}>
								<ClientDetailBilling data={data} />
								<ClientDetailPortfolio data={data} handleOpenPortfolioDeleteModal={handleOpenPortfolioDeleteModal}/>
							</div>
							<ClientDetailTable clientId={data.id} />
						</div>
					</div>
				</>
			)}
			<Dialog
				onClose={() => {
					setIsDeleteDialogOpen(false,)
				}}
				open={isDeleteDialogOpen}
				isCloseButtonShown
			>
				<DeleteClientModal
					onClose={toggleDeleteDialog}
					clientId={id}
					isDetails
				/>
			</Dialog>
			<Dialog
				onClose={() => {
					setIsDeletePortfolioDialogOpen(false,)
				}}
				open={isDeletePortfolioDialogOpen}
				isCloseButtonShown
			>
				<DeletePortfolioModal
					onClose={togglePortfolioDeleteDialog}
					portfolioId={portfolioId}
				/>
			</Dialog>
		</div>
	)
}

export default ClientDetail
