import React from 'react'
import {
	format,
} from 'date-fns'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	MoreVertical,
	XmarkMid,
} from '../../../../assets/icons'
import {
	ItemDialog,
} from './item-dialog.component'

import type {
	IReport,
} from '../../../../shared/types'
import {
	toggleState,
} from '../../../../shared/utils'
import {
	ReportDetailsPDF,
} from './report-details-pdf.component'
import {
	pdfCustomService,
} from '../../../../services/downoload-pdf/downoload-custom-pdf.service'
import * as styles from '../reports.styles'

type Props = {
	report: IReport
	isClient?: boolean
	toggleDetailsVisible: (id: number) => void
}

export const ReportItem: React.FC<Props> = ({
	report,
	isClient,
	toggleDetailsVisible,
},) => {
	const [isPopoverShown, setIsPopoverShown,] = React.useState<boolean>(false,)
	const [isRenderPdf, setIsRenderPdf,] = React.useState<boolean>(false,)

	const pdfRef = React.useRef<HTMLDivElement>(null,)

	const handleDownload = (): void => {
		setIsRenderPdf(true,)
		setTimeout(() => {
			if (pdfRef.current) {
				const fileName = 'report'
				pdfCustomService.getCustomPDF(pdfRef.current, fileName,)
			}
		}, 1000,)
	}

	return (
		<div className={styles.reportContainer}>
			<p className={styles.tableCell}>{report.id}</p>
			{!isClient &&
				<p className={styles.tableCell}>{report.name}</p>
			}
			<p className={styles.tableCell}>{report.type}</p>
			<p className={styles.tableCell}>{report.category}</p>
			<p className={styles.tableCell}>{report.createdBy}</p>
			<p className={styles.tableCell}>{format(report.createdAt, 'dd.MM.yyyy',)}</p>
			<p className={styles.tableCell}>{format(report.updatedAt, 'dd.MM.yyyy',)}</p>
			<div className={styles.menuCell}>
				<ItemDialog
					setDialogOpen={setIsPopoverShown}
					toggleDetailsVisible={toggleDetailsVisible}
					handleDownload={handleDownload}
					report={report}
				>
					<Button<ButtonType.ICON>
						onClick={toggleState(setIsPopoverShown,)}
						className={styles.dotsButton(isPopoverShown,)}
						additionalProps={{
							btnType: ButtonType.ICON,
							size:    Size.SMALL,
							color:   Color.SECONDRAY_GRAY,
							icon:    isPopoverShown ?
								<XmarkMid width={20} height={20} />			:
								<MoreVertical width={20} height={20} />	,
						}}
					/>
				</ItemDialog>
				{report.category === 'Custom' && isRenderPdf &&
					<div className={styles.pdfStyles}>
						<ReportDetailsPDF ref={pdfRef} reportId={report.id} />
					</div>
				}
			</div>
		</div>
	)
}
