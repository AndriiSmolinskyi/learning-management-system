/* eslint-disable complexity */
import * as React from 'react'

import type {
	IPortfolio,
} from '../../../../../../shared/types'
import {
	Check, CheckNegative, Archive, PenSquare,
	Trash,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import {
	usePortfolioActivate,
} from '../../../../../../shared/hooks/portfolio'
import {
	EditPortfolioDrawer,
} from '../edit-content/edit-content.component'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	Roles,
} from '../../../../../../shared/types'

import * as styles from './header.styles'

interface IPortfolioDetailsHeaderProps{
	handleOpenDeleteModal: (id: string) => void
	id: string
	portfolio?: IPortfolio
}
export const PortfolioDetailsHeader: React.FC<IPortfolioDetailsHeaderProps> = ({
	id,
	handleOpenDeleteModal,
	portfolio,
},) => {
	const [isEditOpen, setIsEditOpen,] = React.useState<boolean>(false,)
	const [isAllowed, setIsAllowed,] = React.useState<boolean>(false,)

	const {
		userInfo,
	} = useUserStore()

	const handleEditCondition = (): void => {
		setIsEditOpen(!isEditOpen,)
	}
	const {
		mutateAsync: changePortfolioStatus,
	} = usePortfolioActivate(portfolio?.id,)
	const handleStatusChange = async(id: string, isActivated: boolean,): Promise<void> => {
		changePortfolioStatus({
			id,isActivated: !isActivated,
		},)
	}

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.BACK_OFFICE_MANAGER, Roles.FAMILY_OFFICE_MANAGER,].includes(role,)
		},)
		if (hasPermission) {
			setIsAllowed(true,)
		}
	}, [],)

	return (
		<div className={styles.headerWrapper}>
			<div className={styles.infoBlock}>
				<p className={styles.nameText(portfolio?.isActivated,)}>{portfolio?.name}</p>
				{portfolio?.type && <p className={styles.portfolioType(portfolio.type, portfolio.isActivated,)}>{portfolio.type}</p>}
				{portfolio?.isActivated ?
					<Check/> :
					<CheckNegative/>}
			</div>
			{isAllowed && <div className={styles.actionBlockWrapper}>
				<Button<ButtonType.TEXT>
					onClick={handleEditCondition}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Edit',
						leftIcon: <PenSquare/>,
						size:     Size.SMALL,
						color:    Color.SECONDRAY_COLOR,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={() => {
						if (portfolio) {
							handleStatusChange(portfolio.id, portfolio.isActivated ?? false,)
						}
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     portfolio?.isActivated ?
							'Deactivate' :
							'Activate',
						leftIcon: <Archive className={styles.archiveIcon(portfolio?.isActivated ?? false,)}/>,
						size:     Size.SMALL,
						color:    portfolio?.isActivated ?
							Color.SECONDARY_RED :
							Color.SECONDARY_GREEN,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={styles.button}
					onClick={() => {
						handleOpenDeleteModal(id,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Delete',
						size:     Size.SMALL,
						color:    Color.SECONDARY_RED,
						leftIcon: <Trash width={20} height={20} />,
					}}
				/>
			</div>}
			{portfolio && <EditPortfolioDrawer
				isOpen={isEditOpen}
				onClose={handleEditCondition}
				id={portfolio.id}
			/>}
		</div>
	)
}