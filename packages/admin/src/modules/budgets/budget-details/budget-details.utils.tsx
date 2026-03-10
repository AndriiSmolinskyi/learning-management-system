import React from 'react'

import expenseCreditCardIcon from '../../../assets/images/expense-credit-card.png'
import expenseDonationIcon from '../../../assets/images/expense-donation.png'
import expenseEntertainmentIcon from '../../../assets/images/expense-entertainment.png'
import expenseCashIcon from '../../../assets/images/expenses-cash.png'
import expenseRealEstateIcon from '../../../assets/images/expenses-real-estate.png'

import * as styles from './budget-details.styles'

export const getExpenseCategoryIcon = (name: string,): React.ReactNode => {
	switch (name) {
	case 'Donation':
		return <img src={expenseDonationIcon} className={styles.pngImage} alt='expense category'/>
	case 'Real estate':
		return <img src={expenseRealEstateIcon} className={styles.pngImage} alt='expense category'/>
	case 'Credit card':
		return <img src={expenseCreditCardIcon} className={styles.pngImage} alt='expense category'/>
	case 'Renovation':
		return <img src={expenseCreditCardIcon} className={styles.pngImage} alt='expense category'/>
	case 'Entertainment':
		return <img src={expenseEntertainmentIcon} className={styles.pngImage} alt='expense category'/>
	default:
		return <img src={expenseCashIcon} className={styles.pngImage} alt='expense category'/>
	}
}