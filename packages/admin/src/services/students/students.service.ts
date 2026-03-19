import queryString from 'query-string'

import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import type {
	CreateStudentBody,
	CreateStudentReturn,
	GetStudentsQuery,
	StudentsListReturn,
	StudentItem,
	UpdateStudentBody,
	OkResponse,
} from '../../shared/types'

import {
	StudentRoutes,
} from './students.constants'

class StudentsService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly module = StudentRoutes.MODULE

	public async createStudent(body: CreateStudentBody,): Promise<CreateStudentReturn> {
		return this.httpService.post(`${this.module}/${StudentRoutes.CREATE}`, body,)
	}

	public async getStudentsFiltered(filter: GetStudentsQuery,): Promise<StudentsListReturn> {
		return this.httpService.get(`${this.module}/${StudentRoutes.LIST}/?${queryString.stringify(filter, {
			skipNull:        true,
			skipEmptyString: true,
			arrayFormat:     'bracket',
		},)}`,)
	}

	public async getStudent(id: string,): Promise<StudentItem> {
		return this.httpService.get(`${this.module}/${id}`,)
	}

	public async updateStudent(id: string, body: UpdateStudentBody,): Promise<StudentItem> {
		return this.httpService.patch(`${this.module}/${id}`, body,)
	}

	public async deleteStudent(id: string,): Promise<OkResponse> {
		return this.httpService.delete(`${this.module}/${id}`,)
	}
}

export const studentsService = new StudentsService(new HttpFactoryService().createHttpService(),)