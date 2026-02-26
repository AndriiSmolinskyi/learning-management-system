import { CryptoList, } from '@prisma/client'

export const cryptoDataOptions =  [
	{ name: 'Bitcoin', token: CryptoList.BTC, rate: 105020.80,},
	{ name: 'Ethereum', token: CryptoList.ETH, rate: 3212.53,},
]