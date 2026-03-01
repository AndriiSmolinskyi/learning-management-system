import {
	css,
} from '@emotion/css'
import {
	orbitronRegular,
} from '../../../shared/styles'

export const linkStyle = css`
	color: var(--white);
	${orbitronRegular(14,)}
	text-decoration: underline;
	cursor: pointer;
	&:hover{
		color: var(--green);
	}
`