/* eslint-disable no-unused-expressions */
import {
	injectGlobal,
} from '@emotion/css'
import {
	colors,
} from './colors'

injectGlobal`
	:root{
		--green: ${colors.green};
		--black: ${colors.black};
		--white: ${colors.white};
		--dark-gray: ${colors.darkGray};
		--gray: ${colors.gray};
		--base-black: ${colors.baseBlack};
		--radialGradient: ${colors.radialGradient};
		--IradialGradient: ${colors.IradialGradient};
		--darkYellow: ${colors.darkYellow};
	}
`