import React from 'react'
import {
	Outlet,
} from 'react-router-dom'
import {
	PortfolioNavigate,
} from '../../../modules/clients/portfolios/portfolio/components/navigate-header/navigate-header.component'

import * as styles from './portfolio-layout.styles'

const PortfolioLayout: React.FC = () => {
	return (<div className={styles.layout}>
		<PortfolioNavigate />
		<div>
			<Outlet/>
		</div>
	</div>
	)
}

export default PortfolioLayout
