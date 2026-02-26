import { IsString, IsNotEmpty, } from 'class-validator'

export class GetAssetListDto {
	@IsString()
	@IsNotEmpty()
	public id!: string
}