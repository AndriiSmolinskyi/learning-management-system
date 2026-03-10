import * as React from 'react'

import {
	cx,
} from '@emotion/css'
import {
	AddPortfolioClient,
} from '../../../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	SelectComponent,
	Size,
} from '../../../../../../shared/components'
import {
	ClientsRoute,
} from '../../../../../../assets/icons'
import {
	useClientsListForSelect,
} from '../../../../../clients/client-profiles/clients/hooks'
import {
	CloseXIcon,
} from '../../../../../../assets/icons'
import type {
	IOptionType,
	SelectValueType,
} from '../../../../../../shared/types'

import * as styles from './add-portfolio-content.styles'

interface IAddPortfolioContentProps {
    onClose: () => void
    setClientId: (id: string) => void
    handleChooseClient: () => void
	clientId: string
}
export const AddPortfolioContent: React.FC<IAddPortfolioContentProps> = ({
	onClose,
	setClientId,
	handleChooseClient,
	clientId,
},) => {
	const {
		data: clientList,
	} = useClientsListForSelect()
	const handleSelectChange = (data: SelectValueType,): void => {
		const {
			value,
		} = data as IOptionType
		setClientId(value,)
	}
	return (
		<div className={styles.modalWrapper}>
			<CloseXIcon className={styles.closeIcon} onClick={onClose}/>
			<AddPortfolioClient/>
			<p className={styles.selectText}>Select client</p>
			<p className={styles.infoText}>Please choose a client from the list to continue with portfolio creation.</p>
			{clientList && <div className={styles.selectWrapper}>
				<SelectComponent
					placeholder='Select client'
					isMulti={false}
					options={clientList}
					leftIcon={<ClientsRoute width={18} height={18} />}
					onChange={handleSelectChange}
					isCreateble={Boolean(true,)}
					isSearchable
				/>
			</div>}
			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					disabled={false}
					onClick={onClose}
					className={cx(styles.button, styles.cancelButton,)}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Cancel',
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_COLOR,
					}}
				/>
				<Button<ButtonType.TEXT>
					disabled={!clientId}
					onClick={handleChooseClient}
					className={styles.button}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Continue',
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>

		</div>
	)
}