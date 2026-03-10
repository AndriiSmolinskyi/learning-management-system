/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */

import React from 'react'
import {
	Classes, Popover,
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
import type {
	IOptionType,
} from '../../../../shared/types'
import {
	useAuditUsers,
} from '../../../../shared/hooks/settings/transaction-settings.hook'
import {
	useAuditTypeStore,
} from '../audit-filter.store'
import type {
	TAuditTrailFilter,
} from '../../../../shared/types'
import {
	TransactionTypeAuditType,
} from '../../../../shared/types'
import {
	Tag,
	User,
} from '../../../../assets/icons'
import * as styles from './audit-trail.style'

interface IProps {
	children: React.ReactNode
	isFilterVisible: boolean
	auditTypeFilter: TAuditTrailFilter | undefined
	setAuditTypeFilter: React.Dispatch<React.SetStateAction<TAuditTrailFilter | undefined>>
	setDialogOpen: (value: boolean) => void
}

export const TransactionAuditFilterDialog: React.FC<IProps> = ({
	children,
	isFilterVisible,
	auditTypeFilter,
	setAuditTypeFilter,
	setDialogOpen,
},) => {
	const {
		data: userList,
	} = useAuditUsers()
	const {
		filter, setUsers, setSettingsType, setEditCards,
	} = useAuditTypeStore()
	const [isClearClicked, setIsClearClicked,] = React.useState<boolean>(false,)

	React.useEffect(() => {
		setAuditTypeFilter({
			...auditTypeFilter,
			userName:     filter.userName,
			settingsType: filter.settingsType,
			editCards:    filter.editCards,
		},)
	}, [isFilterVisible,],)

	const handleFilterApply = (filter: TAuditTrailFilter | undefined,): void => {
		setUsers(filter?.userName,)
		setSettingsType(filter?.settingsType,)
		setEditCards(filter?.editCards,)
	}

	const applyCondition = !(isClearClicked ||
		(filter.userName !== auditTypeFilter?.userName) ||
		(filter.settingsType !== auditTypeFilter?.settingsType) ||
		(filter.editCards !== auditTypeFilter?.editCards)
	)

	const SETTINGS_TYPE: ReadonlyArray<TransactionTypeAuditType> = [
		TransactionTypeAuditType.ADDED,
		TransactionTypeAuditType.ARCHIVED,
		TransactionTypeAuditType.DELETED,
		TransactionTypeAuditType.EDITED,
		TransactionTypeAuditType.RELATION,
		TransactionTypeAuditType.RESTORED,
	] as const

	const settingsOptions = React.useMemo<Array<IOptionType<TransactionTypeAuditType>>>(() => {
		return SETTINGS_TYPE.map((label,) => {
			return {
				label, value: label,
			}
		},)
	}, [],)

	const content = (
		<div className={styles.filterDialogContainer}>
			<div className={styles.filterDialogWrapper}>
				<SelectComponent<TransactionTypeAuditType>
					isMulti
					isSearchable
					placeholder='Select actions'
					options={settingsOptions}
					isAudit={true}
					leftIcon={<Tag width={18} height={18}/>}
					value={(auditTypeFilter?.settingsType ?? [])
						.filter((v,): v is TransactionTypeAuditType => {
							return typeof v === 'string' && v.length > 0
						},)
						.map((v,) => {
							return {
								label: v, value: v,
							}
						},)}
					onChange={(select,) => {
						const selected = Array.isArray(select,) ?
							(select as Array<IOptionType<TransactionTypeAuditType>>) :
							select ?
								[select as IOptionType<TransactionTypeAuditType>,] :
								[]
						setAuditTypeFilter((prev,) => {
							return {
								...(prev ?? {
								}),
								settingsType: selected.map((o,) => {
									return o.value
								},),
							}
						},)
					}}
				/>
				<SelectComponent<string>
					isMulti
					isSearchable
					placeholder='Select users'
					options={userList ?? []}
					leftIcon={<User width={18} height={18}/>}
					value={(auditTypeFilter?.userName ?? [])
						.filter((id,): id is string => {
							return typeof id === 'string' && id.length > 0
						},)
						.map((id,) => {
							return userList?.find((o,) => {
								return o.value === id
							},)
						},)
						.filter((o,): o is IOptionType<string> => {
							return Boolean(o,)
						},)}

					onChange={(select,) => {
						const selected = Array.isArray(select,) ?
							(select as Array<IOptionType<string>>) :
							select ?
								[select as IOptionType<string>,] :
								[]
						setAuditTypeFilter((prev,) => {
							return {
								...(prev ?? {
								}),
								userName: selected.map((o,) => {
									return o.value
								},),
							}
						},)
					}}
				/>
				<label className={styles.checkboxBlock}>
					<input
						type='checkbox'
						checked={Boolean(auditTypeFilter?.editCards,)}
						onChange={(e,) => {
							setAuditTypeFilter((prev,) => {
								return {
									...(prev ?? {
									}),
									editCards: e.target.checked || undefined,
								}
							},)
						}}
						className={styles.hiddenCheckbox}
					/>
					<span className={styles.customCheckbox} /> Show only cards with edits
				</label>
			</div>
			<div className={styles.filterBtnWrapper}>
				<Button<ButtonType.TEXT>
					className={styles.clearBtn}
					onClick={() => {
						setAuditTypeFilter(undefined,)
						setIsClearClicked(!isClearClicked,)
					}}
					disabled={!(auditTypeFilter?.userName ??
						auditTypeFilter?.settingsType ??
						typeof auditTypeFilter?.editCards === 'boolean'
					)}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Clear',
						size:    Size.SMALL,
						color:   Color.SECONDRAY_GRAY,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(styles.applyBtn, Classes.POPOVER_DISMISS,)}
					onClick={() => {
						handleFilterApply(auditTypeFilter,)
						setDialogOpen(false,)
						if (isClearClicked) {
							setIsClearClicked(!isClearClicked,)
						}
					}}
					disabled={applyCondition}
					additionalProps={{
						btnType: ButtonType.TEXT,
						text:    'Apply',
						size:    Size.SMALL,
						color:   Color.BLUE,
					}}
				/>
			</div>
		</div>
	)

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
