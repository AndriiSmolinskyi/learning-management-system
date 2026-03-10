import React from 'react'

export function useDebounce<T = string>(value: T, delay = 700,):T {
	const memoizedValue = React.useMemo(() => {
		return JSON.stringify(value,)
	}, [value,],)
	const parsedValue = React.useMemo(() => {
		return JSON.parse(memoizedValue,)
	}, [memoizedValue,],)

	const [debouncedValue, setDebouncedValue,] = React.useState<T>(parsedValue,)
	const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null,)

	React.useEffect(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current,)
		}
		timerRef.current = setTimeout(() => {
			setDebouncedValue(value,)
		}, delay,)

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current,)
			}
		}
	}, [parsedValue, delay,],)

	return debouncedValue
}