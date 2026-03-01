import { HttpException, HttpStatus, Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { ReportDraft,} from '@prisma/client'
import { Prisma, } from '@prisma/client'
import { DocumentService, } from '../../../modules/document/document.service'

import type { TReportDraftExtended, } from '../report.types'
import { text, } from '../../../shared/text'
import { CryptoService, } from '../../../modules/crypto/crypto.service'

@Injectable()
export class ReportDraftService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly documentService: DocumentService,
		private readonly cryptoService: CryptoService,
	) {}

	/**
	* 4.1
		 * Creates a new report draft.
	 *
	 * @param data - The data needed to create the draft.
	 * @returns A promise resolving to the newly created ReportDraft object.
	 */
	public async createReportDraft(data: Prisma.ReportDraftCreateInput,): Promise<ReportDraft> {
		return this.prismaService.reportDraft.create({
			data,
		},)
	}

	/**
	* 4.1
		 * Retrieves all report drafts from the database.
	 *
	 * @returns A promise resolving to an array of ReportDraft objects, ordered by last update date.
	 */
	public async getReportDrafts(): Promise<Array<ReportDraft>> {
		return this.prismaService.reportDraft.findMany({
			orderBy: {
				updatedAt: Prisma.SortOrder.desc,
			},
		},)
	}

	/**
	* 4.1
	 * Retrieves a report draft by its ID, including related client, portfolio, and documents.
	 *
	 * @param id - The ID of the report draft to retrieve.
	 * @returns A promise resolving to the full draft details (extended).
	 * @throws HttpException - If no draft is found with the given ID.
	 */
	public async getReportDraftById(id: number,): Promise<TReportDraftExtended> {
		const reportDraft = await this.prismaService.reportDraft.findUnique({
			where:   { id, },
			include: {
				client:   {
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

		if (!reportDraft) {
			throw new HttpException(text.draftNotExist, HttpStatus.NOT_FOUND,)
		}

		return {
			...reportDraft,
			client: {
				...reportDraft.client,
				firstName: reportDraft.client?.firstName && this.cryptoService.decryptString(reportDraft.client.firstName,),
				lastName:  reportDraft.client?.lastName && this.cryptoService.decryptString(reportDraft.client.lastName,),
			},
			portfolio: {
				...reportDraft.portfolio,
				name: reportDraft.portfolio?.name && this.cryptoService.decryptString(reportDraft.portfolio.name,),
			},
			documents: reportDraft.documents.map((document,) => {
				return {
					...document,
					name: this.cryptoService.decryptString(document.name,),
				}
			},),
		}
	}

	/**
	* 4.1
		 * Updates an existing report draft by ID.
	 *
	 * @param id - The ID of the report draft to update.
	 * @param data - The new values to update the draft with.
	 * @returns A promise resolving to the updated ReportDraft object.
	 */
	public async updateReportDraft(id: number, data: Prisma.ReportDraftUpdateInput,): Promise<ReportDraft> {
		return this.prismaService.reportDraft.update({
			where: {
				id,
			},
			data,
		},)
	}

	/**
	* 4.1
		 * Deletes a report draft by its ID and also deletes any associated documents.
	 *
	 * @param id - The ID of the report draft to delete.
	 * @returns A promise resolving once the draft and its documents are deleted.
	 */
	public async deleteReportDraft(id: number,): Promise<void> {
		const report = await this.prismaService.reportDraft.delete(
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
		await this.documentService.deleteDocumentsByIds({id: documentIds,},)
	}
}