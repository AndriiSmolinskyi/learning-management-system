import * as React from 'react'
import {
	SearchEmptyState,
} from '../../../../../../assets/icons'
import {
	Button, ButtonType, Size, Color,
} from '../../../../../../shared/components'
import * as styles from './client-empty.style'

interface ISearchEmptyProps {
  clearSearch: () => void
}

export const ClientSearchEmpty: React.FC<ISearchEmptyProps> = ({
	clearSearch,
},) => {
	return (
		<div className={styles.emptyContainer}>
			<SearchEmptyState width={164} height={164}/>
			<p className={styles.emptyText}>No results found. Try a different search or filter</p>
			<Button<ButtonType.TEXT>
				disabled={false}
				onClick={clearSearch}
				additionalProps={{
					btnType:  ButtonType.TEXT,
					text:     'Clear',
					size:     Size.SMALL,
					color:    Color.SECONDRAY_GRAY,
				}}
			/>
		</div>
	)
}