/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import * as React from 'react'

import {
	PortfolioHeader,
} from './components/header/header.component'

import {
	useGetPortfolioListFiltered,
} from '../../../../shared/hooks/portfolio'
import {
	PortfolioListItem,
} from './components/portfolio-list-item/portfolio-list-item.components'
import {
	EmptyState,
	Plus,
} from '../../../../assets/icons'
import {
	Button, ButtonType, Color, Dialog, Size,
} from '../../../../shared/components'
import {
	usePortfolioStateStore,
} from './store/portfolio-state.store'
import {
	ClientSearchEmpty,
} from '../../client-profiles/clients/components/client-list/client-search-fall.component'
import {
	SuccessModal,
} from './components/success-modal/success-modal.component'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	DeletePortfolioModal,
} from './components/delete-modal/delete-modal.component'
import {
	Loader,
} from '../../../../shared/components'
import {
	usePortfolioFilterStore,
} from './portfolio.store'
import {
	useDebounce,
} from '../../../../shared/hooks'

import * as styles from './portfolio.styles'

const Portfolio: React.FC = () => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen,] = React.useState<boolean>(false,)
	const [portfolioId, setPortfolioId,] = React.useState<string | undefined>(undefined,)
	const toggleDeleteDialog = toggleState(setIsDeleteDialogOpen,)
	const handleOpenDeleteModal = (portfolioId: string,): void => {
		setPortfolioId(portfolioId,)
		toggleDeleteDialog()
	}
	const {
		storeFilters, resetFilterStore,
	} = usePortfolioFilterStore()
	const {
		toggleIsAddClientVisible,
		isSuccessModalVisible,
		toggleIsSuccessModalVisible,
		resetMutatedPortfolioIds,
	} = usePortfolioStateStore()
	const finalFilter = useDebounce(storeFilters, 700,)

	const {
		data,
		isPending,
	} = useGetPortfolioListFiltered(finalFilter,)

	React.useEffect(() => {
		if (data) {
			resetMutatedPortfolioIds()
		}
	},[data,],)

	const maxTotal = data?.list ?
		Math.max(
			...data.list.map((portfolio,) => {
				return Number(portfolio.totalAssets,) || 0
			},),
		) :
		0

	const activatedPortfolios = data?.list
		.filter((portfolio,) => {
			return portfolio.isActivated || portfolio.isActivated === undefined
		},)
	const deactivatedPortfolios = data?.list
		.filter((portfolio,) => {
			return portfolio.isActivated !== undefined && !portfolio.isActivated
		},)

	return 	(
		<div className={styles.pageWrapper}>
			<PortfolioHeader
				maxTotal={maxTotal}
			/>
			{isPending ?
				<Loader />				:
				(data && Boolean(data.list.length > 0,)) ?
					<div className={styles.listsWrapper(!(Boolean(deactivatedPortfolios?.length,) && Boolean(activatedPortfolios?.length,)),)}>
						{Boolean(activatedPortfolios?.length,) && <ul className={styles.portfolioList}>
							{activatedPortfolios?.map((portfolio,) => {
								return <PortfolioListItem
									key={portfolio.id}
									portfolio={portfolio}
									handleOpenDeleteModal={handleOpenDeleteModal}
								/>
							},)}
						</ul>}
						{Boolean(deactivatedPortfolios?.length,) && Boolean(activatedPortfolios?.length,) && <div className={styles.listsDivider}/>}
						{Boolean(deactivatedPortfolios?.length,) && <ul className={styles.portfolioList}>
							{deactivatedPortfolios?.map((portfolio,) => {
								return <PortfolioListItem
									key={portfolio.id}
									portfolio={portfolio}
									handleOpenDeleteModal={handleOpenDeleteModal}
								/>
							},)}
						</ul>	}
					</div>					:
					(storeFilters.search) ?
						(
							<ClientSearchEmpty clearSearch={resetFilterStore}/>
						) :
						(
							<div className={styles.emptyContainer}>
								<EmptyState/>
								<p className={styles.emptyText}>Nothing here yet. Add portfolio to get started</p>
								<Button<ButtonType.TEXT>
									disabled={false}
									onClick={toggleIsAddClientVisible}
									additionalProps={{
										btnType:  ButtonType.TEXT,
										text:     'Add portfolio',
										leftIcon: <Plus width={20} height={20} />,
										size:     Size.MEDIUM,
										color:    Color.BLUE,
									}}
								/>
							</div>
						)

			}
			<SuccessModal isOpen={isSuccessModalVisible} onClose={toggleIsSuccessModalVisible}/>
			<Dialog
				onClose={() => {
					setIsDeleteDialogOpen(false,)
				}}
				open={isDeleteDialogOpen}
				isCloseButtonShown
			>
				<DeletePortfolioModal
					onClose={toggleDeleteDialog}
					portfolioId={portfolioId}
				/>
			</Dialog>
		</div>
	)
}

export default Portfolio