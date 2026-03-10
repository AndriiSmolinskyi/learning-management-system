export type StepType = 1 | 2 | 3

export type SelectedEntity = {
   portfolioId?: string | null
	portfolioDraftId?: string | null
	entityId: string
}

export type CreateAccountProps = SelectedEntity & {
	bankId: string
}

export type AccountFormValues = {
   accountName: string;
   managementFee: string;
   holdFee: string ;
   sellFee: string;
   buyFee: string;
   description?: string;
	dataCreated?: Date | null;
	iban?: string
	accountNumber?: string
	comment?: string
}