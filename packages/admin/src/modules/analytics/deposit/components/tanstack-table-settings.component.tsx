/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import type {
	Table,
} from '@tanstack/react-table'
import {
	flexRender,
} from '@tanstack/react-table'

import {
	Menu,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	AssetNamesType,
} from '../../../../shared/types'
import {
	useUpsertTablePreference,
} from '../../../../shared/hooks/table/table.hooks'
import * as styles from './tanstack.style'

type TablePreferencePatch = {
	columnVisibility?: Record<string, boolean>
	columnOrder?: Array<string>
}

type Props<TData> = {
	table: Table<TData>
	open: boolean
	setOpen: (v: boolean) => void
	defaultColumnOrder: Array<string>
}

export const TanstackTableSettingsDialog = <TData,>({
	table,
	open,
	setOpen,
	defaultColumnOrder,
}: Props<TData>,): React.JSX.Element => {
	const rootRef = React.useRef<HTMLDivElement | null>(null,)
	const defaultOrderRef = React.useRef<Array<string>>(defaultColumnOrder,)

	const {
		userInfo,
	} = useUserStore()
	const {
		mutateAsync: upsertTablePreference,
	} = useUpsertTablePreference()

	React.useEffect(() => {
		defaultOrderRef.current = defaultColumnOrder
	}, [defaultColumnOrder,],)

	React.useEffect(() => {
		if (!open) {
			return
		}

		const onPointerDown = (e: PointerEvent,): void => {
			const root = rootRef.current
			if (!root) {
				return
			}
			if (root.contains(e.target as Node,)) {
				return
			}
			setOpen(false,)
		}

		document.addEventListener('pointerdown', onPointerDown, true,)
		// eslint-disable-next-line consistent-return
		return () => {
			document.removeEventListener('pointerdown', onPointerDown, true,)
		}
	}, [open, setOpen,],)

	const columnsForToggle = React.useMemo(() => {
		return table.getAllLeafColumns().filter((c,) => {
			return c.id !== '_actions'
		},)
	}, [table,],)

	// eslint-disable-next-line no-unused-vars
	const allVisible = React.useMemo(() => {
		return (
			columnsForToggle.length > 0 &&
			columnsForToggle.every((c,) => {
				return c.getIsVisible()
			},)
		)
	}, [columnsForToggle,],)

	const savePreference = (next?: TablePreferencePatch,): void => {
		const userName = userInfo.name
		if (!userName) {
			return
		}

		const state = table.getState()

		const payload = JSON.stringify({
			columnVisibility: next?.columnVisibility ?? state.columnVisibility,
			columnOrder:      next?.columnOrder ?? state.columnOrder,
		},)

		upsertTablePreference({
			userName,
			tableName: AssetNamesType.CASH_DEPOSIT,
			payload,
		},)
	}

	const setAllVisible = (): void => {
		const t = table as any
		if (typeof t.setColumnVisibility === 'function') {
			t.setColumnVisibility({
			},)
		} else {
			columnsForToggle.forEach((col,) => {
				col.toggleVisibility(true,)
			},)
		}

		savePreference({
			columnVisibility: {
			},
		},)
	}

	const resetAll = (): void => {
		const t = table as any
		const order = defaultOrderRef.current ?? []

		if (typeof t.setColumnOrder === 'function') {
			t.setColumnOrder(order,)
		} else {
			table.setColumnOrder(order,)
		}

		if (typeof t.setColumnVisibility === 'function') {
			t.setColumnVisibility({
			},)
		}

		savePreference({
			columnOrder:      order,
			columnVisibility: {
			},
		},)
	}

	const toggleColumn = (colId: string, nextVisible: boolean,): void => {
		const col = table.getColumn(colId,)
		if (!col) {
			return
		}

		if (!nextVisible) {
			const visibleCount = table
				.getVisibleLeafColumns()
				.filter((c,) => {
					return c.id !== '_actions'
				},).length
			if (visibleCount <= 1) {
				return
			}
		}

		col.toggleVisibility(nextVisible,)

		const current = table.getState().columnVisibility

		const nextVisibility = nextVisible ?
			Object.fromEntries(
				Object.entries(current,).filter(([key,],) => {
					return key !== colId
				},),
			) :
			{
				...current, [colId]: false,
			}

		savePreference({
			columnVisibility: nextVisibility,
		},)
	}

	return (
		<div ref={rootRef} className={styles.settingsRoot}>
			<Button<ButtonType.ICON>
				className={styles.settingsButton}
				onClick={(e,) => {
					e.stopPropagation()
					setOpen(!open,)
				}}
				additionalProps={{
					btnType: ButtonType.ICON,
					size:    Size.SMALL,
					color:   Color.NON_OUT_BLUE,
					icon:    <Menu />,
				}}
			/>

			{open && (
				<div className={styles.settingsPopover}>
					<div className={styles.settingsContent}>
						{columnsForToggle.map((col,) => {
							const canHide = col.getCanHide()
							const isVisible = col.getIsVisible()
							const visibleCount = table
								.getVisibleLeafColumns()
								.filter((c,) => {
									return c.id !== '_actions'
								},).length
							const disable =
								isVisible && visibleCount <= 1

							return (
								<label
									key={col.id}
									className={styles.checkboxBlock}
								>
									<input
										type='checkbox'
										checked={isVisible}
										disabled={!canHide || disable}
										onChange={(e,) => {
											e.stopPropagation()
											toggleColumn(
												col.id,
												e.target.checked,
											)
										}}
										onPointerDown={(e,) => {
											e.stopPropagation()
										}
										}
										className={styles.hiddenCheckbox}
									/>
									<span
										className={styles.customCheckbox}
									/>
									{flexRender(
										col.columnDef.header,
										{
											table,
											column: col,
											header: undefined as any,
										},
									)}
								</label>
							)
						},)}

						<Button<ButtonType.TEXT>
							onClick={(e,) => {
								e.stopPropagation()
								setAllVisible()
							}}
							className={styles.clearBtn}
							additionalProps={{
								btnType: ButtonType.TEXT,
								size:    Size.SMALL,
								color:   Color.NON_OUT_BLUE,
								text:    'Show all',
							}}
						/>

						<Button<ButtonType.TEXT>
							onClick={(e,) => {
								e.stopPropagation()
								resetAll()
								setOpen(false,)
							}}
							className={styles.clearBtn}
							additionalProps={{
								btnType: ButtonType.TEXT,
								size:    Size.SMALL,
								color:   Color.NON_OUT_BLUE,
								text:    'Reset to default',
							}}
						/>
					</div>
				</div>
			)}
		</div>
	)
}
