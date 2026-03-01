import {
	IsEnum,
	IsNotEmpty,
	IsUUID,
	IsOptional,
	IsBooleanString,
} from 'class-validator'
import { AssetNamesType, } from '../asset.types'

export class GetByIdDto {
	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
	@IsUUID(4,)
	public id!: string
}

export class GetByIdRefactoredDto {
	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
	@IsUUID(4,)
	public id!: string

	@IsNotEmpty({
		message: 'Asset name cannot be empty',
	},)
	@IsEnum(AssetNamesType,)
	public assetName!: AssetNamesType

	@IsOptional()
	@IsBooleanString()
	public isVersion?: boolean
}
