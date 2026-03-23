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
const Group = React.lazy(async() => {
	return import('../modules/groups/groups.component')
},)
const GroupDetailsPage = React.lazy(async() => {
	return import('../modules/groups/components/group-details-page.component')
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
		<Route path={RouterKeys.ALL_MATCH} element={<Navigate to={RouterKeys.GROUPS} />} />
		<Route path={RouterKeys.GROUPS} element={<Group />} />
		<Route path={RouterKeys.GROUP} element={<GroupDetailsPage />} />
	</Route>
)
