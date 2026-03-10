import queryString from 'query-string'

import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'

import {
	ReportRoutes,
} from './report.constants'
import type {
	IReportExtended,
	TReportListRes,
	IReport,
	IReportDraft,
	IReportDraftExtended,
} from '../../shared/types'
import type {
	TAddReportProps,
	TEditReportProps,
} from './report.types'
import type {
	TReportFilter,
} from '../../modules/reports/reports-list/reports.types'

class ReportService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = ReportRoutes.MODULE

	private readonly draftModule = ReportRoutes.DRAFT

	public async createReport(body: TAddReportProps,): Promise<IReport> {
		return this.httpService.post(`${this.module}/${ReportRoutes.CREATE}`, body,)
	}

	public async getRepotsFiltered(filter: TReportFilter,): Promise<TReportListRes> {
		return this.httpService.get(`${this.module}/${ReportRoutes.FILTER}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getReportById(id: number,): Promise<IReportExtended> {
		return this.httpService.get(`${this.module}/${id}`,)
	}

	public async updateReport({
		id, ...body
	}: TEditReportProps,): Promise<IReport> {
		return this.httpService.patch(`${this.module}/${id}`, body,)
	}

	public async deleteReport(id: number,): Promise<void> {
		return this.httpService.delete(`${this.module}/${id}`,)
	}

	public async createReportDraft(body: TAddReportProps,): Promise<IReportDraft> {
		return this.httpService.post(`${this.draftModule}/${ReportRoutes.CREATE}`, body,)
	}

	public async getReportDraftById(id: number,): Promise<IReportDraftExtended> {
		return this.httpService.get(`${this.draftModule}/${id}`,)
	}

	public async getReportDrafts(): Promise<Array<IReportDraft>> {
		return this.httpService.get(`${this.draftModule}/${ReportRoutes.LIST}`,)
	}

	public async updateReportDraft({
		id, ...body
	}: TEditReportProps,): Promise<IReportDraft> {
		return this.httpService.patch(`${this.draftModule}/${id}`, body,)
	}

	public async deleteReportDraft(id: number,): Promise<void> {
		return this.httpService.delete(`${this.draftModule}/${id}`,)
	}
}

export const reportService = new ReportService(new HttpFactoryService().createHttpService(),)
