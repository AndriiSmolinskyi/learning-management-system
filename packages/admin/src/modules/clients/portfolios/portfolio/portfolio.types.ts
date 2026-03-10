import type {
	IOptionType,
} from '../../../../shared/types'

export interface IFormProps {
	clients?: Array<IOptionType>
	types?: Array<IOptionType>
	isActivated?: boolean | undefined
	isDeactivated?: boolean | undefined
}

export interface IFilterProps {
	clients?: Array<string>
	types?: Array<string>
	isActivated?: boolean | undefined
	isDeactivated?: boolean | undefined
	search?: string
	range?: Array<number | null>
}