import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'

import {
	useClientsListForSelect,
} from '../../../../clients/client-profiles/clients/hooks'
import {
	Button,
	ButtonType,
	Color,
	SelectComponent,
	Size,
} from '../../../../../shared/components'
import {
	ClientsRoute,
	Check,
	CheckNegative,
	RadioChecked,
	RadioEmpty,
} from '../../../../../assets/icons'
import {
	initialFilterValues,
	useBudgetStore,
} from '../../budget.store'
import type {
	IOptionType,
} from '../../../../../shared/types'
import type {
	StoreBudgetClientList,
	TBudgetSearch,
} from '../../budget.types'
import {
	isDeepEqual,
} from '../../../../../shared/utils'

import * as styles from './filter.styles'

interface IProps {
	children: React.ReactNode
	setDialogOpen: (value: boolean) => void
	setBudgetFilter: React.Dispatch<React.SetStateAction<TBudgetSearch>>
	budgetFilter: TBudgetSearch
}

export const BudgetFilterDialog: React.FC<IProps> = ({
	children,
	setDialogOpen,
	budgetFilter,
	setBudgetFilter,
},) => {
	const {
		data: clientsList,
	} = useClientsListForSelect()
	const {
		setClientIds,
		setIsActivated,
		filter,
	} = useBudgetStore()
	const [isClearClicked, setIsClearClicked,] = React.useState<boolean>(false,)
	const [analyticsFilterOnClose, setAnalyticsFilterOnClose,] = React.useState<TBudgetSearch>(initialFilterValues,)
	React.useEffect(() => {
		setAnalyticsFilterOnClose(filter,)
		return () => {
			setAnalyticsFilterOnClose(filter,)
			setIsClearClicked(false,)
		}
	}, [filter,],)
	const handleFilterApply = (filter: TBudgetSearch,): void => {
		setClientIds(filter.clientIds,)
		setIsActivated(filter.isActivated,)
	}

	const clientOptionsArray = clientsList?.filter((client,) => {
		const isClientSelected = budgetFilter.clientIds?.some(
			(selectedClient,) => {
				return selectedClient.value.id === client.value
			},
		)
		return !isClientSelected
	},)
		.map((client,) => {
			return {
				label: client.label,
				value: {
					id:   client.value,
					name: client.label,
				},
			}
		},) ?? []

	const content = (
		<div className={styles.filterDialogContainer}>
			<div className={styles.filterDialogWrapper}>
				<p className={styles.titleText}>Show only</p>
				<div className={styles.activateBlockWrapper}>
					<p
						onClick={() => {
							setBudgetFilter((prev,) => {
								return {
									...prev,
									isActivated: prev.isActivated === true ?
										undefined :
										true,
								}
							},)
						}}
						className={styles.activateWrapper}>
						{budgetFilter.isActivated === true ?
							<RadioChecked /> :
							<RadioEmpty />}

						<Check/>Active budget plans
					</p>
					<p
						onClick={() => {
							setBudgetFilter((prev,) => {
								return {
									...prev,
									isActivated: prev.isActivated === false ?
										undefined :
										false,
								}
							},)
						}}
						className={styles.activateWrapper}
					>
						{budgetFilter.isActivated === false ?
							<RadioChecked /> :
							<RadioEmpty />}
						<CheckNegative/>Deactivated budget plans
					</p>
				</div>
				<SelectComponent<StoreBudgetClientList>
					isDisabled={!clientsList}
					placeholder='Select client'
					key={budgetFilter.clientIds?.toString()}
					leftIcon={<ClientsRoute width={18} height={18} />}
					options={clientOptionsArray}
					onChange={(select,) => {
						if (select && Array.isArray(select,)) {
							setBudgetFilter({
								...budgetFilter,
								clientIds:      select as Array<IOptionType<StoreBudgetClientList>>,
							},)
						}
					}}
					value={budgetFilter.clientIds}
					isSearchable
					isMulti
				/>
			</div>
			<div className={styles.filterBtnWrapper}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setIsClearClicked(true,)
						setBudgetFilter({
							...initialFilterValues,
						},)
					}}
					className={styles.clearBtn}
					disabled={(!isDeepEqual(budgetFilter, filter,) && (isClearClicked)) ||
						isDeepEqual(analyticsFilterOnClose, initialFilterValues,)}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Clear',
						size:    Size.SMALL,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={() => {
						handleFilterApply(budgetFilter,)
						setDialogOpen(false,)
					}}
					disabled={isDeepEqual(budgetFilter, filter,)}
					className={cx(styles.applyBtn, Classes.POPOVER_DISMISS,) }
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Apply',
						size:    Size.SMALL,
						color:   Color.BLUE,
					}}
				/>
			</div>
		</div>)
	return (
		<Popover
			usePortal={true}
			hasBackdrop={true}
			backdropProps={{
				className: styles.popoverBackdrop,
			}}
			placement='bottom-end'
			content={content}
			autoFocus={false}
			enforceFocus={false}
			popoverClassName={styles.popoverContainer}
			onClosing={() => {
				setDialogOpen(false,)
			}}
		>
			{children}
		</Popover>
	)
}