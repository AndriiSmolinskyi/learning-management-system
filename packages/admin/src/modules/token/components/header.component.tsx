import React, {
	useState,
} from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Telegram, Twitter, PumpFun,
} from '../../../assets/icons'
import {
	Button, ButtonType, Color, Size,
} from '../../../shared/components'
import {
	TOKEN_LINK,
	TWITTER_LINK,
	TELEGRAM_LINK,
} from '../token.constants'
import * as styles from './header.style'

export const Header: React.FC = () => {
	const [isOpen, setIsOpen,] = useState(false,)

	const handleBuyClick = (): void => {
		window.open(TOKEN_LINK, '_blank', 'noopener,noreferrer',)
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<p className={styles.title}>PumpPola</p>

				<div
					className={styles.burger}
					onClick={():void => {
						setIsOpen(!isOpen,)
					}}
				>
					{isOpen ?
						'✕' :
						'☰'}
				</div>
				<div
					className={cx(styles.linkBlock, isOpen && styles.linkBlockActive,)}
				>
					<a className={styles.links} href='#home'>Home</a>
					<a className={styles.links} href='#discovery'>Discovery</a>
					<a className={styles.links} href='#live'>Live</a>
					<a className={styles.links} href='#partners'>Partners</a>
				</div>

				<div className={styles.iconBlock}>
					<a
						target='_blank'
						rel='noopener noreferrer'
						href={TELEGRAM_LINK}
						className={styles.links}
					>
						<Telegram width={20} height={20} />
					</a>
					<a
						target='_blank'
						rel='noopener noreferrer'
						href={TWITTER_LINK}
						className={styles.links}
					>
						<Twitter width={20} height={20} />
					</a>
					<a className={styles.links}
						target='_blank'
						rel='noopener noreferrer'
						href={TOKEN_LINK}
					>
						<PumpFun width={20} height={20} />
					</a>
					<Button
						onClick={handleBuyClick}
						additionalProps={{
							btnType: ButtonType.TEXT,
							text:    'Buy',
							size:    Size.SMALL,
							color:   Color.MAIN_COLOR,
						}}
					/>
				</div>
			</div>
		</div>
	)
}
