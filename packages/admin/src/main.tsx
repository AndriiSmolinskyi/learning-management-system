import React from 'react'
import ReactDOM from 'react-dom/client'
import {
	Portal,
} from '@blueprintjs/core'
import Router from './router/router'
import ErrorBoundary from './modules/error-boundary/error-boundary'
import {
	AdapterDateFns,
} from '@mui/x-date-pickers/AdapterDateFnsV3'
import {
	LocalizationProvider,
} from '@mui/x-date-pickers'
import {
	AuthContextProvider,
} from './providers/auth-context.provider'
import {
	QueryProvider,
} from './providers/query.provider'
import {
	MsalProvider,
} from './providers/msal.provider'
import '../src/translations/i18next'
import '../src/shared/styles/font-faces.css'
import '../src/shared/styles/main'
import '../src/shared/styles/theme'
import '@blueprintjs/core/lib/css/blueprint.css'

import {
	WebSocketProvider,
} from './providers/websocket.provider'
import {
	UmamiTracker,
} from './providers/umami.provider'

import * as styles from './shared/styles/main'

ReactDOM.createRoot(document.getElementById('root',)!,).render(
	<ErrorBoundary>
		<UmamiTracker />
		<Portal className={styles.portal}>
			<QueryProvider>
				<MsalProvider>
					<AuthContextProvider>
						<LocalizationProvider dateAdapter={AdapterDateFns} localeText={{
							okButtonLabel:     'Apply',
							cancelButtonLabel: 'Cancel',
						}}>
							<WebSocketProvider>
								<Router />
							</WebSocketProvider>
						</LocalizationProvider>
					</AuthContextProvider>
				</MsalProvider>
			</QueryProvider>
		</Portal>
	</ErrorBoundary>,
)