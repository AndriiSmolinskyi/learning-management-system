
/* eslint-disable max-lines */
/* eslint-disable complexity */
import {Injectable,} from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import { Prisma, } from '@prisma/client'
import type { TransactionType, } from '@prisma/client'
import type { CreateTransactionTypeDto, } from '../dto/create-transaction.dto'
import type { TransactionTypeCategory, } from '@prisma/client'
import type { TransactionTypeFilterDto, } from '../dto/transaction-filter.dto'
import { TransactionTypeSortBy, TransactionTypeAuditType, } from '../settings.types'
import type { UpdateTransactionTypeDto, } from '../dto/edit-transaction.dto'
import { NotFoundException, } from '@nestjs/common'
import type { ChangeActivatedStatusDto, } from '../dto/change-status.dto'
import type { AuditTrailFilterDto, } from '../dto/audit-trail-filter.dto'
import { EventEmitter2, } from '@nestjs/event-emitter'
import type { TransactionTypeAuditTrail, } from '@prisma/client'
import { PlType, } from '../settings.types'

@Injectable()
export class TransactionSettingsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventEmitter: EventEmitter2,
	) { }

	public async createTransactionType(
		body: CreateTransactionTypeDto,
	): Promise<TransactionType> {
		const {
			name,
			categoryId,
			cashFlow,
			pl,
			annualAssets,
			comment,
			draftId,
			userName,
			userRole,
		} = body

		const nowUtc = new Date()

		return this.prisma.$transaction(async(tx,) => {
			if (draftId) {
				await tx.transactionTypeDraft.delete({ where: { id: draftId, }, },)
			}

			const container = await tx.transactionType.create({ data: {}, },)

			await tx.transactionTypeVersion.create({
				data: {
					typeId:       container.id,
					version:      1,
					isCurrent:    true,
					name,
					categoryId,
					cashFlow,
					pl,
					annualAssets: annualAssets ?? [],
					comment:      comment ?? null,
				},
			},)

			await tx.transactionTypeAuditTrail.create({
				data: {
					transactionTypeId: container.id,
					settingsType:      TransactionTypeAuditType.ADDED,
					userName,
					userRole,
					createdAt:         nowUtc,
					updatedAt:         nowUtc,
				},
			},)

			return container
		},)
	}

	public async createTransactionTypeCategory(name: string,): Promise<TransactionTypeCategory> {
		return this.prisma.transactionTypeCategory.create({
			data: { name, },
		},)
	}

	public async getTransactionTypeById(id: string,): Promise<TransactionType> {
		const tt = await this.prisma.transactionType.findFirst({
			where:   { id, isDeleted: false, },
			include: {
				relatedType:  true,
				versions:     {
					where:   { isCurrent: true, },
					include: { categoryType: true, },
				},
			},
		},)

		if (!tt) {
			throw new NotFoundException('Transaction type not found',)
		}

		return tt
	}

	public async getTransactionTypeCategories(): Promise<Array<{ value: string; label: string }>> {
		const categories = await this.prisma.transactionTypeCategory.findMany({
			select: {
				id:   true,
				name: true,
			},
			where: {
				isDeleted: false,
			},
			orderBy: {
				name: 'asc',
			},
		},)

		return categories.map((c,) => {
			return {
				value: c.id,
				label: c.name,
			}
		},)
	}

	public async getTransactionTypeList(
		filter?: TransactionTypeFilterDto,
	): Promise<Array<TransactionType>> {
		const {
			sortBy = TransactionTypeSortBy.NAME,
			sortOrder = Prisma.SortOrder.asc,
			search,
			assets,
			categoryIds,
			cashFlows,
			isActivated,
			isDeactivated,
		} = filter ?? {}

		const toBool = (v: unknown,): boolean | undefined => {
			if (typeof v === 'boolean') {
				return v
			}
			if (typeof v === 'string') {
				const s = v.trim().toLowerCase()
				if (['true', '1', 'yes', 'on',].includes(s,)) {
					return true
				}
				if (['false', '0', 'no', 'off',].includes(s,)) {
					return false
				}
			}
			return undefined
		}

		const isActivatedB   = toBool(isActivated,)
		const isDeactivatedB = toBool(isDeactivated,)

		function buildPlFilter(pls?: Array<PlType>,): Prisma.TransactionTypeVersionWhereInput | undefined {
			if (pls === undefined) {
				return undefined
			}

			if (pls.length === 0) {
				return {
					OR: [
						{ pl: null, },
						{ pl: { notIn: [PlType.P, PlType.L,], }, },
					],
				}
			}

			const wantsNeutral = pls.includes('' as PlType,)
			const wantedReal   = pls.filter((v,) => {
				return v === PlType.P || v === PlType.L
			},)

			if (wantsNeutral && wantedReal.length) {
				return {
					OR: [
						{ pl: { in: wantedReal, }, },
						{ pl: null, },
						{ pl: { notIn: [PlType.P, PlType.L,], }, },
					],
				}
			}

			if (wantsNeutral) {
				return {
					OR: [
						{ pl: null, },
						{ pl: { notIn: [PlType.P, PlType.L,], }, },
					],
				}
			}
			return { pl: { in: wantedReal, }, }
		}

		const plFilter = buildPlFilter(filter?.pls,)

		const whereV: Prisma.TransactionTypeVersionWhereInput = {
			isCurrent: true,
			// todo: clear if good
			// type:      {
			// 	isDeleted: false,
			// 	...(isActivated === true && isDeactivated !== true ?
			// 		{ isActivated: true, } :
			// 		{}),
			// 	...(isDeactivated === true && isActivated !== true ?
			// 		{ isActivated: false, } :
			// 		{}),
			// },
			type:      {
				isDeleted: false,
				...(isActivatedB === true && isDeactivatedB !== true ?
					{ isActivated: true, } :
					{}),
				...(isDeactivatedB === true && isActivatedB !== true ?
					{ isActivated: false, } :
					{}),
			},
			...(categoryIds?.length ?
				{ categoryId: { in: categoryIds, }, } :
				{}),
			...(cashFlows?.length ?
				{ cashFlow: { in: cashFlows, }, } :
				{}),
			...(plFilter ?? {}),
			...(assets?.length ?
				{
					OR: assets.map((a,) => {
						return {
							type: { asset: { equals: a, mode: Prisma.QueryMode.insensitive, }, },
						}
					},),
				} :
				{}),
		}

		const q = (search ?? '').trim()
		if (q) {
			whereV.OR = [
				{ name: { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ categoryType: { name: { contains: q, mode: Prisma.QueryMode.insensitive, }, }, },
				{ cashFlow: { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ pl: { contains: q, mode: Prisma.QueryMode.insensitive, }, },
			]
		}

		const versions = await this.prisma.transactionTypeVersion.findMany({
			where:   whereV,
			include: {
				categoryType: true,
				type:         { include: { relatedType: true, }, },
			},
		},)

		if (versions.length === 0) {
			return []
		}

		const orderedTypeIds = versions.map((v,) => {
			return v.typeId
		},)

		const typesRaw = await this.prisma.transactionType.findMany({
			where:   { id: { in: orderedTypeIds, }, },
			include: {
				relatedType: {
					include: {
						versions: { where: { isCurrent: true, }, include: { categoryType: true, }, },
					},
				},
				versions: { where: { isCurrent: true, }, include: { categoryType: true, }, },
			},
		},)

		const getCurr = (
			t: (typeof typesRaw)[number],
		): ((typeof typesRaw)[number]['versions'][number] | undefined) => {
			return t.versions[0]
		}

		const getRelCurr = (
			t: (typeof typesRaw)[number],
		): (NonNullable<(typeof typesRaw)[number]['relatedType']>['versions'][number] | undefined) => {
			return t.relatedType?.versions[0]
		}

		const s = (v?: string | null,): string => {
			return (v ?? '').toString()
		}

		const dir: 1 | -1 =
		sortOrder === Prisma.SortOrder.asc ?
			1 :
			-1

		const cmp = (a?: string | null, b?: string | null,): number => {
			return dir * s(a,).localeCompare(s(b,), undefined, { sensitivity: 'base', },)
		}

		const firstNZ = (...vals: Array<number>): number => {
			return vals.find((v,) => {
				return v !== 0
			},) ?? 0
		}

		const sorted = [...typesRaw,].sort((a, b,) => {
			const av = getCurr(a,)
			const bv = getCurr(b,)
			switch (sortBy) {
			case TransactionTypeSortBy.NAME:
				return firstNZ(cmp(av?.name, bv?.name,), cmp(a.asset, b.asset,), a.id.localeCompare(b.id,),)
			case TransactionTypeSortBy.CATEGORY_ID:
				return firstNZ(cmp(av?.categoryType?.name, bv?.categoryType?.name,), cmp(av?.name, bv?.name,), a.id.localeCompare(b.id,),)
			case TransactionTypeSortBy.CASH_FLOW:
				return firstNZ(cmp(av?.cashFlow, bv?.cashFlow,), cmp(av?.name, bv?.name,), a.id.localeCompare(b.id,),)
			case TransactionTypeSortBy.PL:
				return firstNZ(cmp(av?.pl, bv?.pl,), cmp(av?.name, bv?.name,), a.id.localeCompare(b.id,),)
			case TransactionTypeSortBy.RELATED_TYPE_ID: {
				const ar = getRelCurr(a,)
				const br = getRelCurr(b,)
				return firstNZ(cmp(ar?.name, br?.name,), cmp(av?.name, bv?.name,), a.id.localeCompare(b.id,),)
			}
			case TransactionTypeSortBy.ASSET:
				return firstNZ(cmp(a.asset, b.asset,), cmp(av?.name, bv?.name,), a.id.localeCompare(b.id,),)
			default:
				return firstNZ(cmp(av?.name, bv?.name,), a.id.localeCompare(b.id,),)
			}
		},)

		return sorted
	}

	public async changeRelations(
		id: string,
		body: { relatedTypeId?: string | null; asset?: string | null; userName: string; userRole: string },
	): Promise<TransactionType> {
		const nowUtc = new Date()

		return this.prisma.$transaction(async(tx,) => {
			const before = await tx.transactionType.findUnique({
				where:  { id, },
				select: {
					id:            true,
					asset:         true,
					relatedTypeId: true,
					relatedType:   {
						select: {
							id:       true,
							versions: {
								where:  { isCurrent: true, },
								select: { name: true, },
							},
						},
					},
				},
			},)
			if (!before) {
				throw new Error('Transaction type not found',)
			}

			const nextRelatedTypeId = body.relatedTypeId ?? null
			const nextAsset = body.asset ?? null

			const typeChanged = (before.relatedTypeId ?? null) !== nextRelatedTypeId
			const assetChanged = (before.asset ?? null) !== nextAsset

			if (!typeChanged && !assetChanged) {
				return tx.transactionType.findUnique({
					where:   { id, },
					include: {
						relatedType: {
							select: {
								id:       true,
								versions: { where: { isCurrent: true, }, select: { name: true, }, },
							},
						},
					},
				},) as unknown as TransactionType
			}

			const updated = await tx.transactionType.update({
				where: { id, },
				data:  {
					...(typeChanged ?
						{ relatedTypeId: nextRelatedTypeId, } :
						{}),
					...(assetChanged ?
						{ asset: nextAsset, } :
						{}),
				},
				include: {
					relatedType: {
						select: {
							id:       true,
							versions: { where: { isCurrent: true, }, select: { name: true, }, },
						},
					},
				},
			},)

			const relatedTypeFromName = before.relatedType?.versions[0]?.name ?? null
			const relatedTypeToName = updated.relatedType?.versions[0]?.name ?? null
			const assetFrom = before.asset ?? null
			const assetTo = updated.asset ?? null

			const typeLogNeeded = typeChanged && relatedTypeFromName !== relatedTypeToName
			const assetLogNeeded = assetChanged && assetFrom !== assetTo

			if (typeLogNeeded || assetLogNeeded) {
				await tx.transactionTypeAuditTrail.create({
					data: {
						transactionTypeId:               updated.id,
						settingsType:                    TransactionTypeAuditType.RELATION,
						userName:                        body.userName,
						userRole:                        body.userRole,
						transactionTypeRelatedTypeFrom:  typeLogNeeded ?
							relatedTypeFromName :
							null,
						transactionTypeRelatedTypeTo:    typeLogNeeded ?
							relatedTypeToName :
							null,
						transactionTypeRelatedAssetFrom: assetLogNeeded ?
							assetFrom :
							null,
						transactionTypeRelatedAssetTo:   assetLogNeeded ?
							assetTo :
							null,
						createdAt:                       nowUtc,
						updatedAt:                       nowUtc,
					},
				},)
			}

			return updated
		},)
	}

	public async getRelations(id: string,): Promise<{
		id: string
		relatedType: { value: string; label: string } | null
		asset: { value: string; label: string } | null
	}> {
		const tt = await this.prisma.transactionType.findUnique({
			where:  { id, },
			select: {
				id:          true,
				asset:       true,
				relatedType: {
					select: {
						id:       true,
						versions: {
							where:  { isCurrent: true, },
							select: { name: true, },
						},
					},
				},
			},
		},)

		return {
			id,
			relatedType: tt?.relatedType ?
				{
					value: tt.relatedType.id,
					label: tt.relatedType.versions[0]?.name ?? '',
				} :
				null,
			asset: tt?.asset ?
				{
					value: tt.asset,
					label: tt.asset,
				} :
				null,
		}
	}

	public async softDeleteTransactionType(
		id: string,
		body: { userName: string; userRole: string },
	): Promise<TransactionType> {
		const nowUtc = new Date()

		return this.prisma.$transaction(async(tx,) => {
			const updated = await tx.transactionType.update({
				where: { id, },
				data:  { isDeleted: true, },
			},)

			await tx.transactionType.updateMany({
				where: { relatedTypeId: id, },
				data:  {relatedTypeId: null,},
			},)

			await tx.transactionTypeAuditTrail.create({
				data: {
					transactionTypeId: updated.id,
					settingsType:      TransactionTypeAuditType.DELETED,
					userName:          body.userName,
					userRole:          body.userRole,
					createdAt:         nowUtc,
					updatedAt:         nowUtc,
				},
			},)

			return updated
		},)
	}

	public async changeActivatedStatus(
		id: string,
		body: ChangeActivatedStatusDto,
	): Promise<TransactionType> {
		const nowUtc = new Date()
		const { activatedStatus, userName, userRole, } = body
		const settingsType =
		activatedStatus ?
			TransactionTypeAuditType.RESTORED :
			TransactionTypeAuditType.ARCHIVED

		return this.prisma.$transaction(async(tx,) => {
			const updated = await tx.transactionType.update({
				where: { id, },
				data:  { isActivated: activatedStatus, },
			},)
			if (!activatedStatus) {
				await tx.transactionType.updateMany({
					where: { relatedTypeId: id, },
					data:  {relatedTypeId: null,},
				},)
			}
			await tx.transactionTypeAuditTrail.create({
				data: {
					transactionTypeId: updated.id,
					settingsType,
					userName,
					userRole,
					createdAt:         nowUtc,
					updatedAt:         nowUtc,
				},
			},)

			return updated
		},)
	}

	public async updateTransactionType(
		id: string,
		body: UpdateTransactionTypeDto & { isNewVersion: boolean },
	): Promise<TransactionType> {
		const nowUtc = new Date()
		// const hasComment = Object.hasOwn(body, 'comment',)
		const hasComment = 'comment' in body

		// take before update
		const before = await this.prisma.transactionType.findUnique({
			where:    { id, },
			include: {
				versions: {
					where:   { isCurrent: true, },
					include: { categoryType: true, },
				},
			},
		},)

		if (!before) {
			throw new NotFoundException('Transaction type not found',)
		}

		// check data to update
		const data: Prisma.TransactionTypeVersionUpdateInput = {
			...(body.name !== undefined && { name: body.name, }),
			...(body.categoryId !== undefined && { categoryId: body.categoryId, }),
			...(body.cashFlow !== undefined && { cashFlow: body.cashFlow, }),
			...(body.pl !== undefined && { pl: body.pl, }),
			...(body.annualAssets !== undefined && { annualAssets: body.annualAssets, }),
			...(hasComment ?
				{ comment: body.comment ?? '', } :
				{}),
		}

		const sameArr = (a: Array<string>, b: Array<string>,): boolean => {
			const aa = a.slice().sort()
			const bb = b.slice().sort()
			if (aa.length !== bb.length) {
				return false
			}
			for (let i = 0; i < aa.length; i++) {
				if (aa[i] !== bb[i]) {
					return false
				}
			}
			return true
		}

		const currentVersion = await this.prisma.transactionTypeVersion.findFirst({
			where:   { typeId: id, isCurrent: true, },
			include: { categoryType: true, },
		},)
		if (!currentVersion) {
			throw new NotFoundException('Current version not found',)
		}

		// isNew cases
		if (body.isNewVersion) {
			// update type and transaction relations to version
			await this.prisma.transactionTypeVersion.update({
				where: { id: currentVersion.id, },
				data:  { isCurrent: false, },
			},)

			await this.prisma.transactionTypeVersion.create({
				data: {
					typeId:       id,
					version:      currentVersion.version + 1,
					isCurrent:    true,
					name:         body.name         ?? currentVersion.name,
					categoryId:   body.categoryId   ?? currentVersion.categoryId,
					cashFlow:     body.cashFlow     ?? currentVersion.cashFlow,
					pl:           body.pl           ?? currentVersion.pl,
					annualAssets: body.annualAssets ?? currentVersion.annualAssets,
					comment:      hasComment ?
						(body.comment ?? '') :
						(currentVersion.comment ?? null),
				},
				include: { categoryType: true, },
			},)
		} else {
			// create new version
			await this.prisma.$transaction(async(tx,) => {
				const updated = await tx.transactionTypeVersion.update({
					where:   { id: currentVersion.id, },
					data,
					include: { categoryType: true, },
				},)

				await tx.transaction.updateMany({
					where: {
						transactionTypeId: id,
						NOT:               { transactionTypeVersionId: updated.id, },
					},
					data: {
						transactionTypeVersionId: updated.id,
					},
				},)

				const cashFlowChanged =
					body.cashFlow !== undefined && body.cashFlow !== currentVersion.cashFlow

				if (cashFlowChanged) {
					if (body.cashFlow === 'Inflow') {
						await tx.$executeRaw`
						UPDATE "Transaction"
						SET "amount" = ABS("amount")
						WHERE "transaction_type_id" = CAST(${id} AS uuid)
							AND "amount" < 0
					`
					} else if (body.cashFlow === 'Outflow') {
						await tx.$executeRaw`
						UPDATE "Transaction"
						SET "amount" = -ABS("amount")
						WHERE "transaction_type_id" = CAST(${id} AS uuid)
							AND "amount" > 0
					`
					}
				}

				return updated
			},)
		}

		const fresh = await this.prisma.transactionType.findUnique({
			where:   { id, },
			include: {
				versions: { where: { isCurrent: true, }, include: { categoryType: true, }, },
			},
		},)

		if (!fresh || fresh.versions.length === 0) {
			throw new NotFoundException('Current version not found after update',)
		}

		const categoryFrom = before.versions[0].categoryType ?
			before.versions[0].categoryType.name :
			null
		const categoryTo = fresh.versions[0].categoryType ?
			fresh.versions[0].categoryType.name :
			null

		const nameChanged = body.name !== undefined && before.versions[0].name !== fresh.versions[0].name
		const categoryChanged = body.categoryId !== undefined && categoryFrom !== categoryTo
		const cashflowChanged = body.cashFlow !== undefined && before.versions[0].cashFlow !== fresh.versions[0].cashFlow
		const plChanged = body.pl !== undefined && (before.versions[0].pl ?? '') !== (fresh.versions[0].pl ?? '')
		const annualChanged =
				body.annualAssets !== undefined &&
				!sameArr(before.versions[0].annualAssets, fresh.versions[0].annualAssets,)
		const commentChanged = hasComment && (before.versions[0].comment ?? '') !== (fresh.versions[0].comment ?? '')

		// create audit
		await this.prisma.transactionTypeAuditTrail.create({
			data: {
				transactionTypeId: before.id,
				settingsType:      TransactionTypeAuditType.EDITED,
				userName:          body.userName,
				userRole:          body.userRole,
				createdAt:         nowUtc,
				updatedAt:         nowUtc,
				...(nameChanged && {
					transactionTypeNameFrom: before.versions[0].name,
					transactionTypeNameTo:   fresh.versions[0].name,
				}),
				...(categoryChanged && {
					transactionTypeCategoryFrom: categoryFrom,
					transactionTypeCategoryTo:   categoryTo,
				}),
				...(cashflowChanged && {
					transactionTypeCashflowFrom: before.versions[0].cashFlow,
					transactionTypeCashflowTo:   fresh.versions[0].cashFlow,
				}),
				...(plChanged && {
					transactionTypePlFrom: before.versions[0].pl ?? '',
					transactionTypePlTo:   fresh.versions[0].pl ?? '',
				}),
				...(annualChanged && {
					transactionTypeAnnualFrom: before.versions[0].annualAssets,
					transactionTypeAnnualTo:   fresh.versions[0].annualAssets,
				}),
				...(commentChanged && {
					transactionTypeCommentFrom: before.versions[0].comment ?? null,
					transactionTypeCommentTo:   fresh.versions[0].comment ?? null,
				}),
			},
		},)
		// todo: Remove after asset refactor approved
		// this.eventEmitter.emit(eventNames.CBONDS_DATA_UPDATED,)

		return fresh
	}

	public async getTransactionTypeAuditTrail(
		filter?: AuditTrailFilterDto,
	): Promise<Array<TransactionTypeAuditTrail>> {
		const where: Prisma.TransactionTypeAuditTrailWhereInput = {}

		const q = (filter?.search ?? '').trim()
		if (q) {
			where.OR = [
				{
					transactionType: {
						is: {
							versions: {
								some: {
									isCurrent: true,
									OR:        [
										{ name: { contains: q, mode: Prisma.QueryMode.insensitive, }, },
										{ categoryType: { is: { name: { contains: q, mode: Prisma.QueryMode.insensitive, }, }, }, },
									],
								},
							},
						},
					},
				},
				{ transactionTypeNameFrom: { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ transactionTypeNameTo:   { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ transactionTypeCategoryFrom: { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ transactionTypeCategoryTo:   { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ transactionTypeCashflowFrom: { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ transactionTypeCashflowTo:   { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ transactionTypePlFrom: { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ transactionTypePlTo:   { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ transactionTypeCommentFrom: { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ transactionTypeCommentTo:   { contains: q, mode: Prisma.QueryMode.insensitive, }, },
				{ userName: { contains: q, mode: Prisma.QueryMode.insensitive, }, },
			]
		}

		const editCards = filter?.editCards === 'true'
		let desiredTypes: Array<TransactionTypeAuditType> | undefined

		if (editCards) {
			desiredTypes = [TransactionTypeAuditType.EDITED, TransactionTypeAuditType.RELATION,]
		}

		if (filter?.settingsType?.length) {
			desiredTypes = desiredTypes ?
				desiredTypes.filter((t,) => {
					return filter.settingsType!.includes(t,)
				},) :
				filter.settingsType
		}

		if (desiredTypes?.length) {
			where.settingsType = { in: desiredTypes, }
		} else if (desiredTypes && desiredTypes.length === 0) {
			return []
		} else if (!desiredTypes && filter?.settingsType?.length) {
			where.settingsType = { in: filter.settingsType, }
		}

		if (filter?.userName?.length) {
			const names = filter.userName.map((s,) => {
				return s.trim()
			},).filter(Boolean,)
			if (names.length) {
				where.userName = { in: names, }
			}
		}

		return this.prisma.transactionTypeAuditTrail.findMany({
			where,
			orderBy: { createdAt: Prisma.SortOrder.desc, },
			include: {
				transactionType: {
					select: {
						id:          true,
						isActivated: true,
						versions:    {
							where:  { isCurrent: true, },
							select: {
								id:           true,
								name:         true,
								categoryType: { select: { id: true, name: true, }, },
							},
						},
					},
				},
			},
		},)
	}

	public async getAuditUsers(): Promise<Array<{ value: string; label: string }>> {
		const rows = await this.prisma.transactionTypeAuditTrail.findMany({
			select: { userName: true, },
		},)

		const uniq = new Map<string, string>()
		for (const r of rows) {
			const n = (r.userName ?? '').trim()
			if (!n) {
				continue
			}
			const key = n.toLocaleLowerCase()
			if (!uniq.has(key,)) {
				uniq.set(key, n,)
			}
		}

		const list = Array.from(uniq.values(),).sort((a, b,) => {
			return a.localeCompare(b,)
		},)

		return list.map((name,) => {
			return { value: name, label: name, }
		},)
	}

	public async getTransactionTypeCategoriesForList(): Promise<Array<TransactionTypeCategory>> {
		const categoryList = await this.prisma.transactionTypeCategory.findMany({
			where: {
				isDeleted: false,
			},
			orderBy: {
				updatedAt: 'asc',
			},
		},)

		return categoryList
	}

	public async updateTransactionTypeCategory(id: string, name: string,): Promise<TransactionTypeCategory> {
		const updated = await this.prisma.transactionTypeCategory.update({
			where:  { id, },
			data:   { name, },
		},)
		return updated
	}

	public async deleteTransactionTypeCategory(id: string,): Promise<TransactionTypeCategory> {
		const [deleted,] = await this.prisma.$transaction([
			this.prisma.transactionTypeCategory.update({
				where: { id, },
				data:  { isDeleted: true, },
			},),
			this.prisma.transactionTypeDraft.updateMany({
				where: { categoryId: id, },
				data:  { categoryId: null, },
			},),
		],)

		return deleted
	}
}