export const PortfolioRoutes = {
	MODULE:                      'portfolio',
	DRAFT:                       'portfolio/draft',
	SUB_PORTFOLIO:               'portfolio/subportfolio',
	LIST:                        'list',
	LIST_BY_CLIENTS_IDS:                        'list-by-clients-ids',
	CREATE:                      'create',
	CREATE_DRAFT:                'create-draft',
	CREATE_DOCUMENT:             'create-document',
	DRAFT_TO_PORTFOLIO:          'draft-to-portfolio',
	DELETE_DRAFT:                'delete-draft',
	GET_PORTFOLIO_LIST_FILTERED:     'list-filtered',
	UPDATE_STATUS:               'update-status',
	PORTFOLIO_DETAILS:           'details',
	PORTFOLIO_CHART:             'chart-analytics',
	PORTFOLIO_FORMATTED:         'portfolio-formatted',
	SUB_PORTFOLIO_LIST:          'subportfolio-list',
	DELETE_DOCUMENT:             'delete-document',
	CLIENT:                      'client',
	ID:                           ':id',
	MAX_TOTALS:                  'max-totals',
}
export const ApiBodyDescriptions = {
	PORTFOLIO_STATUS_UPDATE:    'Portfolio status update',
	PORTFOLIO_MAX_TOTALS:       'Portfolio max totals',
	CLIENT_ID:                  'Client id',
	GET_CLIENTS_PORTFOLIO_LIST: 'Get clients portfolio list',
	GET_PORTFOLIO_DETAILS:      'Get portfolio details',
	CREATE_PORTFOLIO:           'Create new portfolio',
	CREATE_DOCUMENT:            'Create document',
	DELETE_PORTFOLIO_DRAFT:     'Delete portfolio draft',
	UPDATE_DRAFT_TO_PORTFOLIO:  'Update draft to portfolio',
	SUB_PORTFOLIO_LIST:         'Get subportfolio list of portfolio by id',
	ID:                         'id',
	PORTFOLIO_ID:               'Portfolio ID',
	LIST_BY_CLIENTS_IDS:        'Portfolio by clients ids',
	PORTFOLIO_CHART:            'Portfolio chart',
}

export const MAX_INPUT_LENGTH = 50

export const cacheKeysToDeletePortfolio = [
	`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.PORTFOLIO_CHART}`,
	`/${PortfolioRoutes.MODULE}/${PortfolioRoutes.GET_PORTFOLIO_LIST_FILTERED}`,
]
