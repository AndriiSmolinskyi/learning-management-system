/* eslint-disable max-lines */
import {
	styled,
} from '@mui/material/styles'
import {
	pickersDayClasses,
} from '@mui/x-date-pickers'
import {
	css,
} from '@emotion/css'

export const dayFieldStyles = css`
	padding-left: 20px;
`

export const dateTimePickerStyles = {
	background:                         'white !important',
	width:                              '100% !important',
	border:                             '1px solid #E4E4E7',
	borderRadius:                       '8px',
	boxShadow:                          '0px 2px 6px 0px #1827511A inset',
	'& .MuiFormControl-root': {
		background: 'white !important',
		height: 				'44px',
	},
	'& .MuiInputBase-root': {
		height:        '44px',
	},
	'& .MuiFormLabel-root': {
		top:  '-4px',
		left: '20px',
	},
	'& .MuiFormLabel-root.MuiInputLabel-shrink': {
		top:  '0px',
		left: '0px',
	},
	'& .MuiInputBase-input': {
		paddingLeft:   '10px',
		textTransform: 'lowercase',
		color:         'var(--gray-700)',
		fontFamily:    'Montserrat',
		fontSize:      '14px',
		fontWeight:    460,
		lineHeight:    '19.6px',

	},
	'& .MuiButtonBase-root': {
		padding:    '0px',
		paddingTop: '4px',
		margin:     '0px',
	},
	'& .MuiOutlinedInput-notchedOutline': {
		border: 'none',
	},
	'.MuiPickersLayout-root': {
		background: 'green',
	},
}

export const dateTimePickerDialogStyles = {
	position:                             'fixed !important',
	top:                                  '0px !important' ,
	left:                                 '0px !important',
	transform:                            'none !important',
	width:                      '100vw',
	height:                     '100vh',
	zIndex:                               9999,
	transition:               'all 0.3s ease !important',
	'.MuiPaper-root': {
		transition: 'all 0.3s ease !important',
		background:                 '#0018461A',

		height:     '100vh',
	},
	'.MuiYearCalendar-root': {
		width:                  '298px !important',
		maxHeight:                  '296px !important',
		padding:                '0px !important',
		overflow:               'auto',
		scrollbarWidth:         'none',
		msOverflowStyle:        'none',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
	'.MuiPickersLayout-root': {
		position:     'absolute !important',
		transition:   'all 0.3s ease !important',
		top:          '50% !important',
		left:         '50% !important',
		transform:                            'translate(-50%,-50%) !important',
		background:   'var(--base-white)',

		width:        '312px !important',
		height:       '540px !important',
		borderRadius: '16px !important',
		border:       '1px solid #F2F2F2 !important',
		boxShadow:    '-1px 2px 8px 0px #2A2C731A !important',
		paddingTop:   '16px',
	},
	'.MuiPickersLayout-contentWrapper': {
		background:   'var(--base-white)',
		borderRadius: '16px !important',
	},
	'.MuiDateCalendar-root': {
		width:        '300px !important',
		height:       '100%',
		maxHeight:    '100%',
		borderRadius: '16px !important',
	},
	'.MuiDialogActions-root': {
		padding: '20px',
	},
	'& .MuiDayCalendar-header': {
		marginBottom: '4px !important',
	},
	'& .MuiTypography-root': {
		fontFamily: 'Montserrat, Arial, Helvetica, sans-serif',
		fontSize:   '14px',
		fontWeight: '500',
		lineHeight: '20px',
		color:      'var(--gray-700)',
	},
}

export const headerDataStyles = {
	fontFamily:      'Montserrat, Arial, Helvetica, sans-serif',
	fontSize:        '16px !important',
	fontWeight:      '560 !important',
	lineHeight:      '19.6px !important',
	color:      'var(--gray-700) !important',
	'&:hover':       {
		cursor: 'pointer',
	},
}

export const headerMonthValueStyles = {
	marginTop:      '8px !important',
	border:         '1px solid #F2F2F2 !important',
	boxShadow:      '0px 2px 6px 0px #1827511A inset !important',
	width:          '280px !important',
	height:         '44px !important',
	borderRadius:   '8px !important',
	padding:        '12px !important',
	display:        'flex !important',
	alignItems:     'center !important',
	justifyContent: 'center !important',
	textAlign:      'center !important',
}

export const rangeHeaderMonthValueStyles = {
	marginTop:    '8px !important',
	border:        '1px solid #F2F2F2 !important',
	boxShadow:     '0px 2px 6px 0px #1827511A inset !important',
	width:        '128px !important',
	height:       '44px !important',
	borderRadius: '8px !important',
	padding:      '12px !important',
}

export const rangeHeaderCalendarIcon = {
	marginTop:    '30px !important',
}

export const monthRangeButton = {
	outline:       'none !important',
	border:        'none !important',
	fontFamily:    'Montserrat !important',
	fontSize:      '14px !important',
	fontWeight:    '560 !important',
	lineHeight:    '19.6px !important',
	color:         'var(--gray-700) !important',
	textTransform: 'none',
}

export const CustomCalendarHeaderRoot = styled('div',)({
	display:       'flex',
	flexDirection: 'column',
	padding:       '8px 16px',
	alignItems:    'center',

},)

export const HeaderNavigation = styled('div',)({
	display:        'flex',
	justifyContent: 'space-between',
	width:          '100%',
	alignItems:     'center',
},)

export const buttonGroupStyles = styled('div',)({
	display:        'flex',
	justifyContent: 'space-between',
	width:          '100%',
	alignItems:     'center',
},)

export const actionBarStylse = {
	'&.MuiDialogActions-root': {
		width:          '311px',
		display:                                     'flex',
		justifyContent:                              'space-between',
		borderTop:      '1px solid #F2F2F2',
	},
	'& .MuiButton-root.MuiButton-textPrimary:nth-of-type(1)': {
		color:           'var(--gray-800)',
		border:          '1px solid #E4E4E7',
		backgroundColor:      'var(--gray-25)',
		boxShadow:       '0px 1px 2px 0px #1018280D',
		fontFamily:      'Montserrat, Arial, Helvetica, sans-serif',
		fontSize:        '14px',
		fontWeight:      '560',
		lineHeight:      '19.6px',
		width:           '134px',
		height: 			      '42px',
		textTransform:   'capitalize',
		borderRadius:    '12px',
		transition:      'all 0.3s ease',
		'&:hover':       {
			backgroundColor: 'var(--gray-100)',
			transition:      'all 0.3s ease',
		},
	},
	'& .MuiButton-root.MuiButton-textPrimary:nth-of-type(2)': {
		color:           'var(--base-white)',
		backgroundColor:      'var(--primary-500)',
		border:          '1px solid #1D57C3',
		boxShadow:       '0px 1px 2px 0px #1018280D',

		fontFamily:      'Montserrat, Arial, Helvetica, sans-serif',
		fontSize:        '14px',
		fontWeight:      '560',
		lineHeight:      '19.6px',
		width:           '134px',
		height: 			      '42px',
		textTransform:   'capitalize',
		borderRadius:    '12px',
		transition:    'all 0.3s ease',
		'&:hover':     {
			backgroundColor: 'var(--primary-600)',
			transition:      'all 0.3s ease',
		},
	},
}

export const dayStyles = {
	borderRadius:                                                         '50% !important',
	fontFamily:                                                           'Montserrat, Arial, Helvetica, sans-serif',
	fontWeight:                                                           460,
	fontSize:                                                             '14px',
	width:                                                                '40px',
	height:                                                               '40px',
	margin:                                                               '0 0 4px 0 !important',
	color:                                                                'var(--gray-700)',

	[`&.${pickersDayClasses.selected}`]: {
		backgroundColor: 'var(--primary-500) !important',
		transition:      'all 0.3s ease',
		'&:hover':       {
			backgroundColor: 'var(--primary-600) !important',
		},
	},
	[`&.${pickersDayClasses.dayOutsideMonth}`]: {
		color:                               'var(--gray-400)',
		[`&.${pickersDayClasses.selected}`]: {
			color: 'var(--white)',
		},
	},
	[`&.${pickersDayClasses.disabled}`]: {
		color: 'var(--gray-500) !important',
	},
	[`&.${pickersDayClasses.hiddenDaySpacingFiller}`]: {
		backgroundColor: 'var(--gray-400) !important',
	},
	'& span': {
		borderRadius: '4px !important',
	},
}

export const rangeDateTimePickerStyles = {
	background:                         'white !important',
	width:                              '100% !important',
	borderRadius:                       '8px',
	boxShadow:                          '0px 2px 6px 0px #1827511A inset',
	'& .MuiFormControl-root': {
		background: 'white !important',
		height: 				'44px',
	},
	'& .MuiInputBase-root': {
		position: 'absolute',
		width:    '1px',
		height:   '1px',
		margin:   '-1px',
		border:   0,
		padding:  0,
		clip:     'rect(0 0 0 0)',
		overflow: 'hidden',
	},
}

export const rangeDateTimePickerDialogStyles = {
	position:                             'fixed !important',
	// inset:            '86px 492px auto auto !important',
	transform:                            'none !important',
	width:                      '100vw',
	height:                     '100vh',
	zIndex:                               9999,
	transition:               'all 0.001s ease !important',
	'.MuiPaper-root': {
		background:                 '#0018461A',
		borderRadius: '16px !important',
		height:       '100vh',
	},
	'.MuiPickersLayout-root': {
		background:   'var(--base-white)',
		position:     'absolute !important',
		transition:   'all 0.3s ease !important',
		top:          '50% !important',
		left:         '50% !important',
		transform:                            'translate(-50%,-50%) !important',
		width:        '312px !important',
		height:       '580px !important',
		borderRadius: '16px !important',
		border:       '1px solid #F2F2F2 !important',
		boxShadow:    '-1px 2px 8px 0px #2A2C731A !important',
		paddingTop:   '16px',
	},
	'.MuiPickersLayout-contentWrapper': {
		background:   'var(--base-white)',
		borderRadius: '16px !important',
	},
	'.MuiDateCalendar-root': {
		width:        '300px !important',
		height:       '100%',
		maxHeight:    '100%',
		borderRadius: '16px !important',
	},
	'.MuiPickersSlideTransition-root': {
		width:        '300px !important',
		height:       '298px',
		borderRadius: '16px !important',
	},
	'.MuiDialogActions-root': {
		padding: '20px',
	},
	'& .MuiDayCalendar-header': {
		marginBottom: '4px !important',
	},
	'& .MuiTypography-root': {
		fontFamily: 'Montserrat, Arial, Helvetica, sans-serif',
		fontSize:   '14px',
		fontWeight: '500',
		lineHeight: '20px',
		color:      'var(--gray-700)',
	},
	'.MuiYearCalendar-root': {
		width:                  '298px !important',
		maxHeight:                  '296px !important',
		padding:                '0px !important',
		overflow:               'auto',
		scrollbarWidth:         'none',
		msOverflowStyle:        'none',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
}

export const rangeDateWithControlsTimePickerDialogStyles = {
	position:                             'fixed !important',
	top:                                  '0px !important' ,
	left:                                 '0px !important',
	transform:                            'none !important',
	width:                      '100vw',
	height:                     '100vh',
	zIndex:                               9999,
	transition:               'all 0.001s ease !important',
	'.MuiPaper-root': {
		transition: 'all 0.001s ease !important',
		background:                 '#0018461A',

		height:     '100vh',
	},
	'.MuiPickersLayout-root': {
		position:     'absolute !important',
		transition:   'all 0.001s ease !important',
		top:          '50% !important',
		left:         '50% !important',
		transform:                            'translate(-50%,-50%) !important',
		background:   'var(--base-white)',

		width:        '312px !important',
		height:       '506px !important',
		borderRadius: '16px !important',
		boxShadow:    '-1px 2px 8px 0px #2A2C731A !important',
	},
	'.MuiPickersLayout-contentWrapper': {
		background:   'var(--base-white)',
		borderRadius: '16px !important',
	},
	'.MuiDateCalendar-root': {
		width:        '300px !important',
		height:       '100%',
		maxHeight:    '100%',
		borderRadius: '16px !important',
	},
	'.MuiPickersSlideTransition-root': {
		width:        '300px !important',
		height:       '208px',
		borderRadius: '16px !important',
	},
	'.MuiDialogActions-root': {
		padding: '20px',
	},
	'& .MuiDayCalendar-header': {
		marginBottom: '4px !important',
	},
	'& .MuiTypography-root': {
		fontFamily: 'Montserrat, Arial, Helvetica, sans-serif',
		fontSize:   '14px',
		fontWeight: '500',
		lineHeight: '20px',
		color:      'var(--gray-700)',
	},
}

export const headerBlock = {
	marginTop: '8px !important',
}

export const rangeActionBarStylse = {
	'&.MuiDialogActions-root': {
		width:          '311px',
		display:                                     'flex',
		justifyContent:                              'space-between',
		borderTop:      '1px solid #F2F2F2',
		padding:        '16px',
	},
	'& .MuiButton-root.MuiButton-textPrimary:nth-of-type(1)': {
		color:           'var(--gray-800)',
		border:          '1px solid #E4E4E7',
		backgroundColor:      'var(--gray-25)',
		boxShadow:       '0px 1px 2px 0px #1018280D',
		fontFamily:      'Montserrat, Arial, Helvetica, sans-serif',
		fontSize:        '14px',
		fontWeight:      '560',
		lineHeight:      '19.6px',
		width:           '134px',
		height: 			      '42px',
		textTransform:   'capitalize',
		borderRadius:    '12px',
		transition:      'all 0.3s ease',
		'&:hover':       {
			backgroundColor: 'var(--gray-100)',
			transition:      'all 0.3s ease',
		},
	},
	'& .MuiButton-root.MuiButton-textPrimary:nth-of-type(2)': {
		color:           'var(--base-white)',
		backgroundColor:      'var(--primary-500)',
		border:          '1px solid #1D57C3',
		boxShadow:       '0px 1px 2px 0px #1018280D',

		fontFamily:      'Montserrat, Arial, Helvetica, sans-serif',
		fontSize:        '14px',
		fontWeight:      '560',
		lineHeight:      '19.6px',
		width:           '134px',
		height: 			      '42px',
		textTransform:   'capitalize',
		borderRadius:    '12px',
		transition:    'all 0.3s ease',
		'&:hover':     {
			backgroundColor: 'var(--primary-600)',
			transition:      'all 0.3s ease',
		},
	},
}

export const acceptButton = {
	color:           'var(--base-white)',
	backgroundColor:      'var(--primary-500)',
	border:          '1px solid #1D57C3',
	boxShadow:       '0px 1px 2px 0px #1018280D',

	fontFamily:      'Montserrat, Arial, Helvetica, sans-serif',
	fontSize:        '14px',
	fontWeight:      '560',
	lineHeight:      '19.6px',
	width:           '134px',
	height: 			      '42px',
	textTransform:   'capitalize',
	borderRadius:    '12px',
	transition:    'all 0.3s ease',
	'&:hover':     {
		backgroundColor: 'var(--primary-600)',
		transition:      'all 0.3s ease',
	},
}

export const buttonStyles = (isValid: boolean,): object => {
	return {
		'& .MuiButton-root.MuiButton-textPrimary:nth-of-type(2)': {
			...(isValid ?
				{
					...acceptButton,
				} :
				{
					...acceptButton,
					disabled:        true,
					pointerEvents:   'none',
					backgroundColor: 'var(--primary-200)',
					border:          '1px solid var(--primary-200)',
				}),
		},
	}
}
export const actionBarStyles = (isValid: boolean,): object => {
	return {
		...rangeActionBarStylse,
		...buttonStyles(isValid,),
	}
}
export const svgCalendarStyles = {
	color:                        '#51525C',
	transition:                   'color 0.2s ease',
	'&:hover, &:focus, &:active':      {
		color: 'var(--gray-800)',
	},
}

export const dateTimeHistoryPickerDialogStyles = {
	position:                             'fixed !important',
	top:                                  '0px !important' ,
	left:                                 '0px !important',
	transform:                            'none !important',
	width:                      '100vw',
	height:                     '100vh',
	zIndex:                               9999,
	transition:               'all 0.3s ease !important',
	'.MuiPaper-root': {
		transition: 'all 0.3s ease !important',
		background:                 '#0018461A',

		height:     '100vh',
	},
	'.MuiYearCalendar-root': {
		width:                  '298px !important',
		maxHeight:                  '310px !important',
		padding:                '0px !important',
		overflow:               'auto',
		scrollbarWidth:         'none',
		msOverflowStyle:        'none',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
	'.MuiPickersLayout-root': {
		position:     'absolute !important',
		transition:   'all 0.3s ease !important',
		top:          '50% !important',
		left:         '50% !important',
		transform:                            'translate(-50%,-50%) !important',
		background:   'var(--base-white)',

		width:        '312px !important',
		height:       '540px !important',
		borderRadius: '16px !important',
		border:       '1px solid #F2F2F2 !important',
		boxShadow:    '-1px 2px 8px 0px #2A2C731A !important',
	},
	'.MuiPickersLayout-contentWrapper': {
		background:   'var(--base-white)',
		borderRadius: '16px !important',
	},
	'.MuiDateCalendar-root': {
		width:        '300px !important',
		height:       '100%',
		maxHeight:    '100%',
		borderRadius: '16px !important',
	},
	'.MuiDialogActions-root': {
		padding: '20px',
	},
	'& .MuiDayCalendar-header': {
		marginBottom: '4px !important',
	},
	'& .MuiTypography-root': {
		fontFamily: 'Montserrat, Arial, Helvetica, sans-serif',
		fontSize:   '14px',
		fontWeight: '500',
		lineHeight: '20px',
		color:      'var(--gray-700)',
	},
}