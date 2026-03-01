import type { ValidationArguments, ValidationOptions, ValidatorConstraintInterface, } from 'class-validator'
import { ValidatorConstraint, registerDecorator, } from 'class-validator'

@ValidatorConstraint({ name: 'isOneOfEnums', async: false, },)
export class IsOneOfEnumsConstraint implements ValidatorConstraintInterface {
	public validate(value: Array<unknown>, args: ValidationArguments,): boolean {
		const enums: Array<Record<string, string>> = args.constraints

		if (!Array.isArray(value,)) {
			return false
		}

		return value.every((item: string,) => {
			return enums.some((enumType,) => {
				return Object.values(enumType,).includes(item,)
			},)
		},
		)
	}

	public defaultMessage(args: ValidationArguments,): string {
		return `${args.property} must contain only values from one of the specified enums.`
	}
}

export function IsOneOfEnums(enums: Array<Record<string, string>>, validationOptions?: ValidationOptions,) {
	return function validator(object: object, propertyName: string,): void {
		registerDecorator({
			target:       object.constructor,
			propertyName,
			options:      validationOptions,
			constraints:  enums,
			validator:    IsOneOfEnumsConstraint,
		},)
	}
}