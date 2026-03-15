import * as React from 'react'
import {
	Navigate,
	Route,
} from 'react-router-dom'

import {
	RouterKeys,
} from './keys'

// public routes
const Login = React.lazy(async() => {
	return import('../modules/auth/components/login.component')
},)
const ForgotPassword = React.lazy(async() => {
	return import('../modules/auth/components/forgot-password.component')
},)
const ResetPassword = React.lazy(async() => {
	return import('../modules/auth/components/reset-password.component')
},)

// private routes
const PagesLayout = React.lazy(async() => {
	return import('../shared/components/pages-layout')
},)
const Home = React.lazy(async() => {
	return import('../modules/home/home.component')
},)
const Students = React.lazy(async() => {
	return import('../modules/students/students.component')
},)

export const publicRoutes = (
	<>
		<Route path={RouterKeys.ALL_MATCH} element={<Navigate to={RouterKeys.LOGIN} />} />
		<Route path={RouterKeys.LOGIN} element={<Login />}/>
		<Route path={RouterKeys.FORGOT_PASSWORD} element={<ForgotPassword />} />
		<Route path={RouterKeys.RESET_PASSWORD} element={<ResetPassword />}/>
	</>
)

export const privateRoutes = (
	<Route element={<PagesLayout />}>
		<Route path={RouterKeys.ALL_MATCH} element={<Navigate to={RouterKeys.HOME} />} />
		<Route path={RouterKeys.HOME} element={<Home />} />
		<Route path={RouterKeys.STUDENTS} element={<Students />}/>
	</Route>
)
