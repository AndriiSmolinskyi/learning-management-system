import React from 'react'

import {
	Plus,
	Search,
	XmarkSecond,
	ReportTitleIcon,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Input,
	Size,
} from '../../../../shared/components'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	useLessonStore,
} from '../lessons.store'

import * as styles from '../lessons.styles'

type Props = {
	toggleCreateVisible: () => void
}

export const LessonsHeader: React.FC<Props> = ({
	toggleCreateVisible,
},) => {
	const [isInputVisible, setIsInputVisible,] = React.useState<boolean>(false,)

	const {
		filter,
		setSearch,
	} = useLessonStore()

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setSearch(e.target.value || undefined,)
	}

	const handleSearchButtonClick = (): void => {
		toggleState(setIsInputVisible,)()
		setSearch(undefined,)
	}

	return (
		<div className={styles.filterWrapper}>
			<div className={styles.filterTitle}>
				<ReportTitleIcon width={32} height={32} />
				<h2>Lessons</h2>
			</div>

			<div className={styles.filterActions}>
				{!isInputVisible && (
					<Button<ButtonType.ICON>
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
					<div className={styles.clientHeaderInput}>
						<Input
							name='search'
							label=''
							input={{
								value:       filter.search ?? '',
								onChange:    handleSearch,
								placeholder: 'Search lesson',
								autoFocus:   true,
							}}
							leftIcon={<Search width={20} height={20} />}
							rightIcon={(
								<XmarkSecond
									width={20}
									height={20}
									onClick={handleSearchButtonClick}
									cursor={'pointer'}
								/>
							)}
						/>
					</div>
				)}

				<Button<ButtonType.TEXT>
					onClick={toggleCreateVisible}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Add lesson',
						leftIcon: <Plus width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.BLUE,
					}}
				/>
			</div>
		</div>
	)
}