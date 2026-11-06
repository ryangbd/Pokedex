import './PokemonFilters.css'

const regionNames = {
  1: 'Kanto',
  2: 'Johto',
  3: 'Hoenn',
  4: 'Sinnoh',
  5: 'Unova',
  6: 'Kalos',
  7: 'Alola',
  8: 'Galar',
  9: 'Paldea',
}

export default function PokemonFilters({ filters, onChange, generations, types }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="pokemon-filters" role="search" aria-label="Filtrar Pokémon">
      <label>
        Buscar Pokémon
        <input
          type="search"
          placeholder="Nome ou número"
          value={filters.search}
          onChange={(event) => update('search', event.target.value)}
        />
      </label>
      <label>
        Região
        <select value={filters.generation} onChange={(event) => update('generation', event.target.value)}>
          <option value="">Todas as regiões</option>
          {generations.map((generation) => (
            <option key={generation} value={generation}>
              {regionNames[generation] ?? `Geração ${generation}`}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tipo
        <select value={filters.type} onChange={(event) => update('type', event.target.value)}>
          <option value="">Todos os tipos</option>
          {types.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
