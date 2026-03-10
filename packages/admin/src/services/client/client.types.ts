import type {
	IBudgetPlan,
} from '../../shared/types'
import type {
	Client,
} from '../../shared/types'
import type {
	ClientDraft,
} from '../../shared/types'

export interface IClientWithBudgetPlan extends Client {
	budgetPlan?: IBudgetPlan | null
}

export type AddClientProps = Omit<Client,
	'createdAt' |
	'updatedAt' |
	'id' |
	'isActivated'
	>

export type AddClientDraftProps = Omit<ClientDraft,
	'createdAt' |
	'updatedAt' |
	'id' |
	'isActivated'
>

export type EditClientProps = Partial<AddClientProps>

export type ActivateClientProps = Pick<Client, 'isActivated' | 'id'>

export type AddClientCommentProps = Pick<Client, 'comment' | 'id'>