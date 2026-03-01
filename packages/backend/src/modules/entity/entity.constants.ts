export const EntityRoutes = {
	MODULE:                     'entity',
	CREATE:                     'create',
	SOURCE:                     'source',
	ID:                         ':id',
	BY_PORTFOLIO_ID:            'portfolio/:id',
	CREATE_DOCUMENT:            'create-document',
	DELETE_DOCUMENTS:           'delete-document',
	DOCUMENT_BY_ID:             'document/:id',
	DOWNLOAD_DOCUMENT:          'download-document',
	DOCUMENTS_ENTITY_PORTFOLIO: 'documents-entity-portfolio/:id',
	ENTITY_LIST_BY_IDS:         'entity-list',
}

export const  SwaggerDescriptions = {
	CREATE_ENTITY:              'Create new entity',
	UPDATE_ENTITY:              'Update entity',
	CREATE_DOCUMENT:            'Create document',
	DELETE_DOCUMENTS:           'Delete documents',
	PORTFOLIO_ID:               'Portfolio ID',
	ENTITY_ID:                  'Entity ID',
	DOCUMENTS_BY_ENTITY_ID:     'Retrieve documents by Entity ID',
	DOWNLOAD_DOCUMENT:          'Download document by storage name',
	DOCUMENTS_ENTITY_PORTFOLIO: 'Get all entity documents by portfolio ID',
	ENTITY_LIST_BY_IDS:         'Get all portfolios entities by IDs',
	SOURCE_ID:                  'Source id',
}