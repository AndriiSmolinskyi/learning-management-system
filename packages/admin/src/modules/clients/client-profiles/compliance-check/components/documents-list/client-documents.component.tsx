import * as React from 'react'
import * as styles from './documents-list.styles'
import {
	ComplianceCheckbox,
} from '../checkbox/checkbox.component'
import {
	useComplianceCheckStore,
} from '../../../../../../store/compliance-check.store'
import {
	Users,
} from '../../../../../../assets/icons'
import {
	Collapse,
} from '@blueprintjs/core'
import {
	CollapseArrowIcon,
} from '../../../../../../assets/icons'
import type {
	Client,
} from '../../../../../../shared/types'

interface IClientDocumentsListProps {
	userData : Client
}

export const ClientDocumentsList: React.FC<IClientDocumentsListProps> = ({
	userData,
},) => {
	const [isClientListOpened,setIsClientListOpened,] = React.useState<boolean>(false,)

	const {
		isCheckedAll,
		items,
		toggleSelectAll,
		toggleItem,
	} = useComplianceCheckStore()

	const sortedItems = [...items,].sort((a, b,) => {
		return new Date(b.updatedAt,).getTime() - new Date(a.updatedAt,).getTime()
	},)

	React.useEffect(() => {
		if (isCheckedAll) {
			setIsClientListOpened(true,)
		}
	}, [isCheckedAll,],)
	return (
		<div className={styles.listWrapper}>
			<div className={styles.topHeader}>
				<div className={styles.selectAllBlock(sortedItems.length === 0,)}>
					<ComplianceCheckbox
						key={userData.id}
						label={userData.id}
						isChecked={isCheckedAll}
						onChange={toggleSelectAll}
						isSelectAll
					/>
					<div>
						<p className={styles.iconClientText}><Users className={styles.usersIcon}/><span>Client</span></p>
						<p className={styles.clientNameText}>{userData.firstName} {userData.lastName}</p>
					</div>
				</div>
				<button className={styles.collapseArrowButton(isClientListOpened,)} type='button' onClick={() => {
					setIsClientListOpened(!isClientListOpened,)
				}}><CollapseArrowIcon/></button>
			</div>

			<Collapse isOpen={isClientListOpened}>
				<ul className={styles.checkboxList}>
					{sortedItems.map((item,) => {
						return (
							<ComplianceCheckbox
								key={item.id}
								file={item}
								label={item.label}
								isChecked={item.isChecked}
								onChange={() => {
									toggleItem(item.id,)
								}}
								title={`${userData.firstName} ${userData.lastName}`}
								isNew={
									sortedItems[0]?.updatedAt === item.updatedAt &&
									(new Date().getTime() - new Date(item.updatedAt,).getTime()) <= 12 * 60 * 60 * 1000
								}
							/>
						)
					},)}
				</ul>
			</Collapse>
		</div>
	)
}
