import { useEffect, useState } from 'react'
import PokemonCard from '../PokemonCard/PokemonCard.jsx'
import './App.css'

const apiUrl = 'https://pokeapi.co/api/v2'
const typeLabels = {
  grass: 'Planta',
  poison: 'Veneno',
  fire: 'Fogo',
  water: 'Água',
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`PokéAPI retornou HTTP ${response.status}`)
  }

  return response.json()
}

async function fetchAll(path, signal) {
  const entries = []
  let next = `${apiUrl}/${path}/?limit=200`

  while (next) {
    const page = await fetchJson(next, signal)
    entries.push(...page.results)
    next = page.next
  }

  return entries
}

async function fetchPokemon(signal) {
  const [pokemon, types] = await Promise.all([
    fetchAll('pokemon', signal),
    fetchAll('type', signal),
  ])
  const typeDetails = await Promise.all(types.map(({ url }) => fetchJson(url, signal)))
  const typesByPokemon = new Map()

  for (const { name, pokemon: members } of typeDetails) {
    for (const { pokemon: member, slot } of members) {
      const slots = typesByPokemon.get(member.name) ?? []
      slots[slot - 1] = typeLabels[name] ?? name
      typesByPokemon.set(member.name, slots)
    }
  }

  return pokemon.map(({ name, url }) => ({
    number: new URL(url).pathname.split('/').filter(Boolean).at(-1).padStart(3, '0'),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    types: typesByPokemon.get(name) ?? [],
  }))
}

export default function App() {
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

  return (
    <main className="pokedex">
      <h1>Pokédex</h1>
      <p>Um catálogo de Pokémon.</p>
      {hasError ? (
        <div>
          <p role="alert">Não foi possível carregar os Pokémon.</p>
          <button type="button" onClick={retry}>Tentar novamente</button>
        </div>
      ) : pokemon === null ? (
        <p role="status">Carregando Pokémon…</p>
      ) : (
        <div className="pokemon-grid">
          {pokemon.map((entry) => (
            <PokemonCard key={entry.number} {...entry} />
          ))}
        </div>
      )}
    </main>
  )
}
