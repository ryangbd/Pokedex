import { useEffect, useState } from 'react'
import { fetchPokemon } from '../services/pokeapi.js'

export default function usePokemon() {
  const [pokemon, setPokemon] = useState(null)
  const [hasError, setHasError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    fetchPokemon(signal)
      .then((entries) => {
        if (!signal.aborted) setPokemon(entries)
      })
      .catch(() => {
        if (!signal.aborted) {
          setHasError(true)
          controller.abort()
        }
      })

    return () => controller.abort()
  }, [attempt])

  function retry() {
    setHasError(false)
    setAttempt((previous) => previous + 1)
  }

  return { pokemon, hasError, retry }
}
