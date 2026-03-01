import type { ValidationArguments, ValidatorConstraintInterface, } from 'class-validator'
import { ValidatorConstraint, } from 'class-validator'

@ValidatorConstraint({ name: 'NoMoreThenOneField', async: false, },)
export class NoMoreThenOneFieldValidator implements ValidatorConstraintInterface {
	public validate(value: string, args: ValidationArguments,): boolean {
		const object = args.object as Record<string, string | undefined | null>
		const fields = args.constraints as Array<keyof object>
		const filledFields = fields.filter((field,) => {
			return object[field] !== undefined && object[field] !== null
		},)
		return filledFields.length <= 1
	}

	public defaultMessage(args: ValidationArguments,): string {
		const fields = args.constraints.join(', ',)
		return `No more then one of the following fields must be provided: ${fields}.`
	}
}