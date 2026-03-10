import type {
	FieldValidator,
} from 'final-form'

export const composeValidators = (...validators: Array<FieldValidator<string>>) => {
	return (value: string, allValues: object,): string => {
		return validators.reduce(
			(error, validator,) => {
				return error ?
					error :
					validator(value, allValues,)
			},
			'',
		)
	}
}