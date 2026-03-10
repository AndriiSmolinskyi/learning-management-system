import React from 'react'

import {
	BankSelect,
	EntityIcon,
	BankIcon,
	EntitySelect,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Color, SelectComponent, Size,
} from '../../../../../../shared/components'

import {
	useBankListByPortfolioId,
	useEntityListByPortfolioId,
} from '../../../../../../shared/hooks'
import type {
	IOptionType, SelectValueType,
} from '../../../../../../shared/types'
import type {
	CreateAccountProps, SelectedEntity,
} from './add-account.types'

import * as styles from './account.styles'

type Props = {
	onClose: () => void
	setCreateAccountProps: React.Dispatch<React.SetStateAction<CreateAccountProps | undefined>>
	portfolioId: string
	handleAccountDrawerOpen: () => void
	createAccountProps: CreateAccountProps | undefined
 }

export const AddAccountDialog: React.FC<Props> = ({
	onClose,
	setCreateAccountProps,
	portfolioId,
	handleAccountDrawerOpen,
	createAccountProps,
},) => {
	const [entitySelect, setEntitySelect,] = React.useState<IOptionType<SelectedEntity>>()
	const [bankSelect, setBankSelect,] = React.useState<IOptionType<CreateAccountProps> | null>()

	const {
		data: entityList,
	} = useEntityListByPortfolioId(portfolioId,)
	const {
		data: bankList,
	} = useBankListByPortfolioId(portfolioId,)

	const handleEntitySelectChange = (data: SelectValueType<SelectedEntity>,): void => {
		const {
			value,
			label,
		} = data as IOptionType<SelectedEntity>
		setEntitySelect({
			label, value,
		},)
		setBankSelect(null,)
		setCreateAccountProps(undefined,)
	}

	const handleBankSelectChange = (data: SelectValueType<CreateAccountProps>,): void => {
		const {
			value,
			label,
		} = data as IOptionType<CreateAccountProps>
		setBankSelect({
			label, value,
		},)
		setCreateAccountProps(value,)
	}

	const entityOpions: Array<IOptionType<SelectedEntity>> = entityList?.map((entity,) => {
		return {
			value: {
				entityId:         entity.id,
				portfolioId:      entity.portfolioId,
				portfolioDraftId: entity.portfolioDraftId,
			},
			label: entity.name,
		}
	},) ?? []

	const bankOpions: Array<IOptionType<CreateAccountProps>> = bankList?.filter((bank,) => {
		return bank.entityId === entitySelect?.value.entityId
	},)
		.map((bank,) => {
			return {
				value: {
					bankId:           bank.id,
					entityId:         bank.entityId,
					portfolioId:      bank.portfolioId,
					portfolioDraftId: bank.portfolioDraftId,
				},
				label: `${bank.bankName} (${bank.branchName})`,
			}
		},) ?? []
	return (
		<div className={styles.modalWrapper}>
			<div className={styles.iconsBlockWrapper}>
				<EntityIcon/><BankIcon/>
			</div>
			<p className={styles.selectText}>Select entity and bank</p>
			<p className={styles.infoText}>Please choose an entity and bank from the list to continue with bank account creation.</p>
			<div className={styles.selectWrapper}>
				<SelectComponent<SelectedEntity>
					value={entitySelect}
					placeholder='Select entity'
					isMulti={false}
					options={entityOpions}
					leftIcon={
						<EntitySelect width={18} height={18} />
					}
					onChange={handleEntitySelectChange}
				/>
				<SelectComponent<CreateAccountProps>
					value={bankSelect}
					placeholder='Select bank'
					isMulti={false}
					options={bankOpions}
					isDisabled={!entitySelect}
					leftIcon={
						<BankSelect width={18} height={18} />
					}
					onChange={handleBankSelectChange}
				/>
			</div>
			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						onClose()
						setCreateAccountProps(undefined,)
						setEntitySelect(undefined,)
						setBankSelect(undefined,)
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
					disabled={!portfolioId || !createAccountProps}
					className={styles.buttonSelect}
					onClick={() => {
						handleAccountDrawerOpen()
						setEntitySelect(undefined,)
						setBankSelect(undefined,)
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