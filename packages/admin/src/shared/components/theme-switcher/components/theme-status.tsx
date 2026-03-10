import * as React from 'react'

import {
	status,
} from '../theme-switcher.styles'
import classNames from 'classnames'

const ThemeStatus: React.FunctionComponent = () => {
	return <div className={classNames(status,)} />
}

export default ThemeStatus
