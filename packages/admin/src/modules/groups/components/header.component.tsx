import React from 'react'

import {
	Plus,
	Search,
	XmarkSecond,
	Settings,
} from '../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Input,
	Size,
} from '../../../shared/components'
import {
	toggleState,
} from '../../../shared/utils'
import {
	useGroupsStore,
} from '../groups.store'
import * as styles from './header.styles'

type HeaderProps = {
	onAddGroup: () => void
}

export const Header: React.FC<HeaderProps> = ({
	onAddGroup,
},) => {
	const {
		filter,
		setSearch,
	} = useGroupsStore()

	const [isInputVisible, setIsInputVisible,] = React.useState<boolean>(false,)

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

	return (
		<div className={styles.headerWrapper}>
			<div className={styles.titleIconBlock}>
				<Settings width={32} height={32} />
				<p className={styles.headerTitle}>Groups</p>
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
								placeholder: 'Search group',
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
					onClick={onAddGroup}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add group',
						leftIcon: <Plus />,
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}