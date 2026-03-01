export interface IListItemBody {
	name: string
}

export interface ITransactionTypeList {
	name: string
	cashFlow: string
	id: string
	pl: string
	relatedTypeId?: string
	asset?: string
}

export interface ISelectItemBody {
   value: string
	label: string
}