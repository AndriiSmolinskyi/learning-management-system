import * as React from 'react'
import {
	BrowserRouter,
	Routes,
} from 'react-router-dom'

import {
	Loader,
} from '../shared/components'

import {
	privateRoutes,
	publicRoutes,
} from './routes'
import {
	useAuth,
} from '../providers/auth-context.provider'

const Router: React.FunctionComponent = () => {
	const {
		isAuth, isLoading,
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
