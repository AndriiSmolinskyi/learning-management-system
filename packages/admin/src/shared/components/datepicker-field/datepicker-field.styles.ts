export const datepickerFieldStyles = {
	width:                      '100%',
	height:                     '44px',
	boxShadow:                  '0px 2px 6px 0px #1827511A inset',
	borderRadius:               '50px',
	'& .MuiOutlinedInput-root': {
		borderRadius:    '8px',
		boxShadow:       '0px 2px 6px 0px #1827511A inset',
		backgroundColor: 'white',
		height:                     '44px',

		'& fieldset':    {
			borderColor: 'var(--gray-100)',
		},
		'&:hover fieldset': {
			borderColor: '#E0E0E0',
		},
		'&.Mui-focused fieldset': {
			borderColor: 'var(--primary-200)',
		},
		'&.Mui-error fieldset': {
			border:     '1px solid var(--error-200)',
			boxShadow:  '0 0 0 4px var(--error-100), 0 1px 2px 0 #101828 !important',
		},
	},
	'& .MuiInputBase-input': {
		textTransform:   'lowercase',
		color:         	'var(--gray-400)',
		fontFamily:      'Montserrat, Arial, Helvetica, sans-serif',
		fontSize:        '14px',
		fontWeight:      '460',
		lineHeight:      '19.6px',
		'&:focus':       {
			color: 'var(--gray-900)',
		},
	},
}