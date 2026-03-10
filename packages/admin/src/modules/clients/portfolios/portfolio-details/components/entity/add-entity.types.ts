import type {
	IOptionType,
} from '../../../../../../shared/types'

export type StepType = 1 | 2 | 3 | 4

export type EntityFormValues = {
   name: string
   country: IOptionType | undefined
   authorizedSignatoryName: string
   firstName?: string | null
   lastName?: string | null
   email?: string | null
}