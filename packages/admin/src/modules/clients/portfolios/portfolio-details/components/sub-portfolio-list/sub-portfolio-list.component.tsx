import * as React from 'react'
import {
	Button, ButtonType, Color, Dialog, Drawer, Size,
} from '../../../../../../shared/components'
import {
	ReactComponent as BriefcaseIcon,
} from '../../../../../../assets/icons/briefcase-icon.svg'
import type {
	IPortfolioDetailed,
} from '../../../../../../shared/types'
import {
	SubportfolioListItem,
} from './components/subportfolio-list-item/subportfolio-list-item.component'
import {
	DrawerContent,
} from '../../../portfolio/components/drawer-content/drawer-content.component'
import {
	ClosePortfolioCreationContent,
} from '../../../portfolio/components/close-portfolio-creation/close-portfolio-creation.component'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	Roles,
} from '../../../../../../shared/types'

import * as styles from './sub-portfolio.styles'

interface ISubportfolioListProps{
	subportfolioList: Array<IPortfolioDetailed>
	mainPortfolioName: string
	handleOpenDeleteModal: (portfolioId: string) => void
}

export const SubportfolioList: React.FC<ISubportfolioListProps> = ({
	subportfolioList,
	mainPortfolioName,
	handleOpenDeleteModal,
},) => {
	const [isDrawerOpen, setIsDrawerOpen,] = React.useState<boolean>(false,)
	const [isCloseDialogOpen, setIsCloseDialogOpen,] = React.useState<boolean>(false,)
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)

	const {
		userInfo,
	} = useUserStore()

	const handleCloseDialogIsOpen = (): void => {
		setIsCloseDialogOpen(!isCloseDialogOpen,)
	}
	const handleDrawerToggle = (): void => {
		if (isCloseDialogOpen) {
			setIsDrawerOpen(!isDrawerOpen,)
		} else {
			setIsCloseDialogOpen(true,)
		}
	}
	const clientId = subportfolioList[0]?.clientId ?? ''
	const mainPortfolioId = subportfolioList[0]?.mainPortfolioId ?? ''

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [],)
	return (
		<>
			<div className={styles.listWrapper}>
				<div className={styles.listHeader}>
					<p className={styles.headerTitle}>Sub-portfolio</p>
					{isAllowed && <Button<ButtonType.TEXT>
						onClick={() => {
							setIsDrawerOpen(true,)
						}}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							size:     Size.SMALL,
							color:    Color.SECONDRAY_COLOR,
							text:     'Add sub-portfolio',
							leftIcon: <BriefcaseIcon/>,
						}}
					/>}
				</div>
				<ul className={styles.subportfolioList}>
					{subportfolioList.map((subportfolio,) => {
						return	<div key={subportfolio.id} >
							<SubportfolioListItem subportfolio={subportfolio} handleOpenDeleteModal={handleOpenDeleteModal}/>
						</div>
					},)}
				</ul>
			</div>
			<Dialog
				isPortalUsed
				open={isCloseDialogOpen}
				className={styles.dialog}
				onClose={handleCloseDialogIsOpen}>
				<ClosePortfolioCreationContent handleDrawerToggle={handleDrawerToggle} onClose={handleCloseDialogIsOpen}/>
			</Dialog>
			<Drawer
				isOpen={isDrawerOpen}
				onClose={handleDrawerToggle}
				className={styles.drawer}
			>
				<DrawerContent
					clientId={clientId}
					onClose={handleDrawerToggle}
					handleCloseDialogIsOpen={handleCloseDialogIsOpen}
					onSaveAsSraftClick={() => {
						setIsDrawerOpen(false,)
					}}
					mainPortfolioId={mainPortfolioId}
					mainPortfolioName={mainPortfolioName}
				/>
			</Drawer>
		</>

	)
}