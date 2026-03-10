/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React from 'react'
import type {
	ActionMeta,
	ControlProps,
	MenuListProps,
	MultiValueProps,
	DropdownIndicatorProps,
	SingleValueProps,
} from 'react-select'
import Select, {
	components,
} from 'react-select'
import {
	cx,
} from '@emotion/css'
import {
	PlusBlueLight,
	XmarkSecond,
	ChevronDown,
} from '../../../assets/icons'
import {
	CreatebleSelectEnum,
} from '../../../shared/constants/createble-select.constants'
import {
	TransactionTypeAuditType,
} from '../../../shared/types'
import type {
	IOptionType, SelectValueType,
} from '../../../shared/types'
import type {
	GroupBase,
} from 'react-select'

import * as styles from './select.style'

interface ISelectComponentProps<T = string> {
	options: Array<IOptionType<T>>
	isMulti?: boolean
	value?: SelectValueType<T>
	placeholder?: string
	leftIcon?: React.ReactNode
	isCreateble?: boolean
	isSearchable?: boolean
	createbleStatus?: CreatebleSelectEnum
	isDisabled?: boolean
	isClearable?: boolean
	isLoading?: boolean
	tabIndex?: number
	isBadges?: boolean
	isAudit?: boolean
	onChange: (
		selectedOption: SelectValueType<T>,
		actionMeta: ActionMeta<IOptionType<T>>
	) => void
	getMultiValueElement?: (props: MultiValueProps<IOptionType<T>, boolean>) => React.ReactNode
	createFn?: (isin: string) => Promise<void>
}

export function SelectComponent<T = string>({
	options,
	isMulti = false,
	leftIcon,
	value = undefined,
	placeholder = 'Choose',
	onChange,
	isCreateble,
	createbleStatus,
	isDisabled,
	isSearchable,
	getMultiValueElement,
	isClearable,
	isBadges,
	createFn,
	isLoading,
	tabIndex,
	isAudit,
}: ISelectComponentProps<T>,): React.ReactNode {
	const [menuIsOpen, setMenuIsOpen,] = React.useState(false,)
	const CustomControl = ({
		children, ...props
	}: ControlProps<IOptionType<T>, boolean>,): React.JSX.Element => {
		return (
			<div className={styles.inputWrapper(isDisabled,)}>
				{leftIcon && <span className={styles.leftSvg(props.menuIsOpen, isDisabled,)}>{leftIcon}</span>}
				<components.Control {...props}>
					{children}
				</components.Control>
			</div>
		)
	}

	const CustomDropdownIndicator = (props: DropdownIndicatorProps<IOptionType<T>, boolean>,): React.ReactNode => {
		const {
			menuIsOpen,
		} = props.selectProps
		return (
			<div className={styles.chevronIcon(menuIsOpen, isDisabled,)}>
				<ChevronDown />
			</div>
		)
	}

	const createMenuList = (text: string,createFn?: (value: string) => Promise<void>,):
	((props: MenuListProps<IOptionType<T>, boolean>) => React.JSX.Element) => {
		return (props: MenuListProps<IOptionType<T>, boolean>,) => {
			const {
				inputValue,
			} = props.selectProps
			return (
				<components.MenuList {...props}>
					{props.children}
					{inputValue && createFn && (
						<div
							className={styles.addOptionWrapper}
							onClick={async() => {
								await createFn(inputValue,)
								setMenuIsOpen(false,)
							}}
						>
							<PlusBlueLight className={styles.addOptionPlusIcon} />
							<span className={styles.addOptionText}>{text}</span>
						</div>
					)}
				</components.MenuList>
			)
		}
	}

	const getMenuList = (createbleStatus: CreatebleSelectEnum,): ((props: MenuListProps<IOptionType<T>, boolean>) => React.JSX.Element) | undefined => {
		switch (createbleStatus) {
		case CreatebleSelectEnum.DOCUMENT:
			return createMenuList('Add new document type', createFn,)
		case CreatebleSelectEnum.BANK:
			return createMenuList('Add new bank', createFn,)
		case CreatebleSelectEnum.SERVICE_PROVIDERS:
			return createMenuList('Add new service provider', createFn,)
		case CreatebleSelectEnum.EXPENSE_CATEGORY:
			return createMenuList('Add new category', createFn,)
		case CreatebleSelectEnum.TRANSACTION_CATEGORY:
			return createMenuList('Add new category', createFn,)
		case CreatebleSelectEnum.ISIN:
			return createMenuList('Add new isin', createFn,)
		case CreatebleSelectEnum.TRANSACTION_TYPE:
			return createMenuList('Add new transaction', createFn,)
		default:
			return undefined
		}
	}

	const LoadingMenuList = <T,>(
		props: MenuListProps<IOptionType<T>, boolean>,
	): React.JSX.Element => {
		return (
			<components.MenuList {...props}>
				<div className={styles.addOptionWrapper}>
					<span className={styles.loadingTextStyles}/>
				</div>
			</components.MenuList>
		)
	}

	const CustomMultiValue = (props: MultiValueProps<IOptionType<T>, boolean>,): React.ReactNode => {
		const {
			data, removeProps,
		} = props
		if (getMultiValueElement) {
			return getMultiValueElement(props,)
		}
		return (

			<>
				{isAudit ?
					(
						auditBadge(String(data.label,),)
					) :
					(
						<div className={styles.customMultiSelectItem}>
							<span className={styles.multiValueText}>{data.label}</span>
							<span {...removeProps}>
								<XmarkSecond className={styles.customMultiSelectItemBtn} />
							</span>
						</div>
					)}
			</>

		)
	}

	const auditBadge = (label: string,): React.ReactNode => {
		let badgeClass: string | undefined

		switch (label as unknown as TransactionTypeAuditType) {
		case TransactionTypeAuditType.ADDED:
		case TransactionTypeAuditType.RELATION:
		case TransactionTypeAuditType.RESTORED:
			badgeClass = styles.auditFirst
			break
		case TransactionTypeAuditType.EDITED:
			badgeClass = styles.auditSecond
			break
		case TransactionTypeAuditType.ARCHIVED:
		case TransactionTypeAuditType.DELETED:
			badgeClass = styles.auditThird
			break
		default:
			badgeClass = undefined
		}

		return <p className={cx(styles.infoBadge, badgeClass,)}>{label}</p>
	}

	const CustomSingleValue = (
		props: SingleValueProps<IOptionType<T>>,
	): React.ReactNode => {
		return (
			<div className={styles.singleValueSpan}>
				<span className={styles.multiValueText}>{props.data.label}</span>
			</div>
		)
	}

	const BadgesOption = (props: IOptionType<T>,): React.ReactNode => {
		const {
			label,
		} = props

		let badgeClass
		if (label === 'Corporate') {
			badgeClass = styles.corporateBadge
		} else if (label === 'Private') {
			badgeClass = styles.privateBadge
		} else if (label === 'Joint') {
			badgeClass = styles.jointBadge
		}

		return (
			<p className={cx(styles.infoBadge, badgeClass,)}>{label}</p>
		)
	}

	const AuditFilter = (props: IOptionType<T>,): React.ReactNode => {
		const {
			label,
		} = props

		let badgeClass
		if (label === TransactionTypeAuditType.ADDED) {
			badgeClass = styles.auditFirst
		} else if (label === TransactionTypeAuditType.ARCHIVED) {
			badgeClass = styles.auditThird
		} else if (label === TransactionTypeAuditType.DELETED) {
			badgeClass = styles.auditThird
		} else if (label === TransactionTypeAuditType.EDITED) {
			badgeClass = styles.auditSecond
		} else if (label === TransactionTypeAuditType.RELATION) {
			badgeClass = styles.auditFirst
		} else if (label === TransactionTypeAuditType.RESTORED) {
			badgeClass = styles.auditFirst
		}

		return (
			<p className={cx(styles.infoBadge, badgeClass,)}>{label}</p>
		)
	}

	return (
		<Select
			isClearable={isClearable}
			isDisabled={isDisabled}
			value={value}
			onChange={onChange}
			options={options as Array<IOptionType<T> | GroupBase<IOptionType<T>>>}
			isMulti={isMulti}
			className={styles.selectStyle}
			classNamePrefix='react-select'
			menuPlacement='auto'
			placeholder={placeholder}
			isSearchable={isSearchable}
			tabIndex={tabIndex}
			menuIsOpen={menuIsOpen}
			onMenuOpen={() => {
				setMenuIsOpen(true,)
			}}
			onMenuClose={() => {
				setMenuIsOpen(false,)
			}}
			formatOptionLabel={
				isAudit ?
					AuditFilter :
					isBadges ?
						BadgesOption :
						undefined
			}

			components={{
				Control: CustomControl,
				...(isCreateble && createbleStatus && !isLoading && {
					MenuList: getMenuList(createbleStatus,),
				}),
				...(isLoading && {
					MenuList: LoadingMenuList,
				}),
				...(isMulti ?
					{
						MultiValue: CustomMultiValue,
					} :
					{
						SingleValue: CustomSingleValue,
					}),
				DropdownIndicator: CustomDropdownIndicator,
			}}

		/>
	)
}
