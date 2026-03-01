import type { Account, Asset, } from '@prisma/client'

export interface IAccountExtended extends Account {
	assets: Array<Asset> | null
}