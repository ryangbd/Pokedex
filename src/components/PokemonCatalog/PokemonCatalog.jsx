import { useState } from 'react'
import PokemonDetails from '../PokemonDetails/PokemonDetails.jsx'
import PokemonFilters from '../PokemonFilters/PokemonFilters.jsx'
import PokemonList from '../PokemonList/PokemonList.jsx'
import './PokemonCatalog.css'

export default function PokemonCatalog({ pokemon }) {
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [megaFormId, setMegaFormId] = useState(null)
  const [view, setView] = useState('list')
  const [filters, setFilters] = useState({ search: '', generation: '', type: '' })

  function selectPokemon(entry) {
    setSelectedPokemon(entry)
    setMegaFormId(null)
    setView('details')
  }

  const search = filters.search.trim().toLowerCase()
  const number = search.replace(/^#/, '')
  const visiblePokemon = pokemon.filter((entry) => {
    const matchesSearch = entry.name.toLowerCase().includes(search)
      || (/^\d+$/.test(number) && Number(entry.number) === Number(number))

    return matchesSearch
      && (!filters.generation || entry.generation === filters.generation)
      && (!filters.type || entry.types.includes(filters.type))
  })
  const generations = [...new Set(pokemon.map((entry) => entry.generation))]
    .sort((first, second) => Number(first) - Number(second))
  const types = [...new Set(pokemon.flatMap((entry) => entry.types))]
    .sort((first, second) => first.localeCompare(second, 'pt-BR'))
  const selectedIndex = visiblePokemon.findIndex((entry) => entry.number === selectedPokemon?.number)
  const previousPokemon = visiblePokemon[selectedIndex - 1]
  const nextPokemon = selectedIndex >= 0 ? visiblePokemon[selectedIndex + 1] : undefined
  const evolutionFamily = selectedPokemon?.evolutionChainId == null
    ? []
    : pokemon.filter((entry) => entry.evolutionChainId === selectedPokemon.evolutionChainId)
      .sort((first, second) => first.speciesOrder - second.speciesOrder)

  return (
    <>
      <div className="pokedex-toolbar" data-view={view}>
        <nav className="pokemon-view-switch" aria-label="Visualização do catálogo">
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            Lista
          </button>
          <button
            type="button"
            disabled={!selectedPokemon}
            aria-pressed={view === 'details'}
            onClick={() => setView('details')}
          >
            Detalhes
          </button>
        </nav>
        <div className="pokedex-filter-controls">
          <PokemonFilters
            filters={filters}
            onChange={setFilters}
            generations={generations}
            types={types}
          />
        </div>
      </div>
      <div className="pokemon-layout" data-view={view}>
        <PokemonDetails
          selectedPokemon={selectedPokemon}
          previousPokemon={previousPokemon}
          nextPokemon={nextPokemon}
          evolutionFamily={evolutionFamily}
          selectPokemon={selectPokemon}
          megaFormId={megaFormId}
          setMegaFormId={setMegaFormId}
        />
        <PokemonList
          pokemon={visiblePokemon}
          selectedNumber={selectedPokemon?.number}
          onSelect={selectPokemon}
        />
      </div>
    </>
  )
}
