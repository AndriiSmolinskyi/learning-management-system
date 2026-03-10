/* eslint-disable complexity */
import React from 'react'
import {
	useLocation,
	useNavigate,
} from 'react-router-dom'
import {
	cx,
} from '@emotion/css'

import {
	Bell,
	Book,
	Briefcase,
	Coins,
	Folder,
	Home,
	Wallet,
} from '../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../button'
import {
	Tooltip,
} from '../tooltip'
import {
	ClientsButton,
	OperationsButton,
	ProfileButton,
} from './components/nav-buttons'

import {
	RouterKeys,
} from '../../../router/keys'
import {
	useSignOut,
} from '../../../modules/auth/hooks'

import {
	buttonWrapper,
	container,
	currentBtn,
	sidebarBtn,
} from './side-bar.styles'
import {
	useUserStore,
} from '../../../store/user.store'
import {
	Roles,
} from '../../../shared/types'
import {
	useCustomReportStore,
} from '../../../modules/reports/custom-report/custom-report.store'
import {
	SettingsButton,
} from './components/nav-buttons/settings-button.component'
import * as styles from './side-bar.styles'

export const SideBar: React.FC = () => {
	const [isAnalytic, setAnalytic,] = React.useState<boolean>(false,)

	const navigate = useNavigate()
	const location = useLocation()
	const profileRef = React.useRef(null,)
	const docsRef = React.useRef(null,)
	const {
		handleSignOut,
	} = useSignOut()
	const {
		userInfo,
	} = useUserStore()
	const {
		resetCustomReportStore,
	} = useCustomReportStore()

	React.useEffect(() => {
		const hasPermission = userInfo.roles.some((role,) => {
			return [Roles.INVESTMEN_ANALYST,].includes(role,)
		},)
		if (hasPermission) {
			setAnalytic(true,)
		} else {
			setAnalytic(false,)
		}
	}, [userInfo, setAnalytic,],)

	return (
		<aside ref={profileRef}>
			<div className={container} >
				<ProfileButton
					handleSignOut={handleSignOut}
					profileRef={profileRef}
				/>
				<div className={buttonWrapper}>
					<Tooltip text='Analytics'>
						<Button<ButtonType.ICON>
							className={cx(sidebarBtn, location.pathname.includes(RouterKeys.ANALYTICS,) && currentBtn,)}
							additionalProps={{
								icon:    <Home width={20} height={20}/>,
								btnType:  ButtonType.ICON,
								size:     Size.MEDIUM,
								color:    Color.MICRO,
							}}
							onClick={() => {
								navigate(RouterKeys.ANALYTICS_OVERVIEW,)
							}}
						/>
					</Tooltip>
					<Tooltip text='Notifications'>
						<Button<ButtonType.ICON>
							className={sidebarBtn}
							additionalProps={{
								icon:    <Bell width={20} height={20}/>,
								btnType:  ButtonType.ICON,
								size:     Size.MEDIUM,
								color:    Color.MICRO,
							}}
						/>
					</Tooltip>
				</div>
				<div className={buttonWrapper}>
					{!isAnalytic && <ClientsButton
						current={
							location.pathname.includes(RouterKeys.CLIENTS,) ||
							location.pathname.includes(RouterKeys.PORTFOLIO,)
						}
					/>}
					{isAnalytic && <Tooltip text='Portfolio'>
						<Button<ButtonType.ICON>
							className={cx(sidebarBtn, location.pathname.includes(RouterKeys.PORTFOLIO,) && currentBtn,)}
							additionalProps={{
								icon:    <Briefcase width={20} height={20} />,
								btnType:  ButtonType.ICON,
								size:     Size.MEDIUM,
								color:    Color.MICRO,
							}}
							onClick={() => {
								navigate(RouterKeys.PORTFOLIO,)
							}}
						/>
					</Tooltip>}
					<OperationsButton
						current={location.pathname.includes(RouterKeys.OPERATIONS,)}
					/>
				</div>
				<div className={buttonWrapper} ref={docsRef}>
					{!isAnalytic && <Tooltip text='Payments'>
						<Button<ButtonType.ICON>
							className={sidebarBtn}
							additionalProps={{
								icon:    <Wallet width={20} height={20}/>,
								btnType:  ButtonType.ICON,
								size:     Size.MEDIUM,
								color:    Color.MICRO,
							}}
						/>
					</Tooltip>}
					<Tooltip text='Reports'>
						<Button<ButtonType.ICON>
							className={cx(sidebarBtn, location.pathname.includes(RouterKeys.REPORTS,) && currentBtn,)}
							additionalProps={{
								icon:    <Book width={20} height={20}/>,
								btnType:  ButtonType.ICON,
								size:     Size.MEDIUM,
								color:    Color.MICRO,
							}}
							onClick={() => {
								navigate(RouterKeys.REPORTS, {
									state: null,
								},)
								resetCustomReportStore()
							}}
						/>
					</Tooltip>
					<Tooltip text='Documents'>
						<Button<ButtonType.ICON>
							className={sidebarBtn}
							additionalProps={{
								icon:    <Folder width={20} height={20}/>,
								btnType:  ButtonType.ICON,
								size:     Size.MEDIUM,
								color:    Color.MICRO,
							}}
						/>
					</Tooltip>
				</div>
				<div className={buttonWrapper}>
					{!isAnalytic && <Tooltip text='Budget managment'>
						<Button<ButtonType.ICON>
							className={cx(sidebarBtn, location.pathname.includes(RouterKeys.BUDGET_MANAGMENT,) && currentBtn,)}
							onClick={() => {
								navigate(RouterKeys.BUDGET_MANAGMENT,)
							}}
							additionalProps={{
								icon:    <Coins width={20} height={20}/>,
								btnType:  ButtonType.ICON,
								size:     Size.MEDIUM,
								color:    Color.MICRO,
							}}
						/>
					</Tooltip>}
				</div>
				<div className={styles.buttonWrapperDown}>
					<SettingsButton
						current={location.pathname.includes(RouterKeys.SETTINGS,)}
					/>
				</div>

			</div>
		</aside>
	)
}
