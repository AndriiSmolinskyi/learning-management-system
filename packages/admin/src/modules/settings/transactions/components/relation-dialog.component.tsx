import * as React from 'react'

import {
	Link,
	TransactionsIcon,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	useTransactionTypeRelations, useChangeRelations,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import {
	useGetTransactionTypeList,
} from '../../../../shared/hooks'
import {
	SelectComponent,
} from '../../../../shared/components'
import {
	AssetNamesType,
} from '../../../../shared/types'
import type {
	IOptionType,
} from '../../../../shared/types'
import {
	renderSelectIcon,
} from '../../../../modules/clients/portfolios/portfolio/components/drawer-content/components/form-asset'
import {
	CreatebleSelectEnum,
} from '../../../../shared/constants'
import type {
	SelectValueType,
} from '../../../../shared/types'
import * as styles from './add-transaction.style'

type Props = {
	onAddTransaction: () => void
	handleCloseRelations: () => void
	transactionTypeId: string | undefined
	transactionRelatedTypeId?: string
}

type TRelationsState = {
  relatedType: IOptionType | null
  asset: IOptionType | null
}

export const RelationsDialog: React.FC<Props> = ({
	onAddTransaction,
	handleCloseRelations,
	transactionTypeId,
	transactionRelatedTypeId,
},) => {
	const {
		data: relationData,
	} = useTransactionTypeRelations(transactionTypeId ?? '',)
	const {
		data: transactionTypeList,
	} = useGetTransactionTypeList()
	const {
		mutateAsync: changeRelations,
	} = useChangeRelations()
	const [relations, setRelations,] = React.useState<TRelationsState>({
		relatedType: relationData?.relatedType as IOptionType<string> | null,
		asset:       relationData?.asset as IOptionType<string> | null,
	},)

	const transactionTypeOptions = transactionTypeList?.filter((type,) => {
		if (!relationData) {
			return true
		}
		return type.id !== relationData.id
	},)
		.map((type,) => {
			return {
				label: type.name,
				value: type.id,
			}
		},) ?? []

	React.useEffect(() => {
		setRelations({
			relatedType: relationData?.relatedType as IOptionType<string> | null,
			asset:       relationData?.asset as IOptionType<string> | null,
		},)
	}, [relationData,],)

	const ASSET_NAMES: ReadonlyArray<AssetNamesType> = [
		AssetNamesType.BONDS,
		AssetNamesType.CASH_DEPOSIT,
		AssetNamesType.CRYPTO,
		AssetNamesType.EQUITY_ASSET,
		AssetNamesType.OTHER,
		AssetNamesType.METALS,
		AssetNamesType.OPTIONS,
		AssetNamesType.PRIVATE_EQUITY,
		AssetNamesType.REAL_ESTATE,
		AssetNamesType.LOAN,
	] as const

	const assetOptions = React.useMemo<Array<IOptionType<string>>>(() => {
		return ASSET_NAMES.map((label,) => {
			return {
				label, value: label,
			}
		},)
	}, [],)

	const handleSubmit = (): void => {
		const body = {
			relatedTypeId: relations.relatedType?.value ?? null,
			asset:         relations.asset?.value ?? null,
		}
		if (transactionTypeId) {
			changeRelations({
				id: transactionTypeId,
				body,
			},)
		}
		handleCloseRelations()
	}

	const handleCreateFromSelect = React.useCallback(
		async(label: string,): Promise<void> => {
			onAddTransaction()
			// handleCloseRelations()
		},
		[onAddTransaction,],
	)

	const handleRelatedTypeChange = (select: SelectValueType<string>,): void => {
		if (Array.isArray(select,)) {
			return
		}
		setRelations((prev,) => {
			return {
				...prev,
				relatedType: select ?
					(select as IOptionType<string>) :
					null,
			}
		},)
	}

	const handleAssetChange = (select: SelectValueType<string>,): void => {
		if (Array.isArray(select,)) {
			return
		}
		setRelations((prev,) => {
			return {
				...prev,
				asset: select ?
					(select as IOptionType<string>) :
					null,
			}
		},)
	}

	React.useEffect(() => {
		if (!transactionRelatedTypeId) {
			return
		}
		const found = transactionTypeOptions.find((opt,) => {
			return opt.value === transactionRelatedTypeId
		},)
		if (found) {
			setRelations((prev,) => {
				return {
					...prev, relatedType: found,
				}
			},)
		}
	}, [transactionRelatedTypeId, transactionTypeList,],)

	return (
		<div className={styles.successModalContainer}>
			<div className={styles.relationIcons}>
				<TransactionsIcon width={42} height={42}/>
				<Link width={24} height={24} className={styles.linkIcon}/>
				<TransactionsIcon width={42} height={42}/>
			</div>
			<h4>Transaction relations</h4>
			<p className={styles.subText}>Link this transaction to related assets or other transactions</p>
			<div className={styles.selectBlock}>
				<p className={styles.selectLabel}>Related transaction settings</p>
				<SelectComponent
					key={JSON.stringify(relations,)}
					placeholder='Select or add new transaction settings'
					options={transactionTypeOptions}
					isSearchable
					isClearable
					onChange={handleRelatedTypeChange}
					value={relations.relatedType}
					isCreateble
					createbleStatus={CreatebleSelectEnum.TRANSACTION_TYPE}
					createFn={handleCreateFromSelect}
				/>
			</div>
			<div className={styles.selectBlock}>
				<p className={styles.selectLabel}>Related assets</p>
				<SelectComponent
					placeholder='Select asset'
					options={assetOptions}
					isSearchable
					isClearable
					onChange={handleAssetChange}
					value={relations.asset}
					leftIcon={renderSelectIcon(relations.asset?.label,)}
				/>
			</div>
			<div className={styles.modalButtonBlock}>
				<Button<ButtonType.TEXT>
					onClick={handleCloseRelations}
					className={styles.modalButtonBlockItem}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Cancel',
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={handleSubmit}
					className={styles.modalButtonBlockItem}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Update relations',
						size:    Size.MEDIUM,
						color:   Color.BLUE,
					}}
				/>
			</div>

		</div>
	)
}