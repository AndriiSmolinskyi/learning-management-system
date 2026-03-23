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
	Users,
	Book,
	Settings,
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
	RouterKeys,
} from '../../../router/keys'

import {
	buttonWrapper,
	container,
	currentBtn,
	sidebarBtn,
} from './side-bar.styles'
import {
	ProfileButton,
} from './components/nav-buttons'
import {
	useAuth,
} from '../../../providers/auth-context.provider'
import {
	useCustomLessonStore,
} from '../../../modules/lessons/custom-lessons/custom-lessons.store'
import * as styles from './side-bar.styles'

export const SideBar: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const profileRef = React.useRef(null,)

	const {
		logout,
	} = useAuth()

	const handleSignOut = React.useCallback(async(): Promise<void> => {
		await logout()
		navigate(RouterKeys.LOGIN,)
	}, [logout, navigate,],)

	const {
		resetCustomLessonStore,
	} = useCustomLessonStore()

	return (
		<aside ref={profileRef}>
			<div className={container} >
				<ProfileButton
					handleSignOut={handleSignOut}
					profileRef={profileRef}
				/>
				<div className={buttonWrapper}>
					<Tooltip text='Students'>
						<Button<ButtonType.ICON>
							className={cx(sidebarBtn, location.pathname.includes(RouterKeys.STUDENTS,) && currentBtn,)}
							onClick={() => {
								navigate(RouterKeys.STUDENTS,)
							}}
							additionalProps={{
								icon:    <Users width={20} height={20}/>,
								btnType:  ButtonType.ICON,
								size:     Size.MEDIUM,
								color:    Color.MICRO,
							}}
						/>
					</Tooltip>
					<Tooltip text='Lessons'>
						<Button<ButtonType.ICON>
							className={cx(sidebarBtn, location.pathname.includes(RouterKeys.LESSONS,) && currentBtn,)}
							additionalProps={{
								icon:    <Book width={20} height={20}/>,
								btnType:  ButtonType.ICON,
								size:     Size.MEDIUM,
								color:    Color.MICRO,
							}}
							onClick={() => {
								navigate(RouterKeys.LESSONS, {
									state: null,
								},)
								resetCustomLessonStore()
							}}
						/>
					</Tooltip>
					<Tooltip text='Groups'>
						<Button<ButtonType.ICON>
							className={cx(sidebarBtn, location.pathname.includes(RouterKeys.GROUPS,) && currentBtn,)}
							onClick={() => {
								navigate(RouterKeys.GROUPS,)
							}}
							additionalProps={{
								icon:    <Settings width={20} height={20}/>,
								btnType:  ButtonType.ICON,
								size:     Size.MEDIUM,
								color:    Color.MICRO,
							}}
						/>
					</Tooltip>
				</div>
				<div className={styles.buttonWrapperDown}>
					{/* <SettingsButton
						current={location.pathname.includes(RouterKeys.HOME,)}
					/> */}
				</div>

			</div>
		</aside>
	)
}
