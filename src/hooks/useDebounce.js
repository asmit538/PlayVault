import { useState, useEffect } from 'react'

/**
 * useDebounce — returns `value` only after it has stopped changing
 * for `delay` ms. Typical use: keep the input responsive via local
 * state, but run expensive filtering on the debounced copy.
 *
 *   const [query, setQuery] = useState('')
 *   const debouncedQuery = useDebounce(query, 300)
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    // Cleanup cancels the pending update whenever value/delay changes
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
