import React from 'react'

import {
	BankSelect,
	EntityIcon,
	BankIcon,
	EntitySelect,
	AccountIcon,
} from '../../../../../../assets/icons'
import accountIcon from '../../../../../../assets/images/account-image.png'
import {
	Button, ButtonType, Color, SelectComponent, Size,
} from '../../../../../../shared/components'

import {
	useBankListByPortfolioId,
	useEntityListByPortfolioId,
	useAccountListByPortfolioId,
} from '../../../../../../shared/hooks'
import type {
	IOptionType,
	SelectValueType,
} from '../../../../../../shared/types'
import type {
	CreateAssetProps,
	SelectedEntity,
	SelectedBank,
} from './asset.types'

import * as styles from './asset.styles'

type Props = {
	onClose: () => void
	setCreateAssetProps: React.Dispatch<React.SetStateAction<CreateAssetProps | undefined>>
	portfolioId: string
	handleAssetDrawerOpen: () => void
	createAssetProps: CreateAssetProps | undefined
 }

export const AddAssetDialog: React.FC<Props> = ({
	onClose,
	setCreateAssetProps,
	portfolioId,
	handleAssetDrawerOpen,
	createAssetProps,
},) => {
	const [entitySelect, setEntitySelect,] = React.useState<IOptionType<SelectedEntity>>()
	const [bankSelect, setBankSelect,] = React.useState<IOptionType<SelectedBank> | null>()
	const [accountSelect, setAccountSelect,] = React.useState<IOptionType<CreateAssetProps> | null>()

	const {
		data: entityList,
	} = useEntityListByPortfolioId(portfolioId,)
	const {
		data: bankList,
	} = useBankListByPortfolioId(portfolioId,)
	const {
		data: accountList,
	} = useAccountListByPortfolioId(portfolioId,)

	const handleEntitySelectChange = (data: SelectValueType<SelectedEntity>,): void => {
		const {
			value,
			label,
		} = data as IOptionType<SelectedEntity>
		setEntitySelect({
			label, value,
		},)
		setBankSelect(null,)
		setAccountSelect(null,)
		setCreateAssetProps(undefined,)
	}

	const handleBankSelectChange = (data: SelectValueType<SelectedBank>,): void => {
		const {
			value,
			label,
		} = data as IOptionType<SelectedBank>
		setBankSelect({
			label, value,
		},)
		setAccountSelect(null,)
		setCreateAssetProps(undefined,)
	}

	const handleAccountSelectChange = (data: SelectValueType<CreateAssetProps>,): void => {
		const {
			value,
			label,
		} = data as IOptionType<CreateAssetProps>
		setAccountSelect({
			label, value,
		},)
		setCreateAssetProps(value,)
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

	const bankOpions: Array<IOptionType<SelectedBank>> = bankList?.filter((bank,) => {
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

	const accountOpions: Array<IOptionType<CreateAssetProps>> = accountList?.filter((account,) => {
		return account.bankId === bankSelect?.value.bankId
	},)
		.map((account,) => {
			return {
				value: {
					accountId:        account.id,
					bankId:           account.bankId,
					entityId:         account.entityId,
					portfolioId:      account.portfolioId,
					portfolioDraftId: account.portfolioDraftId,
				},
				label: account.accountName,
			}
		},) ?? []
	return (
		<div className={styles.modalWrapper}>
			<div className={styles.iconsBlockWrapper}>
				<EntityIcon/><BankIcon/><img src={accountIcon} alt='account' className={styles.accountIcon}/>
			</div>
			<p className={styles.selectText}>Select entity, bank and account</p>
			<p className={styles.infoText}>Please choose an entity, bank and bank account to continue with asset creation.</p>
			<div className={styles.selectWrapper}>
				<SelectComponent<SelectedEntity>
					value={entitySelect}
					placeholder='Select entity'
					options={entityOpions}
					leftIcon={
						<EntitySelect className={styles.selectIcon(true,)} width={18} height={18} />
					}
					onChange={handleEntitySelectChange}
				/>
				<SelectComponent<SelectedBank>
					value={bankSelect}
					placeholder='Select bank'
					options={bankOpions}
					isDisabled={!entitySelect}
					leftIcon={
						<BankSelect className={styles.selectIcon(Boolean(entitySelect,),)} width={18} height={18} />
					}
					onChange={handleBankSelectChange}
				/>
				<SelectComponent<CreateAssetProps>
					value={accountSelect}
					placeholder='Select bank account'
					options={accountOpions}
					isDisabled={!bankSelect}
					leftIcon={
						<AccountIcon className={styles.selectIcon(Boolean(bankSelect,),)} width={18} height={18} />
					}
					onChange={handleAccountSelectChange}
				/>
			</div>
			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						onClose()
						setCreateAssetProps(undefined,)
						setEntitySelect(undefined,)
						setBankSelect(undefined,)
						setAccountSelect(undefined,)
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
					disabled={!portfolioId || !createAssetProps}
					className={styles.buttonSelect}
					onClick={() => {
						handleAssetDrawerOpen()
						onClose()
						setEntitySelect(undefined,)
						setBankSelect(undefined,)
						setAccountSelect(undefined,)
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