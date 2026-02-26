/* eslint-disable no-console */
import React, {
	useState,
} from 'react'
import * as styles from './discoer.style'
import {
	Line,
} from './line.component'
import {
	Copy,
} from '../../../assets/icons'

export const Discover: React.FC = () => {
	const [token,] = useState('FanwAcjJV9eWRCsFr21Csa7s7RarQPsUNTuNPLPqpump',)
	const [copied, setCopied,] = useState(false,)

	const handleCopy = (): void => {
		navigator.clipboard
			.writeText(token,)
			.then(() => {
				setCopied(true,)
				setTimeout(() => {
					setCopied(false,)
				}, 1000,)
			},)
			.catch((err,) => {
				console.error(err,)
			},)
	}

	return (
		<div className={styles.discoverWrapper} id='discovery'>
			<div className={styles.main}>
				<div className={styles.tittle}>
					<h2>
						Discover <span>PumpPOla</span>
					</h2>
				</div>
				<Line />
				<div className={styles.text}>
					<p>
						PUMPPOLA token is the invisible current behind the can - the magnetic pulse that draws millions, the fizzy spark that sets it apart, and the digital emblem that makes every sip unforgettable. Experience it yourself.
					</p>
				</div>
				<div className={styles.inputWrapper}>
					<label className={styles.label} htmlFor='fname'>Token Address</label>
					<div className={styles.wr}>
						<div className={styles.form}>
							<input
								className={styles.input}
								type='text'
								id='fname'
								name='fname'
								value={token}
								readOnly
							/>
						</div>
						<button onClick={handleCopy} className={styles.copy}>
							<Copy className={styles.links} width={36} height={36} />
							{copied ?
								'Copied' :
								'Copy'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
