import { useCallback, useEffect, useRef, useState } from 'react'

export function useAsync(task, dependencies = []) {
  const [result, setResult] = useState({ requestId: null, data: null, error: null })
  const [attempt, setAttempt] = useState(0)
  const taskRef = useRef(task)
  const requestId = `${dependencies.join('|')}#${attempt}`

  useEffect(() => {
    taskRef.current = task
  })

  useEffect(() => {
    let cancelled = false

    taskRef
      .current()
      .then((data) => {
        if (!cancelled) setResult({ requestId, data, error: null })
      })
      .catch((error) => {
        if (!cancelled) setResult({ requestId, data: null, error: error.message })
      })

    return () => {
      cancelled = true
    }
  }, [requestId])

  const reload = useCallback(() => setAttempt((current) => current + 1), [])

  const loading = result.requestId !== requestId

  return {
    data: loading ? null : result.data,
    error: loading ? null : result.error,
    loading,
    reload,
  }
}
