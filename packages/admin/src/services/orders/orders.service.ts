import queryString from 'query-string'
import {
	HttpFactoryService,
} from '../../shared/services/http-factory.service'
import type {
	HttpService,
} from '../../shared/services/http.service'
import {
	OrderRoutes,
} from './orders.constants'
import type {
	IAddOrderProps,
	ITOrderListRes,
	IEditOrderProps,
	TOrderFilter,
	IOrderDraft,
	IOrder,
	IOrderUnitsFilter,
	IOrderUnits,
} from '../../shared/types'

class OrderService {
	constructor(private readonly httpService: HttpService,) {
		this.httpService = httpService
	}

	private readonly orderModule = OrderRoutes.MODULE

	public async createOrder(body: IAddOrderProps,): Promise<IOrder> {
		return this.httpService.post(`${this.orderModule}/${OrderRoutes.CREATE}`, body,)
	}

	public async getOrders(): Promise<ITOrderListRes> {
		return this.httpService.get(`${this.orderModule}/${OrderRoutes.LIST}`,)
	}

	public async updateOrderStatus(orderId: number, status: string,): Promise<void> {
		return this.httpService.post(`${this.orderModule}/${OrderRoutes.UPDATE_STATUS}`, {
			orderId, status,
		},)
	}

	public async createOrderDraft(body: IOrderDraft,): Promise<IOrderDraft> {
		return this.httpService.post(`${this.orderModule}/${OrderRoutes.DRAFT_CREATE}`, body,)
	}

	public async getOrderById(orderId: number,): Promise<IOrder> {
		return this.httpService.get(`${this.orderModule}/${orderId}`,)
	}

	public async updateOrder(orderId: number, body: IEditOrderProps,): Promise<IOrder> {
		return this.httpService.patch(`${this.orderModule}/${OrderRoutes.UPDATE}/${orderId}`, body,)
	}

	public async deleteOrderDetails(ids: Array<string>,): Promise<void> {
		return this.httpService.delete(`${this.orderModule}/${OrderRoutes.DELETE_DETAILS}`, {
			data: ids,
		},)
	}

	public async getOrdersFiltered(filter: TOrderFilter,): Promise<ITOrderListRes> {
		return this.httpService.get(`${this.orderModule}/${OrderRoutes.FILTER}/?${queryString.stringify(filter, {
			arrayFormat: 'bracket',
		},)}`,)
	}

	public async getOrderDrafts(): Promise<Array<IOrderDraft>> {
		return this.httpService.get(`${this.orderModule}/${OrderRoutes.DRAFT_LIST}`,)
	}

	public async deleteOrderDraft(draftId: number,): Promise<void> {
		return this.httpService.delete(`${this.orderModule}/${OrderRoutes.DRAFT_DELETE}/${draftId}`,)
	}

	public async updateOrderDraft(draftId: number, body: IOrderDraft,): Promise<IOrderDraft> {
		return this.httpService.patch(`${this.orderModule}/${OrderRoutes.DRAFT_UPDATE}/${draftId}`, body,)
	}

	public async deleteOrderById(id: number,): Promise<void> {
		return this.httpService.delete(`${this.orderModule}/${id}`,)
	}

	public async getOrderUnits(filter: IOrderUnitsFilter | undefined,): Promise<IOrderUnits> {
		return this.httpService.get(`${this.orderModule}/${OrderRoutes.UNITS}`, {
			params: filter,
		},)
	}
}

export const orderService = new OrderService(new HttpFactoryService().createHttpService(),)
