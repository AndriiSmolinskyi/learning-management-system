import type {
	MultiValue,
} from 'react-select'
import type {
	IOptionType,
	IReport,
	ReportCategory,
	ReportType,
	SortOrder,
} from '../../../shared/types'

export type TReportSortByVariants = keyof Pick<
	IReport,
	'id' | 'name' | 'updatedAt' | 'createdAt'
>

export type LinkedAccountType = {
	id: string
	name: string
}

export type TisinsSelect = MultiValue<IOptionType<LinkedAccountType>>

export type TReportFilter = {
	sortBy?: TReportSortByVariants | undefined
	sortOrder?: SortOrder | undefined
	search?: string
	type?: ReportType
	category?: ReportCategory
}

export type TReportSearch = {
	type?: IOptionType<ReportType> | undefined
	category?: IOptionType<ReportCategory> | undefined
}

export type AddReportFormValues = {
	type: ReportType | undefined
	category: IOptionType<ReportCategory> | undefined
	clientId?: IOptionType<LinkedAccountType> | undefined
	portfolioId?: IOptionType<LinkedAccountType> | undefined
	isins?: TisinsSelect | undefined
	name: string
}