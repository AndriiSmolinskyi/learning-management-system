import React from 'react'
import {
	Outlet,
} from 'react-router-dom'

import {
	SideBar,
} from '../side-bar'
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

const PagesLayout: React.FunctionComponent = () => {
	const {
		visible,
	} = useBackdrop()

	return (
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
	)
}

export default PagesLayout