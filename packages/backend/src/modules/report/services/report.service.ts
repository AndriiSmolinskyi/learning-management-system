import {HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Report,} from '@prisma/client'
import { Prisma, } from '@prisma/client'
import { DocumentService, } from '../../../modules/document/document.service'

import type { TReportExtended, TReportListRes, } from '../report.types'
import { text, } from '../../../shared/text'
import type { CreateReportDto, ReportFilterDto, } from '../dto'
import { RedisCacheService, } from '../../redis-cache/redis-cache.service'
import { ReportRoutes, } from '../report.constants'
import { CryptoService, } from '../../crypto/crypto.service'

@Injectable()
export class ReportService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly documentService: DocumentService,
		private readonly cacheService: RedisCacheService,
		private readonly cryptoService: CryptoService,
	) {}

	/**
	 * 4.1
	 * Creates a new report and optionally deletes the associated report draft.
	 *
	 * @remarks
	 * This method:
	 * - Creates a report using the provided input.
	 * - If a `reportDraftId` is provided, the corresponding draft is deleted within the same transaction.
	 *
	 * This ensures that once a report is finalized, the associated draft is no longer stored.
	 *
	 * @param body - The data for creating the report.
	 * @returns A Promise that resolves to the newly created report.
	 * @throws Will throw an error if the creation or draft deletion fails.
	 */
	public async createReport(body: CreateReportDto,): Promise<Report> {
		const {reportDraftId, ...data} = body
		const report = await this.prismaService.$transaction(async(tx,) => {
			const newReport = await this.prismaService.report.create({
				data,
			},)

			if (reportDraftId) {
				const reportDraft = await tx.reportDraft.findUnique({
					where:   { id: reportDraftId, },
				},)

				if (reportDraft) {
					await tx.reportDraft.delete({
						where: { id: reportDraftId, },
					},)
				}
			}

			return newReport
		},)

		await this.cacheService.deleteByUrl(`/${ReportRoutes.REPORT}/${ReportRoutes.FILTER}`,)

		return report
	}

	/**
	 * 4.1
	 * Retrieves a filtered list of reports with sorting and search capabilities.
	 *
	 * @remarks
	 * This method:
	 * - Supports text-based search across multiple fields (ID, client name, report name, etc.).
	 * - Supports sorting and pagination based on the filter input.
	 *
	 * The method ensures that only reports from active clients are returned.
	 *
	 * @param filter - Filtering and sorting options.
	 * @returns A Promise that resolves to a list of filtered reports and the total count.
	 * @throws Will throw an error if retrieval fails.
	 */
	// todo: delete after new version good
	// public async getReportsFiltered(filter: ReportFilterDto,): Promise<TReportListRes> {
	// 	const {
	// 		sortBy = 'id',
	// 		sortOrder = Prisma.SortOrder.desc,
	// 		search,
	// 		...params
	// 	} = filter

	// 	const orderBy: Prisma.ReportOrderByWithRelationInput = {
	// 		[sortBy]: sortOrder,
	// 	}

	// 	const where: Prisma.ReportWhereInput = {
	// 		...(search && {
	// 			OR: [
	// 				(parseInt(search,) ?
	// 					{
	// 						id: {
	// 							equals: parseInt(search,),
	// 						},
	// 					} :
	// 					{}),
	// 				{
	// 					name: {
	// 						contains: search,
	// 						mode:     Prisma.QueryMode.insensitive,
	// 					},
	// 				},
	// 				{
	// 					type: {
	// 						contains: search,
	// 						mode:     Prisma.QueryMode.insensitive,
	// 					},
	// 				},
	// 				{
	// 					createdBy: {
	// 						contains: search,
	// 						mode:     Prisma.QueryMode.insensitive,
	// 					},
	// 				},
	// 				{
	// 					category: {
	// 						contains: search,
	// 						mode:     Prisma.QueryMode.insensitive,
	// 					},
	// 				},
	// 				{
	// 					type: {
	// 						contains: search,
	// 						mode:     Prisma.QueryMode.insensitive,
	// 					},
	// 				},
	// 			],
	// 		}),
	// 		...params,
	// 		OR: [
	// 			{
	// 				client: null,
	// 			},
	// 			{
	// 				client: {
	// 					isActivated: true,
	// 				},
	// 			},
	// 		],
	// 	}

	// 	const [total, list,] = await this.prismaService.$transaction([
	// 		this.prismaService.report.count(),
	// 		this.prismaService.report.findMany({
	// 			where,
	// 			orderBy,
	// 		},),
	// 	],)

	// 	return {
	// 		total,
	// 		list,
	// 	}
	// }
	public async getReportsFiltered(filter: ReportFilterDto,): Promise<TReportListRes> {
		const {
			sortBy = 'id',
			sortOrder = Prisma.SortOrder.desc,
			search,
			...params
		} = filter

		const orderBy: Prisma.ReportOrderByWithRelationInput = {
			[sortBy]: sortOrder,
		}

		const searchWhere: Prisma.ReportWhereInput | undefined = search ?
			{
				OR: [
					(parseInt(search,) ?
						{
							id: {
								equals: parseInt(search,),
							},
						} :
						{}),
					{
						name: {
							contains: search,
							mode:     Prisma.QueryMode.insensitive,
						},
					},
					{
						createdBy: {
							contains: search,
							mode:     Prisma.QueryMode.insensitive,
						},
					},
					{
						category: {
							contains: search,
							mode:     Prisma.QueryMode.insensitive,
						},
					},
					{
						type: {
							contains: search,
							mode:     Prisma.QueryMode.insensitive,
						},
					},
				],
			} :
			undefined

		const clientWhere: Prisma.ReportWhereInput = {
			OR: [
				{
					client: null,
				},
				{
					client: {
						isActivated: true,
					},
				},
			],
		}

		const where: Prisma.ReportWhereInput = {
			AND: [
				searchWhere,
				params,
				clientWhere,
			].filter(Boolean,) as Array<Prisma.ReportWhereInput>,
		}

		const [total, list,] = await this.prismaService.$transaction([
			this.prismaService.report.count({
				where,
			},),
			this.prismaService.report.findMany({
				where,
				orderBy,
			},),
		],)

		return {
			total,
			list,
		}
	}

	/**
	 * 4.1
	 * Retrieves extended details of a specific report by ID.
	 *
	 * @remarks
	 * This method returns:
	 * - Client info (ID, name)
	 * - Portfolio info (ID, name)
	 * - All associated documents
	 *
	 * Ensures that all necessary context is provided for viewing a report in detail.
	 *
	 * @param id - The unique identifier of the report.
	 * @returns A Promise that resolves to the full report details.
	 * @throws Will throw an error if the report is not found.
	 */
	public async getReportExtendedById(id: number,): Promise<TReportExtended> {
		const report = await this.prismaService.report.findUnique({
			where:   { id, },
			include: {
				client: {
					select: {
						id:        true,
						firstName: true,
						lastName:  true,
					},
				},
				portfolio: {
					select: {
						id:   true,
						name: true,
					},
				},
				documents: true,
			},
		},)

		if (!report) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}

		return {
			...report,
			client: {
				...report.client,
				firstName: report.client?.firstName && this.cryptoService.decryptString(report.client.firstName,),
				lastName:  report.client?.lastName && this.cryptoService.decryptString(report.client.lastName,),
			},
			portfolio: {
				...report.portfolio,
				name: report.portfolio?.name && this.cryptoService.decryptString(report.portfolio.name,),
			},
			documents: report.documents.map((document,) => {
				return {
					...document,
					name: this.cryptoService.decryptString(document.name,),
				}
			},),
		}
	}

	/**
	 * 4.1
	 * Updates an existing report by its ID.
	 *
	 * @remarks
	 * This method allows modifying any editable fields of the report.
	 * Useful for correcting or completing a report after initial creation.
	 *
	 * @param id - The ID of the report to update.
	 * @param data - The updated report data.
	 * @returns A Promise that resolves to the updated report.
	 * @throws Will throw an error if the update fails.
	 */
	// public async updateReport(id: number, data: Prisma.ReportUpdateInput,): Promise<Report> {
	public async updateReport(id: number, data: CreateReportDto,): Promise<Report> {
		await this.cacheService.deleteByUrl(`/${ReportRoutes.REPORT}`,)
		const updated = await this.prismaService.report.update({
			where: {
				id,
			},
			data,
		},)
		const cacheKeysToDelete = [
			`/${ReportRoutes.REPORT}/${ReportRoutes.FILTER}`,
			`/${ReportRoutes.REPORT}/${id}`,
		]
		await this.cacheService.deleteByUrl(cacheKeysToDelete,)
		return updated
	}

	/**
	 * 4.1
	 * Deletes a report by its ID along with all related documents.
	*
	 * @remarks
	 * This method:
	 * - Deletes the report itself.
	 * - Retrieves and deletes all documents linked to the report.
	*
	 * This ensures complete cleanup and avoids leaving orphaned documents in the system.
	 *
	 * @param id - The unique identifier of the report to delete.
	 * @returns A Promise that resolves once the deletion process is complete.
	 * @throws Will throw an error if the report or its documents cannot be deleted.
	*/
	public async deleteReport(id: number,): Promise<void> {
		await this.cacheService.deleteByUrl(`/${ReportRoutes.REPORT}`,)
		const report = await this.prismaService.report.delete(
			{
				where:   { id, },
				include: {
					documents: {
						select: {
							id: true,
						},
					},
				},
			},)
		const documentIds = report.documents.map((doc,) => {
			return doc.id
		},)
		await this.documentService.deleteDocumentsByIds({ id: documentIds, },)
		const cacheKeysToDelete = [
			`/${ReportRoutes.REPORT}/${ReportRoutes.FILTER}`,
			`/${ReportRoutes.REPORT}/${id}`,
		]
		await this.cacheService.deleteByUrl(cacheKeysToDelete,)
	}
}