import {
	css,
} from '@emotion/css'
import type {
	Size,
} from './button.types'
import * as monserrat from '../../styles/fonts'

export const baseStyle = (size: Size,): string => {
	const sizeMap = {
		small:  {
			height: '36px', borderRadius: '10px', fontSize: '14px',
		},
		medium: {
			height: '42px', borderRadius: '12px', fontSize: '14px',
		},
		large:  {
			height: '48px', borderRadius: '14px', fontSize: '16px',
		},
	}
	return css`
    height: ${sizeMap[size].height};
    border-radius: ${sizeMap[size].borderRadius};
    font-size: ${sizeMap[size].fontSize};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none !important;
    gap: 8px !important;
    font-family: Montserrat;
    display: flex;
    align-items: center;
    ${monserrat.montserratMidbold}
 
    &:disabled {
      background-color: lightgray;
      color: gray;
      cursor: not-allowed;
    }
  `
}

export const textBtnStyle = (size: Size,): string => {
	const paddingMap = {
		small:  '0 14px',
		medium: '0 18px',
		large:  '0 20px',
	}
	return css`
    padding: ${paddingMap[size]};
  `
}

export const iconBtnStyle = (size: Size,): string => {
	const sizeMap = {
		small:  '36px',
		medium: '42px',
		large:  '48px',
	}
	return css`
    width: ${sizeMap[size]};
    height: ${sizeMap[size]};
    padding: 0;
  `
}

type ButtonStyles = {
  bgcolor?: string
  color?: string
  borderColor?: string
  hoverColor?: string
  focusColorShadow?: string
  disabledColor?: string
  disabledBgColor?: string
  disabledBorderColor?: string
}

type ButtonNonOutStyles = {
	color?: string
	hoverColor?: string
	focusColor?: string
	disabledColor?: string
}

const generateButtonNonOutStyles = (styles: ButtonNonOutStyles,): string => {
	const {
		color,
		hoverColor,
		focusColor,
		disabledColor,
	} = styles

	return css`
		color: var(--${color});
		& path {
			fill: var(--${color});
		}
		background-color: transparent;
		border: none;

		&:hover {
			color: var(--${hoverColor});
			& path {
				fill: var(--${hoverColor});
			}
		}
	  
		&:focus {
			color: var(--${focusColor});
			& path {
				fill: var(--${focusColor});
			}
		}
	  
		&:disabled {
			color: var(--${disabledColor});
			background-color: transparent;
			& path {
				fill:  var(--${disabledColor});
			}
		}
	`
}

const generateButtonStyles = (styles: ButtonStyles,): string => {
	const {
		bgcolor,
		color,
		borderColor,
		hoverColor,
		focusColorShadow,
		disabledColor,
		disabledBgColor,
		disabledBorderColor,
	} = styles

	return css`
		background: var(--${bgcolor});
		color: var(--${color});
		 & path {
			fill: var(--${color});
		}
    	border: 1px solid var(--${borderColor});

    	&:hover {
      background: var(--${hoverColor});
		 & path {
			fill: var(--${color});
		}
		}

	&:focus{
		box-shadow: 0px 0px 0px 4px var(--${focusColorShadow});
	}

    &:disabled {
      background: var(--${disabledBgColor});
	  ${disabledBorderColor ?
		`border: 1px solid var(--${disabledBorderColor});` :
		`border: 1px solid transparent;`}
	  ${disabledColor ?
		`
		color: var(--${disabledColor});
		& path {
			fill: var(--${disabledColor});
		}
		` :
		`color: var(--${color});`}

    }
  `
}

export const colorStyles = {
	secondaryRed: generateButtonStyles({
		bgcolor:             'gradients-button-secondary-error',
		color:               'error-600',
		borderColor:         'error-200',
		hoverColor:          'error-50',
		focusColorShadow:    'error-100',
		disabledBgColor:     'gradients-button-secondary-error',
		disabledColor:       'error-200',
		disabledBorderColor: 'error-100',
	},),
	blue: generateButtonStyles({
		bgcolor:          'gradients-button-primary-blue',
		color:            'base-white',
		borderColor:      'primary-600',
		hoverColor:       'primary-600',
		focusColorShadow:    'primary-100',
		disabledBgColor:    'primary-200',
	},),
	red: generateButtonStyles({
		bgcolor:          'gradients-button-primary-error',
		color:            'base-white',
		borderColor:      'error-700',
		hoverColor:       'error-700',
		focusColorShadow: 'error-100',
		disabledBgColor:    'error-200',
	},),
	green: generateButtonStyles({
		bgcolor:          'gradients-button-primary-success',
		color:            'base-white',
		borderColor:      'green-700',
		hoverColor:       'green-700',
		focusColorShadow: 'green-100',
		disabledBgColor:    'green-200',
	},),
	secondaryGreen: generateButtonStyles({
		bgcolor:             'gradients-button-secondary-success',
		color:               'green-600',
		borderColor:         'green-200',
		hoverColor:          'green-50',
		focusColorShadow:    'green-100',
		disabledColor:       'green-200',
		disabledBgColor:     'gradients-button-secondary-success',
		disabledBorderColor: 'green-100',
	},),
	micro: generateButtonStyles({
		bgcolor:          'gradients-button-secondary-gray',
		color:            'gray-600',
		borderColor:      'gray-200',
		hoverColor:       'gradients-button-secondary-gray',
		focusColorShadow: 'gray-50',
		disabledBgColor:  'gradients-button-secondary-gray',
	},),
	secondaryGrey: generateButtonStyles({
		bgcolor:             'gradients-button-secondary-gray',
		color:               'gray-800',
		borderColor:         'gray-200',
		hoverColor:          'gray-25',
		focusColorShadow:    'gray-100',
		disabledColor:       'gray-300',
		disabledBgColor:     'gradients-button-secondary-gray',
		disabledBorderColor: 'gray-100',
	},),
	nonOutBlue: generateButtonNonOutStyles({
		color:         'primary-600',
		hoverColor:    'primary-700',
		focusColor:    'primary-600',
		disabledColor: 'primary-200',
	},),
	nonOutRed: generateButtonNonOutStyles({
		color:         'error-600',
		hoverColor:    'error-700',
		focusColor:    'error-600',
		disabledColor: 'error-200',
	},),
	nonOutGreen: generateButtonNonOutStyles({
		color:         'green-600',
		hoverColor:    'green-700',
		focusColor:    'green-600',
		disabledColor: 'green-200',
	},),
	tertiaryGray: generateButtonNonOutStyles({
		color:         'gray-600',
		hoverColor:    'base-black',
		focusColor:    'gray-600',
		disabledColor: 'gray-300',
	},),
	secondaryColor: generateButtonStyles({
		bgcolor:             'gradients-button-secondary-blue',
		color:               'primary-600',
		borderColor:         'primary-200',
		hoverColor:          'primary-50',
		focusColorShadow:    'primary-100',
		disabledColor:       'primary-200',
		disabledBgColor:     'gradients-button-secondary-blue',
		disabledBorderColor: 'primary-100',
	},),
	none: css`
		background: transparent;
		border: none;
		color: inherit;
		&:hover {
		background: transparent;
		}
		&:focus {
		box-shadow: none;
		}
		&:disabled {
		background: transparent;
		border: none;
		color: inherit;
		cursor: not-allowed;
		}
  	`,
}