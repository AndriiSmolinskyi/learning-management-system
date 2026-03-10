/* eslint-disable consistent-return */
/* eslint-disable max-lines */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable max-lines */
// /* eslint-disable no-nested-ternary */
// /* eslint-disable complexity */
// import React from 'react'
// import {
// 	cx,
// } from '@emotion/css'
// import {
// 	format,
// } from 'date-fns'
// import type {
// 	Header, ColumnDef, CellContext,
// } from '@tanstack/react-table'
// import {
// 	flexRender, getCoreRowModel, useReactTable,
// } from '@tanstack/react-table'
// import {
// 	DndContext,
// 	KeyboardSensor,
// 	PointerSensor,
// 	closestCenter,
// 	type DragEndEvent,
// 	useSensor,
// 	useSensors,
// } from '@dnd-kit/core'
// import {
// 	restrictToHorizontalAxis,
// } from '@dnd-kit/modifiers'
// import {
// 	arrayMove,
// 	SortableContext,
// 	horizontalListSortingStrategy,
// 	useSortable,
// } from '@dnd-kit/sortable'
// import {
// 	CSS as DndCSS,
// } from '@dnd-kit/utilities'

// import type {
// 	IAnalyticDeposit, IDepositByFilter,
// } from '../../../../services/analytics/analytics.types'
// import {
// 	localeString, toggleState, formatWithAllDecimals,
// } from '../../../../shared/utils'
// import {
// 	Button,
// 	ButtonType,
// 	Size,
// 	Color,
// 	Dialog,
// 	Loader,
// 	SaveAsExcelButton,
// 	EmptyAnalyticsResponse,
// } from '../../../../shared/components'
// import {
// 	Rotate, ArrowDownUp, ArrowDownUpFilled,
// } from '../../../../assets/icons'

// import {
// 	useDepositStore,
// } from '../deposit.store'
// import {
// 	SortOrder, AssetNamesType,
// } from '../../../../shared/types'
// import {
// 	TDepositTableSortVariants,
// } from '../deposit.types'
// import {
// 	getDepositSheetData,
// } from '../deposit.utils'
// import {
// 	DeleteAssetModal,
// } from '../../components/delete-asset-modal/delete-asset-modal.component'
// import {
// 	useAnalyticsFilterStore,
// } from '../../analytics-store'
// import {
// 	TransferConfirmationDialog,
// 	TransferSuccessModal,
// } from '../../../../modules/clients/portfolios/portfolio-details/components/asset'
// import {
// 	ItemDetails,
// } from './item-details'
// import {
// 	TanstackTableSettingsDialog,
// } from './tanstack-table-settings.component'
// import {
// 	useUserStore,
// } from '../../../../store/user.store'
// import {
// 	useTablePreference,
// 	useUpsertTablePreference,
// } from '../../../../shared/hooks/table/table.hooks'
// import * as styles from './tanstack.style'

// type Props = {
// 	tableData?: IDepositByFilter
// 	refetchData: () => void
// 	tableIsFetching?: boolean
// 	isFilterApplied?: boolean
// }

// const fmtDate = (v: unknown,): string => {
// 	return v ?
// 		format(new Date(v as number | string | Date,), 'dd.MM.yyyy',) :
// 		''
// }
// const fmtUSD = (v: unknown,): string => {
// 	return localeString(Number(v,), 'USD', 0, false,)
// }
// const fmtNum = (v: unknown,): string => {
// 	return formatWithAllDecimals(Number(v,),)
// }

// const FIXED_COL_ID = '_actions'

// type PrefPayload = {
// 	columnVisibility?: Record<string, boolean>
// 	columnOrder?: Array<string>
// }

// export const TanstackDepositTable: React.FC<Props> = ({
// 	tableData,
// 	refetchData,
// 	tableIsFetching,
// 	isFilterApplied,
// },) => {
// 	const [isSettingsOpen, setIsSettingsOpen,] = React.useState(false,)

// 	const [columnVisibility, setColumnVisibility,] = React.useState<Record<string, boolean> >({
// 	},)
// 	const [isSettinsCome, setIsSettingsCome,] = React.useState(false,)
// 	const [totalUsdValue, setTotalUsdValue,] = React.useState<number | undefined>(0,)

// 	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
// 	const toggleDeleteDialog = toggleState(setIsDeleteModalShown,)
// 	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)

// 	const handleOpenDeleteModal = (assetId: string,): void => {
// 		setDeleteAssetId(assetId,)
// 		toggleDeleteDialog()
// 	}

// 	const columns: Array<ColumnDef<IAnalyticDeposit, unknown>> = [
// 		{
// 			id:           FIXED_COL_ID,
// 			enableHiding: false,
// 			header:       (): React.JSX.Element => {
// 				return (
// 					<TanstackTableSettingsDialog
// 						table={table}
// 						open={isSettingsOpen}
// 						setOpen={setIsSettingsOpen}
// 						defaultColumnOrder={defaultColumnOrder}
// 					/>
// 				)
// 			},
// 			cell: ({
// 				row,
// 			},): React.JSX.Element => {
// 				return (
// 					<ItemDetails
// 						row={row.original}
// 						refetchData={refetchData}
// 						handleOpenDeleteModal={handleOpenDeleteModal}
// 					/>
// 				)
// 			},
// 		},
// 		{
// 			id:          'portfolioName',
// 			accessorKey: 'portfolioName',
// 			header:      (): React.JSX.Element => {
// 				return <span>Portfolio</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return <div className={styles.cellContent}>{String(getValue() ?? '',)}</div>
// 			},
// 		},
// 		{
// 			id:          'entityName',
// 			accessorKey: 'entityName',
// 			header:      (): React.JSX.Element => {
// 				return <span>Entity</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return <div className={styles.cellContent}>{String(getValue() ?? '',)}</div>
// 			},
// 		},
// 		{
// 			id:          'bankName',
// 			accessorKey: 'bankName',
// 			header:      (): React.JSX.Element => {
// 				return <span>Bank</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return <div className={styles.cellContent}>{String(getValue() ?? '',)}</div>
// 			},
// 		},
// 		{
// 			id:          'accountName',
// 			accessorKey: 'accountName',
// 			header:      (): React.JSX.Element => {
// 				return <span>Account</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return <div className={styles.cellContent}>{String(getValue() ?? '',)}</div>
// 			},
// 		},
// 		{
// 			id:          'startDate',
// 			accessorKey: 'startDate',
// 			header:      (): React.JSX.Element => {
// 				return <span>Start date</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return (
// 					<span className={cx(styles.textNowrap, styles.tableNumberField,)}>
// 						{fmtDate(getValue(),)}
// 					</span>
// 				)
// 			},
// 		},
// 		{
// 			id:          'maturityDate',
// 			accessorKey: 'maturityDate',
// 			header:      (): React.JSX.Element => {
// 				return <span>Maturity</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return (
// 					<span className={cx(styles.textNowrap, styles.tableNumberField,)}>
// 						{getValue() ?
// 							fmtDate(getValue(),) :
// 							'N/A'}
// 					</span>
// 				)
// 			},
// 		},
// 		{
// 			id:          'currency',
// 			accessorKey: 'currency',
// 			header:      (): React.JSX.Element => {
// 				return <span>Currency</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return <span>{String(getValue() ?? '',)}</span>
// 			},
// 		},
// 		{
// 			id:          'currencyValue',
// 			accessorKey: 'currencyValue',
// 			header:      (): React.JSX.Element => {
// 				return <span>Value FC</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return <span className={styles.tableNumberField}>{fmtNum(getValue(),)}</span>
// 			},
// 		},
// 		{
// 			id:          'usdValue',
// 			accessorKey: 'usdValue',
// 			header:      (): React.JSX.Element => {
// 				return <span>Value USD</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return <span className={styles.tableNumberField}>{fmtUSD(getValue(),)}</span>
// 			},
// 		},
// 		{
// 			id:          'interest',
// 			accessorKey: 'interest',
// 			header:      (): React.JSX.Element => {
// 				return <span>Interest</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return <span className={styles.tableNumberField}>{fmtNum(getValue(),)}%</span>
// 			},
// 		},
// 		{
// 			id:          'policy',
// 			accessorKey: 'policy',
// 			header:      (): React.JSX.Element => {
// 				return <span>Policy</span>
// 			},
// 			cell:        ({
// 				getValue,
// 			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
// 				return <span>{String(getValue() ?? '',)}</span>
// 			},
// 		},
// 	]

// 	const nonFixedIds = React.useMemo(() => {
// 		return columns.map((c,) => {
// 			return c.id!
// 		},).filter((id,) => {
// 			return id !== FIXED_COL_ID
// 		},)
// 	}, [columns,],)

// 	const defaultColumnOrder = React.useMemo(() => {
// 		return [FIXED_COL_ID, ...nonFixedIds,]
// 	}, [nonFixedIds,],)

// 	const [columnOrder, setColumnOrder,] = React.useState<Array<string>>(defaultColumnOrder,)

// 	const data = React.useMemo(() => {
// 		return tableData?.list ?? []
// 	}, [tableData?.list,],)

// 	const sortableItems = React.useMemo(() => {
// 		return nonFixedIds
// 	}, [nonFixedIds,],)

// 	const table = useReactTable<IAnalyticDeposit>({
// 		columns,
// 		data,
// 		state:                    {
// 			columnVisibility, columnOrder,
// 		},
// 		onColumnVisibilityChange: setColumnVisibility,
// 		onColumnOrderChange:      setColumnOrder,
// 		getCoreRowModel:          getCoreRowModel(),
// 		autoResetPageIndex:       false,
// 	},)

// 	const {
// 		userInfo,
// 	} = useUserStore()

// 	const userKey = userInfo.name

// 	useUpsertTablePreference()

// 	const {
// 		data: tablePref,
// 	} = useTablePreference(
// 		userKey ?
// 			{
// 				userName: String(userKey,), tableName: AssetNamesType.CASH_DEPOSIT,
// 			} :
// 			undefined,
// 	)

// 	const hasAppliedPrefRef = React.useRef(false,)

// 	React.useEffect(() => {
// 		if (!userKey) {
// 			return
// 		}
// 		hasAppliedPrefRef.current = false
// 	}, [userKey,],)

// 	React.useEffect(() => {
// 		if (hasAppliedPrefRef.current) {
// 			return
// 		}
// 		if (!tablePref?.payload) {
// 			return
// 		}

// 		try {
// 			const rawPayload = (tablePref as any).payload
// 			const parsed: PrefPayload =
// 				typeof rawPayload === 'string' ?
// 					(JSON.parse(rawPayload,) as PrefPayload) :
// 					(rawPayload as PrefPayload)

// 			setColumnVisibility(parsed.columnVisibility ?? {
// 			},)

// 			const allowed = new Set(defaultColumnOrder,)
// 			const fromDb = Array.isArray(parsed.columnOrder,) ?
// 				parsed.columnOrder :
// 				[]
// 			const cleaned = fromDb.filter((id,) => {
// 				return allowed.has(id,) && id !== FIXED_COL_ID
// 			},)
// 			const nextOrder: Array<string> = [FIXED_COL_ID, ...cleaned,]

// 			defaultColumnOrder.forEach((id,) => {
// 				if (id === FIXED_COL_ID) {
// 					return
// 				}
// 				if (!nextOrder.includes(id,)) {
// 					nextOrder.push(id,)
// 				}
// 			},)

// 			setColumnOrder(nextOrder,)
// 		} catch {
// 			setColumnVisibility({
// 			},)
// 			setColumnOrder(defaultColumnOrder,)
// 		} finally {
// 			setIsSettingsCome(true,)
// 			hasAppliedPrefRef.current = true
// 		}
// 	}, [tablePref?.payload, defaultColumnOrder,],)

// 	const {
// 		mutateAsync: upsertTablePreference,
// 	} = useUpsertTablePreference()

// 	const savePreference = (nextOrder?: Array<string>,): void => {
// 		if (!userKey) {
// 			return
// 		}

// 		const state = table.getState()

// 		const payload = JSON.stringify({
// 			columnVisibility: state.columnVisibility,
// 			columnOrder:      nextOrder ?? state.columnOrder,
// 		},)

// 		upsertTablePreference({
// 			userName:  String(userKey,),
// 			tableName: AssetNamesType.CASH_DEPOSIT,
// 			payload,
// 		},)
// 	}

// 	const handleDragEnd = (event: DragEndEvent,): void => {
// 		const {
// 			active, over,
// 		} = event
// 		if (!over || active.id === over.id) {
// 			return
// 		}

// 		const current = columnOrder.filter((id,) => {
// 			return id !== FIXED_COL_ID
// 		},)

// 		const oldIndex = current.indexOf(active.id as string,)
// 		const newIndex = current.indexOf(over.id as string,)
// 		if (oldIndex === -1 || newIndex === -1) {
// 			return
// 		}

// 		const moved = arrayMove(current, oldIndex, newIndex,)
// 		const nextOrder = [FIXED_COL_ID, ...moved,]

// 		setColumnOrder(nextOrder,)
// 		savePreference(nextOrder,)
// 	}

// 	const sensors = useSensors(
// 		useSensor(PointerSensor, {
// 			activationConstraint: {
// 				distance: 8,
// 			},
// 		},),
// 		useSensor(KeyboardSensor, {
// 		},),
// 	)

// 	const firstNonFixedColumnId = React.useMemo(() => {
// 		return columnOrder.find((id,) => {
// 			if (id === FIXED_COL_ID) {
// 				return false
// 			}
// 			const col = table.getColumn(id,)
// 			return Boolean(col?.getIsVisible(),)
// 		},)
// 	}, [columnOrder, columnVisibility, table,],)

// 	const sortVariantByColumnId = React.useMemo(() => {
// 		return {
// 			portfolioName: TDepositTableSortVariants.PORTFOLIO_NAME,
// 			entityName:    TDepositTableSortVariants.ENTITY_NAME,
// 			bankName:      TDepositTableSortVariants.BANK_NAME,
// 			accountName:   TDepositTableSortVariants.ACCOUNT_NAME,
// 			currency:      TDepositTableSortVariants.CURRENCY,
// 			currencyValue: TDepositTableSortVariants.CURRENCY_VALUE,
// 			interest:      TDepositTableSortVariants.INTEREST,
// 			policy:        TDepositTableSortVariants.POLICY,
// 			startDate:     TDepositTableSortVariants.START_DATE,
// 			maturityDate:  TDepositTableSortVariants.MATURITY_DATE,
// 			usdValue:      TDepositTableSortVariants.USD_VALUE,
// 		} as const
// 	}, [],)

// 	const DraggableTableHeader = ({
// 		header,
// 	}: {
// 		header: Header<IAnalyticDeposit, unknown>
// 	},): React.JSX.Element => {
// 		const {
// 			attributes, isDragging, listeners, setNodeRef, transform,
// 		} = useSortable({
// 			id: header.column.id,
// 		},)

// 		const style: React.CSSProperties = {
// 			transform:  DndCSS.Translate.toString(transform,),
// 			opacity:    isDragging ?
// 				0.8 :
// 				1,
// 			cursor:     isDragging ?
// 				'grabbing' :
// 				'grab',
// 			transition: 'transform 0.15s ease',
// 			userSelect: 'none',
// 			zIndex:     1,
// 		}

// 		const renderHeaderContent = (): React.ReactNode => {
// 			if (header.isPlaceholder) {
// 				return null
// 			}

// 			const isFirstNonFixed = header.column.id === firstNonFixedColumnId
// 			const wrapperClass = isFirstNonFixed ?
// 				styles.flex :
// 				styles.flexNumber

// 			const sortVariant =
// 				(sortVariantByColumnId as Record<string, TDepositTableSortVariants | undefined>)[
// 					header.column.id
// 				]

// 			return (
// 				<div className={wrapperClass}>
// 					{flexRender(header.column.columnDef.header, header.getContext(),)}
// 					{sortVariant ?
// 						renderSortArrows(sortVariant,) :
// 						null}
// 				</div>
// 			)
// 		}

// 		return (
// 			<th
// 				ref={setNodeRef}
// 				colSpan={header.colSpan}
// 				style={style}
// 				className={styles.headerCell}
// 				{...attributes}
// 				{...listeners}
// 			>
// 				<div className={styles.tableTitle}>{renderHeaderContent()}</div>
// 			</th>
// 		)
// 	}

// 	const {
// 		filter, sortFilter, setBankId, setCurrency, setAssetId, setSortFilters,
// 	} = useDepositStore()

// 	React.useEffect(() => {
// 		if (filter.assetId?.length) {
// 			let total = 0
// 			filter.assetId.forEach((assetId,) => {
// 				const currentAsset = tableData?.list.find((asset,) => {
// 					return asset.assetId === assetId
// 				},)
// 				if (currentAsset?.usdValue) {
// 					total = total + currentAsset.usdValue
// 				}
// 			},)
// 			setTotalUsdValue(total,)
// 		} else {
// 			setTotalUsdValue(tableData?.totalAssets,)
// 		}
// 	}, [tableData, filter.assetId,],)

// 	const visibleCols = table.getVisibleLeafColumns()
// 	const totalCount = tableData?.list.length ?? 0
// 	const totalUsdText = totalUsdValue ?
// 		localeString(totalUsdValue, 'USD', 0, false,) :
// 		'$0'

// 	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
// 	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
// 	const tableRef = React.useRef<HTMLTableElement>(null,)
// 	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)

// 	const checkHorizontalScroll = (): void => {
// 		if (tableRef.current) {
// 			setIsHorizontalScroll(tableRef.current.scrollWidth > tableRef.current.clientWidth,)
// 		}
// 	}

// 	React.useEffect(() => {
// 		checkHorizontalScroll()
// 		const handleResize = (): void => {
// 			checkHorizontalScroll()
// 		}
// 		window.addEventListener('resize', handleResize,)
// 		return () => {
// 			window.removeEventListener('resize', handleResize,)
// 		}
// 	}, [tableData,],)

// 	const checkTbodyHeight = (): void => {
// 		if (tbodyRef.current && tableRef.current) {
// 			const tbodyHeight = tbodyRef.current.offsetHeight
// 			const tableHeight = tableRef.current.offsetHeight
// 			setIsTbodyEmpty(tableHeight - tbodyHeight - 44 - 46 > 0,)
// 		}
// 	}

// 	React.useEffect(() => {
// 		checkTbodyHeight()
// 		const handleResize = (): void => {
// 			checkTbodyHeight()
// 		}
// 		window.addEventListener('resize', handleResize,)
// 		return () => {
// 			window.removeEventListener('resize', handleResize,)
// 		}
// 	}, [tableData,],)

// 	const renderSortArrows = (type: TDepositTableSortVariants,): React.ReactElement => {
// 		const isCurrent = sortFilter.sortBy === type
// 		const order = sortFilter.sortOrder

// 		const handleClick = (e: React.MouseEvent,): void => {
// 			e.stopPropagation()

// 			if (!isCurrent) {
// 				setSortFilters({
// 					sortBy: type, sortOrder: SortOrder.DESC,
// 				},)
// 			} else if (order === SortOrder.DESC) {
// 				setSortFilters({
// 					sortBy: type, sortOrder: SortOrder.ASC,
// 				},)
// 			} else {
// 				setSortFilters({
// 					sortBy: type, sortOrder: SortOrder.DESC,
// 				},)
// 			}
// 		}

// 		return (
// 			<span
// 				className={styles.sortArrows(order === SortOrder.ASC,)}
// 				onClick={handleClick}
// 				onPointerDown={(e,) => {
// 					e.stopPropagation()
// 				}}
// 			>
// 				{isCurrent ?
// 					<ArrowDownUpFilled /> :
// 					<ArrowDownUp />}
// 			</span>
// 		)
// 	}

// 	const handleTableClear = (): void => {
// 		setBankId(undefined,)
// 		setCurrency(undefined,)
// 		setAssetId(undefined,)
// 	}

// 	const depositSheetData = getDepositSheetData(tableData?.list ?? [],)

// 	const {
// 		setAssetTransferProps, assetTransferProps, resetAnalyticsFilterStore,
// 	} = useAnalyticsFilterStore()
// 	const [isTransferSuccess, setIsTransferSuccess,] = React.useState(false,)

// 	const handleTransferSuccess = (isSuccess: boolean,): void => {
// 		setIsTransferSuccess(isSuccess,)
// 	}

// 	const excelFileName = React.useMemo(() => {
// 		return `${AssetNamesType.CASH_DEPOSIT}_${format(new Date(), 'dd.MM.yyyy_HH:mm:ss',)}`
// 	}, [],)

// 	const handleRowClick = React.useCallback(
// 		(e: React.MouseEvent<HTMLTableRowElement>, assetId: string,) => {
// 			const drawer = document.querySelector('.bp5-overlay',)
// 			if (drawer && drawer.contains(e.target as Node,)) {
// 				return
// 			}

// 			setBankId(undefined,)
// 			setCurrency(undefined,)

// 			const current = filter.assetId ?? []
// 			const next = current.includes(assetId,) ?
// 				current.length === 1 ?
// 					undefined :
// 					current.filter((id,) => {
// 						return id !== assetId
// 					},) :
// 				[...current, assetId,]

// 			setAssetId(next,)
// 		},
// 		[filter.assetId, setAssetId, setBankId, setCurrency,],
// 	)

// 	return isSettinsCome && (
// 		<DndContext
// 			collisionDetection={closestCenter}
// 			modifiers={[restrictToHorizontalAxis,]}
// 			onDragEnd={handleDragEnd}
// 			sensors={sensors}
// 		>
// 			<div className={styles.tableWrapper}>
// 				<div className={styles.scrollPadding} />

// 				<table
// 					className={styles.tableContainer(!isTbodyEmpty && !tableIsFetching && Boolean(tableData?.list.length,),)}
// 					ref={tableRef}
// 				>
// 					<thead className={styles.header}>
// 						{table.getHeaderGroups().map((headerGroup,) => {
// 							return (
// 								<tr key={headerGroup.id}>
// 									{headerGroup.headers
// 										.filter((h,) => {
// 											return h.column.id === FIXED_COL_ID
// 										},)
// 										.map((h,) => {
// 											return (
// 												<th key={h.id} className={cx(styles.headerCell, styles.cellWidth44,)}>
// 													{flexRender(h.column.columnDef.header, h.getContext(),)}
// 												</th>
// 											)
// 										},)}

// 									<SortableContext items={sortableItems} strategy={horizontalListSortingStrategy}>
// 										{headerGroup.headers
// 											.filter((h,) => {
// 												return h.column.id !== FIXED_COL_ID
// 											},)
// 											.map((header,) => {
// 												return <DraggableTableHeader key={header.id} header={header} />
// 											},)}
// 									</SortableContext>
// 								</tr>
// 							)
// 						},)}
// 					</thead>

// 					{!tableIsFetching && Boolean(tableData?.list.length === 0,) && (
// 						<EmptyAnalyticsResponse
// 							isFilter={isFilterApplied}
// 							inTable
// 							clearFunction={resetAnalyticsFilterStore}
// 						/>
// 					)}

// 					{tableIsFetching ?
// 						(
// 							<Loader radius={6} width={150} inTable />
// 						) :
// 						(
// 							<tbody ref={tbodyRef}>
// 								{table.getRowModel().rows.map((row,) => {
// 									const {
// 										assetId,
// 									} = row.original
// 									const isSelected = Boolean(filter.assetId?.includes(assetId,),)
// 									return (
// 										<tr
// 											key={row.id}
// 											className={styles.tableRow(isSelected, false,)}
// 											onClick={(e,) => {
// 												handleRowClick(e, assetId,)
// 											}}
// 										>
// 											{row.getVisibleCells().map((cell,) => {
// 												const isFixed = cell.column.id === FIXED_COL_ID
// 												const isFirstNonFixed = cell.column.id === firstNonFixedColumnId
// 												const wrapperClass = isFirstNonFixed ?
// 													styles.flex :
// 													styles.flexNumber

// 												return (
// 													<td key={cell.id} className={cx(styles.tableCell, isFixed && styles.cellWidth44,)}>
// 														<div className={wrapperClass}>
// 															{flexRender(cell.column.columnDef.cell, cell.getContext(),)}
// 														</div>
// 													</td>
// 												)
// 											},)}
// 										</tr>
// 									)
// 								},)}
// 							</tbody>
// 						)}

// 					<tfoot className={styles.tableFooter(!isTbodyEmpty && !tableIsFetching && Boolean(tableData?.list.length,),)}>
// 						<tr>
// 							{visibleCols.map((col,) => {
// 								const isFixed = col.id === FIXED_COL_ID
// 								const isFlexNumber = col.id === 'usdValue'

// 								const content = (
// 									<>
// 										{isFixed && <span className={styles.totalLabel}>Total: {totalCount}</span>}
// 										{col.id === 'usdValue' && <span className={styles.totalLabel}>{totalUsdText}</span>}
// 									</>
// 								)

// 								return (
// 									<th key={col.id} className={cx(styles.headerCell, isFixed && styles.cellWidth44,)}>
// 										{isFlexNumber ?
// 											<div className={styles.flexNumber}>{content}</div> :
// 											content}
// 									</th>
// 								)
// 							},)}
// 						</tr>
// 					</tfoot>
// 				</table>

// 				<div className={styles.tableBtnContainer(isHorizontalScroll,)}>
// 					<Button<ButtonType.ICON>
// 						onClick={handleTableClear}
// 						disabled={!filter.assetId}
// 						className={styles.clearBtn}
// 						additionalProps={{
// 							btnType: ButtonType.ICON,
// 							icon:    <Rotate />,
// 							size:    Size.SMALL,
// 							color:   Color.NON_OUT_BLUE,
// 						}}
// 					/>
// 					<SaveAsExcelButton sheetData={depositSheetData} fileName={excelFileName} />
// 				</div>

// 				<Dialog
// 					onClose={() => {
// 						setIsDeleteModalShown(false,)
// 					}}
// 					open={isDeleteModalShowed}
// 					isCloseButtonShown
// 				>
// 					<DeleteAssetModal
// 						onClose={toggleDeleteDialog}
// 						assetName={AssetNamesType.CASH_DEPOSIT}
// 						assetId={deleteAssetId}
// 					/>
// 				</Dialog>

// 				<Dialog
// 					open={Boolean(assetTransferProps,)}
// 					onClose={() => {
// 						setAssetTransferProps(undefined,)
// 					}}
// 					onClosed={() => {
// 						setAssetTransferProps(undefined,)
// 					}}
// 					isCloseButtonShown
// 				>
// 					{assetTransferProps && (
// 						<TransferConfirmationDialog
// 							assetProps={assetTransferProps}
// 							onClose={() => {
// 								setAssetTransferProps(undefined,)
// 							}}
// 							handleTransferSuccess={handleTransferSuccess}
// 							assetName={AssetNamesType.CASH_DEPOSIT}
// 						/>
// 					)}
// 				</Dialog>

// 				<Dialog
// 					open={isTransferSuccess}
// 					onClose={() => {
// 						refetchData()
// 						setIsTransferSuccess(false,)
// 					}}
// 					onClosed={() => {
// 						setIsTransferSuccess(false,)
// 					}}
// 					isCloseButtonShown
// 				>
// 					<TransferSuccessModal
// 						onClose={() => {
// 							setIsTransferSuccess(false,)
// 							refetchData()
// 						}}
// 					/>
// 				</Dialog>
// 			</div>
// 		</DndContext>
// 	)
// }
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React from 'react'
import {
	cx,
} from '@emotion/css'
import {
	format,
} from 'date-fns'
import type {
	Header, ColumnDef, CellContext,
} from '@tanstack/react-table'
import {
	flexRender, getCoreRowModel, useReactTable,
} from '@tanstack/react-table'
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	type DragEndEvent,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	restrictToHorizontalAxis,
} from '@dnd-kit/modifiers'
import {
	arrayMove,
	SortableContext,
	horizontalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable'
import {
	CSS as DndCSS,
} from '@dnd-kit/utilities'

import type {
	IAnalyticDeposit, IDepositByFilter,
} from '../../../../services/analytics/analytics.types'
import {
	localeString, formatWithAllDecimals,
} from '../../../../shared/utils'
import {
	Button,
	ButtonType,
	Size,
	Color,
	Dialog,
	Loader,
	SaveAsExcelButton,
	EmptyAnalyticsResponse,
} from '../../../../shared/components'
import {
	Rotate, ArrowDownUp, ArrowDownUpFilled,
} from '../../../../assets/icons'

import {
	useDepositStore,
} from '../deposit.store'
import {
	SortOrder, AssetNamesType,
} from '../../../../shared/types'
import {
	TDepositTableSortVariants,
} from '../deposit.types'
import {
	getDepositSheetData,
} from '../deposit.utils'
import {
	DeleteAssetModal,
} from '../../components/delete-asset-modal/delete-asset-modal.component'
import {
	useAnalyticsFilterStore,
} from '../../analytics-store'
import {
	TransferConfirmationDialog,
	TransferSuccessModal,
} from '../../../../modules/clients/portfolios/portfolio-details/components/asset'
import {
	ItemDetails,
} from './item-details'
import {
	TanstackTableSettingsDialog,
} from './tanstack-table-settings.component'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	useTablePreference,
	useUpsertTablePreference,
} from '../../../../shared/hooks/table/table.hooks'
import * as styles from './tanstack.style'

type Props = {
	tableData?: IDepositByFilter
	refetchData: () => void
	tableIsFetching?: boolean
	isFilterApplied?: boolean
}

const fmtDate = (v: unknown,): string => {
	return v ?
		format(new Date(v as number | string | Date,), 'dd.MM.yyyy',) :
		''
}
const fmtUSD = (v: unknown,): string => {
	return localeString(Number(v,), 'USD', 0, false,)
}
const fmtNum = (v: unknown,): string => {
	return formatWithAllDecimals(Number(v,),)
}

const FIXED_COL_ID = '_actions'
const CONFIG_FALLBACK_TIMEOUT_MS = 6000

const NON_FIXED_COL_IDS: Array<string> = [
	'portfolioName',
	'entityName',
	'bankName',
	'accountName',
	'startDate',
	'maturityDate',
	'currency',
	'currencyValue',
	'usdValue',
	'interest',
	'policy',
]

const DEFAULT_COLUMN_ORDER: Array<string> = [FIXED_COL_ID, ...NON_FIXED_COL_IDS,]

type PrefPayload = {
	columnVisibility?: Record<string, boolean>
	columnOrder?: Array<string>
}

export const TanstackDepositTable: React.FC<Props> = ({
	tableData,
	refetchData,
	tableIsFetching,
	isFilterApplied,
},) => {
	const [isSettingsOpen, setIsSettingsOpen,] = React.useState(false,)

	const [columnVisibility, setColumnVisibility,] = React.useState<Record<string, boolean>>({
	},)
	const [columnOrder, setColumnOrder,] = React.useState<Array<string>>(DEFAULT_COLUMN_ORDER,)

	const [isConfigReady, setIsConfigReady,] = React.useState(false,)
	const hasResolvedConfigRef = React.useRef(false,)
	const configTimeoutRef = React.useRef<number | null>(null,)

	const [totalUsdValue, setTotalUsdValue,] = React.useState<number | undefined>(0,)

	const [isDeleteModalShowed, setIsDeleteModalShown,] = React.useState(false,)
	const [deleteAssetId, setDeleteAssetId,] = React.useState<string | undefined>(undefined,)

	const handleOpenDeleteModal = React.useCallback((assetId: string,) => {
		setDeleteAssetId(assetId,)
		setIsDeleteModalShown(true,)
	}, [],)

	const handleCloseDeleteModal = React.useCallback(() => {
		setIsDeleteModalShown(false,)
	}, [],)

	const columns: Array<ColumnDef<IAnalyticDeposit, unknown>> = [
		{
			id:           FIXED_COL_ID,
			enableHiding: false,
			header:       (): React.JSX.Element => {
				return (
					<TanstackTableSettingsDialog
						table={table}
						open={isSettingsOpen}
						setOpen={setIsSettingsOpen}
						defaultColumnOrder={DEFAULT_COLUMN_ORDER}
					/>
				)
			},
			cell: ({
				row,
			},): React.JSX.Element => {
				return (
					<ItemDetails
						row={row.original}
						refetchData={refetchData}
						handleOpenDeleteModal={handleOpenDeleteModal}
					/>
				)
			},
		},
		{
			id:          'portfolioName',
			accessorKey: 'portfolioName',
			header:      (): React.JSX.Element => {
				return <span>Portfolio</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return <div className={styles.cellContent}>{String(getValue() ?? '',)}</div>
			},
		},
		{
			id:          'entityName',
			accessorKey: 'entityName',
			header:      (): React.JSX.Element => {
				return <span>Entity</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return <div className={styles.cellContent}>{String(getValue() ?? '',)}</div>
			},
		},
		{
			id:          'bankName',
			accessorKey: 'bankName',
			header:      (): React.JSX.Element => {
				return <span>Bank</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return <div className={styles.cellContent}>{String(getValue() ?? '',)}</div>
			},
		},
		{
			id:          'accountName',
			accessorKey: 'accountName',
			header:      (): React.JSX.Element => {
				return <span>Account</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return <div className={styles.cellContent}>{String(getValue() ?? '',)}</div>
			},
		},
		{
			id:          'startDate',
			accessorKey: 'startDate',
			header:      (): React.JSX.Element => {
				return <span>Start date</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return (
					<span className={cx(styles.textNowrap, styles.tableNumberField,)}>
						{fmtDate(getValue(),)}
					</span>
				)
			},
		},
		{
			id:          'maturityDate',
			accessorKey: 'maturityDate',
			header:      (): React.JSX.Element => {
				return <span>Maturity</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return (
					<span className={cx(styles.textNowrap, styles.tableNumberField,)}>
						{getValue() ?
							fmtDate(getValue(),) :
							'N/A'}
					</span>
				)
			},
		},
		{
			id:          'currency',
			accessorKey: 'currency',
			header:      (): React.JSX.Element => {
				return <span>Currency</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return <span>{String(getValue() ?? '',)}</span>
			},
		},
		{
			id:          'currencyValue',
			accessorKey: 'currencyValue',
			header:      (): React.JSX.Element => {
				return <span>Value FC</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return <span className={styles.tableNumberField}>{fmtNum(getValue(),)}</span>
			},
		},
		{
			id:          'usdValue',
			accessorKey: 'usdValue',
			header:      (): React.JSX.Element => {
				return <span>Value USD</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return <span className={styles.tableNumberField}>{fmtUSD(getValue(),)}</span>
			},
		},
		{
			id:          'interest',
			accessorKey: 'interest',
			header:      (): React.JSX.Element => {
				return <span>Interest</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return <span className={styles.tableNumberField}>{fmtNum(getValue(),)}%</span>
			},
		},
		{
			id:          'policy',
			accessorKey: 'policy',
			header:      (): React.JSX.Element => {
				return <span>Policy</span>
			},
			cell:        ({
				getValue,
			}: CellContext<IAnalyticDeposit, unknown>,): React.JSX.Element => {
				return <span>{String(getValue() ?? '',)}</span>
			},
		},
	]

	const data = React.useMemo(() => {
		return tableData?.list ?? []
	}, [tableData?.list,],)

	const table = useReactTable<IAnalyticDeposit>({
		columns,
		data,
		state:                    {
			columnVisibility, columnOrder,
		},
		onColumnVisibilityChange: setColumnVisibility,
		onColumnOrderChange:      setColumnOrder,
		getCoreRowModel:          getCoreRowModel(),
		autoResetPageIndex:       false,
	},)

	const sortableItems = React.useMemo(() => {
		return table
			.getVisibleLeafColumns()
			.map((c,) => {
				return c.id
			},)
			.filter((id,) => {
				return id !== FIXED_COL_ID
			},)
	}, [table, columnOrder, columnVisibility,],)

	const {
		userInfo,
	} = useUserStore()

	const userKey = userInfo.name

	const prefQuery = useTablePreference(
		userKey ?
			{
				userName: String(userKey,), tableName: AssetNamesType.CASH_DEPOSIT,
			} :
			undefined,
	) as any

	const tablePref = prefQuery?.data
	const prefIsLoading = Boolean(prefQuery?.isLoading || prefQuery?.isFetching,)
	const prefIsError = Boolean(prefQuery?.isError,)

	const resolveConfigAsDefault = React.useCallback(() => {
		setColumnVisibility({
		},)
		setColumnOrder(DEFAULT_COLUMN_ORDER,)
		setIsConfigReady(true,)
		hasResolvedConfigRef.current = true
		if (configTimeoutRef.current) {
			window.clearTimeout(configTimeoutRef.current,)
			configTimeoutRef.current = null
		}
	}, [],)

	const resolveConfigApplied = React.useCallback(() => {
		setIsConfigReady(true,)
		hasResolvedConfigRef.current = true
		if (configTimeoutRef.current) {
			window.clearTimeout(configTimeoutRef.current,)
			configTimeoutRef.current = null
		}
	}, [],)

	React.useEffect(() => {
		hasResolvedConfigRef.current = false
		setIsConfigReady(false,)
		setColumnVisibility({
		},)
		setColumnOrder(DEFAULT_COLUMN_ORDER,)

		if (configTimeoutRef.current) {
			window.clearTimeout(configTimeoutRef.current,)
			configTimeoutRef.current = null
		}

		if (!userKey) {
			setIsConfigReady(true,)
			hasResolvedConfigRef.current = true
			return
		}

		configTimeoutRef.current = window.setTimeout(() => {
			if (!hasResolvedConfigRef.current) {
				resolveConfigAsDefault()
			}
		}, CONFIG_FALLBACK_TIMEOUT_MS,)

		return () => {
			if (configTimeoutRef.current) {
				window.clearTimeout(configTimeoutRef.current,)
				configTimeoutRef.current = null
			}
		}
	}, [userKey, resolveConfigAsDefault,],)

	React.useEffect(() => {
		if (!userKey) {
			return
		}
		if (hasResolvedConfigRef.current) {
			return
		}
		if (prefIsLoading) {
			return
		}
		if (prefIsError) {
			resolveConfigAsDefault()
			return
		}

		const rawPayload = tablePref?.payload
		if (!rawPayload) {
			resolveConfigAsDefault()
			return
		}

		try {
			const parsed: PrefPayload =
				typeof rawPayload === 'string' ?
					(JSON.parse(rawPayload,) as PrefPayload) :
					(rawPayload as PrefPayload)

			setColumnVisibility(parsed.columnVisibility ?? {
			},)

			const allowed = new Set(DEFAULT_COLUMN_ORDER,)
			const fromDb = Array.isArray(parsed.columnOrder,) ?
				parsed.columnOrder :
				[]
			const cleaned = fromDb.filter((id,) => {
				return allowed.has(id,) && id !== FIXED_COL_ID
			},)
			const nextOrder: Array<string> = [FIXED_COL_ID, ...cleaned,]

			DEFAULT_COLUMN_ORDER.forEach((id,) => {
				if (id === FIXED_COL_ID) {
					return
				}
				if (!nextOrder.includes(id,)) {
					nextOrder.push(id,)
				}
			},)

			setColumnOrder(nextOrder,)
		} catch {
			resolveConfigAsDefault()
			return
		}

		resolveConfigApplied()
	}, [
		userKey,
		prefIsLoading,
		prefIsError,
		tablePref?.payload,
		resolveConfigAsDefault,
		resolveConfigApplied,
	],)

	const {
		mutateAsync: upsertTablePreference,
	} = useUpsertTablePreference()

	const savePreference = (nextOrder?: Array<string>,): void => {
		if (!userKey) {
			return
		}

		const state = table.getState()

		const payload = JSON.stringify({
			columnVisibility: state.columnVisibility,
			columnOrder:      nextOrder ?? state.columnOrder,
		},)

		upsertTablePreference({
			userName:  String(userKey,),
			tableName: AssetNamesType.CASH_DEPOSIT,
			payload,
		},)
	}

	const handleDragEnd = (event: DragEndEvent,): void => {
		const {
			active, over,
		} = event
		if (!over || active.id === over.id) {
			return
		}

		const current = columnOrder.filter((id,) => {
			return id !== FIXED_COL_ID
		},)

		const oldIndex = current.indexOf(active.id as string,)
		const newIndex = current.indexOf(over.id as string,)
		if (oldIndex === -1 || newIndex === -1) {
			return
		}

		const moved = arrayMove(current, oldIndex, newIndex,)
		const nextOrder = [FIXED_COL_ID, ...moved,]

		setColumnOrder(nextOrder,)
		savePreference(nextOrder,)
	}

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		},),
		useSensor(KeyboardSensor, {
		},),
	)

	const firstNonFixedColumnId = React.useMemo(() => {
		return columnOrder.find((id,) => {
			if (id === FIXED_COL_ID) {
				return false
			}
			const col = table.getColumn(id,)
			return Boolean(col?.getIsVisible(),)
		},)
	}, [columnOrder, columnVisibility, table,],)

	const sortVariantByColumnId = React.useMemo(() => {
		return {
			portfolioName: TDepositTableSortVariants.PORTFOLIO_NAME,
			entityName:    TDepositTableSortVariants.ENTITY_NAME,
			bankName:      TDepositTableSortVariants.BANK_NAME,
			accountName:   TDepositTableSortVariants.ACCOUNT_NAME,
			currency:      TDepositTableSortVariants.CURRENCY,
			currencyValue: TDepositTableSortVariants.CURRENCY_VALUE,
			interest:      TDepositTableSortVariants.INTEREST,
			policy:        TDepositTableSortVariants.POLICY,
			startDate:     TDepositTableSortVariants.START_DATE,
			maturityDate:  TDepositTableSortVariants.MATURITY_DATE,
			usdValue:      TDepositTableSortVariants.USD_VALUE,
		} as const
	}, [],)

	const {
		filter, sortFilter, setBankId, setCurrency, setAssetId, setSortFilters,
	} = useDepositStore()

	React.useEffect(() => {
		if (filter.assetId?.length) {
			let total = 0
			filter.assetId.forEach((assetId,) => {
				const currentAsset = tableData?.list.find((asset,) => {
					return asset.assetId === assetId
				},)
				if (currentAsset?.usdValue) {
					total = total + currentAsset.usdValue
				}
			},)
			setTotalUsdValue(total,)
		} else {
			setTotalUsdValue(tableData?.totalAssets,)
		}
	}, [tableData, filter.assetId,],)

	const visibleCols = table.getVisibleLeafColumns()
	const totalCount = tableData?.list.length ?? 0
	const totalUsdText = totalUsdValue ?
		localeString(totalUsdValue, 'USD', 0, false,) :
		'$0'

	const [isTbodyEmpty, setIsTbodyEmpty,] = React.useState(true,)
	const [isHorizontalScroll, setIsHorizontalScroll,] = React.useState(false,)
	const tableRef = React.useRef<HTMLTableElement>(null,)
	const tbodyRef = React.useRef<HTMLTableSectionElement>(null,)

	const checkHorizontalScroll = (): void => {
		if (tableRef.current) {
			setIsHorizontalScroll(tableRef.current.scrollWidth > tableRef.current.clientWidth,)
		}
	}

	React.useEffect(() => {
		checkHorizontalScroll()
		const handleResize = (): void => {
			checkHorizontalScroll()
		}
		window.addEventListener('resize', handleResize,)
		return () => {
			window.removeEventListener('resize', handleResize,)
		}
	}, [tableData,],)

	const checkTbodyHeight = (): void => {
		if (tbodyRef.current && tableRef.current) {
			const tbodyHeight = tbodyRef.current.offsetHeight
			const tableHeight = tableRef.current.offsetHeight
			setIsTbodyEmpty(tableHeight - tbodyHeight - 44 - 46 > 0,)
		}
	}

	React.useEffect(() => {
		checkTbodyHeight()
		const handleResize = (): void => {
			checkTbodyHeight()
		}
		window.addEventListener('resize', handleResize,)
		return () => {
			window.removeEventListener('resize', handleResize,)
		}
	}, [tableData,],)

	const renderSortArrows = (type: TDepositTableSortVariants,): React.ReactElement => {
		const isCurrent = sortFilter.sortBy === type
		const order = sortFilter.sortOrder

		const handleClick = (e: React.MouseEvent,): void => {
			e.stopPropagation()

			if (!isCurrent) {
				setSortFilters({
					sortBy: type, sortOrder: SortOrder.DESC,
				},)
			} else if (order === SortOrder.DESC) {
				setSortFilters({
					sortBy: type, sortOrder: SortOrder.ASC,
				},)
			} else {
				setSortFilters({
					sortBy: type, sortOrder: SortOrder.DESC,
				},)
			}
		}

		return (
			<span
				className={styles.sortArrows(order === SortOrder.ASC,)}
				onClick={handleClick}
				onPointerDown={(e,) => {
					e.stopPropagation()
				}}
			>
				{isCurrent ?
					<ArrowDownUpFilled /> :
					<ArrowDownUp />}
			</span>
		)
	}

	const DraggableTableHeader = ({
		header,
	}: {
		header: Header<IAnalyticDeposit, unknown>
	},): React.JSX.Element => {
		const {
			attributes, isDragging, listeners, setNodeRef, transform,
		} = useSortable({
			id: header.column.id,
		},)

		const style: React.CSSProperties = {
			transform:  DndCSS.Translate.toString(transform,),
			opacity:    isDragging ?
				0.8 :
				1,
			cursor:     isDragging ?
				'grabbing' :
				'grab',
			transition: 'transform 0.15s ease',
			userSelect: 'none',
			zIndex:     1,
		}

		const renderHeaderContent = (): React.ReactNode => {
			if (header.isPlaceholder) {
				return null
			}

			const isFirstNonFixed = header.column.id === firstNonFixedColumnId
			const wrapperClass = isFirstNonFixed ?
				styles.flex :
				styles.flexNumber

			const sortVariant =
				(sortVariantByColumnId as Record<string, TDepositTableSortVariants | undefined>)[
					header.column.id
				]

			return (
				<div className={wrapperClass}>
					{flexRender(header.column.columnDef.header, header.getContext(),)}
					{sortVariant ?
						renderSortArrows(sortVariant,) :
						null}
				</div>
			)
		}

		return (
			<th
				ref={setNodeRef}
				colSpan={header.colSpan}
				style={style}
				className={styles.headerCell}
				{...attributes}
				{...listeners}
			>
				<div className={styles.tableTitle}>{renderHeaderContent()}</div>
			</th>
		)
	}

	const handleTableClear = (): void => {
		setBankId(undefined,)
		setCurrency(undefined,)
		setAssetId(undefined,)
	}

	const depositSheetData = getDepositSheetData(tableData?.list ?? [],)

	const {
		setAssetTransferProps, assetTransferProps, resetAnalyticsFilterStore,
	} = useAnalyticsFilterStore()
	const [isTransferSuccess, setIsTransferSuccess,] = React.useState(false,)

	const handleTransferSuccess = (isSuccess: boolean,): void => {
		setIsTransferSuccess(isSuccess,)
	}

	const excelFileName = React.useMemo(() => {
		return `${AssetNamesType.CASH_DEPOSIT}_${format(new Date(), 'dd.MM.yyyy_HH:mm:ss',)}`
	}, [],)

	const handleRowClick = React.useCallback(
		(e: React.MouseEvent<HTMLTableRowElement>, assetId: string,) => {
			const drawer = document.querySelector('.bp5-overlay',)
			if (drawer && drawer.contains(e.target as Node,)) {
				return
			}

			setBankId(undefined,)
			setCurrency(undefined,)

			const current = filter.assetId ?? []
			const next = current.includes(assetId,) ?
				current.length === 1 ?
					undefined :
					current.filter((id,) => {
						return id !== assetId
					},) :
				[...current, assetId,]

			setAssetId(next,)
		},
		[filter.assetId, setAssetId, setBankId, setCurrency,],
	)

	const isGlobalLoading = Boolean(tableIsFetching,) || !isConfigReady || (Boolean(userKey,) && prefIsLoading && !hasResolvedConfigRef.current)

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToHorizontalAxis,]}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<div className={styles.tableWrapper}>
				<div className={styles.scrollPadding} />

				<table
					className={styles.tableContainer(!isTbodyEmpty && !isGlobalLoading && Boolean(tableData?.list.length,),)}
					ref={tableRef}
				>
					<thead className={styles.header}>
						{table.getHeaderGroups().map((headerGroup,) => {
							return (
								<tr key={headerGroup.id}>
									{headerGroup.headers
										.filter((h,) => {
											return h.column.id === FIXED_COL_ID
										},)
										.map((h,) => {
											return (
												<th key={h.id} className={cx(styles.headerCell, styles.cellWidth44,)}>
													{flexRender(h.column.columnDef.header, h.getContext(),)}
												</th>
											)
										},)}

									<SortableContext items={sortableItems} strategy={horizontalListSortingStrategy}>
										{headerGroup.headers
											.filter((h,) => {
												return h.column.id !== FIXED_COL_ID
											},)
											.map((header,) => {
												return <DraggableTableHeader key={header.id} header={header} />
											},)}
									</SortableContext>
								</tr>
							)
						},)}
					</thead>

					{!isGlobalLoading && Boolean(tableData?.list.length === 0,) && (
						<EmptyAnalyticsResponse
							isFilter={isFilterApplied}
							inTable
							clearFunction={resetAnalyticsFilterStore}
						/>
					)}

					{isGlobalLoading ?
						(
							<Loader radius={6} width={150} inTable />
						) :
						(
							<tbody ref={tbodyRef}>
								{table.getRowModel().rows.map((row,) => {
									const {
										assetId,
									} = row.original
									const isSelected = Boolean(filter.assetId?.includes(assetId,),)
									return (
										<tr
											key={row.id}
											className={styles.tableRow(isSelected, false,)}
											onClick={(e,) => {
												handleRowClick(e, assetId,)
											}}
										>
											{row.getVisibleCells().map((cell,) => {
												const isFixed = cell.column.id === FIXED_COL_ID
												const isFirstNonFixed = cell.column.id === firstNonFixedColumnId
												const wrapperClass = isFirstNonFixed ?
													styles.flex :
													styles.flexNumber

												return (
													<td key={cell.id} className={cx(styles.tableCell, isFixed && styles.cellWidth44,)}>
														<div className={wrapperClass}>
															{flexRender(cell.column.columnDef.cell, cell.getContext(),)}
														</div>
													</td>
												)
											},)}
										</tr>
									)
								},)}
							</tbody>
						)}

					<tfoot className={styles.tableFooter(!isTbodyEmpty && !isGlobalLoading && Boolean(tableData?.list.length,),)}>
						<tr>
							{visibleCols.map((col,) => {
								const isFixed = col.id === FIXED_COL_ID
								const isFlexNumber = col.id === 'usdValue'

								const content = (
									<>
										{isFixed && <span className={styles.totalLabel}>Total: {totalCount}</span>}
										{col.id === 'usdValue' && <span className={styles.totalLabel}>{totalUsdText}</span>}
									</>
								)

								return (
									<th key={col.id} className={cx(styles.headerCell, isFixed && styles.cellWidth44,)}>
										{isFlexNumber ?
											<div className={styles.flexNumber}>{content}</div> :
											content}
									</th>
								)
							},)}
						</tr>
					</tfoot>
				</table>

				<div className={styles.tableBtnContainer(isHorizontalScroll,)}>
					<Button<ButtonType.ICON>
						onClick={handleTableClear}
						disabled={!filter.assetId || isGlobalLoading}
						className={styles.clearBtn}
						additionalProps={{
							btnType: ButtonType.ICON,
							icon:    <Rotate />,
							size:    Size.SMALL,
							color:   Color.NON_OUT_BLUE,
						}}
					/>
					<SaveAsExcelButton sheetData={depositSheetData} fileName={excelFileName} />
				</div>

				<Dialog
					onClose={handleCloseDeleteModal}
					open={isDeleteModalShowed}
					isCloseButtonShown
				>
					<DeleteAssetModal
						onClose={handleCloseDeleteModal}
						assetName={AssetNamesType.CASH_DEPOSIT}
						assetId={deleteAssetId}
					/>
				</Dialog>

				<Dialog
					open={Boolean(assetTransferProps,)}
					onClose={() => {
						setAssetTransferProps(undefined,)
					}}
					onClosed={() => {
						setAssetTransferProps(undefined,)
					}}
					isCloseButtonShown
				>
					{assetTransferProps && (
						<TransferConfirmationDialog
							assetProps={assetTransferProps}
							onClose={() => {
								setAssetTransferProps(undefined,)
							}}
							handleTransferSuccess={handleTransferSuccess}
							assetName={AssetNamesType.CASH_DEPOSIT}
						/>
					)}
				</Dialog>

				<Dialog
					open={isTransferSuccess}
					onClose={() => {
						refetchData()
						setIsTransferSuccess(false,)
					}}
					onClosed={() => {
						setIsTransferSuccess(false,)
					}}
					isCloseButtonShown
				>
					<TransferSuccessModal
						onClose={() => {
							setIsTransferSuccess(false,)
							refetchData()
						}}
					/>
				</Dialog>
			</div>
		</DndContext>
	)
}
