import * as React from 'react'

import {
	Check,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import * as styles from './add-transaction.style'

type Props = {
	onExit: () => void
	toggleRelationsVisible: (id: string) => void
	transactionTypeId: string | undefined
	isRelationsOpen?: boolean
}

export const SuccessCreateDialog: React.FC<Props> = ({
	onExit,
	toggleRelationsVisible,
	transactionTypeId,
	isRelationsOpen,
},) => {
	return (
		<div className={styles.successModalContainer}>
			<Check width={42} height={42}/>
			<h4>New transaction settings added!</h4>
			{!isRelationsOpen &&
				<p className={styles.parText}>Do you want to link this transaction to related assets or other transactions?</p>
			}
			{!isRelationsOpen &&
				<div className={styles.buttonBlock}>
					<Button<ButtonType.TEXT>
						onClick={onExit}
						className={styles.button}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Later',
							size:     Size.MEDIUM,
							color:    Color.SECONDRAY_GRAY,
						}}
					/>
					<Button<ButtonType.TEXT>
						className={styles.button}
						onClick={() => {
							if (transactionTypeId) {
								toggleRelationsVisible(transactionTypeId,)
								onExit()
							}
						}}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Add relations',
							size:     Size.MEDIUM,
							color:    Color.BLUE,
						}}
					/>
				</div>
			}
			{isRelationsOpen &&
				<Button<ButtonType.TEXT>
					onClick={onExit}
					className={styles.buttonOk}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'OK',
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_GRAY,
					}}
				/>
			}

		</div>
	)
}