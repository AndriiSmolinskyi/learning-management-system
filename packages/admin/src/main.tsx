import React from 'react'
import ReactDOM from 'react-dom/client'
import {
	Portal,
} from '@blueprintjs/core'
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
import './translations/i18next'
import '../src/shared/styles/font-faces.css'
import './shared/styles/main'
import './shared/styles/theme'
import '@blueprintjs/core/lib/css/blueprint.css'
import Router from './router/router'
import * as styles from './shared/styles/main'

ReactDOM.createRoot(document.getElementById('root',)!,).render(
	<Portal className={styles.portal}>
		<QueryProvider>
			<AuthContextProvider>
				<LocalizationProvider dateAdapter={AdapterDateFns} localeText={{
					okButtonLabel:     'Apply',
					cancelButtonLabel: 'Cancel',
				}}>
					<Router/>
				</LocalizationProvider>
			</AuthContextProvider>
		</QueryProvider>
	</Portal>,
)