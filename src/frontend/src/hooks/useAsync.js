import { useCallback, useEffect, useRef, useState } from 'react'

export function useAsync(task, dependencies = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [attempt, setAttempt] = useState(0)
  const taskRef = useRef(task)
  const key = dependencies.join('|')

  useEffect(() => {
    taskRef.current = task
  })

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, loading: true, error: null }))

    taskRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error: error.message })
      })

    return () => {
      cancelled = true
    }
  }, [attempt, key])

  const reload = useCallback(() => setAttempt((current) => current + 1), [])

  return { ...state, reload }
}
