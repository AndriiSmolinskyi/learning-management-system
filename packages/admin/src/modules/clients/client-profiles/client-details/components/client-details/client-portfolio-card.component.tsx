import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import {
	Check,
	CheckNegative,
	MoreVertical,
	XmarkMid,
} from '../../../../../../assets/icons'
import {
	PortfolioCardDialog,
} from '../portfolio-card-dialog'
import type {
	IPortfolio,
} from '../../../../../../shared/types'
import {
	EditPortfolioDrawer,
} from '../../../../portfolios/portfolio-details/components/edit-content/edit-content.component'
import {
	localeString,
} from '../../../../../../shared/utils'
import {
	RouterKeys,
} from '../../../../../../router/keys'

import * as styles from './portfolio-card.style'
import {
	usePortfolioStateStore,
} from '../../../../../../modules/clients/portfolios/portfolio/store/portfolio-state.store'

type Props = {
	portfolio: IPortfolio
	isLast?: boolean
	setMainPortfolioId?: (value: string) => void
	setIsDrawerOpen?: (value: boolean) => void
	handleOpenPortfolioDeleteModal: (id: string) => void
}

export const ClientPortfolioCard: React.FC<Props> = ({
	portfolio,
	isLast,
	setMainPortfolioId,
	setIsDrawerOpen,
	handleOpenPortfolioDeleteModal,
},) => {
	const [dialogOpen, setDialogOpen,] = React.useState<boolean>(false,)
	const [isEditOpen, setIsEditOpen,] = React.useState<boolean>(false,)
	const handleEditCondition = (): void => {
		setIsEditOpen(!isEditOpen,)
	}
	const {
		mutatedPortfolioIds,
	} = usePortfolioStateStore()
	const buttonRef = React.useRef<HTMLDivElement | null>(null,)
	const liRef = React.useRef<HTMLDivElement | null>(null,)

	const navigate = useNavigate()

	React.useEffect(() => {
		const handleDocumentClick = (e: MouseEvent,): void => {
			const target = e.target as Node
			if (
				liRef.current?.contains(target,) &&
				!buttonRef.current?.contains(target,)
			) {
				navigate(`${RouterKeys.PORTFOLIO}/${portfolio.id}`,)
			}
		}
		document.addEventListener('click', handleDocumentClick,)
		return () => {
			document.removeEventListener('click', handleDocumentClick,)
		}
	}, [navigate, portfolio.id,],)
	return (
		<div ref={liRef} className={styles.portfolioCard(portfolio.isActivated,)} >
			<div className={styles.portfolioMainFlex}>
				<div className={styles.portfolioCardHeader}>
					<div className={styles.portfolioCardHeaderLeft}>
						{portfolio.isActivated ?
							<Check width={24} height={24} />	:
							<CheckNegative width={24} height={24}/>}
						<div className={styles.portfolioCardHeaderStatus(portfolio.type, portfolio.isActivated,)}>
							<p>{portfolio.type}</p>
						</div>
					</div>
					{!mutatedPortfolioIds?.includes(portfolio.id,) && <div className={styles.moreBtnWrapper} ref={buttonRef}>
						<PortfolioCardDialog
							id={portfolio.id}
							isActivated={Boolean(portfolio.isActivated,)}
							setDialogOpen={setDialogOpen}
							status={portfolio.isActivated}
							isLast={isLast}
							setMainPortfolioId={setMainPortfolioId}
							setIsDrawerOpen={setIsDrawerOpen}
							handleEditCondition={handleEditCondition}
							handleOpenPortfolioDeleteModal={handleOpenPortfolioDeleteModal}
						>
							<Button<ButtonType.ICON>
								onClick={() => {
									setDialogOpen(true,)
								}}
								additionalProps={{
									btnType: ButtonType.ICON,
									size:    Size.SMALL,
									color:   Color.SECONDRAY_GRAY,
									icon:    dialogOpen ?
										<XmarkMid width={20} height={20} /> :
										<MoreVertical width={20} height={20} />,
								}}
							/>
						</PortfolioCardDialog>
					</div>}
				</div>
				<div className={styles.portfolioCardBody}>
					<p className={styles.portfolioCardBodyBigText(portfolio.isActivated,)}>{portfolio.name}</p>
				</div>
			</div>
			<div className={styles.portfolioCardFooter}>
				<p className={styles.portfolioCardFooterBigText(portfolio.isActivated,)}>${localeString(portfolio.totalAssets ?? 0, '', 2, false,)}</p>
			</div>
			<EditPortfolioDrawer
				isOpen={isEditOpen}
				onClose={handleEditCondition}
				id={portfolio.id}
			/>
		</div>
	)
}