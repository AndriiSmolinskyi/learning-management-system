import * as React from 'react'
import {
	BrowserRouter,
	Routes,
} from 'react-router-dom'

import {
	Loader,
} from '../shared/components'

import {
	useAuth,
} from '../shared/hooks/use-auth.hook'

import {
	privateRoutes,
	publicRoutes,
} from './routes'

const Router: React.FunctionComponent = () => {
	const {
		isAuth,
	} = useAuth()
	return (
		<BrowserRouter>
			<React.Suspense fallback={<Loader />}>
				<Routes>
					{
						isAuth ?
							privateRoutes :
							publicRoutes
					}
				</Routes>
			</React.Suspense>
		</BrowserRouter>
	)
}

export default Router
