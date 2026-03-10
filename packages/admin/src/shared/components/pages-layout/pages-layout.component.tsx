import React from 'react'
import {
	Outlet,
} from 'react-router-dom'
import {
	SideBar,
} from '../side-bar'
import {
	useAuth, useNetworkStatus,
} from '../../hooks'
import {
	AxiosEvent,
} from '../../constants'
import {
	useBackdrop,
} from '../../../store/backdrop.store'

import {
	backdrop,
	container,
	block,
	loader,
	loaderWrapper,
} from './pages-layout.styles'
import {
	useUser,
} from '../../hooks/use-user.hook'
import {
	useAutoLogout,
} from '../../../modules/auth/hooks'
import {
	ConnectionErrorPage,
} from '../connection-error/connection-error.component'

const PagesLayout: React.FunctionComponent = () => {
	const {
		checkAuth,
	} = useAuth()
	const {
		visible,
	} = useBackdrop()
	useUser()
	useAutoLogout()
	const network = useNetworkStatus()

	React.useEffect(() => {
		window.addEventListener(AxiosEvent.UNAUTHORIZED, checkAuth,)

		return () => {
			window.removeEventListener(AxiosEvent.UNAUTHORIZED, checkAuth,)
		}
	}, [],)

	return network ?
		(
			<main className={container}>
				{visible && (
					<div className={backdrop}/>
				)}
				<SideBar />
				<div className={block}>
					<React.Suspense fallback={<div className={loaderWrapper}><div className={loader}/></div>}>
						<Outlet />
					</React.Suspense>
				</div>
			</main>
		) :
		(<ConnectionErrorPage/>)
}

export default PagesLayout