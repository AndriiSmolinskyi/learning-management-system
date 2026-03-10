/* eslint-disable complexity */
import * as React from 'react'
import {
	cx,
} from '@emotion/css'

import {
	Button, ButtonType, Color, Size,
} from '../../../../../../../../shared/components'
import {
	ArrowLeft,
} from '../../../../../../../../assets/icons'
import {
	useAddPortfolioStore,getMaxSubSteps,
} from '../../../../store/step.store'
import {
	useUpdateDraftToPortfolio,
} from '../../../../../../../../shared/hooks/portfolio'
import {
	AssetNamesType,
} from '../../../../../../../../shared/types'

import type {
	IOptionType,
} from '../../../../../../../../shared/types'
import type {
	IPortfolioErrorValues,
} from '../form-portfolio/form-portfolio.types'

import * as styles from './bottom-block.styles'

interface IBottomBlockProps {
	errors?: IPortfolioErrorValues
	onClose?: () => void
	portfolioDraftId?: string
	toggleSuccessModalIsOpen?: () => void
	assetName?: IOptionType<AssetNamesType>
}

export const BottomBlock: React.FC<IBottomBlockProps> = ({
	errors,
	onClose,
	portfolioDraftId,
	toggleSuccessModalIsOpen,
	assetName,
},) => {
	const {
		mutateAsync: transformDraftToPortfolio,
	} = useUpdateDraftToPortfolio()
	const {
		step, subStep, setSubStep, portfolioId, setCreatedPortfolioId, reset, setCreatedMainPortfolioId,
	} = useAddPortfolioStore()

	const handleUpdateDraftToPortfolio = async(idProp: string,): Promise<void> => {
		const {
			id,
			mainPortfolioId,
		} = await transformDraftToPortfolio(idProp,)
		setCreatedPortfolioId(id,)
		setCreatedMainPortfolioId(mainPortfolioId,)
	}
	const hasErrors = (errors: IPortfolioErrorValues,): boolean => {
		return Object.keys(errors,).length > 0
	}

	const maxSubStep = getMaxSubSteps(step,)

	const handleSubBackClick = (): void => {
		setSubStep(subStep - 1,)
	}
	const handleSubNextClick = (e: React.MouseEvent,): void => {
		e.preventDefault()
		setSubStep(subStep + 1,)
	}

	const getButtonText = (step: number,): string => {
		switch (step) {
		case 1:
			return 'Add portfolio'
		case 2:
			return 'Add entity'
		case 3:
			return 'Add bank'
		case 4:
			return 'Add account'
		case 5:
			return 'Add asset'
		default:
			return 'Submit'
		}
	}
	return (
		<div className={styles.bottomBlockWrapper}>
			{step === 5 && subStep === 1 ?
				<button type='button' className={styles.skipButton} onClick={() => {
					handleUpdateDraftToPortfolio(portfolioDraftId ?
						portfolioDraftId :
						portfolioId ?? '',)
					if (onClose) {
						onClose()
						reset()
					}
					if (toggleSuccessModalIsOpen) {
						toggleSuccessModalIsOpen()
					}
				}}>Skip</button> :
				<Button<ButtonType.ICON>
					disabled={subStep === 1}
					onClick={handleSubBackClick}
					className={cx(subStep === 1 && 'hidden-el',)}
					additionalProps={{
						btnType: ButtonType.ICON,
						size:    Size.MEDIUM,
						color:   Color.SECONDRAY_COLOR,
						icon:    <ArrowLeft width={20} height={20} />,
					}}
				/>}
			{(subStep === maxSubStep) || (assetName?.value === AssetNamesType.CASH && subStep === 2) ?
				(
					<Button<ButtonType.TEXT>
						disabled={errors && hasErrors(errors,)}
						type='submit'
						additionalProps={{
							btnType:   ButtonType.TEXT,
							text:      getButtonText(step,),
							rightIcon: <ArrowLeft className={styles.nextButtonIcon} />,
							size:      Size.MEDIUM,
							color:     Color.BLUE,
						}}
					/>
				) :
				(
					<Button<ButtonType.TEXT>
						disabled={subStep === maxSubStep || (errors && hasErrors(errors,))}
						onClick={handleSubNextClick}
						additionalProps={{
							btnType:   ButtonType.TEXT,
							text:      'Next',
							rightIcon: <ArrowLeft className={styles.nextButtonIcon} />,
							size:      Size.MEDIUM,
							color:     Color.BLUE,
						}}
					/>
				)}
		</div>
	)
}