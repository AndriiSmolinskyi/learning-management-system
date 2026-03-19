import queryString from 'query-string'

import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import type {
	CreateLessonBody,
	GetLessonsQuery,
	LessonsListReturn,
	LessonItem,
	OkResponse,
	UpdateLessonBody,
} from '../../shared/types'

import {
	LessonsRoutes,
} from './lessons.constants'

class LessonsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = LessonsRoutes.MODULE

	public async createLesson(body: CreateLessonBody,): Promise<LessonItem> {
		return this.httpService.post(`${this.module}/${LessonsRoutes.CREATE}`, body,)
	}

	public async getLessonsFiltered(filter: GetLessonsQuery,): Promise<LessonsListReturn> {
		return this.httpService.get(`${this.module}/${LessonsRoutes.LIST}/?${queryString.stringify(filter, {
			skipNull:        true,
			skipEmptyString: true,
			arrayFormat:     'bracket',
		},)}`,)
	}

	public async getLesson(id: string,): Promise<LessonItem> {
		return this.httpService.get(`${this.module}/${id}`,)
	}

	public async updateLesson(id: string, body: UpdateLessonBody,): Promise<LessonItem> {
		return this.httpService.patch(`${this.module}/${id}`, body,)
	}

	public async deleteLesson(id: string,): Promise<OkResponse> {
		return this.httpService.delete(`${this.module}/${id}`,)
	}
}

export const lessonsService = new LessonsService(new HttpFactoryService().createHttpService(),)