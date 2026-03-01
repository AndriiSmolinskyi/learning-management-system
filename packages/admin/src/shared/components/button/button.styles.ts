import {
	css,
} from '@emotion/css'
import type {
	Size,
} from './button.types'
import {
	orbitronSemibold,
} from '../../../shared/styles'

export const baseStyle = (size: Size,): string => {
	const sizeMap = {
		small:  {
			height: '36px', borderRadius: '10px', fontSize: '13px',
		},
		medium: {
			height: '45px', borderRadius: '10px', fontSize: '20px',
		},
		large:  {
			height: '65px', borderRadius: '14px', fontSize: '20px',
		},
	}
	return css`
    height: ${sizeMap[size].height};
    border-radius: ${sizeMap[size].borderRadius};
    ${orbitronSemibold(13,)}
    font-size: ${sizeMap[size].fontSize};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none !important;
    gap: 8px !important;
    /* font-family: Orbitron; */
    display: flex;
    align-items: center;
 
    &:disabled {
      background-color: lightgray;
      color: gray;
      cursor: not-allowed;
    }
  `
}

export const textBtnStyle = (size: Size,): string => {
	const paddingMap = {
		small:  '0 30px',
		medium: '0 56px',
		large:  '0 56px',
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
  hoverBgColor?: string
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

// eslint-disable-next-line no-unused-vars
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
		hoverBgColor,
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
		box-shadow: 4px 4px 20px rgba(35, 162, 0, 0.25), -4px -4px 20px rgba(35, 162, 0, 0.25);

    	&:hover {
      	background: var(--${hoverBgColor});
			color: var(--${hoverColor});
			cursor: pointer;
		 	& path {
				fill: var(--${hoverColor});
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
	mainColor: generateButtonStyles({
		bgcolor:             'black',
		color:               'white',
		borderColor:         'green',
		hoverBgColor:        'white',
		hoverColor:          'black',
		// only for example
		disabledColor:       'white',
		disabledBgColor:     'base-black',
		disabledBorderColor: 'gray',
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