/* eslint-disable complexity */

import * as React from 'react'

import {
	BigTransactionSettings,
	Plus,
	ExcelIcon,
	HistoryClockIcon,
	Filter,
	Search,
	XmarkSecond,
	CloseXIcon,
	PanelTop,
	ClientLists,
} from '../../../assets/icons'
import {
	Button, ButtonType, Color, Size, Input,
} from '../../../shared/components'
import {
	toggleState,
} from '../../../shared/utils'
import {
	useStudentsStore,
} from '../students.store'
import * as styles from './header.styles'

type HeaderProps = {
	some?: string
	onAddStudent: () => void
}

export const Header: React.FC<HeaderProps> = ({
	some,
	onAddStudent,
},) => {
	const {
		filter, setSearch,
	} = useStudentsStore()
	const [isInputVisible, setIsInputVisible,] = React.useState<boolean>(false,)
	const [isFilterVisible, setIsFilterVisible,] = React.useState<boolean>(false,)

	const handleSearchButtonClick = (): void => {
		toggleState(setIsInputVisible,)()
	}

	const handleSearchCloseClick = (): void => {
		setSearch(undefined,)
		toggleState(setIsInputVisible,)()
	}

	const handleSearchBlur = (): void => {
		if (filter.search) {
			return
		}
		toggleState(setIsInputVisible,)()
	}

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setSearch(e.target.value || undefined,)
	}

	const hasFilters = !(filter.search)

	return (
		<div className={styles.headerWrapper}>
			<div className={styles.titleIconBlock}>
				<ClientLists width={32} height={32}/>
				<p className={styles.headerTitle}>Students</p>
			</div>
			<div className={styles.buttonsBlock}>
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
				{(isInputVisible || filter.search) && (
					<div
						className={styles.clientHeaderInput}
						onBlur={handleSearchBlur}
					>
						<Input
							name='search'
							label=''
							input={{
								value:       filter.search ?? '',
								onChange:    handleSearch,
								placeholder: 'Search student',
								autoFocus:   true,
							}}
							leftIcon={<Search width={20} height={20} />}
							rightIcon={<XmarkSecond
								width={20} height={20}
								onClick={handleSearchCloseClick}
								cursor={'pointer'}
							/>}
						/>
					</div>
				)}
				<Button<ButtonType.TEXT>
					className={styles.addButton}
					onClick={onAddStudent}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add student',
						leftIcon: <Plus/>,
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}