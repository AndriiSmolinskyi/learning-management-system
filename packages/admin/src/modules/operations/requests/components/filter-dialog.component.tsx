// todo: old version of request filter
// import React from 'react'
// import {
// 	Classes,
// 	Popover,
// } from '@blueprintjs/core'
// import type {
// 	MultiValue,
// } from 'react-select'
// import {
// 	cx,
// } from '@emotion/css'

// import {
// 	Button,
// 	ButtonType,
// 	Color,
// 	Size,
// 	SelectComponent,
// } from '../../../../shared/components'
// import {
// 	BankSelect,
// 	Briefcase,
// 	EntitySelect,
// 	PortfolioTypeIcon,
// } from '../../../../assets/icons'

// import {
// 	useRequestStore,
// } from '../request.store'
// import {
// 	usePortfolioList,
// } from '../../../../shared/hooks/portfolio'
// import type {
// 	LinkedAccountType,
// 	TRequestSearch,
// } from '../request.types'
// import {
// 	AssetNamesType,
// 	type IOptionType,
// 	type RequestStatusType,
// } from '../../../../shared/types'
// import {
// 	renderSelectIcon,
// } from '../../../clients/portfolios/portfolio/components/drawer-content/components/form-asset'
// import {
// 	requestTypeOptions,
// } from '../../../../shared/constants'
// import {
// 	getSelectMultiLabelElement,
// } from '../request.utils'
// import {
// 	isDeepEqual,
// } from '../../../../shared/utils'
// import {
// 	useAssetsListBySourceId, useBanksBySourceId, useEntitiesBySourceIds,
// } from '../../../../shared/hooks'

// import * as styles from '../requests.styles'

// interface IProps {
// 	children: React.ReactNode
// 	setDialogOpen: (value: boolean) => void
// }

// const initialFilterValues: TRequestSearch = {
// 	portfolioId: undefined,
// 	entityId:    undefined,
// 	bankId:      undefined,
// 	assetId:     undefined,
// 	statuses:    undefined,
// }

// export const RequestFilterDialog: React.FC<IProps> = ({
// 	children,
// 	setDialogOpen,
// },) => {
// 	const [requestFilter, setRequestFilter,] = React.useState<TRequestSearch>(initialFilterValues,)

// 	const {
// 		filter,
// 		setPortfolioId,
// 		setEntityId,
// 		setBankId,
// 		setAssetId,
// 		setStatuses,
// 		resetRequestStore,
// 	} = useRequestStore()

// 	const {
// 		data: portfoliosList,
// 	} = usePortfolioList()
// 	const {
// 		data: entityList,
// 	} = useEntitiesBySourceIds({
// 		portfolioIds: requestFilter.portfolioId?.value.id ?
// 			[requestFilter.portfolioId.value.id,] :
// 			undefined,
// 	},)
// 	const {
// 		data: bankList,
// 	} = useBanksBySourceId({
// 		entityId:    requestFilter.entityId?.value.id,
// 		portfolioId: requestFilter.portfolioId?.value.id,
// 	},)
// 	const {
// 		data: assetList,
// 	} = useAssetsListBySourceId({
// 		entityId:    requestFilter.entityId?.value.id,
// 		portfolioId: requestFilter.portfolioId?.value.id,
// 		bankId:      requestFilter.bankId?.value.id,
// 	},)

// 	const handleFilterApply = (filter: TRequestSearch,): void => {
// 		setPortfolioId(filter.portfolioId?.value.id,)
// 		setEntityId(filter.entityId?.value.id,)
// 		setBankId(filter.bankId?.value.id,)
// 		setAssetId(filter.assetId?.value.id,)
// 		setStatuses(filter.statuses?.map((status,) => {
// 			return status.value
// 		},),)
// 	}

// 	const portfolioOptionsArray = React.useMemo(() => {
// 		return portfoliosList?.map((portfolio,) => {
// 			return {
// 				label: portfolio.name,
// 				value: {
// 					id:   portfolio.id,
// 					name: portfolio.name,
// 				},
// 			}
// 		},) ?? []
// 	}, [portfoliosList,],)

// 	const entityOptionsArray = React.useMemo(() => {
// 		return entityList?.map((entity,) => {
// 			return {
// 				label: entity.name,
// 				value: {
// 					id:   entity.id,
// 					name: entity.name,
// 				},
// 			}
// 		},) ?? []
// 	}, [entityList,],)

// 	const bankOptionsArray = React.useMemo(() => {
// 		return bankList?.map((bank,) => {
// 			return {
// 				label: bank.bankName,
// 				value: {
// 					id:   bank.id,
// 					name: bank.bankName,
// 				},
// 			}
// 		},) ?? []
// 	}, [bankList,],)

// 	const assetOptionsArray = React.useMemo(() => {
// 		return (assetList ?? [])
// 			.filter((asset,) => {
// 				return (
// 					asset.assetName === AssetNamesType.BONDS ||
// 			asset.assetName === AssetNamesType.EQUITY_ASSET
// 				)
// 			},)
// 			.map((asset,) => {
// 				return {
// 					label: asset.assetName,
// 					value: {
// 						id:   asset.id,
// 						name: asset.assetName,
// 					},
// 				}
// 			},)
// 	}, [assetList,],)

// 	const content = (
// 		<div className={styles.filterDialogContainer}>
// 			<div className={styles.filterDialogWrapper}>
// 				Filter requests ({filter.type ?
// 					filter.type.toLowerCase() :
// 					'default'})
// 				<SelectComponent<LinkedAccountType>
// 					key={requestFilter.portfolioId?.value.id}
// 					options={portfolioOptionsArray}
// 					value={requestFilter.portfolioId}
// 					leftIcon={<Briefcase width={18} height={18} />}
// 					placeholder='Select portfolio or sub-portfolio'
// 					onChange={(select,) => {
// 						if (select && !Array.isArray(select,)) {
// 							setRequestFilter({
// 								...requestFilter,
// 								bankId:      undefined,
// 								entityId:    undefined,
// 								assetId:     undefined,
// 								portfolioId: select as IOptionType<LinkedAccountType>,
// 							},)
// 						}
// 					}}
// 				/>
// 				<SelectComponent<LinkedAccountType>
// 					key={requestFilter.entityId?.value.id}
// 					options={entityOptionsArray}
// 					value={requestFilter.entityId}
// 					leftIcon={<EntitySelect width={18} height={18} />}
// 					placeholder='Select entity'
// 					onChange={(select,) => {
// 						if (select && !Array.isArray(select,)) {
// 							setRequestFilter({
// 								...requestFilter,
// 								bankId:      undefined,
// 								assetId:     undefined,
// 								entityId:    select as IOptionType<LinkedAccountType>,
// 							},)
// 						}
// 					}}
// 				/>
// 				<SelectComponent<LinkedAccountType>
// 					key={requestFilter.bankId?.value.id}
// 					options={bankOptionsArray}
// 					value={requestFilter.bankId}
// 					leftIcon={<BankSelect width={18} height={18} />}
// 					placeholder='Select bank'
// 					onChange={(select,) => {
// 						if (select && !Array.isArray(select,)) {
// 							setRequestFilter({
// 								...requestFilter,
// 								assetId:     undefined,
// 								bankId:      select as IOptionType<LinkedAccountType>,
// 							},)
// 						}
// 					}}
// 				/>
// 				<SelectComponent<LinkedAccountType>
// 					key={requestFilter.assetId?.value.id}
// 					options={assetOptionsArray}
// 					value={requestFilter.assetId}
// 					leftIcon={renderSelectIcon(requestFilter.assetId?.value.name,)}
// 					placeholder='Select asset'
// 					onChange={(select,) => {
// 						if (select && !Array.isArray(select,)) {
// 							setRequestFilter({
// 								...requestFilter,
// 								assetId:      select as IOptionType<LinkedAccountType>,
// 							},)
// 						}
// 					}}
// 				/>
// 				<SelectComponent<RequestStatusType>
// 					key={requestFilter.statuses?.toString()}
// 					options={requestTypeOptions}
// 					isMulti
// 					getMultiValueElement={getSelectMultiLabelElement}
// 					value={requestFilter.statuses}
// 					leftIcon={<PortfolioTypeIcon width={18} height={18} />}
// 					placeholder='Select statuses'
// 					onChange={(select,) => {
// 						if (select && Array.isArray(select,)) {
// 							setRequestFilter({
// 								...requestFilter,
// 								statuses:      select as MultiValue<IOptionType<RequestStatusType>>,
// 							},)
// 						}
// 					}}
// 				/>
// 			</div>
// 			<div className={styles.filterBtnWrapper}>
// 				<Button<ButtonType.TEXT>
// 					onClick={() => {
// 						setRequestFilter({
// 							...initialFilterValues,
// 						},)
// 						resetRequestStore()
// 					}}
// 					className={styles.clearBtn}
// 					additionalProps={{
// 						btnType: ButtonType.TEXT,
// 						text:    'Clear',
// 						size:    Size.SMALL,
// 						color:   Color.SECONDRAY_GRAY,
// 					}}
// 				/>
// 				<Button<ButtonType.TEXT>
// 					onClick={() => {
// 						handleFilterApply(requestFilter,)
// 						setDialogOpen(false,)
// 					}}
// 					disabled={isDeepEqual(requestFilter, initialFilterValues,)}
// 					className={cx(styles.applyBtn, Classes.POPOVER_DISMISS,) }
// 					additionalProps={{
// 						btnType: ButtonType.TEXT,
// 						text:    'Apply',
// 						size:    Size.SMALL,
// 						color:   Color.BLUE,
// 					}}
// 				/>
// 			</div>
// 		</div>)

// 	return (
// 		<Popover
// 			usePortal={true}
// 			hasBackdrop={true}
// 			backdropProps={{
// 				className: styles.popoverBackdrop,
// 			}}
// 			placement='bottom-end'
// 			content={content}
// 			popoverClassName={styles.popoverContainer}
// 			onClosing={() => {
// 				setDialogOpen(false,)
// 			}}
// 		>
// 			{children}
// 		</Popover>
// 	)
// }