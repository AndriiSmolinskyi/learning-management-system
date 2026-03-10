/* eslint-disable complexity */
import React from 'react'

import {
	EmptyTable,
} from './empty-table.component'
import {
	EmptyFilter,
} from './empty-filter.component'
import {
	Loader,
} from '../../../../shared/components'
import {
	TableHeader,
} from './table-header.component'
import {
	DraftItem,
} from './draft-item.component'
import {
	ReportItem,
} from './report-item.component'
import {
	useReportDraftsList,
	useReportsListFiltered,
} from '../../../../shared/hooks/reports'
import type {
	TReportSearch,
} from '../reports.types'
import {
	useReportStore,
} from '../reports.store'
import {
	ReportType,
} from '../../../../shared/types'
import {
	useDebounce,
} from '../../../../shared/hooks'

import * as styles from '../reports.styles'

type Props = {
	clientId?: string
	isClient?: boolean
	toggleCreateVisible: VoidFunction
	toggleDetailsVisible: (id: number) => void
	setReportFilter: React.Dispatch<React.SetStateAction<TReportSearch | undefined>>
}

export const ReportsTable: React.FC<Props> = ({
	isClient,
	clientId,
	toggleCreateVisible,
	setReportFilter,
	toggleDetailsVisible,
},) => {
	const {
		filter,
	} = useReportStore()

	const finalFilter = useDebounce(filter, 700,)

	const {
		data: reportList,
		isFetching,
	} = useReportsListFiltered(finalFilter,)
	const {
		data: reportDraftList,
	} = useReportDraftsList()

	const noReports = reportDraftList?.length === 0 && reportList?.total === 0
	const noFilteredResult = !reportDraftList?.length && !reportList?.list.length

	const clientReportList = reportList?.list
		.filter((report,) => {
			if (!report.clientId || report.clientId === 'null') {
				return report.type === ReportType.INTERNAL
			}
			return report.type === ReportType.INTERNAL || report.clientId === clientId
		},)
		.slice(0, isClient ?
			5 :
			undefined,)

	return (
		<div className={styles.tableContainer}>
			<TableHeader isClient={isClient} />
			<div className={styles.requestListContainer(isClient,)}>
				{isFetching && (
					<Loader />
				)}
				{!isFetching && noReports &&
					<EmptyTable
						toggleCreateVisible={toggleCreateVisible}
					/>}
				{!isFetching && !noReports && noFilteredResult &&
					<EmptyFilter
						setReportFilter={setReportFilter}
					/>}
				{!isFetching && !noReports && !noFilteredResult &&
					<>
						{!isClient && reportDraftList?.map((draft,) => {
							return (
								<DraftItem
									key={draft.id}
									draft={draft}
								/>
							)
						},)}
						{isClient ?
							(clientReportList?.map((report,) => {
								return (
									<ReportItem
										key={report.id}
										report={report}
										toggleDetailsVisible={toggleDetailsVisible}
										isClient={isClient}
									/>
								)
							},))							:
							(reportList?.list.map((report,) => {
								return (
									<ReportItem
										key={report.id}
										report={report}
										toggleDetailsVisible={toggleDetailsVisible}
										isClient={isClient}
									/>
								)
							},))
						}
					</>}
			</div>
		</div>
	)
}
