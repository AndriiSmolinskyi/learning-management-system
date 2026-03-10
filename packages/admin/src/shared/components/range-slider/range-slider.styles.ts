import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratMediumReg,
	montserratMidbold,
} from '../../../shared/styles'

export const rangeSliderWrapper = css`
	margin-bottom: ${spaces.mid20};
`

export const dateRangeSliderWrapper = css`
	margin-bottom: ${spaces.mid20};
	padding-left: ${spaces.mid20};
	padding-right: ${spaces.mid20};
`

export const totalAssetsText = css`
	${montserratMidbold}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-800);
	margin-bottom: 2px !important;
`

export const rangeSetInfo = css`
	${montserratMediumReg}
	font-size: 14px;
	line-height: 19.6px;
	color: var(--gray-500);
	margin-bottom: ${spaces.smallMedium} !important;

`

export const valuesBlock = css`
	margin-top: -5px;
	display: flex;
	justify-content: space-between;
`

export const valueWrapper = (isFilled: boolean,): string => {
	return css`
	width: 122px;
	padding: ${spaces.smallMedium};
	border-radius: ${spaces.small};
	border: 1px solid var(--gray-100);
	box-shadow: 0px 2px 6px 0px #1827511A inset;
	background-color: var(--base-white);

	${montserratMediumReg}
	font-size:  14px;
	line-height:  19.6px;
	color: ${isFilled ?
		'var(--gray-400)' :
		'var(--gray-900)'};

	 &:focus {
      outline: none;
    }
`
}

export const minMaxText = css`
	${montserratMidbold}	
	font-size: 12px;
	line-height: 16.8px;
	color: var(--gray-600);
	text-align: center;
	margin-bottom: 2px !important;
`

export const SliderSxStyles = {
	'& .MuiSlider-thumb': {
		width:             '24px',
		height:            '24px',
		backgroundColor:   'var(--base-white)',
		border:            '1px solid var(--primary-600)',
		position:        'absolute',
		'&::before':     {
			content:         '""',
			position:        'absolute',
			top:          '50%',
			left:         '50%',
			transform:    'translate(-50%, -50%)',
			width:           '16px',
			height:          '16px',
			borderRadius:    '50%',
			background:   'var(--gradients-blue-button)',
			border:          'none',
			boxShadow:    'none',
		},
	},
	'& .MuiSlider-rail': {
		height:            '8px',
		backgroundColor:   'var(--primary-200)',

	},
	'& .MuiSlider-track': {
		height:            '8px',
		background:   'var(--gradients-blue-button)',
	},
}

export const sliderBlock = css`
	padding: 0px 10px;
`