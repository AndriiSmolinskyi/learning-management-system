import {
	css,
} from '@emotion/css'
import {
	montserratMidbold,
} from '../../../../../../shared/styles'

export const emptyContainer = css`
    height: 69vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 16px;
`

export const emptyText = css`
    ${montserratMidbold}
    font-size: 12px;
    color: var(--gray-600);
    font-style: italic;
`