import React from 'react'

import {
	Button, ButtonType, Color, Size,
} from '../../../../shared/components/button'
import {
	ExcelIcon,
} from '../../../../assets/icons'

import {
	exportToExcel,
} from '../../../../shared/utils'
import type {
	TransactionFilter,
} from '../../../../services/analytics/analytics.types'
import {
	transactionService,
} from '../../../../services/analytics/transaction.service'
import {
	getTransactionsSheetData,
} from '../transactions.utils'
import type {
	TransactionSortFilter,
} from '../transactions.types'

import * as styles from '../transactions.styles'

type Props = {
	exelFilter: TransactionFilter & TransactionSortFilter
	fileName: string;
}

export const SaveAsExcelButton: React.FC<Props> = ({
	fileName,
	exelFilter,
},) => {
	return (
		<Button<ButtonType.ICON>
			onClick={async() => {
				try {
					const data = await transactionService.getTransactionAnalytics(exelFilter,)

					const sheetData = getTransactionsSheetData(data.list,)

					exportToExcel({
						sheetData,
						fileName,
					},)
				} catch (error) {
					exportToExcel({
						sheetData: [],
						fileName,
					},)
				}
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