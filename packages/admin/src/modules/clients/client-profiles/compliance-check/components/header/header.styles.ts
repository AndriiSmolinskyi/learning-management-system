import {
	css,
} from '@emotion/css'
import {
	montserratSemibold,
	spaces,
} from '../../../../../../shared/styles'

export const headerWrapper = css`
    padding: ${spaces.mid20};
    border-radius: 26px;
    box-shadow: -2px 4px 10px 0px #2A2C731F;
    background-color:  var(--base-white);
    display: flex;
    align-items: center;
    gap: ${spaces.smallMedium};
`

export const headerTitle = css`
    ${montserratSemibold}
    color: var(--gray-800);
    font-size: 22px;
    line-height: 30.8px;
`

export const backLink = css`
    border-radius: 10px;
    padding: ${spaces.small};
    background: var(--gradients-back-link-gray);
    border: 1px solid #E4E4E7;
    box-shadow: 1px 1px 4px 0px #0E0F590F;

`