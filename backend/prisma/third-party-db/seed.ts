/* eslint-disable complexity */
/* eslint-disable no-console */
import { PrismaClient, } from '@third-party-prisma/client'
import {
	currencyDataOptions,
	metalDataOptions,
	cryptoDataOptions,
	isinDataList,
} from './seeds'

const prisma = new PrismaClient()

async function main(): Promise<void> {
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
