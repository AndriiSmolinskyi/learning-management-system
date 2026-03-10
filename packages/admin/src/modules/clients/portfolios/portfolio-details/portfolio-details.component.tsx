/* eslint-disable complexity */
import * as React from 'react'
import {
	useParams,
} from 'react-router-dom'

import {
	TotalPortfolioValue,
} from './components/total-portfolio-value/total-portfolio-value.component'
import {
	PortfolioDetailsHeader,
} from './components/header/header.component'
import {
	SubItemsList,
} from './components/sub-items-list/sub-items-list.component'
import {
	SubportfolioList,
} from './components/sub-portfolio-list/sub-portfolio-list.component'
import {
	NameInfoBlock,
} from './components/name-info-block/name-info-block.component'
import {
	useGetPortfolioById,
	useGetPortfolioDetails,
	useGetSubportfolioList,
} from '../../../../shared/hooks'
import {
	DocumentSection,
} from './components/document-section/document-section.component'
import {
	useRequestsListBySourceId,
} from '../../../../shared/hooks/requests'
import {
	RequestList,
} from './components/request-list'
import {
	PortfolioAnalytics,
} from './components/analytics/analytics.component'
import {
	Transactions,
} from './components/transactions/transactions.component'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	Dialog, Loader,
} from '../../../../shared/components'
import {
	DeletePortfolioModal,
} from '../portfolio/components/delete-modal/delete-modal.component'
import * as styles from './portfolio-details.styles'

const PortfolioDetails: React.FC = () => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen,] = React.useState<boolean>(false,)
	const [portfolioId, setPortfolioId,] = React.useState<string | undefined>(undefined,)
	const [isSubPortfolio, setIsSubPortfolio,] = React.useState<boolean>(false,)
	const toggleDeleteDialog = toggleState(setIsDeleteDialogOpen,)
	const handleOpenDeleteModal = (portfolioId: string,): void => {
		setPortfolioId(portfolioId,)
		toggleDeleteDialog()
		if ((portfolioId !== id) && (portfolioId !== subportfolioId)) {
			setIsSubPortfolio(true,)
		} else {
			setIsSubPortfolio(false,)
		}
	}
	const {
		id, subportfolioId,
	} = useParams()
	const {
		data: portfolio,
	} = useGetPortfolioById(subportfolioId ?? id ?? '',)
	const {
		data: portfolioData,
		isPending: isPortfolioPending,
	} = useGetPortfolioDetails(subportfolioId ?? id ?? '',)
	const {
		data: subportfolioList,
		isSuccess,
	} = useGetSubportfolioList(id ?? '', subportfolioId ?? '',)
	const {
		data: requestList,
	} = useRequestsListBySourceId({
		portfolioId: id ?? subportfolioId,
	},)
	const totalAssets = portfolioData?.entities.reduce((acc, item,) => {
		return acc + (item.totalAssets ?? 0)
	}, 0,)
	return (
		<div className={styles.pageWrapper}>
			<PortfolioDetailsHeader portfolio={portfolio} id={subportfolioId ?? id!} handleOpenDeleteModal={handleOpenDeleteModal}/>
			<div className={styles.bothSidesWrapper}>
				<div className={styles.leftSideWrapper}>
					{portfolioData && <TotalPortfolioValue
						bankQuantity={portfolioData.banks.length}
						accountsQuantity={portfolioData.accounts.length}
						entitiesQuantity={portfolioData.entities.length}
						assetQuantity={portfolioData.assetsAmount}
						totalAssets={totalAssets}
						clientId={portfolioData.clientId}
						isPortfolioPending={isPortfolioPending}
					/>}
					{isPortfolioPending && <div className={styles.loaderWrapper}>
						<Loader/>
					</div>}
					{portfolioData && <SubItemsList portfolio={portfolioData}/>}
					{isSuccess && !subportfolioId && portfolio && Boolean(subportfolioList.length > 0,) && (
						<SubportfolioList
							mainPortfolioName={portfolio.name}
							subportfolioList={subportfolioList}
							handleOpenDeleteModal={handleOpenDeleteModal}
						/>
					)}
					{requestList && requestList.length > 0 && (
						<RequestList
							requestList={requestList}
						/>
					)}
				</div>
				<div className={styles.sideWrapper}>
					{portfolio?.clientId && <NameInfoBlock portfolioName={portfolio.name} userData={portfolioData?.client} clientId={portfolio.clientId}/>}
					<PortfolioAnalytics id={subportfolioId ?? id ?? ''}/>
					{portfolio && <Transactions portfolio={portfolio}/>}
					{portfolioData &&	<DocumentSection portfolio={portfolioData}/>}
				</div>
			</div>
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
					isDetails={!isSubPortfolio}
				/>
			</Dialog>
		</div>
	)
}

export default PortfolioDetails