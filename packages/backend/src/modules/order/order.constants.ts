export const OrderRoutes = {
	ORDER:          'order',
	LIST:           'list',
	DRAFT:          'order/draft',
	CREATE:         'create',
	UPDATE_STATUS:  'update-status',
	UPDATE:         '/update/:id',
	GET_ONE:        '/:id',
	DELETE_DETAILS: '/delete-details',
	FILTER:         'filter',
	DELETE:         'delete',
	ASSETS:         'assets/:orderId',
	UNITS:          'units',
}

export const SwaggerDescriptions = {
	ORDER_TAG:    'Order',
	DRAFT_TAG:    'Order draft',
	CREATE_ORDER: 'Create new order',
	CREATE_DRAFT: 'Create new order draft',
	UPDATE_ORDER: 'Update an existing order and its details',
	DELETE_ORDER: 'Delete an existing order and its details',
	FILTER:         'Order list filter',
}
