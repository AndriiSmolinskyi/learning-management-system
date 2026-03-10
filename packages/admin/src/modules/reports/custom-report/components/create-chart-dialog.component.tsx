import React from 'react'
import {
	Classes,
	Popover,
} from '@blueprintjs/core'
import {
	cx,
} from '@emotion/css'

import {
	Button,
	ButtonType,
	Color,
	Size,
} from '../../../../shared/components/button'
import {
	LineChartIcon,
	PieChartIcon,
	BarChartIcon,
	BarChartHorizontalIcon,
	ScatterChartIcon,
} from '../../../../assets/icons'

import * as styles from '../custom-report.styles'

interface IProps {
	children: React.ReactNode
	togglePopover: () => void
	toggleEditPieChart: VoidFunction
	toggleEdiHorizontalChart: VoidFunction
	toggleEditVerticalChart: VoidFunction
	toggleEditBubbleChart: VoidFunction
	toggleEditLineChart: VoidFunction
}

export const CreateChartDialog: React.FC<IProps> = ({
	children,
	togglePopover,
	toggleEditPieChart,
	toggleEdiHorizontalChart,
	toggleEditVerticalChart,
	toggleEditBubbleChart,
	toggleEditLineChart,
},) => {
	const content = (
		<div className={styles.dialogContainer}>
			<div className={styles.menuActions}>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={toggleEditLineChart}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Line chart',
						leftIcon: <LineChartIcon width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={toggleEditPieChart}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Pie chart',
						leftIcon: <PieChartIcon width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={toggleEditVerticalChart}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     `Bar chart`,
						leftIcon: <BarChartIcon width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={toggleEdiHorizontalChart}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     `Bar chart race`,
						leftIcon: <BarChartHorizontalIcon width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
					}}
				/>
				<Button<ButtonType.TEXT>
					className={cx(Classes.POPOVER_DISMISS, styles.actionBtn,)}
					onClick={toggleEditBubbleChart}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     `Bubble chart`,
						leftIcon: <ScatterChartIcon width={20} height={20} />,
						size:     Size.MEDIUM,
						color:    Color.NON_OUT_BLUE,
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
			popoverClassName={cx(
				styles.popoverContainer,
				Classes.POPOVER_DISMISS,
			)}
			onClosing={togglePopover}
		>
			{children}
		</Popover>
	)
}