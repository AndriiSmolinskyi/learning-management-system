import {
	css,
} from '@emotion/css'
import {
	spaces,
	montserratMidbold,
	montserratMediumReg,
} from '../../styles'

export const container = css`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background-color: var(--primary-25);
  padding: 9.1px ${spaces.midLarge};
  border-bottom: 1px solid var(--primary-100);
`

export const progressBarContainer = css`
  height: 8px;
  width: 100%;
  background-color: var(--primary-200);
  border-radius: 5px;
  overflow: hidden;;
  position: relative;
  border-radius: 8px;
`

export const progress = (progressPercentage: number,):string => {
	return css`
  height: 100%;
  background: var(--gradients-button-primary-blue);
  width: ${progressPercentage}%;
  transition: width 0.3s ease;
  border-radius: 999px;
`
}
export const stepInfo = css`
	background: linear-gradient(180deg, rgba(34, 54, 243, 0.7) 70%, rgba(34, 54, 243, 0) 100%);
	border: 1px solid var(--primary-200);
	border-radius: 16px;
	${montserratMidbold}
	font-style: italic;
	display: flex;
	align-items: center;
	color: var(--base-white);
	font-size: 12px;
	text-align: center;
   padding: 2px 8.5px 2px 6.5px;
`

export const lableProgress = css`
  padding: ${spaces.midLarge} ${spaces.midLarge} 9px ${spaces.midLarge};
`

export const lableProgressSecond = css`
  height: 130px;
  padding-left: ${spaces.midLarge};
  padding-right: ${spaces.midLarge};
  padding-top: 24px;
  scroll-behavior: smooth;
  scrollbar-width: none;   
  margin-bottom: 13px;

  overflow-y: auto;
	&::-webkit-scrollbar {
    display: none;
  }
	scrollbar-width: none;
	-webkit-overflow-scrolling: touch;
	-ms-overflow-style: none;
`

export const lableBlock = css`
  display: flex;
  position: relative;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0%;
  }
`

export const currentIcon = css`
  width: 24px;
  height: 24px;
  background: var(--base-white);
  border-radius: 50%;
  border: 1px solid var(--primary-200);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 0px 0px 4px var(--primary-100);
`

export const lableTextBlock = css`
  	margin-left: 12px;
 	width: calc(100% - 12px - 24px);
`

export const labelTitle = (fontSize: number,):string => {
	return css`
  ${montserratMidbold}
  font-size: ${fontSize}px;
  color: var(--gray-800);
  line-height: 16.8px;
`
}

export const lableDec = css`
  ${montserratMediumReg}
  font-size: 12px;
  color: var(--gray-500);
  line-height: 16.8px;
	height: 34px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
`

export const StepConnector = css`
  position: absolute;
  width: 2px;
  height: 32px;
  left: 11px;
  top: 28px;
`