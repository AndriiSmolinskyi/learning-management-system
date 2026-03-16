import React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	CollapseArrowIcon,
} from '../../../assets/icons'
import {
	toggleState,
} from '../../utils'

import * as styles from './form-collapse.styles'

type Props = {
	children: React.ReactNode
	isOpen: boolean
	title: string | React.ReactNode
	info?: Array<string | undefined>
	onClose: React.Dispatch<React.SetStateAction<boolean>>
	className?: string
	details?: string
}

export const FormCollapse: React.FC<Props> = ({
	children,
	isOpen,
	info,
	title,
	onClose,
	className,
	details,
},) => {
	return (
		<div className={cx(styles.collapseBlock(isOpen && Boolean(children,),), className,)}>
			<div className={styles.collapseHeaderBlock}>
				<div className={styles.topInfo}>
					<p className={styles.topInfoText}>{title}</p>
					{details && <p className={styles.details}>{details}</p>}
					{info?.filter((content: string | undefined,) => {
						return Boolean(content?.trim(),)
					},).map((content, i,) => {
						return (
							<span key={i} className={styles.bottomInfoText}>{content}</span>
						)
					},)}
				</div>
				<button
					className={styles.collapseArrowButton(isOpen && Boolean(children,),)}
					type='button'
					onClick={() => {
						toggleState(onClose,)()
					}}
				>
					<CollapseArrowIcon/>
				</button>
			</div>
			<div className={styles.fieldsBlock(isOpen && Boolean(children,), title === 'Documents',)}>
				{children}
			</div>
		</div >
	)
}