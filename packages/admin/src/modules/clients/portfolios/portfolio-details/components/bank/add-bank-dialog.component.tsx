import React from 'react'

import {
	EntityIcon,
	EntitySelect,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Color, SelectComponent, Size,
} from '../../../../../../shared/components'

import {
	useEntityListByPortfolioId,
} from '../../../../../../shared/hooks'
import type {
	IOptionType, SelectValueType,
} from '../../../../../../shared/types'
import type {
	CreateBankProps,
} from './add-bank.types'
import * as styles from './bank.styles'

type Props = {
	onClose: () => void
	setCreateBankProps: React.Dispatch<React.SetStateAction<CreateBankProps | undefined>>
	portfolioId: string
	handleBankDrawerOpen: () => void
	createBankProps: CreateBankProps | undefined
 }

export const AddBankDialog: React.FC<Props> = ({
	onClose,
	setCreateBankProps,
	portfolioId,
	handleBankDrawerOpen,
	createBankProps,
},) => {
	const {
		data: entityList,
	} = useEntityListByPortfolioId(portfolioId,)
	const [selectValue, setSelectValue,] = React.useState<IOptionType<CreateBankProps>>()

	const handleSelectChange = (data: SelectValueType<CreateBankProps>,): void => {
		const {
			value,
			label,
		} = data as IOptionType<CreateBankProps>
		setSelectValue({
			label, value,
		},)
		setCreateBankProps(value,)
	}

	const entityOpions: Array<IOptionType<CreateBankProps>> = entityList?.map((entity,) => {
		return {
			value: {
				entityId:         entity.id,
				portfolioId:      entity.portfolioId,
				portfolioDraftId: entity.portfolioDraftId,
			},
			label: entity.name,
		}
	},) ?? []

	return (
		<div className={styles.modalWrapper}>
			<EntityIcon/>
			<p className={styles.selectText}>Select entity</p>
			<p className={styles.infoText}>Please choose an entity from the list to continue with bank account creation.</p>
			<div className={styles.selectWrapper}>
				<SelectComponent<CreateBankProps>
					value={selectValue}
					placeholder='Select entity'
					isMulti={false}
					options={entityOpions}
					leftIcon={
						<EntitySelect width={18} height={18} />
					}
					onChange={handleSelectChange}
				/>
			</div>
			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						onClose()
						setSelectValue(undefined,)
						setCreateBankProps(undefined,)
					}}
					className={styles.buttonSelect}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Cancel',
						size:     Size.MEDIUM,
						color:    Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					disabled={!portfolioId || !createBankProps}
					className={styles.buttonSelect}
					onClick={() => {
						handleBankDrawerOpen()
						setSelectValue(undefined,)
						onClose()
					} }
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