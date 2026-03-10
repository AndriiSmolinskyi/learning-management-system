import React from 'react'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import {
	useDeletePortfolio,
} from '../../../../../../shared/hooks/portfolio'
import {
	DraftIcon,
	Trash,
} from '../../../../../../assets/icons'
import type {
	IPortfolio,
} from '../../../../../../shared/types'
import * as styles from './portfolio-card.style'

type Props = {
	portfolio: IPortfolio
	setIsDrawerOpen?: (open: boolean) => void
	setSelectedPortfolio?: (portfolio: IPortfolio) => void
}

export const ClientPortfolioDraft: React.FC<Props> = ({
	portfolio,
	setIsDrawerOpen,
	setSelectedPortfolio,
},) => {
	const {
		mutateAsync: deletePortfolio,
	} = useDeletePortfolio()

	const handleDeleteDraft = async(id: string,): Promise<void> => {
		await deletePortfolio(id,)
	}

	const handleResumeClick = (): void => {
		if (setIsDrawerOpen && setSelectedPortfolio) {
			setIsDrawerOpen(true,)
			setSelectedPortfolio(portfolio,)
		}
	}
	return (
		<div className={styles.portfolioCard(true,)}>
			<div>
				<div className={styles.portfolioCardHeader}>
					<DraftIcon width={32} height={32}/>
				</div>
				<div className={styles.portfolioCardBody}>
					<p className={styles.draftName}>{portfolio.name}</p>
					<p className={styles.draftUpdated}>{new Date(portfolio.updatedAt,).toLocaleDateString('en-US', {
						month: 'short',
						day:   'numeric',
						year:  'numeric',
					},)}</p>

				</div>
			</div>
			<div className={styles.draftFooter}>
				<Button<ButtonType.TEXT>
					onClick={handleResumeClick}
					additionalProps={{
						btnType: ButtonType.TEXT,
						size:    Size.SMALL,
						color:   Color.SECONDARY_GREEN,
						text:    'Resume',
					}}
				/>
				<Button<ButtonType.ICON>
					disabled={false}
					onClick={() => {
						handleDeleteDraft(portfolio.id,)
					}}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.SMALL,
						color:   Color.SECONDARY_RED,
						icon:    <Trash className={styles.trashIcon}/>,
					}}
				/>
			</div>
		</div>
	)
}