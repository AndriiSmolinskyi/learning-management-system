import React from 'react'
import ReactDOM from 'react-dom/client'
import ErrorBoundary from './modules/error-boundary/error-boundary'
import Router from './router/router'
import './shared/styles/theme'
import './shared/styles/main'

ReactDOM.createRoot(document.getElementById('root',)!,).render(
	<ErrorBoundary>
		<Router/>
	</ErrorBoundary>,
)
