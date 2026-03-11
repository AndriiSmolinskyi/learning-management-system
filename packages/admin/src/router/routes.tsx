import * as React from 'react'
import {
	Navigate,
	Outlet,
	Route,
} from 'react-router-dom'

import {
	RouterKeys,
} from './keys'

const Login = React.lazy(async() => {
	return import('../modules/auth/login.component')
},)
const Home = React.lazy(async() => {
	return import('../modules/auth/login.component')
},)

export const publicRoutes = (
	<>
		<Route path={RouterKeys.LOGIN} element={<Login />}/>
		<Route path={RouterKeys.ALL_MATCH} element={<Navigate to={RouterKeys.LOGIN} />} />
	</>
)

export const privateRoutes = (
	<Route>
		<Route path={RouterKeys.ALL_MATCH} element={<Navigate to={RouterKeys.HOME} />} />
		<Route path={RouterKeys.HOME} element={<Home />}/>
	</Route>
)
