import {
	css,
} from '@emotion/css'
import {
	spaces,
} from '../../../shared/styles'

export const container = css`
	display: flex;
	flex-direction: column;
	// gap: ${spaces.medium};
	height: calc(100% - 16px - 52px);
	width: 100%;
`