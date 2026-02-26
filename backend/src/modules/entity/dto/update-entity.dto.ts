import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
} from 'class-validator'

import { EMAIL_REGEX, } from '../../../shared/constants/regexes.constants'
import { MAX_INPUT_LENGTH, } from '../../../shared/constants'

export class UpdateEntityDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Entity name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public name?: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Country must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public country?: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Authorized signatory name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public authorizedSignatoryName?: string

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