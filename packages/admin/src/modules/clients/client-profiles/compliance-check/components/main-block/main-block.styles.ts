import {
	css,
} from '@emotion/css'
import {
	customScrollbar,
	spaces,
} from '../../../../../../shared/styles'

export const mainBlock = css`
    display: flex;
    flex-direction: column;
    padding: ${spaces.mid20};
    gap: ${spaces.mid20};
    background-color: var(--base-white);
    border-radius: ${spaces.medium};
`

export const listsWrapper = css`
    display: flex;
    flex-direction: column;
    gap: ${spaces.smallMedium};
    max-height: calc(100vh - 299px);
    overflow-y: auto;
	${customScrollbar}
	&::-webkit-scrollbar-thumb {
    box-shadow: inset 3px 0px 0px 4px var(--base-white);
  }

`