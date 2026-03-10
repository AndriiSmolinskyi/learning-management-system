
import React from 'react'
import {
	CloseXIcon,
	Filter,
	Plus,
	ReportTitleIcon,
	Search,
	XmarkSecond,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Input,
	Size,
} from '../../../../shared/components'
import {
	ReportFilterDialog,
} from './filter-dialog.component'

import {
	toggleState,
} from '../../../../shared/utils'
import {
	useReportStore,
} from '../reports.store'
import type {
	TReportSearch,
} from '../reports.types'

import * as styles from '../reports.styles'

type Props = {
	toggleCreateVisible: () => void
	reportFilter: TReportSearch | undefined
	setReportFilter: React.Dispatch<React.SetStateAction<TReportSearch | undefined>>

}

export const ReportsHeader: React.FC<Props> = ({
	toggleCreateVisible,
	reportFilter,
	setReportFilter,
},) => {
	const [isInputVisible, setIsInputVisible,] = React.useState<boolean>(false,)
	const [isFilterVisible, setIsFilterVisible,] = React.useState<boolean>(false,)

	const {
		filter,
		setSearch,
	} = useReportStore()

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setSearch(e.target.value || undefined,)
	}

	const handleSearchButtonClick = (): void => {
		toggleState(setIsInputVisible,)()
		setSearch(undefined,)
	}

	const hasFilters = !(reportFilter?.category ?? reportFilter?.type)

	return (
		<div className={styles.filterWrapper}>
			<div className={styles.filterTitle}>
				<ReportTitleIcon width={32} height={32}/>
				<h2>Reports</h2>
			</div>
			<div className={styles.filterActions}>
				{!isInputVisible && (
					<Button<ButtonType.ICON>
						disabled={false}
						onClick={handleSearchButtonClick}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.MEDIUM,
							color:   Color.SECONDRAY_COLOR,
							icon:    <Search width={20} height={20} />,
						}}
					/>
				)}
				{isInputVisible && (
					<div
						className={styles.clientHeaderInput}
					>
						<Input
							name='search'
							label=''
							input={{
								value:       filter.search ?? '',
								onChange:    handleSearch,
								placeholder: 'Search report',
								autoFocus:   true,
							}}
							leftIcon={<Search width={20} height={20} />}
							rightIcon={<XmarkSecond
								width={20} height={20}
								onClick={handleSearchButtonClick}
								cursor={'pointer'}
							/>}
						/>
					</div>
				)}
				<ReportFilterDialog
					setDialogOpen={setIsFilterVisible}
					reportFilter={reportFilter}
					setReportFilter={setReportFilter}
					isFilterVisible={isFilterVisible}
				>
					<Button<ButtonType.ICON>
						className={styles.filterButton(isFilterVisible, !hasFilters,)}
						onClick={toggleState(setIsFilterVisible,)}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.MEDIUM,
							color:   Color.SECONDRAY_COLOR,
							icon:    isFilterVisible ?
								<CloseXIcon width={20} height={20} /> :
								<Filter width={20} height={20} />,
						}}
					/>
				</ReportFilterDialog>
				<Button<ButtonType.TEXT>
					onClick={toggleCreateVisible}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add report',
						leftIcon: <Plus width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}
