import type {
	ValidationOptions,
	ValidationArguments,} from 'class-validator'
import {
	registerDecorator,
} from 'class-validator'

export function IsNotEqual(
	property: string,
	validationOptions?: ValidationOptions,
) {
	return function validator(object: object, propertyName: string,): void {
		registerDecorator({
			name:         'IsNotEqual',
			target:       object.constructor,
			propertyName,
			options:      validationOptions,
			constraints:  [property,],
			validator:    {
				validate(value: string, args: ValidationArguments,) {
					const [relatedPropertyName,] = args.constraints as Array<string>
					const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName]
					return typeof value === 'string' &&
						typeof relatedValue === 'string' &&
						value !== relatedValue
				},
				defaultMessage(args: ValidationArguments,) {
					const [relatedPropertyName,] = args.constraints
					return `${args.property} must not be equal to ${relatedPropertyName}`
				},
			},
		},)
	}
}