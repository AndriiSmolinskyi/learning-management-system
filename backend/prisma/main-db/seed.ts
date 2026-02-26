/* eslint-disable complexity */
/* eslint-disable no-console */
import { PrismaClient, } from '@prisma/client'
import {
	bankList,
	transactionType,
	expenseCategoryDataOptions,
	documentTypeOptions,
	serviceProviderList,
	currencyDataOptions,
	metalDataOptions,
	cryptoDataOptions,
	isinDataList,
} from './seeds'

const prisma = new PrismaClient()

async function main(): Promise<void> {
	const countBankList = await prisma.bankList.count()
	if (countBankList === 0) {
		await prisma.bankList.createMany({
			data: bankList,
		},)
	}

	// const countTransactionType = await prisma.transactionType.count()
	// if (countTransactionType === 0) {
	// 	await prisma.transactionType.createMany({
	// 		data: transactionType,
	// 	},)
	// }

	const expenseCategoryList = await prisma.expenseCategoryList.count()
	if (expenseCategoryList === 0) {
		await prisma.expenseCategoryList.createMany({
			data: expenseCategoryDataOptions,
		},)
	}

	const countDocumentType = await prisma.documentType.count()
	if (countDocumentType === 0) {
		await prisma.documentType.createMany({
			data: documentTypeOptions,
		},)
	}

	const countServiceProviders = await prisma.serviceProvidersList.count()
	if (countServiceProviders === 0) {
		await prisma.serviceProvidersList.createMany({
			data: serviceProviderList,
		},)
	}

	const countCurrencyList = await prisma.currencyData.count()
	if (countCurrencyList === 0) {
		await prisma.currencyData.createMany({
			data: currencyDataOptions,
		},)
	}

	const countMetalList = await prisma.metalData.count()
	if (countMetalList === 0) {
		await prisma.metalData.createMany({
			data: metalDataOptions,
		},)
	}

	const cryptoList = await prisma.cryptoData.count()
	if (cryptoList === 0) {
		await prisma.cryptoData.createMany({
			data: cryptoDataOptions,
		},)
	}

	const isinsList = await prisma.isins.count()
	if (isinsList === 0) {
		await prisma.isins.createMany({
			data: isinDataList,
		},)
	}
}

main()
	.catch((e,) => {
		console.log('error', e,)
		process.exit(1,)
	},)
	.finally(async() => {
		await prisma.$disconnect()
	},)
