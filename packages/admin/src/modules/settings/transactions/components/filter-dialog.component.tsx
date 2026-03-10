/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */

import React from 'react'
import {
	Classes, Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'
import {
	Button,
	ButtonType,
	Color,
	Size,
	SelectComponent,
} from '../../../../shared/components'
import type {
	IOptionType,
} from '../../../../shared/types'
import type {
	TransactionTypeFilter,
} from '../../../../shared/types'
import {
	useTransactionCategoryList,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import {
	AssetNamesType,
} from '../../../../shared/types'
import {
	useTransactionTypeStore,
} from '../transaction-settings.store'
import {
	TransactionCashFlow, PlType,
} from '../../../../shared/types'
import {
	RadioChecked,
	RadioEmpty,
	Check,
	CheckNegative,
	AssetDollarIcon,
} from '../../../../assets/icons'
import * as styles from './header.styles'

interface IProps {
  children: React.ReactNode
  isFilterVisible: boolean
  transactionTypeFilter: TransactionTypeFilter | undefined
  setTransactionTypeFilter: React.Dispatch<
    React.SetStateAction<TransactionTypeFilter | undefined>
  >
  setDialogOpen: (value: boolean) => void
}

export const TransactionTypeFilterDialog: React.FC<IProps> = ({
	children,
	isFilterVisible,
	transactionTypeFilter,
	setTransactionTypeFilter,
	setDialogOpen,
},) => {
	const {
		data: categoryList,
	} = useTransactionCategoryList()
	const {
		filter, setCategoryIds, setAssets, setCashFlows, setPls, setIsActivated, setIsDeactivated,
	} = useTransactionTypeStore()
	const [isClearClicked, setIsClearClicked,] = React.useState<boolean>(false,)

	const categoryOptions = React.useMemo<Array<IOptionType<string>>>(() => {
		return (categoryList ?? []).map((o,) => {
			return {
				label: o.label,
				value: o.value,
			}
		},)
	}, [categoryList,],)

	const ASSET_NAMES: ReadonlyArray<AssetNamesType> = [
		AssetNamesType.BONDS,
		AssetNamesType.CASH,
		AssetNamesType.CASH_DEPOSIT,
		AssetNamesType.COLLATERAL,
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

	React.useEffect(() => {
		setTransactionTypeFilter({
			...transactionTypeFilter,
			categoryIds: filter.categoryIds,
			assets:      filter.assets,
			cashFlows:   filter.cashFlows,
			pls:         filter.pls,
		},)
	}, [isFilterVisible,],)

	type ToggleKey = 'isActivated' | 'isDeactivated'

	const handleCheckboxToggle = (key: ToggleKey,): void => {
		setTransactionTypeFilter((prev,) => {
			const checked = Boolean(prev?.[key],)
			return {
				...(prev ?? {
				}),
				[key]: checked ?
					undefined :
					true,
				...(key === 'isActivated' ?
					{
						isDeactivated: undefined,
					} :
					{
						isActivated: undefined,
					}),
			} as TransactionTypeFilter
		},)
	}

	const handleFilterApply = (filter: TransactionTypeFilter | undefined,): void => {
		setCategoryIds(filter?.categoryIds,)
		setAssets(filter?.assets,)
		setCashFlows(filter?.cashFlows,)
		setPls(filter?.pls,)
		setIsActivated(filter?.isActivated,)
		setIsDeactivated(filter?.isDeactivated,)
	}

	const applyCondition = !(isClearClicked ||
		(filter.categoryIds !== transactionTypeFilter?.categoryIds) ||
		(filter.assets !== transactionTypeFilter?.assets) ||
		(filter.cashFlows !== transactionTypeFilter?.cashFlows) ||
		(filter.pls !== transactionTypeFilter?.pls) ||
		(filter.isActivated !== transactionTypeFilter?.isActivated) ||
		(filter.isDeactivated !== transactionTypeFilter?.isDeactivated))

	const content = (
		<div className={styles.filterDialogContainer}>
			<div className={styles.filterDialogWrapper}>
				<SelectComponent<string>
					isMulti
					isSearchable
					placeholder='Select category'
					options={categoryOptions}
					value={(transactionTypeFilter?.categoryIds ?? [])
						.filter((id,): id is string => {
							return typeof id === 'string' && id.length > 0
						},)
						.map((id,) => {
							return categoryOptions.find((o,) => {
								return o.value === id
							},)
						},)
						.filter((o,): o is IOptionType<string> => {
							return Boolean(o,)
						},)}

					onChange={(select,) => {
						const selected = Array.isArray(select,) ?
							(select as Array<IOptionType<string>>) :
							select ?
								[select as IOptionType<string>,] :
								[]
						setTransactionTypeFilter((prev,) => {
							return {
								...(prev ?? {
								}),
								categoryIds: selected.map((o,) => {
									return o.value
								},),
							}
						},)
					}}
				/>
				<SelectComponent<string>
					isMulti
					isSearchable
					placeholder='Select related asset'
					options={assetOptions}
					leftIcon={<AssetDollarIcon/>}
					value={(transactionTypeFilter?.assets ?? [])
						.filter((v,): v is string => {
							return typeof v === 'string' && v.length > 0
						},)
						.map((v,) => {
							return {
								label: v, value: v,
							}
						},)}
					onChange={(select,) => {
						const selected = Array.isArray(select,) ?
							(select as Array<IOptionType<string>>) :
							select ?
								[select as IOptionType<string>,] :
								[]
						setTransactionTypeFilter((prev,) => {
							return {
								...(prev ?? {
								}),
								assets: selected.map((o,) => {
									return o.value
								},),
							}
						},)
					}}
				/>
				<div>
					<p className={styles.titleCheckbox}>Cashflow type</p>
					<div className={styles.checkboxFlex}>
						<label className={styles.checkboxBlock}>
							<input
								type='checkbox'
								checked={transactionTypeFilter?.cashFlows?.includes(TransactionCashFlow.INFLOW,) ?? false}
								onChange={(e,) => {
									const {
										checked,
									} = e.target
									setTransactionTypeFilter((prev,) => {
										const current = prev?.cashFlows ?? []
										return {
											...(prev ?? {
											}),
											cashFlows: checked ?
												[...current, TransactionCashFlow.INFLOW,] :
												current.filter((f,) => {
													return f !== TransactionCashFlow.INFLOW
												},),
										}
									},)
								}}
								className={styles.hiddenCheckbox}
							/>
							<span className={styles.customCheckbox} /> Cash in
						</label>

						<label className={styles.checkboxBlock}>
							<input
								type='checkbox'
								checked={transactionTypeFilter?.cashFlows?.includes(TransactionCashFlow.OUTFLOW,) ?? false}
								onChange={(e,) => {
									const {
										checked,
									} = e.target
									setTransactionTypeFilter((prev,) => {
										const current = prev?.cashFlows ?? []
										return {
											...(prev ?? {
											}),
											cashFlows: checked ?
												[...current, TransactionCashFlow.OUTFLOW,] :
												current.filter((f,) => {
													return f !== TransactionCashFlow.OUTFLOW
												},),
										}
									},)
								}}
								className={styles.hiddenCheckbox}
							/>
							<span className={styles.customCheckbox} /> Cash out
						</label>
					</div>
				</div>
				<div>
					<p className={styles.titleCheckbox}>P/L type</p>
					<div className={styles.checkboxFlex}>
						<label className={styles.checkboxBlock}>
							<input
								type='checkbox'
								checked={transactionTypeFilter?.pls?.includes(PlType.P,) ?? false}
								onChange={(e,) => {
									const {
										checked,
									} = e.target
									setTransactionTypeFilter((prev,) => {
										const current = prev?.pls ?? []
										return {
											...(prev ?? {
											}),
											pls: checked ?
												[...current, PlType.P,] :
												current.filter((f,) => {
													return f !== PlType.P
												},),
										}
									},)
								}}
								className={styles.hiddenCheckbox}
							/>
							<span className={styles.customCheckbox} /> Profit
						</label>

						<label className={styles.checkboxBlock}>
							<input
								type='checkbox'
								checked={transactionTypeFilter?.pls?.includes(PlType.L,) ?? false}
								onChange={(e,) => {
									const {
										checked,
									} = e.target
									setTransactionTypeFilter((prev,) => {
										const current = prev?.pls ?? []
										return {
											...(prev ?? {
											}),
											pls: checked ?
												[...current, PlType.L,] :
												current.filter((f,) => {
													return f !== PlType.L
												},),
										}
									},)
								}}
								className={styles.hiddenCheckbox}
							/>
							<span className={styles.customCheckbox} /> Loss
						</label>

						<label className={styles.checkboxBlock}>
							<input
								type='checkbox'
								checked={transactionTypeFilter?.pls?.includes(PlType.N,) ?? false}
								onChange={(e,) => {
									const {
										checked,
									} = e.target
									setTransactionTypeFilter((prev,) => {
										const current = prev?.pls ?? []
										return {
											...(prev ?? {
											}),
											pls: checked ?
												[...current, PlType.N,] :
												current.filter((f,) => {
													return f !== PlType.N
												},),
										}
									},)
								}}
								className={styles.hiddenCheckbox}
							/>
							<span className={styles.customCheckbox} /> Neutral
						</label>
					</div>
				</div>
				<div>
					<p className={styles.showText}>Show only</p>
					<label className={styles.activateLabel}>
						<input
							type='checkbox'
							checked={Boolean(transactionTypeFilter?.isActivated,)}
							className='hidden-el'
							onChange={() => {
								handleCheckboxToggle('isActivated',)
							}}
						/>
						{transactionTypeFilter?.isActivated ?
							<RadioChecked /> :
							<RadioEmpty />}
						<Check />
						<span className={styles.activationStatusText}>Active settings</span>
					</label>

					<label className={styles.activateLabel}>
						<input
							type='checkbox'
							checked={Boolean(transactionTypeFilter?.isDeactivated,)}
							className='hidden-el'
							onChange={() => {
								handleCheckboxToggle('isDeactivated',)
							}}
						/>
						{transactionTypeFilter?.isDeactivated ?
							<RadioChecked /> :
							<RadioEmpty />}
						<CheckNegative />
						<span className={styles.activationStatusText}>Deactivated settings</span>
					</label>
				</div>
			</div>
			<div className={styles.filterBtnWrapper}>
				<Button<ButtonType.TEXT>
					className={styles.clearBtn}
					onClick={() => {
						setTransactionTypeFilter(undefined,)
						setIsClearClicked(!isClearClicked,)
					}}
					disabled={!(transactionTypeFilter?.categoryIds ??
						transactionTypeFilter?.assets ??
						transactionTypeFilter?.cashFlows ??
						transactionTypeFilter?.pls ??
						transactionTypeFilter?.isActivated ??
						transactionTypeFilter?.isDeactivated
					)}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Clear',
						size:    Size.SMALL,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(styles.applyBtn, Classes.POPOVER_DISMISS,)}
					disabled={applyCondition}
					onClick={() => {
						handleFilterApply(transactionTypeFilter,)
						setDialogOpen(false,)
						if (isClearClicked) {
							setIsClearClicked(!isClearClicked,)
						}
					}}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Apply',
						size:    Size.SMALL,
						color:   Color.BLUE,
					}}
				/>
			</div>
		</div>
	)

	return (
		<Popover
			usePortal={true}
			hasBackdrop={true}
			backdropProps={{
				className: styles.popoverBackdrop,
			}}
			placement='bottom-end'
			content={content}
			popoverClassName={styles.popoverContainer}
			onClosing={() => {
				setDialogOpen(false,)
			}}
			autoFocus={false}
			enforceFocus={false}
		>
			{children}
		</Popover>
	)
}
