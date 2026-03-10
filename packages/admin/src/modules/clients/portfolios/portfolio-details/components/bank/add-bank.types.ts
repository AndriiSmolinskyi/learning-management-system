import type {
	IOptionType, SelectOptionType,
} from '../../../../../../shared/types'

export type StepType = 1 | 2 | 3

export type BankFormValues = {
   bankName: IOptionType<SelectOptionType> | undefined
   country: IOptionType | undefined
   branchName: string
   firstName?: string | null
   lastName?: string | null
   email?: string | null
}

export type CreateBankProps = {
	portfolioId?: string | null
	portfolioDraftId?: string | null
	entityId: string
}