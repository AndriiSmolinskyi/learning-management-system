import {
	ArrayNotEmpty,
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
} from 'class-validator'

import { EMAIL_REGEX, } from '../../../shared/constants/regexes.constants'
import { MAX_INPUT_LENGTH, } from '../../../shared/constants'

export class AddClientDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `First name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public firstName!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Last name must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public lastName!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Residence must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public residence!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Country must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public country!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Region must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public region!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `City must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public city!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Street address must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public streetAddress!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Building number must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public buildingNumber!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(MAX_INPUT_LENGTH, {
		message: `Postal code must not exceed ${MAX_INPUT_LENGTH} characters.`,
	},)
	public postalCode!: string

	@IsArray()
	@ArrayNotEmpty()
	@Matches(EMAIL_REGEX, {
		each: true,
	},)
	public emails!: Array<string>

	@IsArray()
	@ArrayNotEmpty()
	@IsString({
		each: true,
	},)
	@IsNotEmpty({
		each: true,
	},)
	public contacts!: Array<string>

	@IsOptional()
	@IsString()
	public comment?: string
}