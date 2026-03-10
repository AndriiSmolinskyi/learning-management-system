import React from 'react'

import type {
	IAuthContextValue,
} from '../../providers/auth-context.provider'
import {
	AuthContext,
} from '../../providers/auth-context.provider'

export const useAuth = (): IAuthContextValue => {
	const context = React.useContext(AuthContext,)
	if (!context) {
		throw new Error('useAuth must be used within an AuthContextProvider',)
	}
	return context
}