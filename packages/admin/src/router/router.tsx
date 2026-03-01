import * as React from 'react'
import {
	BrowserRouter, Routes, Route,
} from 'react-router-dom'
import {
	RouterKeys,
} from './keys'

const Token = React.lazy(async() => {
	return import('../modules/token/token.component')
},)

const Router: React.FunctionComponent = () => {
	return (
		<BrowserRouter>
			<React.Suspense>
				<Routes>
					<Route path= { RouterKeys.ALL_MATCH } element = {< Token />} />
					<Route path={RouterKeys.ROOT} element={<Token />} />
				</Routes>
			</React.Suspense>
		</BrowserRouter>
	)
}

export default Router
