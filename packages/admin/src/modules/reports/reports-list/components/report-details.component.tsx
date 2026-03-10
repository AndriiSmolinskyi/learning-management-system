import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components'
import {
	DownoloadBlue,
	PenSquare,
	PrinterIcon,
} from '../../../../assets/icons'
import {
	ReportCategory,
} from '../../../../shared/types'
import {
	RouterKeys,
} from '../../../../router/keys'
import {
	useReportById,
} from '../../../../shared/hooks/reports'
import {
	pdfCustomService,
} from '../../../../services/downoload-pdf/downoload-custom-pdf.service'
import {
	ReportDetailsPDF,
} from './report-details-pdf.component'
import * as styles from '../reports.styles'

type Props = {
	onClose: VoidFunction
	reportId: number | undefined
}

export const ReportDetails: React.FC<Props> = ({
	onClose,
	reportId,
},) => {
	const navigate = useNavigate()

	const {
		data: reportExtended,
	} = useReportById(reportId,)

	const pdfRef = React.useRef<HTMLDivElement>(null,)

	const handleDownload = (): void => {
		setTimeout(() => {
			if (pdfRef.current) {
				const fileName = 'report'
				pdfCustomService.getCustomPDF(pdfRef.current, fileName,)
			}
		}, 1000,)
	}

	return (
		<div className={styles.detailsContainer}>
			<h3 className={styles.detailsHeader}>Report details</h3>
			{reportExtended &&
				<ReportDetailsPDF ref={pdfRef} reportId={reportExtended.id} />}
			<div className={styles.addBtnWrapper(reportExtended?.category === ReportCategory.CUSTOM,)}>
				<div>
					<Button<ButtonType.ICON>
						onClick={() => {
							// todo: add print report
							onClose()
						}}
						additionalProps={{
							btnType: ButtonType.ICON,
							icon:    <PrinterIcon width={20} height={20} />,
							size:    Size.MEDIUM,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>
					{reportExtended?.category === ReportCategory.CUSTOM ?
						<Button<ButtonType.ICON>
							onClick={() => {
								handleDownload()
								// onClose()
							}}
							additionalProps={{
								btnType: ButtonType.ICON,
								icon:    <DownoloadBlue width={20} height={20} />,
								size:    Size.MEDIUM,
								color:   Color.SECONDRAY_COLOR,
							}}
						/> :
						<Button<ButtonType.TEXT>
							onClick={() => {
								handleDownload()
							}}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								text:     'Download',
								leftIcon: <DownoloadBlue width={20} height={20} />,
								size:     Size.MEDIUM,
								color:    Color.SECONDRAY_COLOR,
							}}
						/>
					}
				</div>
				{reportExtended?.category === ReportCategory.CUSTOM && (
					<Button<ButtonType.TEXT>
						onClick={() => {
							onClose()
							navigate(RouterKeys.CUSTOM_REPORT, {
								state: {
									reportId,
								},
							},)
						}}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Edit',
							leftIcon: <PenSquare width={20} height={20} />,
							size:     Size.MEDIUM,
							color:    Color.SECONDRAY_COLOR,
						}}
					/>
				)}
			</div>
		</div>
	)
}
