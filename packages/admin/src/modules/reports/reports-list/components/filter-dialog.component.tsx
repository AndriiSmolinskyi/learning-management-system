import React from 'react'
import {
	Classes,
	Popover,
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

import {
	ReportCategory,
	ReportType,
} from '../../../../shared/types'
import type {
	IOptionType,
} from '../../../../shared/types'
import type {
	TReportSearch,
} from '../reports.types'
import {
	useReportStore,
} from '../reports.store'
import * as styles from '../reports.styles'

interface IProps {
	children: React.ReactNode
	isFilterVisible: boolean
	setDialogOpen: (value: boolean) => void
	reportFilter: TReportSearch | undefined
	setReportFilter: React.Dispatch<React.SetStateAction<TReportSearch | undefined>>
}

export const ReportFilterDialog: React.FC<IProps> = ({
	children,
	isFilterVisible,
	setDialogOpen,
	reportFilter,
	setReportFilter,
},) => {
	const {
		setCategory,
		setType,
		filter,
	} = useReportStore()
	const [isClearClicked, setIsClearClicked,] = React.useState<boolean>(false,)

	const handleFilterApply = (filter: TReportSearch | undefined,): void => {
		setCategory(filter?.category?.value,)
		setType(filter?.type?.value,)
	}

	const mapCategoryToOption = (category: ReportCategory | undefined,): IOptionType<ReportCategory> | undefined => {
		if (!category) {
			return undefined
		}
		return {
			label: category,
			value: category,
		}
	}

	const mapTypeToOption = (type: ReportType | undefined,): IOptionType<ReportType> | undefined => {
		if (!type) {
			return undefined
		}
		return {
			label: type,
			value: type,
		}
	}

	React.useEffect(() => {
		setReportFilter({
			...filter,
			category: filter.category ?
				mapCategoryToOption(filter.category,) :
				undefined,
			type:     filter.type ?
				mapTypeToOption(filter.type,) :
				undefined,
		},)
	}, [isFilterVisible,],)

	const typeOptionsArray = [
		{
			label: ReportType.CUSTOMER,
			value: ReportType.CUSTOMER,
		},
		{
			label: ReportType.INTERNAL,
			value: ReportType.INTERNAL,
		},
	]

	const categoryOptionsArray = [
		{
			label: ReportCategory.BOND,
			value: ReportCategory.BOND,
		},
		{
			label: ReportCategory.STOCK,
			value: ReportCategory.STOCK,
		},
		{
			label: ReportCategory.CUSTOM,
			value: ReportCategory.CUSTOM,
		},
		{
			label: ReportCategory.STATEMENT,
			value: ReportCategory.STATEMENT,
		},
	]

	const applyCondition = !(isClearClicked ||
		(filter.type !== reportFilter?.type?.value) ||
		(filter.category !== reportFilter?.category?.value)
	)

	const content = (
		<div className={styles.filterDialogContainer}>
			<div className={styles.filterDialogWrapper}>
				<SelectComponent<ReportType>
					key={reportFilter?.type?.value}
					options={typeOptionsArray}
					value={reportFilter?.type}
					placeholder='Select report type'
					isSearchable={false}
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setReportFilter({
								...reportFilter,
								type: select as IOptionType<ReportType>,
							},)
						}
					}}
				/>
				<SelectComponent<ReportCategory>
					key={reportFilter?.category?.value}
					options={categoryOptionsArray}
					value={reportFilter?.category}
					placeholder='Select report category'
					isSearchable={false}
					onChange={(select,) => {
						if (select && !Array.isArray(select,)) {
							setReportFilter({
								...reportFilter,
								category: select as IOptionType<ReportCategory>,
							},)
						}
					}}
				/>
			</div>
			<div className={styles.filterBtnWrapper}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						setReportFilter(undefined,)
						setIsClearClicked(!isClearClicked,)
					}}
					disabled={!(reportFilter?.category ?? reportFilter?.type)}
					className={styles.clearBtn}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Clear',
						size:    Size.SMALL,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					onClick={() => {
						handleFilterApply(reportFilter,)
						setDialogOpen(false,)
					}}
					disabled={applyCondition}
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