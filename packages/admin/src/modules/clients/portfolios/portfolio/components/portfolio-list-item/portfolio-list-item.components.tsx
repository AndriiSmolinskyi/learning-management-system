/* eslint-disable complexity */
/* eslint-disable no-unused-vars */
import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	Drawer as BlueDrawer,
} from '@blueprintjs/core'
import {
	Drawer,
} from '../../../../../../shared/components'
import {
	PortfolioCardDialog,
} from '../portfolio-card-dialog'
import {
	Button, ButtonType,
	Color,
	Size,
} from '../../../../../../shared/components'
import {
	MoreVertical, XmarkMid,DraftIcon, Trash, Check, CheckNegative,
	Xmark,
} from '../../../../../../assets/icons'
import {
	formatDateForDraft,
	localeString,
} from '../../../../../../shared/utils'
import {
	useDeletePortfolio,
} from '../../../../../../shared/hooks/portfolio/use-portfolio.hook'
import {
	getResumeStep,
} from '../../utils/get-resume-step.util'
import {
	EditPortfolioForm,
} from '../../../portfolio-details/components/edit-content/components/edit-form/edit-form.component'
import {
	AddPortfolio,
} from '../add-portfolio/add-portfolio.component'
import {
	RouterKeys,
} from '../../../../../../router/keys'

import type {
	IPortfolio,
	IPortfolioDetailed,
} from '../../../../../../shared/types'
import {
	useAddPortfolioStore,
} from '../../store/step.store'
import {
	usePortfolioStateStore,
} from '../../store/portfolio-state.store'

import * as styles from './portfolio-list-item.styles'

interface IPortfolioListItemProps {
	portfolio: IPortfolio
	handleOpenDeleteModal: (portfolioId: string) => void
}
export const PortfolioListItem: React.FC<IPortfolioListItemProps> = ({
	portfolio,
	handleOpenDeleteModal,
},) => {
	const {
		mutatedPortfolioIds,
	} = usePortfolioStateStore()
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [isEditOpen, setIsEditOpen,] = React.useState<boolean>(false,)
	const [isSubportfolioExit, setIsSubportfolioExit,] = React.useState<boolean>(false,)
	const buttonRef = React.useRef<HTMLDivElement | null>(null,)
	const navigate = useNavigate()
	const handleNavigate = (e: React.MouseEvent,): void => {
		if (mutatedPortfolioIds?.includes(portfolio.id,)) {
			return
		}
		if (buttonRef.current && buttonRef.current.contains(e.target as Node,)) {
			return
		}
		navigate(`${RouterKeys.PORTFOLIO}/${portfolio.id}`,)
	}
	const handlePopoverCondition = (): void => {
		setIsPopoverShown(!isPopoverShown,)
	}
	const isPortfolio = 'isActivated' in portfolio
	const {
		mutateAsync: deletePortfolio,
	} = useDeletePortfolio()
	const {
		setAccountId,
	} = useAddPortfolioStore()
	const handleDeleteDraft = async(id: string,): Promise<void> => {
		await deletePortfolio(id,)
	}
	const handleEditCondition = (): void => {
		setIsEditOpen(!isEditOpen,)
	}
	const draftStep = getResumeStep(portfolio,)

	return isPortfolio ?
		(
			<>
				<div className={styles.liItemWrapper(portfolio.isActivated, mutatedPortfolioIds?.includes(portfolio.id,),)} onClick={handleNavigate}>
					{!mutatedPortfolioIds?.includes(portfolio.id,) && <div className={styles.buttonWrapper} ref={buttonRef}>
						<PortfolioCardDialog
							id={portfolio.id}
							status={portfolio.isActivated}
							handlePopoverCondition={handlePopoverCondition}
							addSubportfolioClick={() => {
								setIsDrawerOpen(true,)
								setIsSubportfolioExit(true,)
							}}
							handleEditCondition={handleEditCondition}
							handleOpenDeleteModal={handleOpenDeleteModal}
						>
							<Button<ButtonType.ICON>
								disabled={false}
								onClick={handlePopoverCondition}
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
						</PortfolioCardDialog>
					</div>}
					<div className={styles.topBlock}>
						{portfolio.isActivated ?
							<Check/> :
							<CheckNegative/>}
						<p className={styles.portfolioType(portfolio.type, portfolio.isActivated,)}>{portfolio.type}</p>
					</div>
					<p className={styles.portfolioName(portfolio.isActivated,)}>
						{portfolio.name}
					</p>
					<p className={styles.totalAssets}>
						Total assets:
					</p>
					<p className={styles.quantityAssets(portfolio.isActivated,)}>
						${localeString(portfolio.totalAssets ?? 0, '', 2, false,)}
					</p>
				</div>
				<AddPortfolio
					clientId={portfolio.clientId}
					setIsDrawerOpen={setIsDrawerOpen}
					isDrawerOpen={isDrawerOpen}
					mainPortfolioId={portfolio.id}
					isSubportfolio={isSubportfolioExit}
				/>
				<Drawer
					isOpen={isEditOpen}
					onClose={handleEditCondition}
				>
					<div>
						<div className={styles.editHeader}>
							<h2 className={styles.editHeaderTitle}>Edit portfolio</h2>
							<Button<ButtonType.ICON>
								onClick={handleEditCondition}
								additionalProps={{
									btnType:   ButtonType.ICON,
									size:      Size.SMALL,
									icon:      <Xmark width={32} height={36} />,
									color:     Color.NONE,
								}}
							/>
						</div>
					</div>
					<EditPortfolioForm portfolio={portfolio} onClose={handleEditCondition}/>
				</Drawer>
			</>
		) :
		(
			<>
				<li className={styles.liItemWrapper(portfolio.isActivated, mutatedPortfolioIds?.includes(portfolio.id,),)}>
					<div className={styles.topBlock}>
						<DraftIcon/>
					</div>
					<p className={styles.draftName}>
					Draft: {portfolio.name}
					</p>
					<p className={styles.updatedDate}>
					Last updated: {formatDateForDraft(portfolio.updatedAt,)}
					</p>
					{mutatedPortfolioIds?.includes(portfolio.id,) && <p className={styles.draftName}>Creating<span className={styles.dotAnimation()}/></p>}
					{!mutatedPortfolioIds?.includes(portfolio.id,) && <div className={styles.buttonBlock}>
						<Button<ButtonType.TEXT>
							disabled={false}
							onClick={() => {
								setAccountId(portfolio.id,)
								setIsDrawerOpen(true,)
							}}
							className={styles.resumeButton}
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
					</div>}
				</li>
				<AddPortfolio
					clientId={portfolio.clientId}
					setIsDrawerOpen={setIsDrawerOpen}
					isDrawerOpen={isDrawerOpen}
					mainPortfolioId={portfolio.id}
					draftStep={draftStep}
					portfolioDraft={portfolio}
					isSuccesModalOut
					isDraft
				/>
			</>
		)
}