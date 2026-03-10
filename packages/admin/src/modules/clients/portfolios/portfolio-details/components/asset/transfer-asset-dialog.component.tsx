/* eslint-disable complexity */
import React from 'react'

import {
	BankSelect,
	ClientsRoute,
	EntitySelect,
	AccountIcon,
	Briefcase,
} from '../../../../../../assets/icons'
import transferIcon from '../../../../../../assets/images/transfer-icon.png'
import {
	Button, ButtonType, Color, SelectComponent, Size,
} from '../../../../../../shared/components'

import {
	useBankListByPortfolioId,
	useEntityListByPortfolioId,
	useAccountListByPortfolioId,
	usePortfolioListByClientId,
} from '../../../../../../shared/hooks'
import type {
	IAsset,
	IOptionType,
	SelectValueType,
} from '../../../../../../shared/types'
import type {
	CreateAssetProps,
	SelectedEntity,
	SelectedBank,
} from './asset.types'
import {
	useClientsListForSelect,
} from '../../../../../clients/client-profiles/clients/hooks'
import {
	useAnalyticsFilterStore,
} from '../../../../../analytics/analytics-store'
export type SelectOptionType = {
	id: string
	name: string
}

import * as styles from './asset.styles'

type Props = {
	onClose: () => void
	asset: IAsset
	isVersion?: boolean
 }

export const TransferAssetDialog: React.FC<Props> = ({
	onClose,
	asset,
	isVersion,
},) => {
	const [clientSelect, setClientSelect,] = React.useState<IOptionType<SelectOptionType> | undefined>(undefined,)
	const [portfolioSelect, setPortfolioSelect,] = React.useState<IOptionType<SelectOptionType>| undefined>(undefined,)
	const [entitySelect, setEntitySelect,] = React.useState<IOptionType<SelectedEntity> | null>()
	const [bankSelect, setBankSelect,] = React.useState<IOptionType<SelectedBank> | null>()
	const [accountSelect, setAccountSelect,] = React.useState<IOptionType<CreateAssetProps> | null>()

	const {
		data: clientList,
	} = useClientsListForSelect()
	const {
		setAssetTransferProps,
	} = useAnalyticsFilterStore()
	const clientOptions = clientList?.map((client,) => {
		return {
			label: client.label,
			value: {
				name: client.label,
				id:   client.value,
			},
		}
	},) ?? []
	const {
		data: portfolioList,
	} = usePortfolioListByClientId(clientSelect?.value.id,)
	const portfolioOptions = portfolioList?.map((portfolio,) => {
		return {
			label: portfolio.name,
			value: {
				name: portfolio.name,
				id:   portfolio.id,
			},
		}
	},) ?? []
	const {
		data: entityList,
	} = useEntityListByPortfolioId(portfolioSelect?.value.id,)

	const {
		data: bankList,
	} = useBankListByPortfolioId(portfolioSelect?.value.id ?? '',)
	const {
		data: accountList,
	} = useAccountListByPortfolioId(portfolioSelect?.value.id ?? '',)

	const handleClientSelectChange = (data: SelectValueType<SelectOptionType>,): void => {
		const {
			value,
			label,
		} = data as IOptionType<SelectOptionType>
		setClientSelect({
			value,
			label,
		},)
		setPortfolioSelect(undefined,)
		setEntitySelect(null,)
		setBankSelect(null,)
		setAccountSelect(null,)
	}

	const handlePortfolioSelectChange = (data: SelectValueType<SelectOptionType>,): void => {
		const {
			value,
			label,
		} = data as IOptionType<SelectOptionType>
		setPortfolioSelect({
			value,
			label,
		},)
		setEntitySelect(null,)
		setBankSelect(null,)
		setAccountSelect(null,)
	}

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
	}

	const handleAccountSelectChange = (data: SelectValueType<CreateAssetProps>,): void => {
		const {
			value,
			label,
		} = data as IOptionType<CreateAssetProps>
		setAccountSelect({
			label, value,
		},)
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
				label: bank.bankName,
			}
		},) ?? []

	const accountOpions: Array<IOptionType<CreateAssetProps>> = accountList?.filter((account,) => {
		return account.bankId === bankSelect?.value.bankId && account.id !== asset.accountId
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
	const isDataSelected = Boolean(clientSelect?.value.id &&
		portfolioSelect?.value.id &&
		entitySelect?.value.entityId &&
		bankSelect?.value.bankId &&
		accountSelect?.value.accountId,)

	const handleAssetTransfer = async(): Promise<void> => {
		if (!clientSelect || !portfolioSelect || !entitySelect || !bankSelect || !accountSelect) {
			return
		}
		const parsedPayload = JSON.parse(asset.payload,)
		const assetData = {
			id:          asset.groupId ?
				asset.groupId :
				asset.id,
			accountId:            accountSelect.value.accountId,
			bankId:               bankSelect.value.bankId,
			entityId:             entitySelect.value.entityId,
			portfolioId:          portfolioSelect.value.id,
			clientId:             clientSelect.value.id,
			isin:                 parsedPayload.isin,
			assetName:            asset.assetName,
			security:             parsedPayload.security,
			units:                parsedPayload.units,
			totalUnitsToTransfer: asset.totalUnitsToTransfer,
		}
		setAssetTransferProps(assetData,)
		onClose()
	}

	return (
		<div className={styles.modalWrapper} onClick={(e,) => {
			e.stopPropagation()
		}}>
			<div className={styles.iconsBlockWrapper}>
				<img src={transferIcon} alt='transfer' className={styles.transferIcon}/>
			</div>
			<p className={styles.selectText}>Select transfer destination</p>
			<p className={styles.infoText}>Please choose the destination for transferring this Asset.</p>
			<div className={styles.selectWrapper}>
				<SelectComponent<SelectOptionType>
					value={clientSelect}
					placeholder='Select client'
					options={clientOptions}
					isDisabled={clientOptions.length === 0}
					leftIcon={
						<ClientsRoute className={styles.selectIcon(true,)} width={18} height={18} />
					}
					onChange={handleClientSelectChange}
				/>
				<SelectComponent<SelectOptionType>
					key={portfolioSelect?.value.id}
					value={portfolioSelect}
					placeholder='Select portfolio or sub-portfolio'
					options={portfolioOptions}
					isDisabled={portfolioOptions.length === 0}
					leftIcon={
						<Briefcase className={styles.selectIcon(true,)} width={18} height={18} />
					}
					onChange={handlePortfolioSelectChange}
				/>
				<SelectComponent<SelectedEntity>
					value={entitySelect}
					placeholder='Select entity'
					isDisabled={!portfolioSelect}
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
					disabled={!isDataSelected}
					className={styles.buttonSelect}
					onClick={() => {
						handleAssetTransfer()
						setClientSelect(undefined,)
						setPortfolioSelect(undefined,)
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