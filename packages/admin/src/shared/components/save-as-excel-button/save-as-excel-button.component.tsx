import React from 'react'

import {
	Button, ButtonType, Color, Size,
} from '../button'
import {
	ExcelIcon,
} from '../../../assets/icons'

import {
	exportToExcel,
} from '../../utils'
import type {
	TExcelSheetType,
} from '../../types'

import * as styles from './save-as-excel-button.styles'

type Props = {
	sheetData: TExcelSheetType | undefined
	fileName: string;
}

export const SaveAsExcelButton: React.FC<Props> = ({
	fileName,
	sheetData,
},) => {
	return (
		<Button<ButtonType.ICON>
			onClick={() => {
				exportToExcel({
					sheetData,
					fileName,
				},)
			}}
			className={styles.saveBtn}
			additionalProps={{
				btnType:  ButtonType.ICON,
				icon:     <ExcelIcon width={20} height={20} />,
				size:     Size.SMALL,
				color:    Color.SECONDRAY_COLOR,
			}}
		/>
	)
}