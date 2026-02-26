import type { Prisma, } from '@prisma/client'

export type CreateEmailsProps = {
	tx: Prisma.TransactionClient
	clientId: string
	emails: Array<string>
}

export type UpdateEmailProps = {
	tx: Prisma.TransactionClient
	where: Prisma.EmailWhereUniqueInput
	data: Prisma.EmailUpdateWithoutUserInput
}