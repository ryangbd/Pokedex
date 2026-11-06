import { useEffect, useState } from 'react'
import PokemonCard from '../PokemonCard/PokemonCard.jsx'
import PokemonFilters from '../PokemonFilters/PokemonFilters.jsx'
import './App.css'

const apiUrl = 'https://graphql.pokeapi.co/v1beta2'
const artworkUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
const typeLabels = {
  normal: 'Normal',
  fighting: 'Lutador',
  flying: 'Voador',
  grass: 'Planta',
  poison: 'Veneno',
  fire: 'Fogo',
  water: 'Água',
  ground: 'Terra',
  rock: 'Pedra',
  bug: 'Inseto',
  ghost: 'Fantasma',
  steel: 'Aço',
  electric: 'Elétrico',
  psychic: 'Psíquico',
  ice: 'Gelo',
  dragon: 'Dragão',
  dark: 'Sombrio',
  fairy: 'Fada',
}

async function fetchPokemon(signal) {
  const query = `
    {
      pokemon(where: {is_default: {_eq: true}}, order_by: {id: asc}) {
        id
        name
        pokemonspecy { generation_id }
        pokemontypes(order_by: {slot: asc}) {
          type { name }
        }
      }
    }
  `
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`PokéAPI retornou HTTP ${response.status}`)
  }

  const { data, errors } = await response.json()

  if (errors?.length || !data?.pokemon) {
    throw new Error('A PokéAPI não retornou a lista de Pokémon.')
  }

  return data.pokemon.map(({ id, name, pokemonspecy, pokemontypes }) => ({
    number: String(id).padStart(3, '0'),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    generation: String(pokemonspecy.generation_id),
    imageUrl: `${artworkUrl}/${id}.png`,
    types: pokemontypes.map(({ type }) => typeLabels[type.name] ?? type.name),
  }))
}

export default function App() {
  const [pokemon, setPokemon] = useState(null)
  const [hasError, setHasError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [filters, setFilters] = useState({ search: '', generation: '', type: '' })

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

  const search = filters.search.trim().toLowerCase()
  const number = search.replace(/^#/, '')
  const visiblePokemon = pokemon?.filter((entry) => {
    const matchesSearch = entry.name.toLowerCase().includes(search)
      || (/^\d+$/.test(number) && Number(entry.number) === Number(number))

    return matchesSearch
      && (!filters.generation || entry.generation === filters.generation)
      && (!filters.type || entry.types.includes(filters.type))
  })
  const generations = [...new Set(pokemon?.map((entry) => entry.generation))]
    .sort((first, second) => Number(first) - Number(second))
  const types = [...new Set(pokemon?.flatMap((entry) => entry.types))]
    .sort((first, second) => first.localeCompare(second, 'pt-BR'))

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
        <>
          <PokemonFilters
            filters={filters}
            onChange={setFilters}
            generations={generations}
            types={types}
          />
          {visiblePokemon.length === 0 ? (
            <p role="status">Nenhum Pokémon encontrado.</p>
          ) : (
            <div className="pokemon-grid">
              {visiblePokemon.map((entry) => (
                <PokemonCard key={entry.number} {...entry} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
