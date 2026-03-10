/* eslint-disable complexity */
import * as React from 'react'
import {
	useLocation, useParams,
} from 'react-router-dom'
import {
	Link,
} from 'react-router-dom'

import {
	RouterKeys,
} from '../../../../../../router/keys'
import {
	ClientsRoute, ChevronRight, Briefcase,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../../../../shared/components'
import {
	useUserStore,
} from '../../../../../../store/user.store'
import {
	Roles,
} from '../../../../../../shared/types'

import * as styles from './navigate-header.styles'

interface IPortfoioNavigateProps {
  portfolioId?: string
}

export const PortfolioNavigate: React.FC<IPortfoioNavigateProps> = () => {
	const [isAnalyst, setIsAnalyst,] = React.useState<boolean>(false,)

	const {
		userInfo,
	} = useUserStore()
	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.INVESTMEN_ANALYST,].includes(role,)
		},)
		if (hasPermission) {
			setIsAnalyst(true,)
		}
	}, [],)
	const location = useLocation()
	const {
		id, subportfolioId,
	} = useParams()
	const isOnPortfolioPage = location.pathname.includes(RouterKeys.PORTFOLIO,)
	const isOnPortfolioDetailsPage = location.pathname.includes(`${RouterKeys.PORTFOLIO}/${id}`,)
	const isOnSubPortfolioDetailsPage = location.pathname.includes(`${RouterKeys.SUB_PORTFOLIO}/${subportfolioId}`,)
	return (
		<div className={styles.pageHeader}>
			{!isAnalyst && <Link to={RouterKeys.CLIENTS} className={styles.linkHeader}>
				<Button<ButtonType.TEXT>
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Clients',
						size:     Size.SMALL,
						color:    Color.NONE,
						leftIcon: <ClientsRoute width={20} height={20} />,
					}}
				/>
			</Link>}
			<Link to={RouterKeys.PORTFOLIO} className={styles.linkHeader}>
				{!isAnalyst && <ChevronRight width={20} height={20} />}
				<Button<ButtonType.TEXT>
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Portfolio',
						size:     Size.SMALL,
						color:    (isOnPortfolioPage && !isOnPortfolioDetailsPage) ?
							Color.NON_OUT_BLUE :
							Color.NONE,
						leftIcon:  (isOnPortfolioPage && !isOnPortfolioDetailsPage) ?
							<Briefcase width={20} height={20} /> :
							<Briefcase className={styles.inactiveBriefcase} width={20} height={20} />,
					}}
				/>
			</Link>
			{id && (
				<Link to={`${RouterKeys.PORTFOLIO}/${id}`} className={styles.linkHeader}>
					<ChevronRight width={20} height={20} />
					<Button<ButtonType.TEXT>
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Portfolio details',
							size:    Size.SMALL,
							color:   isOnPortfolioDetailsPage && !isOnSubPortfolioDetailsPage ?
								Color.NON_OUT_BLUE :
								Color.NONE,
						}}
					/>
				</Link>
			)}
			{subportfolioId && (
				<Link to={`${RouterKeys.PORTFOLIO}/${id}/${RouterKeys.SUB_PORTFOLIO}/${subportfolioId}`} className={styles.linkHeader}>
					<ChevronRight width={20} height={20} />
					<Button<ButtonType.TEXT>
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Sub-portfolio details',
							size:    Size.SMALL,
							color:   isOnSubPortfolioDetailsPage ?
								Color.NON_OUT_BLUE :
								Color.NONE,
						}}
					/>
				</Link>
			)}
		</div>
	)
}