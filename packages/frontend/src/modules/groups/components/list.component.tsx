import React from 'react'
import {
	format,
} from 'date-fns'
import {
	useNavigate,
} from 'react-router-dom'
import {
	useMyGroups,
} from '../../../shared/hooks/groups/groups.hook'
import {
	FilterEmpty,
} from './filter-empty.component'
import {
	Button,
	ButtonType,
	Size,
	Color,
} from '../../../shared/components'
import * as styles from './list.styles'

export const List: React.FC = () => {
	const navigate = useNavigate()

	const {
		data,
		isFetching,
	} = useMyGroups()

	if (isFetching) {
		return (
			<FilterEmpty />
		)
	}

	return (
		<div className={styles.listBlock}>
			{data?.items.map((group,) => {
				return (
					<div key={group.id} className={styles.liItemWrapper}>
						<div>
							<h1 className={styles.courseName}>{group.courseName}</h1>
							<p className={styles.groupName}>{group.groupName}</p>
							<p className={styles.starDate}>
								{format(group.startDate, 'dd.MM.yyyy',)}
							</p>
						</div>

						<div>
							<Button<ButtonType.TEXT>
								onClick={() => {
									navigate(`/groups/${group.id}`,)
								}}
								additionalProps={{
									btnType: ButtonType.TEXT,
									text:    'Open',
									size:    Size.MEDIUM,
									color:   Color.BLUE,
								}}
							/>
						</div>
					</div>
				)
			},)}
		</div>
	)
}

export default List