/* eslint-disable complexity */
import React from 'react'
import {
	useNavigate,
} from 'react-router-dom'
import {
	Classes,
} from '@blueprintjs/core'

import {
	Briefcase,
	ClientsRoute,
	ReportTitleIcon,
} from '../../../../assets/icons'
import {
	Button,
	ButtonType,
	Color,
	Input,
	Radio,
	SelectComponent,
	Size,
} from '../../../../shared/components'

import type {
	IOptionType,
} from '../../../../shared/types'
import {
	ReportCategory,
	ReportType,
} from '../../../../shared/types'
import type {
	AddReportFormValues,
	LinkedAccountType,
	TisinsSelect,
} from '../reports.types'
import {
	useClientsListForSelect,
} from '../../../clients/client-profiles/clients/hooks'
import {
	usePortfolioListByClientId,
} from '../../../../shared/hooks/portfolio'
import {
	useCreateReport,
} from '../../../../shared/hooks/reports'
import {
	useUserStore,
} from '../../../../store/user.store'
import {
	useGetEmissionsIsins,
	useGetEquityStocksIsins,
} from '../../../../shared/hooks'
import {
	RouterKeys,
} from '../../../../router/keys'
import {
	generateReportName,
} from '../reports.utils'

import * as styles from '../reports.styles'

const resetValuesData: AddReportFormValues = {
	type:        undefined,
	category:    undefined,
	clientId:    undefined,
	portfolioId: undefined,
	name:        '',

}

const categoryOptionsArray = [
	{
		label: ReportCategory.STOCK,
		value: ReportCategory.STOCK,
	},
	{
		label: ReportCategory.BOND,
		value: ReportCategory.BOND,
	},
	{
		label: ReportCategory.STATEMENT,
		value: ReportCategory.STATEMENT,
	},
	{
		label: ReportCategory.CUSTOM,
		value: ReportCategory.CUSTOM,
	},
]

type Props = {
	onClose: VoidFunction
	toggleSuccessDialogVisible: (reportId: number) => void
}

export const AddReportDialog: React.FC<Props> = ({
	onClose,
	toggleSuccessDialogVisible,
},) => {
	const [reportForm, setReportForm,] = React.useState<AddReportFormValues>(resetValuesData,)

	const navigate = useNavigate()
	const {
		data: clientsList,
	} = useClientsListForSelect()
	const {
		data: portfoliosList,
	} = usePortfolioListByClientId(reportForm.clientId?.value.id,)
	const {
		mutateAsync: createReport,
		isPending,
	} = useCreateReport()
	const {
		userInfo,
	} = useUserStore()
	const {
		data: stockIsinList,
	} = useGetEquityStocksIsins()
	const {
		data: bondIsinList,
	} = useGetEmissionsIsins()

	const clientOptionsArray = clientsList?.map((client,) => {
		return {
			label: `${client.label}`,
			value: {
				id:   client.value,
				name: `${client.label}`,
			},
		}
	},) ?? []

	const portfolioOptionsArray = portfoliosList?.map((portfolio,) => {
		return {
			label: portfolio.name,
			value: {
				id:   portfolio.id,
				name: portfolio.name,
			},
		}
	},) ?? []

	const stockIsinOptionsArray = React.useMemo(() => {
		return stockIsinList?.map((name,) => {
			return {
				label: name,
				value: {
					id: name,
					name,
				},
			}
		},) ?? []
	}, [stockIsinList,],)

	const bondIsinOptionsArray = React.useMemo(() => {
		return bondIsinList?.map((name,) => {
			return {
				label: name,
				value: {
					id: name,
					name,
				},
			}
		},) ?? []
	}, [bondIsinList,],)

	const handleCreateReport = async({
		category,
		clientId,
		portfolioId,
		type,
		name,
	}: AddReportFormValues,): Promise<void> => {
		if (type === ReportType.INTERNAL && category) {
			const newReport = await createReport({
				type,
				category:    category.value,
				createdBy: userInfo.name,
				name,
			},)
			onClose()
			toggleSuccessDialogVisible(newReport.id,)
		}
		if (type === ReportType.CUSTOMER && category && clientId && portfolioId) {
			const newReport = await createReport({
				type,
				category:    category.value,
				clientId:    clientId.value.id,
				portfolioId: portfolioId.value.id,
				createdBy:   userInfo.name,
				name,
			},)
			onClose()
			toggleSuccessDialogVisible(newReport.id,)
		}
	}

	const hasValidationErrors = Boolean(
		!reportForm.type ||
		!reportForm.category ||
		!reportForm.name ||
		(reportForm.type === ReportType.CUSTOMER &&
			(!reportForm.clientId || !reportForm.portfolioId)),
	)

	return (
		<div className={styles.modalWrapper}>
			<div className={styles.modalContent}>
				<ReportTitleIcon width={42} height={42} />
				<h4 className={styles.modalTitle}>Add new report</h4>
				<div className={styles.radioWrapper}>
					<Radio
						label='Customer'
						name='type'
						input={{
							value:    ReportType.CUSTOMER,
							checked:  reportForm.type === ReportType.CUSTOMER,
							onChange: (e,) => {
								setReportForm({
									...reportForm,
									clientId:    undefined,
									portfolioId: undefined,
									type:        e.target.value as ReportType,
								},)
							},
						}}
					/>
					<Radio
						label='Internal'
						name='type'
						input={{
							value:    ReportType.INTERNAL,
							checked:  reportForm.type === ReportType.INTERNAL,
							onChange: (e,) => {
								setReportForm({
									...reportForm,
									clientId:    undefined,
									portfolioId: undefined,
									type:        e.target.value as ReportType,
								},)
							},
						}}
					/>
				</div>
				{reportForm.type && (
					<div className={styles.selectWrapper}>
						{reportForm.type === ReportType.CUSTOMER && (
							<>
								<SelectComponent<LinkedAccountType>
									placeholder='Select client'
									leftIcon={<ClientsRoute width={18} height={18} />}
									options={clientOptionsArray}
									onChange={(select,) => {
										if (select && !Array.isArray(select,)) {
											setReportForm({
												...reportForm,
												portfolioId: undefined,
												clientId:    select as IOptionType<LinkedAccountType>,
											},)
										}
									}}
									value={reportForm.clientId}
									isSearchable
								/>
								<SelectComponent<LinkedAccountType>
									isSearchable
									key={reportForm.portfolioId?.value.id}
									options={portfolioOptionsArray}
									value={reportForm.portfolioId}
									leftIcon={<Briefcase width={18} height={18} />}
									placeholder='Select portfolio'
									onChange={(select,) => {
										if (select && !Array.isArray(select,)) {
											setReportForm({
												...reportForm,
												portfolioId: select as IOptionType<LinkedAccountType>,
											},)
										}
									}}
								/>
							</>
						)}
						<SelectComponent<ReportCategory>
							key={reportForm.category?.value}
							options={categoryOptionsArray}
							value={reportForm.category}
							placeholder='Select report category'
							isSearchable={false}
							onChange={(select,) => {
								if (select && !Array.isArray(select,)) {
									setReportForm({
										...reportForm,
										isins:    undefined,
										category: select as IOptionType<ReportCategory>,
										name:     generateReportName((select as IOptionType<ReportCategory>).value,),
									},)
								}
							}}
						/>
						{reportForm.category?.value === ReportCategory.BOND && (
							<SelectComponent<LinkedAccountType>
								options={bondIsinOptionsArray}
								value={reportForm.isins}
								placeholder='Select ISIN'
								isMulti
								isClearable={false}
								isSearchable
								isCreateble={false}
								onChange={(select,) => {
									if (select && Array.isArray(select,)) {
										setReportForm({
											...reportForm,
											isins:    select as TisinsSelect,
										},)
									}
								}}
							/>
						)}
						{reportForm.category?.value === ReportCategory.STOCK && (
							<SelectComponent<LinkedAccountType>
								options={stockIsinOptionsArray}
								value={reportForm.isins}
								placeholder='Select ISIN'
								isMulti
								isClearable={false}
								isSearchable
								isCreateble={false}
								onChange={(select,) => {
									if (select && Array.isArray(select,)) {
										setReportForm({
											...reportForm,
											isins:    select as TisinsSelect,
										},)
									}
								}}
							/>
						)}
						<Input
							label=''
							input={{
								value:       reportForm.name,
								disabled:    !reportForm.category,
								placeholder: 'Enter report title',
								onChange:    (e,) => {
									setReportForm((prev,) => {
										return {
											...prev,
											name: e.target.value,
										}
									},)
								},
							}}
						/>
					</div>
				)}
			</div>
			<div className={styles.buttonBlock}>
				<Button<ButtonType.TEXT>
					onClick={() => {
						onClose()
						setReportForm(resetValuesData,)
					}}
					additionalProps={{
						btnType:  ButtonType.TEXT,
						text:     'Cancel',
						size:     Size.MEDIUM,
						color:    Color.MICRO,
					}}
				/>
				{reportForm.category?.value === ReportCategory.CUSTOM ?
					(
						<Button<ButtonType.TEXT>
							onClick={async() => {
								onClose()
								navigate(`${RouterKeys.REPORTS}/${RouterKeys.CUSTOM_REPORT}`, {
									state: {
										customPayload: {
											type:          reportForm.type,
											category:      reportForm.category!.value,
											clientId:      reportForm.clientId?.value.id,
											clientName:    reportForm.clientId?.value.name,
											portfolioId:   reportForm.portfolioId?.value.id,
											portfolioName: reportForm.portfolioId?.value.name,
											createdBy:     userInfo.name,
											name:          reportForm.name,
										},
										reportId:      null,
										reportDraftId: null,
									},
								},)
							}}
							className={Classes.POPOVER_DISMISS}
							disabled={Boolean(isPending || hasValidationErrors,)}
							additionalProps={{
								btnType:  ButtonType.TEXT,
								text:     'Continue',
								size:     Size.MEDIUM,
								color:    Color.BLUE,
							}}
						/>) :
					(<Button<ButtonType.TEXT>
						onClick={async() => {
							await handleCreateReport(reportForm,)
						}}
						disabled={Boolean(isPending || hasValidationErrors,)}
						additionalProps={{
							btnType:  ButtonType.TEXT,
							text:     'Add report',
							size:     Size.MEDIUM,
							color:    Color.BLUE,
						}}
					/>)
				}
			</div>
		</div>
	)
}
