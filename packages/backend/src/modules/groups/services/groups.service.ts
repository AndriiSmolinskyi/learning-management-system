/* eslint-disable complexity */
import {
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { PrismaService, } from 'nestjs-prisma'
import type {
	Group,
	Prisma,
} from '@prisma/client'

import type {
	CreateGroupDto,
} from '../dto/create-group.dto'
import type {
	UpdateGroupDto,
} from '../dto/update-group.dto'
import {
	GroupsSortBy,
	SortOrder,
} from '../dto/get-groups.dto'
import type {
	GetGroupsDto,
} from '../dto/get-groups.dto'
import type {
	GroupItem,
	GroupsListReturn,
} from '../groups.types'

@Injectable()
export class GroupsService {
	constructor(
		private readonly prismaService: PrismaService,
	) {}

	public async createGroup(body: CreateGroupDto,): Promise<GroupItem> {
		const created = await this.prismaService.group.create({
			data: {
				groupName:  body.groupName.trim(),
				courseName: body.courseName.trim(),
				comment:    body.comment?.trim() ?? null,
				startDate:  new Date(body.startDate,),
			},
		},)

		return this.mapGroup(created,)
	}

	public async updateGroup(id: string, body: UpdateGroupDto,): Promise<GroupItem> {
		await this.ensureGroupExists(id,)

		const updated = await this.prismaService.group.update({
			where: { id, },
			data:  {
				...(body.groupName !== undefined && {
					groupName: body.groupName.trim(),
				}),
				...(body.courseName !== undefined && {
					courseName: body.courseName.trim(),
				}),
				...(body.comment !== undefined && {
					comment: body.comment.trim() || null,
				}),
				...(body.startDate !== undefined && {
					startDate: new Date(body.startDate,),
				}),
			},
		},)

		return this.mapGroup(updated,)
	}

	public async getGroups(query: GetGroupsDto,): Promise<GroupsListReturn> {
		const page = query.page ?? 1
		const pageSize = query.pageSize ?? 20
		const skip = (page - 1) * pageSize

		const rawSearch = query.search?.trim()
		const search = rawSearch ?
			rawSearch :
			undefined

		const where: Prisma.GroupWhereInput = search ?
			{
				OR: [
					{
						groupName: {
							contains: search,
							mode:     'insensitive',
						},
					},
					{
						courseName: {
							contains: search,
							mode:     'insensitive',
						},
					},
					{
						comment: {
							contains: search,
							mode:     'insensitive',
						},
					},
				],
			} :
			{}

		const sortBy = query.sortBy ?? GroupsSortBy.CREATED_AT
		const sortOrder = query.sortOrder ?? SortOrder.DESC
		const orderBy = this.buildOrderBy(sortBy, sortOrder,)

		const [total, items,] = await Promise.all([
			this.prismaService.group.count({
				where,
			},),
			this.prismaService.group.findMany({
				where,
				skip,
				take: pageSize,
				orderBy,
			},),
		],)

		return {
			items: items.map((group,) => {
				return this.mapGroup(group,)
			},),
			total,
			page,
			pageSize,
		}
	}

	public async deleteGroup(id: string,): Promise<{ ok: true }> {
		await this.ensureGroupExists(id,)

		await this.prismaService.group.delete({
			where: { id, },
		},)

		return { ok: true, }
	}

	private async ensureGroupExists(id: string,): Promise<void> {
		const group = await this.prismaService.group.findUnique({
			where:  { id, },
			select: { id: true, },
		},)

		if (!group) {
			throw new NotFoundException('Group not found',)
		}
	}

	private mapGroup(group: Group,): GroupItem {
		return {
			id:         group.id,
			groupName:  group.groupName,
			courseName: group.courseName,
			comment:    group.comment,
			startDate:  group.startDate.toISOString(),
			createdAt:  group.createdAt.toISOString(),
			updatedAt:  group.updatedAt.toISOString(),
		}
	}

	private buildOrderBy(
		sortBy: GroupsSortBy | 'groupName' | 'courseName' | 'startDate' | 'createdAt',
		sortOrder: SortOrder | 'asc' | 'desc',
	): Array<Record<string, Prisma.SortOrder>> {
		const order: Prisma.SortOrder = sortOrder === 'asc' ?
			'asc' :
			'desc'

		if (sortBy === 'groupName') {
			return [
				{ groupName: order, },
				{ createdAt: 'desc', },
				{ id: 'desc', },
			]
		}

		if (sortBy === 'courseName') {
			return [
				{ courseName: order, },
				{ createdAt: 'desc', },
				{ id: 'desc', },
			]
		}

		if (sortBy === 'startDate') {
			return [
				{ startDate: order, },
				{ id: 'desc', },
			]
		}

		if (sortBy === 'createdAt') {
			return [
				{ createdAt: order, },
				{ id: 'desc', },
			]
		}

		return [
			{ createdAt: 'desc', },
			{ id: 'desc', },
		]
	}
}