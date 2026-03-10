import * as React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	ReactComponent as BriefcaseIcon,
} from '../../../../../../assets/icons/portfolio.svg'
import {
	ReactComponent as UserIcon,
} from '../../../../../../assets/icons/client-list.svg'
import {
	cx,
} from '@emotion/css'
import {
	RouterKeys,
} from '../../../../../../router/keys'

import * as styles from './name-info-block.styles'

interface IPortfolioDetailsHeaderProps{
	clientId: string
	portfolioName?: string
	userData?: {
		lastName: string
		firstName: string
	}
}

export const NameInfoBlock: React.FC<IPortfolioDetailsHeaderProps> = ({
	portfolioName,
	userData,
	clientId,
},) => {
	const navigate = useNavigate()
	const handleNavigateToClient = (): void => {
		navigate(`${RouterKeys.CLIENTS}/${clientId}`,)
	}
	return (
		<div className={styles.mainWrapper}>
			{userData && <p className={styles.nameBlock} onClick={handleNavigateToClient}><UserIcon width={24} height={24}/><span className={styles.nameText}>{userData.firstName} {userData.lastName}</span></p>}
			{portfolioName && <p className={cx(styles.nameBlock, styles.conditionalText,)}><BriefcaseIcon/> <span className={styles.nameText}>{portfolioName}</span></p>}
		</div>
	)
}