import React from 'react'
import {
	MsalProvider as Provider,
} from '@azure/msal-react'
import type {
	Configuration,
	PopupRequest,
} from '@azure/msal-browser'
import {
	PublicClientApplication,
} from '@azure/msal-browser'

interface IProps {
	children: React.ReactNode;
}

const {
	VITE_CLIENT_ID,
	VITE_TENANT_ID,
	VITE_CLOUD_INSTANCE,
	VITE_REDIRECT_URI,
} = import.meta.env

export const msalConfig: Configuration = {
	auth: {
		clientId:              VITE_CLIENT_ID,
		authority:             `${VITE_CLOUD_INSTANCE}/${VITE_TENANT_ID}`,
		redirectUri:           VITE_REDIRECT_URI,
		postLogoutRedirectUri: VITE_REDIRECT_URI,
	},
	cache: {
		cacheLocation:          'sessionStorage',
		storeAuthStateInCookie: true,
	},
}

export const readRequest: PopupRequest = {
	scopes: ['User.Read',],
	prompt: 'select_account',
}

const msalInstance = new PublicClientApplication(msalConfig,)

export const MsalProvider: React.FC<IProps> = ({
	children,
},) => {
	return (
		<Provider instance={msalInstance}>
			{children}
		</Provider>
	)
}