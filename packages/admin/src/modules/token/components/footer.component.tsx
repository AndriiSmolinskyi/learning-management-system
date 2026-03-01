import React from 'react'
import {
	LinkButton,
} from '../../../shared/components/link-button/link-button.component'
import {
	TWITTER_LINK,
	TELEGRAM_LINK,
} from '../token.constants'
import * as styles from './footer.style'

export const Footer: React.FC = () => {
	return (
		<div>
			<div className={styles.footerContainer}>
				<div>
					<span className={styles.footerTitle}>PUMPPOLA</span>
					<p className={styles.footerText}>Just like Coca-Cola in 1886, PUMPPOLA in 2025. We’re entering a market of monopolists becoming the winners. Join us, win with us.</p>
				</div>
				<div className={styles.footerSocial}>
					<h3 className={styles.footerSubTitle}>Links</h3>
					<LinkButton text={'Home'} href='#home'/>
					<LinkButton text={'Live'} href='#live'/>
					<LinkButton text={'Discovery'}href='#discovery'/>
					<LinkButton text={'Partners'}href='#partners' />
				</div>
				<div className={styles.footerSocial}>
					<h3 className={styles.footerSubTitle}>Socials</h3>
					<LinkButton text={'X'}
						target='_blank'
						rel='noopener noreferrer'
						href={TWITTER_LINK}
					/>
					<LinkButton
						target='_blank'
						rel='noopener noreferrer'
						href={TELEGRAM_LINK}
						text={'Telegram'} />
				</div>
			</div>
			<div className={styles.footerBottom}>
				<div className={styles.footerBottomBlock}>
					<span className={styles.rights}>© 2025 PUMPPOLA. All rights reserved.</span>

				</div>
			</div>
		</div>
	)
}