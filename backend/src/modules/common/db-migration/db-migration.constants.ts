
import type { TCreateClient, } from '../../client'
import type { TPortfolioToMigrate, } from './db-migration.types'

export const clientsToMigrate: Array<TCreateClient> = [
	{
		emails:         ['/////',],
		contacts:       ['///',],
		firstName:      '///',
		lastName:       '///',
		residence:      '////',
		country:        '///',
		region:         '///',
		city:           '///',
		streetAddress:  '///',
		buildingNumber: '///',
		postalCode:     '////',
	},
]

export const portfoliosToMigrate: Array<TPortfolioToMigrate> = [
	{
		clientFirstName:         '///',
		clientLastName:         '///',
		name:            '///',
		type:            '///',
	},
]