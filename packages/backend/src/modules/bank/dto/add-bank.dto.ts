import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	Matches,
	MaxLength,
} from 'class-validator'

import { EMAIL_REGEX, } from '../../../shared/constants/regexes.constants'
import { MAX_INPUT_LENGTH, } from '../../../shared/constants'

export class AddBankDto {
	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
	@IsUUID(4,)
	public clientId!: string

	@IsOptional()
	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
	@IsUUID(4,)
	public portfolioId?: string

	@IsOptional()
	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
	@IsUUID(4,)
	public portfolioDraftId?: string

	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
	@IsUUID(4,)
	public bankListId!: string

	@IsNotEmpty({
		message: 'ID cannot be empty',
	},)
	@IsUUID(4,)
	public entityId!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Bank name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public bankName!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Country must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public country!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Branch name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public branchName!: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `First name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public firstName?: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Last name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public lastName?: string

	@IsOptional()
	@IsEmail()
	@Matches(EMAIL_REGEX,)
	public email?: string
}