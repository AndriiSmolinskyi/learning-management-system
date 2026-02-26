
export enum CashFlow {
  INFLOW = 'Inflow',
  OUTFLOW = 'Outflow',
}

export enum PlType {
	P = 'P',
	L = 'L',
	N = ''
}

export type TSortTransactionFields = {
	name: 'name',
	categoryId: 'categoryId',
	cashFlow: 'cashFlow',
	pl: 'pl',
	relatedTypeId: 'relatedTypeId',
	asset: 'asset',
}

export enum TransactionTypeSortBy {
	NAME = 'name',
	CATEGORY_ID = 'categoryId',
	CASH_FLOW = 'cashFlow',
	PL = 'pl',
	RELATED_TYPE_ID = 'relatedTypeId',
	ASSET = 'asset',
}

export enum TransactionTypeAuditType {
	ADDED = 'Added',
	EDITED = 'Edited',
	RELATION = 'Relation',
	DELETED = 'Deleted',
	RESTORED = 'Restored',
	ARCHIVED = 'Archived'
}