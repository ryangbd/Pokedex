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
        pokemonspecy {
          id
          generation_id
          evolution_chain_id
          order
        }
        pokemontypes(order_by: {slot: asc}) {
          type { name }
        }
      }
      megaPokemon: pokemon(where: {pokemonforms: {is_mega: {_eq: true}}}, order_by: {id: asc}) {
        id
        name
        pokemonspecy { id }
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

  const megaFormsBySpecies = new Map()
  for (const { id, name, pokemonspecy } of data.megaPokemon ?? []) {
    const forms = megaFormsBySpecies.get(pokemonspecy.id) ?? []
    const suffix = name.split('-mega')[1]?.replaceAll('-', ' ').trim().toUpperCase()
    forms.push({
      id,
      label: suffix ? `Mega ${suffix}` : 'Mega',
      imageUrl: `${artworkUrl}/${id}.png`,
      shinyImageUrl: `${artworkUrl}/shiny/${id}.png`,
    })
    megaFormsBySpecies.set(pokemonspecy.id, forms)
  }

  return data.pokemon.map(({ id, name, pokemonspecy, pokemontypes }) => ({
    number: String(id).padStart(3, '0'),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    generation: String(pokemonspecy.generation_id),
    evolutionChainId: pokemonspecy.evolution_chain_id,
    speciesOrder: pokemonspecy.order,
    imageUrl: `${artworkUrl}/${id}.png`,
    shinyImageUrl: `${artworkUrl}/shiny/${id}.png`,
    megaForms: megaFormsBySpecies.get(pokemonspecy.id) ?? [],
    types: pokemontypes.map(({ type }) => typeLabels[type.name] ?? type.name),
  }))
}

export default function App() {
  const [pokemon, setPokemon] = useState(null)
  const [hasError, setHasError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [showShiny, setShowShiny] = useState(false)
  const [megaFormId, setMegaFormId] = useState(null)
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

  function selectPokemon(entry) {
    setSelectedPokemon(entry)
    setMegaFormId(null)
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
  const selectedIndex = visiblePokemon?.findIndex((entry) => entry.number === selectedPokemon?.number) ?? -1
  const previousPokemon = visiblePokemon?.[selectedIndex - 1]
  const nextPokemon = selectedIndex >= 0 ? visiblePokemon[selectedIndex + 1] : undefined
  const megaForm = selectedPokemon?.megaForms.find((form) => form.id === megaFormId)
  const displayedForm = megaForm ?? selectedPokemon
  const evolutionFamily = selectedPokemon?.evolutionChainId == null
    ? []
    : pokemon.filter((entry) => entry.evolutionChainId === selectedPokemon.evolutionChainId)
      .sort((first, second) => first.speciesOrder - second.speciesOrder)

  return (
    <main className="pokedex">
      {hasError ? (
        <div>
          <p role="alert">Não foi possível carregar os Pokémon.</p>
          <button type="button" onClick={retry}>Tentar novamente</button>
        </div>
      ) : pokemon === null ? (
        <p role="status">Carregando Pokémon…</p>
      ) : (
        <>
          <div className="pokedex-toolbar">
            <PokemonFilters
              filters={filters}
              onChange={setFilters}
              generations={generations}
              types={types}
            />
          </div>
          <div className="pokemon-layout">
            <aside className="pokemon-details" aria-label="Pokémon selecionado" aria-live="polite">
              {selectedPokemon ? (
                <>
                  <div className="pokemon-details-navigation">
                    <button
                      type="button"
                      aria-label="Pokémon anterior"
                      disabled={!previousPokemon}
                      onClick={() => selectPokemon(previousPokemon)}
                    >
                      <span aria-hidden="true">‹</span>
                    </button>
                    <img
                      className="pokemon-details-image"
                      src={showShiny ? displayedForm.shinyImageUrl : displayedForm.imageUrl}
                      alt={showShiny ? `${selectedPokemon.name} na forma shiny` : ''}
                      onError={showShiny ? () => setShowShiny(false) : undefined}
                      width="400"
                      height="400"
                    />
                    <button
                      type="button"
                      aria-label="Próximo Pokémon"
                      disabled={!nextPokemon}
                      onClick={() => selectPokemon(nextPokemon)}
                    >
                      <span aria-hidden="true">›</span>
                    </button>
                  </div>
                  {selectedPokemon.megaForms.length > 0 && (
                    <select
                      className="pokemon-form-select"
                      aria-label="Forma do Pokémon"
                      value={megaFormId ?? ''}
                      onChange={(event) => setMegaFormId(Number(event.target.value) || null)}
                    >
                      <option value="">Forma normal</option>
                      {selectedPokemon.megaForms.map((form) => (
                        <option key={form.id} value={form.id}>{form.label}</option>
                      ))}
                    </select>
                  )}
                  <div className="pokemon-details-title">
                    <h2>{selectedPokemon.name}</h2>
                    <button
                      className="pokemon-shiny-toggle"
                      type="button"
                      aria-label="Forma shiny"
                      aria-pressed={showShiny}
                      title="Alternar forma shiny"
                      onClick={() => setShowShiny((current) => !current)}
                    >
                      <span aria-hidden="true">✦</span>
                    </button>
                  </div>
                  {evolutionFamily.length > 1 && (
                    <ul className="pokemon-evolutions" aria-label="Linha evolutiva">
                      {evolutionFamily.map((entry) => (
                        <li key={entry.number}>
                          <button
                            type="button"
                            aria-label={entry.name}
                            aria-pressed={entry.number === selectedPokemon.number}
                            title={entry.name}
                            onClick={() => selectPokemon(entry)}
                          >
                            <img src={entry.imageUrl} alt="" width="48" height="48" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p>Selecione um Pokémon para exibi-lo aqui.</p>
              )}
            </aside>
            <section className="pokemon-results" aria-label="Catálogo">
              <h1>Pokédex</h1>
              <p className="pokemon-results-count">{visiblePokemon.length} Pokémon</p>
              {visiblePokemon.length === 0 ? (
                <p role="status">Nenhum Pokémon encontrado.</p>
              ) : (
                <div className="pokemon-grid">
                  {visiblePokemon.map((entry) => (
                    <PokemonCard
                      key={entry.number}
                      {...entry}
                      selected={selectedPokemon?.number === entry.number}
                      onSelect={() => selectPokemon(entry)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  )
}
