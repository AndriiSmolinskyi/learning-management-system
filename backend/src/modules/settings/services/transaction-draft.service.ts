/* eslint-disable complexity */
import {Injectable, } from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type { Prisma, } from '@prisma/client'
import type { TransactionTypeDraft, } from '@prisma/client'
import type { CreateTransactionTypeDraftDto, } from '../dto/create-transaction-draft.dto'
import { NotFoundException, } from '@nestjs/common'

@Injectable()
export class TransactionSettingsDraftService {
	constructor(private readonly prisma: PrismaService,) {}

	public async createTransactionTypeDraft(
		body: CreateTransactionTypeDraftDto,
	): Promise<TransactionTypeDraft> {
		const { name, categoryId, cashFlow, pl, annualAssets, comment, } = body

		const data: Prisma.TransactionTypeDraftUncheckedCreateInput = {
			name,
			cashFlow,
			pl,
			categoryId,
			comment,
			annualAssets: Array.isArray(annualAssets,) ?
				annualAssets :
				[],
		}

		return this.prisma.transactionTypeDraft.create({ data, },)
	}

	public async getTransactionTypeDrafts(): Promise<Array<TransactionTypeDraft>> {
		const transactionTypeDrafts = await this.prisma.transactionTypeDraft.findMany({
			orderBy: {
				updatedAt: 'desc',
			},
			include: {
				categoryType: true,
			},
		},)
		return transactionTypeDrafts
	}

	public async getTransactionTypeDraftById(id: string,): Promise<TransactionTypeDraft> {
		const draft = await this.prisma.transactionTypeDraft.findUnique({
			where:   { id, },
			include: { categoryType: true, },
		},)
		if (!draft) {
			throw new NotFoundException('Draft not found',)
		}
		return draft
	}

	public async deleteTransactionTypeDraft(id: string,): Promise<void> {
		await this.prisma.transactionTypeDraft.delete({
			where: { id, },
		},)
	}

	public async updateTransactionTypeDraft(
		id: string,
		body: Partial<CreateTransactionTypeDraftDto>,
	): Promise<TransactionTypeDraft> {
		const data: Prisma.TransactionTypeDraftUncheckedUpdateInput = {}

		if ('name' in body) {
			data.name = body.name ?? null
		}
		if ('categoryId' in body) {
			data.categoryId = body.categoryId ?? null
		}
		if ('cashFlow' in body) {
			data.cashFlow = body.cashFlow ?? null
		}
		if ('pl' in body) {
			data.pl = body.pl ?? null
		}
		if ('comment' in body) {
			data.comment = body.comment ?? null
		}
		if ('annualAssets' in body) {
			const v = Array.isArray(body.annualAssets,) ?
				body.annualAssets.filter((s,): s is string => {
					return typeof s === 'string'
				},) :
				[]
			data.annualAssets = { set: v, }
		}

		return this.prisma.transactionTypeDraft.update({
			where:   { id, },
			data,
			include: { categoryType: true, },
		},)
	}
}