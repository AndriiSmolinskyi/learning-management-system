import {ApiProperty,} from '@nestjs/swagger'

export class AnalyticsAvailabilityDto {
	@ApiProperty({ description: 'Indicates if cash is available', },)
	public hasCash: boolean

	@ApiProperty({ description: 'Indicates if deposit is available', },)
	public hasDeposit: boolean

	@ApiProperty({ description: 'Indicates if bonds are available', },)
	public hasBonds: boolean

	@ApiProperty({ description: 'Indicates if options are available', },)
	public hasOptions: boolean

	@ApiProperty({ description: 'Indicates if loan is available', },)
	public hasLoan: boolean

	@ApiProperty({ description: 'Indicates if equities are available', },)
	public hasEquities: boolean

	@ApiProperty({ description: 'Indicates if metals are available', },)
	public hasMetals: boolean

	@ApiProperty({ description: 'Indicates if private equity is available', },)
	public hasPrivateEquity: boolean

	@ApiProperty({ description: 'Indicates if crypto is available', },)
	public hasCrypto: boolean

	@ApiProperty({ description: 'Indicates if collateral is available', },)
	public hasCollateral: boolean

	@ApiProperty({ description: 'Indicates if real estate is available', },)
	public hasRealEstate: boolean

	@ApiProperty({ description: 'Indicates if other investments are available', },)
	public hasOtherInvestments: boolean
}

