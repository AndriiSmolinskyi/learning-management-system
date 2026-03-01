import { ApiProperty, } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional, } from 'class-validator'

export class CreatePortfolioDocumentDto {
	@ApiProperty({
		required:    true,
		description: 'Portfolio document type',
	},)
	@IsString()
	@IsNotEmpty()
	public type!: string

	@ApiProperty({
		required:    false,
		description: 'Related protfolio ID for document creation',
	},)
	@IsString()
	@IsOptional()
	public portfolioId?: string

	@ApiProperty({
		required:    false,
		description: 'Related protfolio drat ID for document creation',
	},)
	@IsString()
	@IsOptional()
	public portfolioDraftId?: string
}