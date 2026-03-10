import type {
	IOptionType,
} from '../../../../../shared/types'

export interface IExpenseCategory {
	category: string
	budget: number
}

export type AddCategoryOptionType = {
	id: string
	name: string
}

export type AddCategoryItemValues = {
	budget: string | undefined
	category: IOptionType<AddCategoryOptionType> | undefined
}