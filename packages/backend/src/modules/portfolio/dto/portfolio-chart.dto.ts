import { ApiProperty, } from '@nestjs/swagger'
import {
	IsEnum,
	IsUUID,
} from 'class-validator'

import { PortfolioChartFilterEnum, } from '../portfolio.types'

export class PortfolioChartDto {
	@ApiProperty({
		required:    true,
		description: 'Portfolio id',
	},)
	@IsUUID()
	public portfolioId: string

	@ApiProperty({
		required:    true,
		description: 'Filter entity',
	},)
	@IsEnum(PortfolioChartFilterEnum,)
	public filterType: PortfolioChartFilterEnum
}