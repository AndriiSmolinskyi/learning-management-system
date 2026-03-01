import type { Prisma, } from '@prisma/client'

export type CreatePhonesProps = {
	tx: Prisma.TransactionClient
	clientId: string
	contacts: Array<string>
}