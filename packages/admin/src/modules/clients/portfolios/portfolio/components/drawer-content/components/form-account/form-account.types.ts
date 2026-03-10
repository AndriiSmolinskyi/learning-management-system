export interface IAccountFormValues {
   documents?: string
   accountName: string;
   managementFee: string;
   holdFee: string ;
   sellFee: string;
   buyFee: string;
   description?: string;
	dataCreated?: Date;
	iban?: string
	accountNumber?: string
	comment?: string
}

export interface IAccountErrorValues {
	accountName?: string;
   managementFee?: string;
   holdFee?: string ;
   sellFee?: string;
   buyFee?: string;
}

export interface IAccountValidateValues {
   accountName: string;
   managementFee: string;
   holdFee: string ;
	sellFee: string;
   buyFee: string;
   description?: string;
	dataCreated?: string;
	iban?: string
	accountNumber?: string
	comment?: string
}