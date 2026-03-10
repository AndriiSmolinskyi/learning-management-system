import {
	css,
} from '@emotion/css'
import {
	montserratMediumReg,
	montserratMidbold,
	spaces,
} from '../../../../../../shared/styles'

export const listWrapper = css`
    background-color: var(--primary-50);
    padding: ${spaces.small};
    border-radius: ${spaces.small};
`

// export const portfolioInnerContent = css`
//     position: relative;
//     &::before {
//         content: '';
//         width: 2px;
//         height: 100%;
//         position: absolute;
//         top: 0px;
//         left: 0px;
//         background-color: var(--primary-200);
//         border-radius: ${spaces.small};
//     }
// `

export const portfolioInnerContent = (isEmpty: boolean,): string => {
	return css`
    position: relative;
	 ${!isEmpty && css`
      &::before {
        content: '';
        width: 2px;
        height: 100%;
        position: absolute;
        top: 0px;
        left: 0px;
        background-color: var(--primary-200);
        border-radius: ${spaces.small};
      }
    `}
`
}

// export const entityListWrapper = css`
//  background-color: var(--primary-50);
//  padding-left: 14px;
//  border-radius: ${spaces.small};
//  margin-top: 12px;
// `

export const entityListWrapper = (isEmpty: boolean,): string => {
	return css`
   background-color: var(--primary-50);
    padding-left: 14px;
    border-radius: ${spaces.small};
    margin-top: ${isEmpty ?
		'0px' :
		'12px'};
	 padding-left: ${isEmpty ?
		'0px' :
		'14px'};
`
}

// export const assetListWrapper = css`
//     background-color: var(--primary-50);
//     padding-left: 14px;
//     border-radius: ${spaces.small};
//     margin-top: 12px;
// `

export const assetListWrapper = (isEmpty: boolean,): string => {
	return css`
   background-color: var(--primary-50);
    padding-left: 14px;
    border-radius: ${spaces.small};
    margin-top: ${isEmpty ?
		'0px' :
		'12px'};
	 padding-left: ${isEmpty ?
		'0px' :
		'14px'};
`
}

export const usersIcon = css`
    width: 14.67px;
    height: 13.33px;
    & path {
        fill: var(--gray-400);
    }
`

export const assetIcon = css`
 & svg {
    width: 14.67px;
    height: 13.33px;
    & path {
        fill: var(--gray-400);
    }
 }
`

export const selectAllBlock = (isEmpty: boolean,): string => {
	return css`
    display: flex;
    gap: 8px;
    align-items: center;
    padding-left: ${isEmpty ?
		'0px' :
		'0px'};
`
}

export const iconClientText = css`
   ${montserratMediumReg}
   font-size: 12px;
   line-height: 16.8px;
   color: var(--gray-500);
   display: flex;
   gap: ${spaces.tiny};
	user-select: none;
`

export const clientNameText = css`
   ${montserratMidbold}
   font-size: 14px;
   line-height: 19.6px;
   color: var(--gray-800);
	user-select: none;
`

export const checkboxList = css`
    position: relative;
    list-style: none;
    padding: 0;
    margin-top: ${spaces.medium};
    display: flex;
    flex-direction: column;
    gap: ${spaces.smallMedium};
    padding-left: ${spaces.smallMedium};
`

export const collapseArrowButton = (isOpen: boolean,): string => {
	return css`
    background-color: transparent;
    outline: none !important;
    border: none;
    transition: all 300ms ease;
    transform: ${isOpen ?
		'rotate(0deg)' :
		'rotate(180deg)'};
`
}

export const topHeader = css`
    display: flex;
    align-items: center;
    justify-content: space-between;
`