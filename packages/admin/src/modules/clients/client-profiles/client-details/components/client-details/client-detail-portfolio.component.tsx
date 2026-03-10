/* eslint-disable complexity */
import React from 'react'
import {
	Button, ButtonType, Size, Color, Loader,
} from '../../../../../../shared/components'
import {
	Plus,
} from '../../../../../../assets/icons'
import {
	ClientPortfolioCard,
} from './client-portfolio-card.component'
import type {
	Client, IPortfolio,
} from '../../../../../../shared/types'
import {
	useGetPortfolioListFiltered,
} from '../../../../../../shared/hooks/portfolio'
import {
	ClientPortfolioDraft,
} from './client-portfolio-draft.component'
import {
	getResumeStep,
} from '../../../../portfolios/portfolio/utils/get-resume-step.util'
import {
	AddPortfolio,
} from '../../../../portfolios/portfolio/components/add-portfolio/add-portfolio.component'

import * as styles from './client-detail.style'

interface IClientDetailsProps {
  data: Client
  handleOpenPortfolioDeleteModal: (id: string) => void
}

export const ClientDetailPortfolio: React.FC<IClientDetailsProps> = ({
	data,
	handleOpenPortfolioDeleteModal,
},) => {
	const {
		data: clientPortfolios,
		isPending,
	} = useGetPortfolioListFiltered({
		clients: [data.id,],
	},)

	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [selectedPortfolio, setSelectedPortfolio,] = React.useState<IPortfolio | null>(null,)
	const [mainPortfolioId, setMainPortfolioId,] = React.useState<string>('',)
	const [draftStep, setDraftStep,] = React.useState<number>(1,)

	const clientPortfoliosFiltered = clientPortfolios?.list.filter((portfolio,) => {
		return portfolio.isActivated !== undefined || portfolio.clientId === data.id
	},)

	React.useEffect(() => {
		if (!isDrawerOpen) {
			setSelectedPortfolio(null,)
		}
	},[isDrawerOpen,],)

	React.useEffect(() => {
		if (selectedPortfolio) {
			setDraftStep(getResumeStep(selectedPortfolio,),)
		} else {
			setDraftStep(1,)
		}
	},[selectedPortfolio,],)
	return (
		<div className={styles.ClientDetailPortfolio}>
			<div className={styles.ClientDetailPortfolioHeader}>
				<h4 className={styles.ClientDetailPortfolioTitle}>Portfolio</h4>
				<Button<ButtonType.TEXT>
					type='button'
					className={styles.addPortfolioBtn}
					onClick={() => {
						setIsDrawerOpen(true,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add new',
						size:     Size.SMALL,
						color:    Color.BLUE,
						leftIcon: <Plus width={20} height={20}/>,
					}}
				/>
			</div>
			<div className={styles.ClientDetailPortfolioCards}>
				{isPending && (
					<Loader
						radius={5}
						width={100}
						wrapperClassName={styles.loaderStyle}
					/>
				)}
				{!isPending && clientPortfoliosFiltered?.map((portfolio, index,) => {
					const isLast = clientPortfoliosFiltered.length > 1 && index === clientPortfoliosFiltered.length - 1
					return portfolio.isActivated === undefined ?
						(
							<ClientPortfolioDraft key={portfolio.id} portfolio={portfolio}
								setIsDrawerOpen={setIsDrawerOpen}
								setSelectedPortfolio={setSelectedPortfolio}
							/>
						) :
						(
							<ClientPortfolioCard key={portfolio.id} portfolio={portfolio} isLast={isLast}
								setMainPortfolioId={setMainPortfolioId}
								setIsDrawerOpen={setIsDrawerOpen}
								handleOpenPortfolioDeleteModal={handleOpenPortfolioDeleteModal}
							/>
						)
				},)}

			</div>
			<AddPortfolio
				clientId={data.id}
				setIsDrawerOpen={(isOpen,) => {
					setIsDrawerOpen(isOpen,)
					if (!isOpen) {
						setMainPortfolioId('',)
					}
				}}
				isDrawerOpen={isDrawerOpen}
				{...(draftStep && {
					draftStep,
				})}
				{...(mainPortfolioId && {
					mainPortfolioId,
				})}
				{...(selectedPortfolio && {
					portfolioDraft: selectedPortfolio,
				})}
				{...(draftStep && {
					isDraft: draftStep >= 2,
				})}
			/>
		</div>
	)
}