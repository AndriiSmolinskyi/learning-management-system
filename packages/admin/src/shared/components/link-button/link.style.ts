import {
	css,
} from '@emotion/css'
import {
	orbitronRegular,
} from '../../styles'

export const linkStyle = css`
	color: var(--white);
	${orbitronRegular(14,)}
	text-decoration: underline;
	cursor: pointer;
	&:hover{
		color: var(--green);
	}
`