import React from 'react'
import {
	Button,
	ButtonType,
	Color,
	Size,
	Input,
} from '../../../../shared/components'
import {
	Search,
	Filter,
	CloseXIcon,
} from '../../../../assets/icons'
import {
	useTransactionTypeAuditTrail,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import {
	AuditTrailItem,
} from './audit-trail-item.component'
import {
	useDebounce,
} from '../../../../shared/hooks'
import {
	TransactionAuditFilterDialog,
} from './audit-trail-filter.component'
import {
	toggleState,
} from '../../../../shared/utils'
import type {
	TAuditTrailFilter,
} from '../../../../shared/types'
import {
	useAuditTypeStore,
} from '../audit-filter.store'
import * as styles from './audit-trail.style'

type Props = {
	onClose: () => void
}

export const AuditTrail: React.FC<Props> = ({
	onClose,
},) => {
	const [auditTypeFilter, setAuditTypeFilter,] = React.useState<TAuditTrailFilter | undefined>()
	const [isFilterVisible, setIsFilterVisible,] = React.useState<boolean>(false,)
	const {
		filter, setSearch,
	} = useAuditTypeStore()
	const finalFilter = useDebounce(filter, 700,)
	const {
		data: auditList,
	} = useTransactionTypeAuditTrail(finalFilter,)

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>,): void => {
		setSearch(e.target.value || undefined,)
	}

	const hasFilters = !(filter.userName ?? filter.settingsType ?? filter.editCards)

	return (
		<div className={styles.formContainer}>
			<h3 className={styles.formHeader}>Transaction audit trail</h3>
			<div className={styles.filterBlock}>
				<div
					className={styles.clientHeaderInput}
				>
					<Input
						name='search'
						label=''
						input={{
							value:       filter.search,
							onChange:    handleSearch,
							placeholder: 'Search',
							autoFocus:   true,
						}}
						leftIcon={<Search width={20} height={20} />}
					/>
				</div>
				<TransactionAuditFilterDialog
					setDialogOpen={setIsFilterVisible}
					isFilterVisible={isFilterVisible}
					auditTypeFilter={auditTypeFilter}
					setAuditTypeFilter={setAuditTypeFilter}
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
				</TransactionAuditFilterDialog>
			</div>
			<div className={styles.detailsFormWrapper}>
				{auditList?.map((audit,) => {
					return (
						<AuditTrailItem
							key={audit.id}
							auditItem={audit}
						/>
					)
				},)}
			</div>
		</div>
	)
}